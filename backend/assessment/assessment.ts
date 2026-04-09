import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData, checkAdmin } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";
import {
  getTopCareerMatches,
  getCertificatesForRole,
  getCareerRecsForRole,
  analyzeSkillGapsForRole,
} from "./career-brain";
import { getTopCareerMatchesV2, computeRIASEC, computeBigFive } from "./career-brain-v2";
import { determineArchetype } from "./archetypes";
import { generateNarrative } from "./narrative-generator";
import { awardAchievement } from "../streaks/streaks";

const db = new SQLDatabase("assessment", { migrations: "./migrations" });

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
  partial?: boolean;
}

// GET /assessment/:userId
export const getAssessment = api(
  { expose: true, method: "GET", path: "/assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetAssessmentResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
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
  personalityType?: string;
  rawAnswers?: Record<string, string | string[]>;
}

// POST /assessment — Submit questionnaire answers, get career matches via local brain
export const submitAssessment = api(
  { expose: true, method: "POST", path: "/assessment", auth: true },
  async (params: SubmitAssessmentParams): Promise<GetAssessmentResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    RateLimits.assessment("assess:" + userID);
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    const now = new Date().toISOString();

    const { careerMatches, skillGaps } = getTopCareerMatches({
      workStyle: params.workStyle,
      strengths: params.strengths,
      values: params.values,
      currentSkills: params.currentSkills,
      experienceLevel: params.experienceLevel,
      interests: params.interests,
      currentRole: params.currentRole,
      personalityType: params.personalityType,
      answers: params.rawAnswers,
    });

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

    // Award "First Steps" achievement for completing the assessment
    try { await awardAchievement({ userId: params.userId, badgeKey: "first_steps" }); } catch {}

    // Notify user that their assessment is complete
    try {
      const { createNotification } = await import("../streaks/streaks");
      await createNotification({
        userId: params.userId,
        type: "info",
        title: "Assessment Complete",
        body: "Check your career matches and start your roadmap.",
      });
    } catch {}

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

// POST /assessment/certificates — Pre-built certificate recommendations from career brain
export const getCertificates = api(
  { expose: true, method: "POST", path: "/assessment/certificates", auth: true },
  async ({ userId, skills, targetRole }: GetCertificatesParams): Promise<GetCertificatesResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    const recommendations = getCertificatesForRole(targetRole, skills);
    return { recommendations };
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

// POST /assessment/career-recommendations — Pre-built recommendations from career brain
export const getCareerRecommendations = api(
  { expose: true, method: "POST", path: "/assessment/career-recommendations", auth: true },
  async (params: CareerRecommendationsParams): Promise<CareerRecommendationsResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");

    return getCareerRecsForRole(params.targetRole);
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

// POST /assessment/skill-gap-analysis — Enhanced skill gap analysis with modifier layers
export const analyzeSkillGaps = api(
  { expose: true, method: "POST", path: "/assessment/skill-gap-analysis", auth: true },
  async (params: SkillGapAssessmentParams): Promise<{
    result: {
      skillGaps: SkillGapItem[];
      summary: string;
      topPriority: string;
      gapAdvice?: { category: string; adviceSnippet: string; actionItems: string[] };
      experienceTier?: string;
      matchedRules?: string[];
    };
  }> => {
    const currentSkills = [
      ...params.tools,
      ...Object.entries(params.technicalSkills)
        .filter(([, v]) => v && v !== "none")
        .map(([k]) => k),
      ...Object.entries(params.softSkills)
        .filter(([, v]) => v && v !== "none")
        .map(([k]) => k),
    ];

    const result = analyzeSkillGapsForRole(
      params.targetRole,
      currentSkills,
      params.technicalSkills,
      params.softSkills,
      params.biggestGap,
      {
        targetRole: params.targetRole,
        currentSkills,
        technicalSkills: params.technicalSkills,
        softSkills: params.softSkills,
        biggestGap: params.biggestGap,
        yearsExperience: params.yearsExperience,
        learningStyle: params.learningStyle,
      },
    );

    return { result };
  }
);

// ── Assessment V2 ────────────────────────────────────────────────────────────

interface SubmitAssessmentV2Params {
  userId: string;
  rawAnswers: Record<string, string | string[]>;
  workStyle?: string;
  strengths?: string[];
  values?: string[];
  currentSkills?: string[];
  experienceLevel?: string;
  interests?: string[];
  trajectory?: string;
}

interface AssessmentV2Response {
  result: {
    careerMatches: any[];
    skillGaps: any[];
    archetype: { id: string; name: string; tagline: string; description: string };
    riasec: any;
    bigFive: any;
    narrative: any;
    categorizedMatches?: any[];
  };
}

export const submitAssessmentV2 = api(
  { expose: true, method: "POST", path: "/assessment-v2", auth: true },
  async (params: SubmitAssessmentV2Params): Promise<AssessmentV2Response> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    RateLimits.assessment("assess:" + userID);

    const rawAnswers = params.rawAnswers ?? {};

    // Compute scores
    const riasec = computeRIASEC(rawAnswers as Record<string, string[]>);
    const bigFive = computeBigFive(rawAnswers as Record<string, string[]>);
    const archetype = determineArchetype(riasec, bigFive);

    // Get career matches using v2 engine
    const { careerMatches, skillGaps, categorizedMatches } = getTopCareerMatchesV2({
      workStyle: params.workStyle ?? '',
      strengths: params.strengths ?? [],
      values: params.values ?? [],
      currentSkills: params.currentSkills ?? [],
      experienceLevel: params.experienceLevel ?? 'junior',
      interests: params.interests ?? [],
      answers: rawAnswers,
    }, 3);

    // Generate narrative
    const narrative = generateNarrative(
      archetype.name,
      archetype.tagline,
      riasec,
      bigFive,
      params.trajectory ?? 'explorer',
      { remote: true, teamSize: 'small', pace: 'steady' },
      userID,
    );

    // Store results (same table, upsert)
    const now = new Date().toISOString();
    await db.exec`
      INSERT INTO assessments (user_id, completed_at, strengths, values, personality_type, career_matches, raw_answers, skill_gaps, current_skills)
      VALUES (${params.userId}, ${now}, ${JSON.stringify(params.strengths ?? [])}, ${JSON.stringify(params.values ?? [])}, ${archetype.id}, ${JSON.stringify(careerMatches)}, ${JSON.stringify(rawAnswers)}, ${JSON.stringify(skillGaps)}, ${JSON.stringify(params.currentSkills ?? [])})
      ON CONFLICT (user_id) DO UPDATE SET
        completed_at = excluded.completed_at,
        strengths = excluded.strengths,
        values = excluded.values,
        personality_type = excluded.personality_type,
        career_matches = excluded.career_matches,
        raw_answers = excluded.raw_answers,
        skill_gaps = excluded.skill_gaps,
        current_skills = excluded.current_skills
    `;

    // Award achievement
    try { await awardAchievement({ userId: params.userId, badgeKey: "first_steps" }); } catch {}
    try {
      const { createNotification } = await import("../streaks/streaks");
      await createNotification({ userId: params.userId, type: "info", title: "Assessment Complete", body: "Check your career matches and start your roadmap." });
    } catch {}

    return {
      result: {
        careerMatches,
        skillGaps,
        archetype: { id: archetype.id, name: archetype.name, tagline: archetype.tagline, description: archetype.description },
        riasec,
        bigFive,
        narrative,
        categorizedMatches,
      },
    };
  }
);

// ── Admin Endpoints ──────────────────────────────────────────────────────────

export interface AdminAssessmentStatsResponse {
  userIdsWithAssessment: string[];
  totalAssessments: number;
}

export const adminAssessmentStats = api(
  { expose: true, method: "GET", path: "/admin/assessment-stats", auth: true },
  async (): Promise<AdminAssessmentStatsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const userIds: string[] = [];
    try {
      const rows = db.query`SELECT user_id FROM assessments`;
      for await (const row of rows) {
        userIds.push(row.user_id);
      }
    } catch {}

    return { userIdsWithAssessment: userIds, totalAssessments: userIds.length };
  }
);

export const adminDeleteUserAssessment = api(
  { expose: true, method: "DELETE", path: "/admin/user-assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    await db.exec`DELETE FROM assessments WHERE user_id = ${userId}`;
    return { success: true };
  }
);

// GET /admin/assessment/:userId — Get a specific user's assessment results
export const adminGetAssessment = api(
  { expose: true, method: "GET", path: "/admin/assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<any> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");
    // Same logic as getAssessment but for any user
    const row = await db.queryRow`SELECT * FROM assessments WHERE user_id = ${userId}`;
    if (!row) return { result: null };
    return {
      result: {
        completedAt: row.completed_at,
        careerMatches: JSON.parse(row.career_matches || '[]'),
        skillGaps: JSON.parse(row.skill_gaps || '[]'),
        currentSkills: JSON.parse(row.current_skills || '[]'),
        personalityType: row.personality_type,
      },
    };
  }
);

// ── Admin Analytics ───────────────────────────────────────────────────────────

interface AdminAnalyticsResponse {
  totalAssessments: number;
  topCareers: { title: string; count: number }[];
}

// GET /admin/analytics — Assessment analytics (most common career matches, domain distribution)
export const adminAnalytics = api(
  { expose: true, method: "GET", path: "/admin/analytics", auth: true },
  async (): Promise<AdminAnalyticsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const totalAssessments = await db.queryRow`SELECT COUNT(*) as count FROM assessments`;

    // Get all career matches to compute popularity
    const careerCounts: Record<string, number> = {};
    const rows = db.query`SELECT career_matches FROM assessments WHERE career_matches IS NOT NULL`;
    for await (const row of rows) {
      try {
        const matches = JSON.parse(row.career_matches || '[]');
        for (const m of matches) {
          if (m.title) careerCounts[m.title] = (careerCounts[m.title] || 0) + 1;
        }
      } catch {}
    }

    const topCareers = Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));

    return {
      totalAssessments: Number(totalAssessments?.count ?? 0),
      topCareers,
    };
  }
);
