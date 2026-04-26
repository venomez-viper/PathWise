import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData, checkAdmin } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";
import {
  getCertificatesForRole,
  getCareerRecsForRole,
  analyzeSkillGapsForRole,
} from "./career-brain";
import { getTopCareerMatchesV2, computeRIASEC, computeBigFive, computeRIASECV2, computeBigFiveV2 } from "./career-brain-v2";
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
  careerFamily?: string;
  domain?: string;
  whyThisFits?: string[];
  salaryRange?: { min: number; max: number };
  growthOutlook?: string;
  dimensions?: {
    interest: number;
    personality: number;
    values: number;
    aptitude: number;
    environment: number;
    stage: number;
  };
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
             career_matches, skill_gaps, current_skills,
             riasec_scores, bigfive_scores, archetype_data, narrative_data
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
        riasec: row.riasec_scores ? JSON.parse(row.riasec_scores) : null,
        bigFive: row.bigfive_scores ? JSON.parse(row.bigfive_scores) : null,
        archetype: row.archetype_data ? JSON.parse(row.archetype_data) : null,
        narrative: row.narrative_data ? JSON.parse(row.narrative_data) : null,
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

// DEPRECATED: Uses v2 engine internally. Kept for backward compatibility.
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

    // v2 engine returns a superset of v1 fields; we strip extra fields below
    const v2Result = getTopCareerMatchesV2({
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

    // Map v2 career matches to the v1 shape with dimensions
    const careerMatches: CareerMatch[] = v2Result.careerMatches.map(m => ({
      title: m.title,
      matchScore: m.matchScore,
      description: m.description,
      requiredSkills: m.requiredSkills,
      pathwayTime: m.pathwayTime,
      dimensions: m.dimensions,
    }));
    const skillGaps = v2Result.skillGaps;

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
    try { await awardAchievement({ userId: params.userId, badgeKey: "first_steps" }); } catch (e) { console.error("[assessment] failed to award achievement:", e); }

    // Notify user that their assessment is complete
    try {
      const { createNotification } = await import("../streaks/streaks");
      await createNotification({
        userId: params.userId,
        type: "info",
        title: "Assessment Complete",
        body: "Check your career matches and start your roadmap.",
      });
    } catch (e) { console.error("[assessment] failed to create notification:", e); }

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
    // Input validation
    if (typeof params.technicalSkills !== 'object' || params.technicalSkills === null || Array.isArray(params.technicalSkills)) {
      throw APIError.invalidArgument("technicalSkills must be an object mapping skill names to proficiency levels");
    }
    if (typeof params.softSkills !== 'object' || params.softSkills === null || Array.isArray(params.softSkills)) {
      throw APIError.invalidArgument("softSkills must be an object mapping skill names to proficiency levels");
    }
    if (!Array.isArray(params.tools)) {
      throw APIError.invalidArgument("tools must be an array of tool names");
    }
    if (!params.yearsExperience || typeof params.yearsExperience !== 'string' || params.yearsExperience.trim() === '') {
      throw APIError.invalidArgument("yearsExperience must be a non-empty string");
    }

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

// ── Bias Detection ───────────────────────────────────────────────────────────

function detectBias(
  rawAnswers: Record<string, any>,
  startedAt?: string,
): { flags: string[]; confidenceNote?: string } {
  const flags: string[] = [];
  const values = Object.values(rawAnswers).map(v => (Array.isArray(v) ? v[0] : v));
  const total = values.length;
  if (total === 0) return { flags };

  // 1. Straight-lining: >60% same answer
  const freq: Record<string, number> = {};
  for (const v of values) {
    if (v != null) freq[String(v)] = (freq[String(v)] || 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(freq));
  if (maxFreq / total > 0.6) {
    flags.push("Straight-line pattern detected: most answers were the same option");
  }

  // 2. Speed: < 2 minutes for a full-length assessment
  if (startedAt) {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    if (total >= 50 && elapsed < 120) {
      flags.push("Responses completed unusually quickly");
    }
  }

  // 3. Extreme response bias: >70% at extremes (1/5 or strongly_agree/strongly_disagree)
  const EXTREMES = new Set(["1", "5", "strongly_agree", "strongly_disagree"]);
  const extremeCount = values.filter(v => EXTREMES.has(String(v))).length;
  if (extremeCount / total > 0.7) {
    flags.push("Most responses were at the extreme ends of the scale");
  }

  return {
    flags,
    confidenceNote: flags.length > 0
      ? "Some response patterns suggest your results may not fully reflect your preferences. Consider retaking the assessment with more time."
      : undefined,
  };
}

// ── Validation Consistency Check ────────────────────────────────────────────

/**
 * Validation question pairs: each entry maps a validation question ID to the
 * original question ID it cross-checks, plus a function that returns true when
 * the two answers are consistent.
 */
interface ValidationPair {
  validationId: string;
  originalId: string;
  isConsistent: (originalAnswer: string, validationAnswer: string) => boolean;
}

const VALIDATION_PAIRS: ValidationPair[] = [
  {
    // bf_v1 (reverse-coded: "avoid experiments") vs ri_i1 ("enjoy designing experiments")
    // ri_i1 "like" should pair with bf_v1 low agreement (1-2), ri_i1 "dislike" with high (4-5)
    validationId: 'bf_v1',
    originalId: 'ri_i1',
    isConsistent: (orig, val) => {
      const likesExperiments = orig === 'like';
      const dislikesExperiments = orig === 'dislike';
      const valNum = parseInt(val, 10);
      if (isNaN(valNum)) return true; // skip if unparseable
      if (likesExperiments) return valNum <= 3; // should disagree with "avoid experiments"
      if (dislikesExperiments) return valNum >= 3; // should agree with "avoid experiments"
      return true; // neutral is always consistent
    },
  },
  {
    // wd_v2 (energy after group work) vs bf_e3 ("recharged after collaborating")
    // bf_e3 high (4-5) = extraverted -> wd_v2 should be "energized"
    // bf_e3 low (1-2) = introverted -> wd_v2 should be "drained"
    validationId: 'wd_v2',
    originalId: 'bf_e3',
    isConsistent: (orig, val) => {
      const origNum = parseInt(orig, 10);
      if (isNaN(origNum)) return true;
      if (origNum >= 4) return val === 'energized' || val === 'mixed';
      if (origNum <= 2) return val === 'drained' || val === 'mixed';
      return true; // neutral is always consistent
    },
  },
  {
    // sa_v3 (comfort with freelance/variable income) vs va_1 (autonomy vs security)
    // va_1 "self_direction" -> sa_v3 should be higher (3+)
    // va_1 "security" -> sa_v3 should be lower (1-3)
    validationId: 'sa_v3',
    originalId: 'va_1',
    isConsistent: (orig, val) => {
      const valNum = parseInt(val, 10);
      if (isNaN(valNum)) return true;
      if (orig === 'self_direction') return valNum >= 3;
      if (orig === 'security') return valNum <= 3;
      return true;
    },
  },
  {
    // lc_v4 (past best work style) vs wd_1 (preferred contribution style)
    // wd_1 "independent" -> lc_v4 "solo"
    // wd_1 "paired" -> lc_v4 "pair"
    // wd_1 "coordinator" -> lc_v4 "team_lead"
    // wd_1 "foundation" -> lc_v4 "research"
    validationId: 'lc_v4',
    originalId: 'wd_1',
    isConsistent: (orig, val) => {
      const mapping: Record<string, string> = {
        independent: 'solo',
        paired: 'pair',
        coordinator: 'team_lead',
        foundation: 'research',
      };
      // Consistent if exact match OR either is missing
      if (!orig || !val) return true;
      return mapping[orig] === val;
    },
  },
];

function checkConsistency(
  rawAnswers: Record<string, any>,
): { consistencyScore: number; flags: string[] } {
  const flags: string[] = [];
  let pairsChecked = 0;
  let pairsConsistent = 0;

  for (const pair of VALIDATION_PAIRS) {
    const origRaw = rawAnswers[pair.originalId];
    const valRaw = rawAnswers[pair.validationId];
    // Skip pairs where either question was not answered
    if (origRaw == null || valRaw == null) continue;

    const origAnswer = Array.isArray(origRaw) ? origRaw[0] : String(origRaw);
    const valAnswer = Array.isArray(valRaw) ? valRaw[0] : String(valRaw);

    pairsChecked++;
    if (pair.isConsistent(origAnswer, valAnswer)) {
      pairsConsistent++;
    }
  }

  // If no pairs could be checked, assume full consistency
  if (pairsChecked === 0) return { consistencyScore: 100, flags };

  const consistencyScore = Math.round((pairsConsistent / pairsChecked) * 100);

  if (pairsChecked >= 3 && (pairsChecked - pairsConsistent) >= 3) {
    flags.push("Some answers appear inconsistent - results may be less reliable");
  }

  return { consistencyScore, flags };
}

// ── Assessment V2 ────────────────────────────────────────────────────────────

interface SubmitAssessmentV2Params {
  userId: string;
  rawAnswers: Record<string, string | string[]>;
  startedAt?: string;
  workStyle?: string;
  strengths?: string[];
  values?: string[];
  currentSkills?: string[];
  experienceLevel?: string;
  interests?: string[];
  trajectory?: string;
}

interface RIASECResult {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}

interface NarrativeResult {
  headline: string;
  tagline: string;
  fullNarrative: string;
  shareQuote: string;
}

interface AssessmentV2Response {
  result: {
    careerMatches: {
      title: string; matchScore: number; description: string;
      requiredSkills: string[]; pathwayTime: string;
      careerFamily?: string; domain?: string;
      whyThisFits?: string[];
      salaryRange?: { min: number; max: number };
      growthOutlook?: string;
      dimensions?: {
        interest: number; personality: number; values: number;
        aptitude: number; environment: number; stage: number;
      };
    }[];
    skillGaps: { skill: string; importance: string; learningResource: string; scoreImpact?: number; learningHours?: number; roi?: number }[];
    archetype: { id: string; name: string; tagline: string; description: string; confidence?: number; runnerUp?: string };
    riasec: RIASECResult;
    bigFive: BigFiveResult;
    narrative: NarrativeResult;
    categorizedMatches?: {
      category: string;
      profile: { id: string; title: string; domain: string; description: string };
      score: number;
      confidence: string;
      dimensions: { interest: number; personality: number; values: number; aptitude: number; environment: number; stage: number; total: number };
      whyThisFits: string[];
    }[];
    biasFlags?: string[];
    confidenceNote?: string;
    consistencyScore?: number;
  };
}

export const submitAssessmentV2 = api(
  { expose: true, method: "POST", path: "/assessment-v2", auth: true },
  async (params: SubmitAssessmentV2Params): Promise<AssessmentV2Response> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    RateLimits.assessment("assess:" + userID);

    const rawAnswers = params.rawAnswers ?? {};

    // Compute scores — detect v2 answer format (ri_/bf_ prefixed keys) vs v1 (int1/ws1)
    const hasV2Keys = Object.keys(rawAnswers).some(k => k.startsWith('ri_') || k.startsWith('bf_'));
    const riasec = hasV2Keys ? computeRIASECV2(rawAnswers) : computeRIASEC(rawAnswers as Record<string, string[]>);
    const bigFive = hasV2Keys ? computeBigFiveV2(rawAnswers) : computeBigFive(rawAnswers as Record<string, string[]>);
    const archetype = determineArchetype(riasec, bigFive);

    // Consistency check on validation question pairs
    const consistency = checkConsistency(rawAnswers);

    // Get career matches using v2 engine
    const { careerMatches: rawCareerMatches, skillGaps, categorizedMatches } = getTopCareerMatchesV2({
      workStyle: params.workStyle ?? '',
      strengths: params.strengths ?? [],
      values: params.values ?? [],
      currentSkills: params.currentSkills ?? [],
      experienceLevel: params.experienceLevel ?? 'junior',
      interests: params.interests ?? [],
      answers: rawAnswers,
    }, 3);

    // Dampen extreme scores if consistency is low
    const careerMatches = consistency.consistencyScore < 50
      ? rawCareerMatches.map(m => ({ ...m, matchScore: Math.round(m.matchScore * 0.95) }))
      : rawCareerMatches;

    // Generate narrative
    const narrative = generateNarrative(
      archetype.name,
      archetype.tagline,
      riasec,
      bigFive,
      params.trajectory ?? 'explorer',
      { remote: true, teamSize: 'small', pace: 'steady' },
      userID,
      archetype.confidence,
      archetype.runnerUp,
    );

    // Store results (same table, upsert)
    const now = new Date().toISOString();
    const archetypeJson = JSON.stringify({ id: archetype.id, name: archetype.name, tagline: archetype.tagline, description: archetype.description, superpower: archetype.superpower, growthEdge: archetype.growthEdge });
    await db.exec`
      INSERT INTO assessments (user_id, completed_at, strengths, values, personality_type, career_matches, raw_answers, skill_gaps, current_skills, riasec_scores, bigfive_scores, archetype_data, narrative_data)
      VALUES (${params.userId}, ${now}, ${JSON.stringify(params.strengths ?? [])}, ${JSON.stringify(params.values ?? [])}, ${archetype.id}, ${JSON.stringify(careerMatches)}, ${JSON.stringify(rawAnswers)}, ${JSON.stringify(skillGaps)}, ${JSON.stringify(params.currentSkills ?? [])}, ${JSON.stringify(riasec)}, ${JSON.stringify(bigFive)}, ${archetypeJson}, ${JSON.stringify(narrative)})
      ON CONFLICT (user_id) DO UPDATE SET
        completed_at = excluded.completed_at,
        strengths = excluded.strengths,
        values = excluded.values,
        personality_type = excluded.personality_type,
        career_matches = excluded.career_matches,
        raw_answers = excluded.raw_answers,
        skill_gaps = excluded.skill_gaps,
        current_skills = excluded.current_skills,
        riasec_scores = excluded.riasec_scores,
        bigfive_scores = excluded.bigfive_scores,
        archetype_data = excluded.archetype_data,
        narrative_data = excluded.narrative_data
    `;

    // Award achievement
    try { await awardAchievement({ userId: params.userId, badgeKey: "first_steps" }); } catch (e) { console.error("[assessment-v2] failed to award achievement:", e); }
    try {
      const { createNotification } = await import("../streaks/streaks");
      await createNotification({ userId: params.userId, type: "info", title: "Assessment Complete", body: "Check your career matches and start your roadmap." });
    } catch (e) { console.error("[assessment-v2] failed to create notification:", e); }

    // Bias detection
    const bias = detectBias(rawAnswers, params.startedAt);

    // Merge consistency flags with bias flags
    const allFlags = [...bias.flags, ...consistency.flags];
    const confidenceNote = allFlags.length > 0
      ? "Some response patterns suggest your results may not fully reflect your preferences. Consider retaking the assessment with more time."
      : undefined;

    return {
      result: {
        careerMatches,
        skillGaps,
        archetype: { id: archetype.id, name: archetype.name, tagline: archetype.tagline, description: archetype.description, confidence: archetype.confidence, runnerUp: archetype.runnerUp },
        riasec,
        bigFive,
        narrative,
        categorizedMatches,
        biasFlags: allFlags.length > 0 ? allFlags : undefined,
        confidenceNote,
        consistencyScore: consistency.consistencyScore,
      },
    };
  }
);

// ── Assessment V2 Progress (save/load) ───────────────────────────────────────

interface SaveProgressParams {
  currentPhase: number;
  currentQuestion: number;
  answers: Record<string, string | string[] | number>;
  completedTier: number;
  startedAt: string;
}

interface SaveProgressResponse {
  success: boolean;
}

// POST /assessment-v2/progress -- Save partial assessment state
export const saveAssessmentProgress = api(
  { expose: true, method: "POST", path: "/assessment-v2/progress", auth: true },
  async (params: SaveProgressParams): Promise<SaveProgressResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;

    const stateJson = JSON.stringify(params);
    await db.exec`
      INSERT INTO assessment_progress (user_id, state, updated_at)
      VALUES (${userID}, ${stateJson}::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        state = ${stateJson}::jsonb,
        updated_at = NOW()
    `;

    return { success: true };
  }
);

interface GetProgressResponse {
  progress: SaveProgressParams | null;
}

// GET /assessment-v2/progress -- Retrieve saved assessment progress
export const getAssessmentProgress = api(
  { expose: true, method: "GET", path: "/assessment-v2/progress", auth: true },
  async (): Promise<GetProgressResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;

    const row = await db.queryRow`
      SELECT state FROM assessment_progress WHERE user_id = ${userID}
    `;
    if (!row) return { progress: null };

    try {
      const parsed = typeof row.state === 'string' ? JSON.parse(row.state) : row.state;
      return { progress: parsed };
    } catch {
      return { progress: null };
    }
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
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const userIds: string[] = [];
    try {
      const rows = db.query`SELECT user_id FROM assessments`;
      for await (const row of rows) {
        userIds.push(row.user_id);
      }
    } catch (e) { console.error("[admin] failed to query assessment user IDs:", e); }

    return { userIdsWithAssessment: userIds, totalAssessments: userIds.length };
  }
);

