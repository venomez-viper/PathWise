import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import Anthropic from "@anthropic-ai/sdk";

const db = new SQLDatabase("assessment", { migrations: "./migrations" });
const anthropicKey = secret("AnthropicAPIKey");

export interface CareerMatch {
  title: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  pathwayTime: string;
}

export interface SkillGap {
  skill: string;
  importance: "high" | "medium" | "low";
  learningResource: string;
}

export interface AssessmentResult {
  userId: string;
  completedAt: string;
  strengths: string[];
  values: string[];
  currentSkills: string[];
  personalityType: string;
  careerMatches: CareerMatch[];
  skillGaps: SkillGap[];
}

export interface GetAssessmentResponse {
  result: AssessmentResult | null;
}

// GET /assessment/:userId
export const getAssessment = api(
  { expose: true, method: "GET", path: "/assessment/:userId" },
  async ({ userId }: { userId: string }): Promise<GetAssessmentResponse> => {
    const row = await db.queryRow`
      SELECT user_id, completed_at, strengths, values, personality_type,
             career_matches, skill_gaps, current_skills
      FROM assessments WHERE user_id = ${userId}
    `;
    if (!row) return { result: null };
    return {
      result: {
        userId: row.user_id,
        completedAt: row.completed_at,
        strengths: JSON.parse(row.strengths),
        values: JSON.parse(row.values),
        currentSkills: row.current_skills ? JSON.parse(row.current_skills) : [],
        personalityType: row.personality_type,
        careerMatches: JSON.parse(row.career_matches),
        skillGaps: row.skill_gaps ? JSON.parse(row.skill_gaps) : [],
      },
    };
  }
);

// Flat params — compatible with deployed staging API (no nested `answers`)
export interface SubmitAssessmentParams {
  userId: string;
  workStyle: string;
  strengths: string[];
  values: string[];
  currentSkills: string[];
  experienceLevel: string;
  interests: string[];
  currentRole?: string;
  personalityType?: string; // accepted for backward compat but we derive our own
}

async function analyzeWithClaude(p: SubmitAssessmentParams): Promise<{ careerMatches: CareerMatch[]; skillGaps: SkillGap[] }> {
  const client = new Anthropic({ apiKey: anthropicKey() });

  const prompt = `You are an expert career counselor and labor market analyst. Analyze these career assessment answers and recommend the best career paths.

Assessment:
- Work style: ${p.workStyle}
- Top strengths: ${p.strengths.join(", ")}
- Core values: ${p.values.join(", ")}
- Current skills: ${p.currentSkills.join(", ") || "None specified"}
- Experience level: ${p.experienceLevel}
- Interests/domains: ${p.interests.join(", ")}
${p.currentRole ? `- Current role: ${p.currentRole}` : ""}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "careerMatches": [
    {
      "title": "Role Title",
      "matchScore": 85,
      "description": "2-3 sentences explaining why this role fits this person's profile",
      "requiredSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "pathwayTime": "6-12 months"
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill Name",
      "importance": "high",
      "learningResource": "Specific course or certification name"
    }
  ]
}

Provide exactly 3 career matches ranked by match score (highest first). Identify 5 key skill gaps based on what they currently know vs what the top match requires. Be specific and actionable.`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected AI response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse AI response");

  return JSON.parse(jsonMatch[0]);
}

// --- Certificate Recommendations ---

export interface CertificateRecommendation {
  skill: string;
  certName: string;
  provider: string;
  url: string;
  duration: string;
  level: string;
  cost: string;
  whyRecommended: string;
}

export interface GetCertificatesParams {
  userId: string;
  skills: string[];
  targetRole: string;
}

export interface GetCertificatesResponse {
  recommendations: CertificateRecommendation[];
}

// POST /assessment/certificates
export const getCertificates = api(
  { expose: true, method: "POST", path: "/assessment/certificates" },
  async ({ userId, skills, targetRole }: GetCertificatesParams): Promise<GetCertificatesResponse> => {
    const client = new Anthropic({ apiKey: anthropicKey() });

    const prompt = `You are a career advisor recommending real online certificates. For someone targeting "${targetRole}" with skill gaps in: ${skills.join(', ')}

Recommend exactly ${Math.min(skills.length * 2, 8)} real, verifiable certificates from real platforms. Use ONLY real certificate programs that exist right now.

Respond with ONLY a valid JSON array:
[
  {
    "skill": "which skill gap this addresses",
    "certName": "Official certificate/course name",
    "provider": "Platform name (Coursera/Google/AWS/etc)",
    "url": "Direct URL to the certificate page",
    "duration": "e.g. 6 months part-time",
    "level": "Beginner|Intermediate|Advanced",
    "cost": "Free|$49/month|$300 exam fee|etc",
    "whyRecommended": "One sentence on why this is the best choice for targeting ${targetRole}"
  }
]

Include a mix of: free options (Coursera audit, Google certificates), paid certificates (AWS, etc). Prioritize industry-recognized certifications.`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected AI response type");

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    const recommendations: CertificateRecommendation[] = JSON.parse(jsonMatch[0]);
    return { recommendations };
  }
);

// POST /assessment — Submit questionnaire answers, get AI career matches
export const submitAssessment = api(
  { expose: true, method: "POST", path: "/assessment" },
  async (params: SubmitAssessmentParams): Promise<GetAssessmentResponse> => {
    const now = new Date().toISOString();

    const aiResult = await analyzeWithClaude(params);
    const { careerMatches, skillGaps } = aiResult;

    const personalityType = `${params.workStyle}-${params.experienceLevel}`;

    await db.exec`
      INSERT INTO assessments (user_id, completed_at, strengths, values, personality_type,
                               career_matches, raw_answers, skill_gaps, current_skills)
      VALUES (
        ${params.userId}, ${now},
        ${JSON.stringify(params.strengths)},
        ${JSON.stringify(params.values)},
        ${personalityType},
        ${JSON.stringify(careerMatches)},
        ${JSON.stringify(params)},
        ${JSON.stringify(skillGaps)},
        ${JSON.stringify(params.currentSkills)}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        completed_at     = excluded.completed_at,
        strengths        = excluded.strengths,
        values           = excluded.values,
        personality_type = excluded.personality_type,
        career_matches   = excluded.career_matches,
        raw_answers      = excluded.raw_answers,
        skill_gaps       = excluded.skill_gaps,
        current_skills   = excluded.current_skills
    `;

    return {
      result: {
        userId: params.userId,
        completedAt: now,
        strengths: params.strengths,
        values: params.values,
        currentSkills: params.currentSkills,
        personalityType,
        careerMatches,
        skillGaps,
      },
    };
  }
);
