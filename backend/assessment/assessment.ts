import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeForPrompt } from "../shared/sanitize";
import { callClaudeWithRetry } from "../shared/ai-utils";

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
  { expose: true, method: "GET", path: "/assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetAssessmentResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) {
      throw APIError.permissionDenied("you can only view your own assessment");
    }

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
  const prompt = `You are an expert career counselor and labor market analyst. Analyze these career assessment answers and recommend the best career paths.

Assessment:
- Work style: ${sanitizeForPrompt(p.workStyle, 100)}
- Top strengths: ${p.strengths.map(s => sanitizeForPrompt(s, 100)).join(", ")}
- Core values: ${p.values.map(v => sanitizeForPrompt(v, 100)).join(", ")}
- Current skills: ${p.currentSkills.map(s => sanitizeForPrompt(s, 100)).join(", ") || "None specified"}
- Experience level: ${sanitizeForPrompt(p.experienceLevel, 100)}
- Interests/domains: ${p.interests.map(i => sanitizeForPrompt(i, 100)).join(", ")}
${p.currentRole ? `- Current role: ${sanitizeForPrompt(p.currentRole, 200)}` : ""}

Respond with ONLY a valid JSON object (no markdown, no explanation, no dashes, no code fences):
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

Provide exactly 3 career matches ranked by match score (highest first). Identify 5 key skill gaps. Be specific and actionable.`;

  const fallback = {
    careerMatches: [
      { title: "General Professional", matchScore: 70, description: "Based on your skills and interests, a general professional role could be a good starting point. Complete the assessment with more detail for better matches.", requiredSkills: p.currentSkills.slice(0, 5), pathwayTime: "6-12 months" },
    ],
    skillGaps: [
      { skill: "Industry Knowledge", importance: "high" as const, learningResource: "LinkedIn Learning - Industry Foundations" },
      { skill: "Technical Proficiency", importance: "medium" as const, learningResource: "Coursera - Professional Certificate" },
    ],
  };

  return callClaudeWithRetry({
    apiKey: anthropicKey(),
    model: "claude-opus-4-6",
    maxTokens: 1500,
    prompt,
    retries: 2,
    fallback,
  });
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
  { expose: true, method: "POST", path: "/assessment/certificates", auth: true },
  async ({ userId, skills, targetRole }: GetCertificatesParams): Promise<GetCertificatesResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");
    const safeTargetRole = sanitizeForPrompt(targetRole, 200);
    const safeSkills = skills.map(s => sanitizeForPrompt(s, 100));

    const prompt = `You are a career advisor recommending real online certificates. For someone targeting "${safeTargetRole}" with skill gaps in: ${safeSkills.join(', ')}

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
    "whyRecommended": "One sentence on why this is the best choice for targeting ${safeTargetRole}"
  }
]

Include a mix of: free options (Coursera audit, Google certificates), paid certificates (AWS, etc). Prioritize industry-recognized certifications.`;

    const recommendations = await callClaudeWithRetry({
      apiKey: anthropicKey(),
      model: "claude-opus-4-6",
      maxTokens: 2000,
      prompt,
      retries: 2,
      fallback: [],
    });

    return { recommendations: Array.isArray(recommendations) ? recommendations : recommendations.recommendations ?? [] };
  }
);

// --- Career Recommendations ---

interface CareerRecommendation {
  type: "portfolio" | "networking" | "job_application";
  title: string;
  description: string;
  platform?: string;
  url?: string;
  difficulty?: string;
  timeEstimate?: string;
  why: string;
  actionStep: string;
}

interface CareerRecommendationsParams {
  userId: string;
  skills: string[];
  targetRole: string;
  currentSkills: string[];
}

interface CareerRecommendationsResponse {
  portfolio: CareerRecommendation[];
  networking: CareerRecommendation[];
  jobApplications: CareerRecommendation[];
}

