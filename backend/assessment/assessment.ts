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

export interface QuestionnaireAnswers {
  workStyle: string;
  strengths: string[];
  values: string[];
  currentSkills: string[];
  experienceLevel: string;
  interests: string[];
  currentRole?: string;
}

export interface SubmitAssessmentParams {
  userId: string;
  answers: QuestionnaireAnswers;
}

async function analyzeWithClaude(answers: QuestionnaireAnswers): Promise<{ careerMatches: CareerMatch[]; skillGaps: SkillGap[] }> {
  const client = new Anthropic({ apiKey: anthropicKey() });

  const prompt = `You are an expert career counselor and labor market analyst. Analyze these career assessment answers and recommend the best career paths.

Assessment:
- Work style: ${answers.workStyle}
- Top strengths: ${answers.strengths.join(", ")}
- Core values: ${answers.values.join(", ")}
- Current skills: ${answers.currentSkills.join(", ") || "None specified"}
- Experience level: ${answers.experienceLevel}
- Interests/domains: ${answers.interests.join(", ")}
${answers.currentRole ? `- Current role: ${answers.currentRole}` : ""}

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

// POST /assessment — Submit questionnaire answers, get AI career matches
export const submitAssessment = api(
  { expose: true, method: "POST", path: "/assessment" },
  async (params: SubmitAssessmentParams): Promise<GetAssessmentResponse> => {
    const now = new Date().toISOString();
    const { answers } = params;

    const aiResult = await analyzeWithClaude(answers);
    const { careerMatches, skillGaps } = aiResult;

    // Derive personalityType from work style + strengths for backward compat
    const personalityType = `${answers.workStyle}-${answers.experienceLevel}`;

    await db.exec`
      INSERT INTO assessments (user_id, completed_at, strengths, values, personality_type,
                               career_matches, raw_answers, skill_gaps, current_skills)
      VALUES (
        ${params.userId}, ${now},
        ${JSON.stringify(answers.strengths)},
        ${JSON.stringify(answers.values)},
        ${personalityType},
        ${JSON.stringify(careerMatches)},
        ${JSON.stringify(answers)},
        ${JSON.stringify(skillGaps)},
        ${JSON.stringify(answers.currentSkills)}
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
        strengths: answers.strengths,
        values: answers.values,
        currentSkills: answers.currentSkills,
        personalityType,
        careerMatches,
        skillGaps,
      },
    };
  }
);