export const adminDeleteUserAssessment = api(
  { expose: true, method: "DELETE", path: "/admin/user-assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    await db.exec`DELETE FROM assessments WHERE user_id = ${userId}`;
    return { success: true };
  }
);

interface AdminAssessmentResult {
  completedAt: string;
  careerMatches: { title: string; matchScore: number; description: string }[];
  skillGaps: { skill: string; importance: string; learningResource: string; scoreImpact?: number; learningHours?: number; roi?: number }[];
  currentSkills: string[];
  personalityType: string;
}

interface AdminGetAssessmentResponse {
  result: AdminAssessmentResult | null;
}

// GET /admin/assessment/:userId — Get a specific user's assessment results
export const adminGetAssessment = api(
  { expose: true, method: "GET", path: "/admin/assessment/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<AdminGetAssessmentResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
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
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
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
      } catch (e) { console.error("[admin] failed to parse career_matches JSON:", e); }
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

// ── Internal: Purge a user's data from the assessment DB ─────────────────────

/**
 * Wipe everything in this service that belongs to `userId`. Called by
 * `auth.adminDeleteUser` and `auth.deleteAccount` as part of the cross-service
 * cascade. Best-effort — each delete is isolated.
 */
export const purgeUser = api(
  { expose: false },
  async ({ userId }: { userId: string }): Promise<{ success: boolean; deleted: Record<string, boolean> }> => {
    const deleted: Record<string, boolean> = {};

    try {
      await db.exec`DELETE FROM assessment_progress WHERE user_id = ${userId}`;
      deleted.assessment_progress = true;
    } catch (err) {
      console.error("purgeUser(assessment): assessment_progress delete failed", err instanceof Error ? err.message : err);
      deleted.assessment_progress = false;
    }

    try {
      await db.exec`DELETE FROM assessments WHERE user_id = ${userId}`;
      deleted.assessments = true;
    } catch (err) {
      console.error("purgeUser(assessment): assessments delete failed", err instanceof Error ? err.message : err);
      deleted.assessments = false;
    }

    return { success: true, deleted };
  }
);