// POST /assessment/career-recommendations
export const getCareerRecommendations = api(
  { expose: true, method: "POST", path: "/assessment/career-recommendations", auth: true },
  async (params: CareerRecommendationsParams): Promise<CareerRecommendationsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    const safeTargetRole = sanitizeForPrompt(params.targetRole, 200);

    const prompt = `You are an expert career coach for someone targeting "${safeTargetRole}".
Skill gaps to address: ${params.skills.slice(0, 5).join(", ")}
Current skills: ${params.currentSkills.slice(0, 5).join(", ") || "Not specified"}

Respond with ONLY a valid JSON object (no markdown):
{
  "portfolio": [
    {
      "type": "portfolio",
      "title": "Project name",
      "description": "What to build and what technologies to use",
      "platform": "GitHub",
      "url": "https://github.com",
      "difficulty": "Intermediate",
      "timeEstimate": "3 weeks",
      "why": "Why this project impresses ${safeTargetRole} hiring managers",
      "actionStep": "First concrete step to start today"
    }
  ],
  "networking": [
    {
      "type": "networking",
      "title": "Community or action name",
      "description": "What this networking opportunity is",
      "platform": "LinkedIn",
      "url": "Real URL if applicable",
      "why": "Why this network matters for ${safeTargetRole}",
      "actionStep": "Specific first action (e.g. 'Send connection request with this message...')"
    }
  ],
  "jobApplications": [
    {
      "type": "job_application",
      "title": "Company or job board name",
      "description": "What type of role to apply for and why this company",
      "platform": "LinkedIn Jobs",
      "url": "Real job board URL",
      "why": "Why this is a great fit given their skills",
      "actionStep": "What to highlight in the application"
    }
  ]
}

Requirements:
- Exactly 3 portfolio projects (role-specific, using their skill gaps, buildable in 1-4 weeks)
- Exactly 3 networking recommendations (real communities, LinkedIn groups, Slack/Discord communities, meetups)
- Exactly 3 job application targets (mix of job boards and specific companies known for hiring ${safeTargetRole}s)
- All URLs must be real and working
- Portfolio projects must use real tech stack relevant to skill gaps
- Be very specific to "${safeTargetRole}" — no generic advice`;

    const fallback = {
      portfolio: [{ type: "portfolio", title: `${safeTargetRole} Portfolio Project`, description: "Build a showcase project demonstrating your key skills.", why: "Portfolio projects are the #1 way to stand out.", actionStep: "Start with a project brief today." }],
      networking: [{ type: "networking", title: "Industry LinkedIn Groups", description: "Join relevant professional groups.", why: "Networking opens 70% of job opportunities.", actionStep: "Send 3 connection requests today." }],
      jobApplications: [{ type: "job_application", title: "LinkedIn Jobs", description: `Search for ${safeTargetRole} positions.`, why: "Active applications show intent.", actionStep: "Set up job alerts for your target role." }],
    };

    const result = await callClaudeWithRetry({
      apiKey: anthropicKey(),
      model: "claude-opus-4-6",
      maxTokens: 2000,
      prompt,
      retries: 2,
      fallback,
    });

    return {
      portfolio: result.portfolio ?? [],
      networking: result.networking ?? [],
      jobApplications: result.jobApplications ?? [],
    };
  }
);

// POST /assessment — Submit questionnaire answers, get AI career matches
export const submitAssessment = api(
  { expose: true, method: "POST", path: "/assessment", auth: true },
  async (params: SubmitAssessmentParams): Promise<GetAssessmentResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
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

// ── Skill Gap Assessment ──────────────────────────────────────────────────────

interface SkillGapAssessmentParams {
  userId: string;
  targetRole: string;
  currentRole?: string;
  technicalSkills: Record<string, string>;
  softSkills: Record<string, string>;
  tools: string[];
  yearsExperience: string;
  biggestGap: string;
  learningStyle: string[];
}

interface SkillGapItem {
  skill: string;
  importance: "high" | "medium" | "low";
  learningResource: string;
  currentLevel: string;
  targetLevel: string;
}

export const analyzeSkillGaps = api(
  { expose: true, method: "POST", path: "/assessment/skill-gap-analysis", auth: true },
  async (params: SkillGapAssessmentParams): Promise<{
    result: { skillGaps: SkillGapItem[]; summary: string; topPriority: string };
  }> => {
    const safeTargetRole = sanitizeForPrompt(params.targetRole, 200);
    const safeYearsExperience = sanitizeForPrompt(params.yearsExperience, 50);

    const techList = Object.entries(params.technicalSkills)
      .filter(([, v]) => v && v !== "none")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "None rated";

    const softList = Object.entries(params.softSkills)
      .filter(([, v]) => v && v !== "none")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "None rated";

    const prompt = `You are an expert career coach performing a skill gap analysis.

Target Role: ${safeTargetRole}
Current Role: ${params.currentRole || "Not specified"}
Experience: ${safeYearsExperience}
Technical Skills self-rated: ${techList}
Soft Skills self-rated: ${softList}
Tools used: ${params.tools.join(", ") || "None"}
Biggest self-identified gap: ${params.biggestGap || "Not specified"}
Preferred learning style: ${params.learningStyle.join(", ") || "Not specified"}

Identify the key skill gaps for someone targeting "${safeTargetRole}".

Respond with ONLY valid JSON (no markdown, no dashes, no code fences):
{
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "high",
      "currentLevel": "none",
      "targetLevel": "intermediate",
      "learningResource": "Specific real course name and platform"
    }
  ],
  "summary": "2-3 sentence overall readiness assessment",
  "topPriority": "The single most critical skill to develop first"
}

Generate 5-7 skill gaps ranked by importance. Use real course/resource names.`;

    const fallback = {
      skillGaps: [
        { skill: "Core Technical Skills", importance: "high", currentLevel: "beginner", targetLevel: "intermediate", learningResource: "Coursera Professional Certificate" },
        { skill: "Industry Knowledge", importance: "high", currentLevel: "beginner", targetLevel: "intermediate", learningResource: "LinkedIn Learning" },
      ],
      summary: "Assessment could not be fully analyzed. Please try again for detailed results.",
      topPriority: "Core technical skills for your target role",
    };

    const parsed = await callClaudeWithRetry({
      apiKey: anthropicKey(),
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1200,
      prompt,
      retries: 2,
      fallback,
    });

    return {
      result: {
        skillGaps: parsed.skillGaps ?? [],
        summary: parsed.summary ?? "",
        topPriority: parsed.topPriority ?? "",
      },
    };
  }
);
