/**
 * Career Brain v2 — Vector-Space Scoring Engine
 *
 * Replaces the v1 weighted-overlap engine with cosine similarity,
 * per-career dimension weights, expanded synergy/anti-pattern detection,
 * percentile normalization, and categorized result presentation.
 *
 * Designed to run in parallel with v1 for shadow-mode A/B testing.
 */

import type { CareerProfile, SkillGapEntry, CertEntry, RecEntry, MilestoneEntry } from "./career-profiles";
import { CAREER_PROFILES_PART1 } from "./career-profiles";
import { CAREER_PROFILES_PART2 } from "./career-profiles-2";
import { CAREER_PROFILES_3 } from "./career-profiles-3";

// Deduplicate profiles by id — last occurrence wins (newer files take precedence)
const ALL_PROFILES: CareerProfile[] = (() => {
  const merged = [...CAREER_PROFILES_PART1, ...CAREER_PROFILES_PART2, ...CAREER_PROFILES_3];
  const byId = new Map<string, CareerProfile>();
  for (const p of merged) byId.set(p.id, p);
  return Array.from(byId.values());
})();

// ── Re-export types matching v1 for backward compat ─────────────────────

export interface CareerMatch {
  title: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  pathwayTime: string;
  careerFamily?: string;
  whyThisFits?: string[];
  salaryRange?: { min: number; max: number };
  growthOutlook?: string;
  domain?: string;
}

export interface SkillGap {
  skill: string;
  importance: "high" | "medium" | "low";
  learningResource: string;
}

export interface AssessmentInput {
  workStyle: string;
  strengths: string[];
  values: string[];
  currentSkills: string[];
  experienceLevel: string;
  interests: string[];
  currentRole?: string;
  personalityType?: string;
  answers?: Record<string, string | string[]>;
}

// ── v2 Types ────────────────────────────────────────────────────────────

export interface CareerWeights {
  interest: number;
  personality: number;
  values: number;
  aptitude: number;
  environment: number;
  stage: number;
}

const DEFAULT_WEIGHTS: CareerWeights = {
  interest: 0.30,
  personality: 0.20,
  values: 0.25,
  aptitude: 0.05,
  environment: 0.10,
  stage: 0.10,
};

export interface DimensionalScore {
  interest: number;
  personality: number;
  values: number;
  aptitude: number;
  environment: number;
  stage: number;
  total: number;
}

export interface CategorizedMatch {
  category: "best_overall" | "fastest_path" | "highest_growth" | "hidden_gem" | "stretch_goal";
  profile: CareerProfile;
  score: number;
  confidence: "high" | "medium" | "low";
  dimensions: DimensionalScore;
  whyThisFits: string[];
}

export interface RIASECScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}

// ── Dimension Mapping ───────────────────────────────────────────────────
// Maps answer keys to CareerProfile fields, grouped by scoring dimension.

const INTEREST_DIMS: [string, keyof CareerProfile][] = [
  ["int1", "interests"],
  ["int2", "problemTypes"],
  ["int3", "archetypes"],
];

const PERSONALITY_DIMS: [string, keyof CareerProfile][] = [
  ["ws1", "workStyles"],
  ["ws2", "decisionStyle"],
  ["ws3", "collaboration"],
  ["ws4", "ambiguityStyle"],
];

const VALUES_DIMS: [string, keyof CareerProfile][] = [
  ["val1", "coreValues"],
  ["val2", "tradeoffs"],
  ["val3", "frustrations"],
  ["val4", "rewards"],
];

const ENVIRONMENT_DIMS: [string, keyof CareerProfile][] = [
  ["env1", "environments"],
  ["env2", "teamSizes"],
  ["env3", "paces"],
  ["env4", "managementStyles"],
];

const STAGE_DIMS: [string, keyof CareerProfile][] = [
  ["car1", "careerStages"],
  ["car2", "riskLevels"],
  ["car3", "trajectories"],
  ["car4", "groupRoles"],
];

const ALL_DIMS: [string, keyof CareerProfile][] = [
  ...INTEREST_DIMS,
  ...PERSONALITY_DIMS,
  ...VALUES_DIMS,
  ...ENVIRONMENT_DIMS,
  ...STAGE_DIMS,
];

// ── Helpers ─────────────────────────────────────────────────────────────

/** Normalise a raw answer entry to a string array */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Extract structured answers from AssessmentInput */
function extractAnswers(input: AssessmentInput): Record<string, string[]> {
  if (input.answers && Object.keys(input.answers).length > 0) {
    const normalised: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(input.answers)) {
      normalised[k] = toArray(v);
    }
    return normalised;
  }

  // Reconstruct from legacy personalityType format: "int1-ws2-car1"
  const parts = (input.personalityType || "").split("-");
  const extracted: Record<string, string[]> = {};

  if (parts[0] && parts[0] !== "mixed") extracted.int1 = [parts[0]];
  if (parts[1] && parts[1] !== "balanced") extracted.ws2 = [parts[1]];
  if (parts[2]) extracted.car1 = [parts[2]];

  for (const s of input.strengths) {
    const lower = s.toLowerCase();
    if (lower.includes("technical")) extracted.int2 = ["technical"];
    else if (lower.includes("human")) extracted.int2 = ["human"];
    else if (lower.includes("creative")) extracted.int2 = ["creative"];
    else if (lower.includes("strategic")) extracted.int2 = ["strategic"];
    else if (lower.includes("scientific")) extracted.int2 = ["scientific"];

    if (lower.includes("open")) extracted.ws1 = ["open"];
    else if (lower.includes("cautious")) extracted.ws1 = ["cautious"];
    else if (lower.includes("organized")) extracted.ws1 = ["organized"];
    else if (lower.includes("empathetic")) extracted.ws1 = ["empathetic"];

    if (lower.includes("leader")) extracted.car4 = ["leader"];
    else if (lower.includes("ideator")) extracted.car4 = ["ideator"];
    else if (lower.includes("doer")) extracted.car4 = ["doer"];
    else if (lower.includes("harmonizer")) extracted.car4 = ["harmonizer"];

    if (lower.includes("structure")) extracted.ws4 = ["structure"];
    else if (lower.includes("experiment")) extracted.ws4 = ["experiment"];
    else if (lower.includes("consult")) extracted.ws4 = ["consult"];
  }

  for (const v of input.values) {
    if (["autonomy", "prestige", "purpose", "mastery"].includes(v)) extracted.val1 = [v];
    if (["purpose_over_wealth", "wealth_over_stability", "balance_over_creativity"].includes(v)) extracted.val2 = [v];
    if (["monotony", "no_impact", "micromanaged", "isolation"].includes(v)) extracted.val3 = [v];
    if (["wealth", "recognition", "learning", "impact"].includes(v)) extracted.val4 = [v];
  }

  extracted.ws3 = [input.workStyle || "mixed"];
  return extracted;
}

// ── 1. Trait Vector Encoding ────────────────────────────────────────────

/**
 * Build the vocabulary of all possible trait values for each dimension
 * by scanning every career profile. Returns a map from profile field name
 * to sorted unique values.
 */
export function buildVocabulary(): Map<string, string[]> {
  const vocab = new Map<string, Set<string>>();

  for (const [, profileKey] of ALL_DIMS) {
    if (!vocab.has(profileKey)) vocab.set(profileKey, new Set());
    const set = vocab.get(profileKey)!;
    for (const profile of ALL_PROFILES) {
      const vals = (profile[profileKey] as string[]) ?? [];
      for (const v of vals) set.add(v.toLowerCase());
    }
  }

  const result = new Map<string, string[]>();
  for (const [key, set] of vocab) {
    result.set(key, [...set].sort());
  }
  return result;
}

// Lazily computed vocabulary singleton
let _vocab: Map<string, string[]> | null = null;
function getVocab(): Map<string, string[]> {
  if (!_vocab) _vocab = buildVocabulary();
  return _vocab;
}

/**
 * Encode user answers into a numeric vector aligned with the global vocabulary.
 * Each vocabulary term gets a 1 if the user selected it, 0 otherwise.
 */
export function encodeUserVector(answers: Record<string, string[]>): number[] {
  const vocab = getVocab();
  const vector: number[] = [];

  for (const [answerKey, profileKey] of ALL_DIMS) {
    const terms = vocab.get(profileKey) ?? [];
    const userValues = new Set((answers[answerKey] ?? []).map(v => v.toLowerCase()));
    for (const term of terms) {
      vector.push(userValues.has(term) ? 1 : 0);
    }
  }

  return vector;
}

/**
 * Encode a career profile into a numeric vector aligned with the global vocabulary.
 * Each vocabulary term gets a 1 if the profile includes it, 0 otherwise.
 */
export function encodeProfileVector(profile: CareerProfile): number[] {
  const vocab = getVocab();
  const vector: number[] = [];

  for (const [, profileKey] of ALL_DIMS) {
    const terms = vocab.get(profileKey) ?? [];
    const profileValues = new Set(((profile[profileKey] as string[]) ?? []).map(v => v.toLowerCase()));
    for (const term of terms) {
      vector.push(profileValues.has(term) ? 1 : 0);
    }
  }

  return vector;
}

/**
 * Encode vectors scoped to a specific dimension group (e.g., interest, personality).
 * Returns [userVector, profileVector] for just that dimension's fields.
 */
function encodeDimensionVectors(
  answers: Record<string, string[]>,
  profile: CareerProfile,
  dims: [string, keyof CareerProfile][],
): [number[], number[]] {
  const vocab = getVocab();
  const userVec: number[] = [];
  const profileVec: number[] = [];

  for (const [answerKey, profileKey] of dims) {
    const terms = vocab.get(profileKey) ?? [];
    const userValues = new Set((answers[answerKey] ?? []).map(v => v.toLowerCase()));
    const profileValues = new Set(((profile[profileKey] as string[]) ?? []).map(v => v.toLowerCase()));
    for (const term of terms) {
      userVec.push(userValues.has(term) ? 1 : 0);
      profileVec.push(profileValues.has(term) ? 1 : 0);
    }
  }

  return [userVec, profileVec];
}

/**
 * Jaccard similarity: |intersection| / |union|.
 * Unlike cosine similarity, Jaccard penalises profiles that have many traits
 * the user did NOT select. This prevents overly broad profiles from matching
 * everyone. Returns 0 if both vectors are all-zeros.
 */
function jaccardSimilarity(a: number[], b: number[]): number {
  let intersection = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0 || b[i] > 0) union++;
    if (a[i] > 0 && b[i] > 0) intersection++;
  }
  return union === 0 ? 0 : intersection / union;
}

// ── 2. Cosine Similarity ────────────────────────────────────────────────

/**
 * Compute cosine similarity between two numeric vectors.
 * Returns a value in [0, 1] for non-negative vectors (which ours always are).
 * Returns 0 if either vector is all-zeros.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

// ── 3. Per-Career Dimensional Scoring ───────────────────────────────────

/**
 * Compute per-dimension cosine similarities between user answers and a career profile,
 * then combine using the provided (or default) weights.
 */
/**
 * Check whether the user answered any personality-dimension questions.
 * Personality answers use keys like ws1, ws2, ws3, ws4.
 */
function hasPersonalityAnswers(answers: Record<string, string[]>): boolean {
  return PERSONALITY_DIMS.some(([key]) => (answers[key] ?? []).length > 0);
}

/**
 * Check whether the user answered any environment-dimension questions.
 */
function hasEnvironmentAnswers(answers: Record<string, string[]>): boolean {
  return ENVIRONMENT_DIMS.some(([key]) => (answers[key] ?? []).length > 0);
}

/**
 * Check whether the user answered any stage-dimension questions.
 */
function hasStageAnswers(answers: Record<string, string[]>): boolean {
  return STAGE_DIMS.some(([key]) => (answers[key] ?? []).length > 0);
}

export function scoreDimensional(
  userAnswers: Record<string, string[]>,
  profile: CareerProfile,
  weights?: CareerWeights,
): DimensionalScore {
  const w = { ...(weights ?? DEFAULT_WEIGHTS) };

  // ── Progressive profiling: redistribute weights for unanswered dimensions ──
  // When users complete only Tier 1 (interests + values + context), personality/
  // environment/stage dimensions may be empty. Zero those weights and redistribute
  // proportionally to answered dimensions so the total still sums to ~1.
  const missingWeight: number[] = [];
  if (!hasPersonalityAnswers(userAnswers)) {
    missingWeight.push(w.personality);
    w.personality = 0;
  }
  if (!hasEnvironmentAnswers(userAnswers)) {
    missingWeight.push(w.environment);
    w.environment = 0;
  }
  if (!hasStageAnswers(userAnswers)) {
    missingWeight.push(w.stage);
    w.stage = 0;
  }

  if (missingWeight.length > 0) {
    const totalMissing = missingWeight.reduce((a, b) => a + b, 0);
    // Redistribute proportionally to interest and values (the core Tier 1 dims)
    const interestShare = w.interest / (w.interest + w.values || 1);
    w.interest += totalMissing * interestShare;
    w.values += totalMissing * (1 - interestShare);
  }

  const [ui, pi] = encodeDimensionVectors(userAnswers, profile, INTEREST_DIMS);
  const [up, pp] = encodeDimensionVectors(userAnswers, profile, PERSONALITY_DIMS);
  const [uv, pv] = encodeDimensionVectors(userAnswers, profile, VALUES_DIMS);
  const [ue, pe] = encodeDimensionVectors(userAnswers, profile, ENVIRONMENT_DIMS);
  const [us, ps] = encodeDimensionVectors(userAnswers, profile, STAGE_DIMS);

  // Blend cosine similarity (direction match) with Jaccard similarity (overlap penalty)
  // to prevent overly broad profiles from matching everyone. 60% cosine + 40% Jaccard.
  const blendSim = (u: number[], p: number[]): number =>
    cosineSimilarity(u, p) * 0.6 + jaccardSimilarity(u, p) * 0.4;

  const interest = blendSim(ui, pi);
  const personality = blendSim(up, pp);
  const values = blendSim(uv, pv);
  const environment = blendSim(ue, pe);
  const stage = blendSim(us, ps);

  // Aptitude: skill overlap ratio (simple since we don't have per-skill vectors)
  // handled separately; placeholder cosine = 0 until we have aptitude vectors
  const aptitude = 0;

  const total =
    interest * w.interest +
    personality * w.personality +
    values * w.values +
    aptitude * w.aptitude +
    environment * w.environment +
    stage * w.stage;

  return { interest, personality, values, aptitude, environment, stage, total };
}

// ── 4. Synergy Detection (30 patterns, top 15+ implemented) ────────────

interface SynergyPatternV2 {
  id: string;
  name: string;
  requires: Record<string, string[]>;
  boostWhen: { field: keyof CareerProfile; values: string[] }[];
  matchThreshold: number;
  bonus: number;
  explanation: string;
}

const SYNERGY_PATTERNS_V2: SynergyPatternV2[] = [
  // S01 — Software Engineering Core
  {
    id: "s01-software-engineering-core",
    name: "Software Engineering Core",
    requires: { int1: ["investigative", "realistic"], int2: ["technical"], int3: ["builder"], val1: ["mastery"] },
    boostWhen: [
      { field: "domains", values: ["Technology"] },
      { field: "archetypes", values: ["builder", "optimizer"] },
      { field: "problemTypes", values: ["technical"] },
    ],
    matchThreshold: 0.75,
    bonus: 3.5,
    explanation: "You combine technical curiosity with a builder's drive and a hunger for mastery -- the core DNA of a software engineer.",
  },
  // S02 — Data Science Pipeline
  {
    id: "s02-data-science-pipeline",
    name: "Data Science Pipeline",
    requires: { int1: ["investigative"], int2: ["scientific", "technical"], ws2: ["thinking"], val4: ["learning"] },
    boostWhen: [
      { field: "domains", values: ["Data & Analytics"] },
      { field: "problemTypes", values: ["analytical", "scientific"] },
      { field: "decisionStyle", values: ["thinking", "analytical"] },
    ],
    matchThreshold: 0.75,
    bonus: 3,
    explanation: "Your analytical mind and love of scientific discovery align perfectly with data careers.",
  },
  // S03 — DevOps / Infrastructure
  {
    id: "s03-devops-infrastructure",
    name: "DevOps / Infrastructure",
    requires: { int3: ["builder", "operator"], ws1: ["organized"], ws4: ["structure"], env3: ["steady"] },
    boostWhen: [
      { field: "domains", values: ["Technology", "Cybersecurity"] },
      { field: "archetypes", values: ["builder", "optimizer"] },
      { field: "paces", values: ["steady"] },
    ],
    matchThreshold: 0.75,
    bonus: 2.5,
    explanation: "You thrive on building reliable systems with structure and consistency.",
  },
  // S04 — Cybersecurity Mindset
  {
    id: "s04-cybersecurity-mindset",
    name: "Cybersecurity Mindset",
    requires: { int1: ["investigative"], ws1: ["cautious"], ws2: ["thinking"], ws4: ["research", "structure"] },
    boostWhen: [
      { field: "domains", values: ["Technology", "Cybersecurity"] },
      { field: "archetypes", values: ["optimizer", "analyst"] },
      { field: "workStyles", values: ["cautious", "methodical"] },
    ],
    matchThreshold: 0.66,
    bonus: 3,
    explanation: "Your cautious, analytical approach makes you suited to spotting vulnerabilities others miss.",
  },
  // S05 — AI/ML Specialist
  {
    id: "s05-ai-ml-specialist",
    name: "AI/ML Specialist",
    requires: { int1: ["investigative"], int2: ["scientific", "technical"], val1: ["mastery"], ws1: ["open"], ws4: ["experiment", "research"] },
    boostWhen: [
      { field: "domains", values: ["Data & Analytics", "Technology"] },
      { field: "problemTypes", values: ["scientific", "analytical"] },
      { field: "archetypes", values: ["thinker", "builder"] },
    ],
    matchThreshold: 0.66,
    bonus: 3.5,
    explanation: "Your scientific curiosity and comfort with experimentation is what cutting-edge AI work demands.",
  },
  // S06 — Full-Stack Versatility
  {
    id: "s06-fullstack-versatility",
    name: "Full-Stack Versatility",
    requires: { int3: ["builder"], ws1: ["open"], ws3: ["mixed"], car3: ["generalist"] },
    boostWhen: [
      { field: "domains", values: ["Technology"] },
      { field: "archetypes", values: ["builder", "generalist"] },
      { field: "trajectories", values: ["generalist"] },
    ],
    matchThreshold: 0.75,
    bonus: 2.5,
    explanation: "You're the adaptable generalist who can work across the entire stack.",
  },
  // S07 — Technical Leadership
  {
    id: "s07-technical-leadership",
    name: "Technical Leadership",
    requires: { car4: ["leader"], int2: ["strategic", "technical"], car3: ["manager"], car1: ["advancing"] },
    boostWhen: [
      { field: "trajectories", values: ["manager", "executive"] },
      { field: "groupRoles", values: ["leader"] },
      { field: "domains", values: ["Technology", "Product Management"] },
    ],
    matchThreshold: 0.75,
    bonus: 3,
    explanation: "You combine technical understanding with natural leadership and strategic thinking.",
  },
  // S09 — UX / Design Thinking
  {
    id: "s09-ux-design-thinking",
    name: "UX / Design Thinking",
    requires: { int1: ["artistic"], int2: ["human", "creative"], ws1: ["empathetic"], ws2: ["consensus", "feeling"] },
    boostWhen: [
      { field: "domains", values: ["Design & UX"] },
      { field: "problemTypes", values: ["human", "creative"] },
      { field: "archetypes", values: ["creator", "helper"] },
    ],
    matchThreshold: 0.75,
    bonus: 3,
    explanation: "You blend creative sensibility with genuine empathy for users.",
  },
  // S10 — Content Creation
  {
    id: "s10-content-creation",
    name: "Content Creation",
    requires: { int2: ["creative"], int1: ["artistic"], val1: ["autonomy"], ws3: ["solo", "pair"], car4: ["ideator"] },
    boostWhen: [
      { field: "domains", values: ["Media & Entertainment", "Marketing", "Media & Journalism"] },
      { field: "archetypes", values: ["creator", "visionary"] },
      { field: "coreValues", values: ["autonomy"] },
    ],
    matchThreshold: 0.66,
    bonus: 2.5,
    explanation: "Your creative instinct and love of autonomy make content creation a natural fit.",
  },
  // S15 — Clinical Healthcare
  {
    id: "s15-clinical-healthcare",
    name: "Clinical Healthcare",
    requires: { int1: ["social"], int2: ["human", "scientific"], ws1: ["empathetic", "cautious"], val1: ["purpose"], val4: ["impact"] },
    boostWhen: [
      { field: "domains", values: ["Healthcare"] },
      { field: "archetypes", values: ["helper", "analyst"] },
      { field: "coreValues", values: ["purpose", "impact"] },
    ],
    matchThreshold: 0.66,
    bonus: 3,
    explanation: "Your blend of empathy, scientific rigor, and purpose-driven motivation is the foundation of clinical healthcare careers.",
  },
  // S16 — Teaching / Education
  {
    id: "s16-teaching-education",
    name: "Teaching / Education",
    requires: { int1: ["social"], int3: ["helper", "thinker"], int2: ["human"], val2: ["purpose_over_wealth"], val4: ["impact"] },
    boostWhen: [
      { field: "domains", values: ["Education & Training", "Education"] },
      { field: "archetypes", values: ["helper", "mentor"] },
      { field: "coreValues", values: ["purpose", "benevolence"] },
    ],
    matchThreshold: 0.66,
    bonus: 3,
    explanation: "You genuinely care about others' growth and will trade wealth for meaning.",
  },
  // S21 — Strategic Consulting
  {
    id: "s21-strategic-consulting",
    name: "Strategic Consulting",
    requires: { int2: ["strategic"], int1: ["investigative"], ws2: ["thinking"], val2: ["growth_over_comfort"], ws3: ["collaborative", "mixed"] },
    boostWhen: [
      { field: "domains", values: ["Consulting", "Finance/Consulting"] },
      { field: "problemTypes", values: ["strategic", "analytical"] },
      { field: "trajectories", values: ["generalist", "manager"] },
    ],
    matchThreshold: 0.66,
    bonus: 3,
    explanation: "You combine analytical depth with strategic breadth and thrive on growth pressure.",
  },
  // S22 — Entrepreneurship
  {
    id: "s22-entrepreneurship",
    name: "Entrepreneurship",
    requires: { car2: ["high"], val1: ["autonomy"], car4: ["ideator", "leader"], ws1: ["open"], val2: ["wealth_over_stability"] },
    boostWhen: [
      { field: "trajectories", values: ["entrepreneur", "founder"] },
      { field: "riskLevels", values: ["high"] },
      { field: "coreValues", values: ["autonomy"] },
    ],
    matchThreshold: 0.66,
    bonus: 3.5,
    explanation: "You have the rare combination of risk appetite, autonomy drive, and creative vision that entrepreneurship demands.",
  },
  // S23 — Financial Analysis
  {
    id: "s23-financial-analysis",
    name: "Financial Analysis",
    requires: { int1: ["investigative"], int2: ["technical", "scientific"], ws1: ["organized"], ws2: ["thinking"], ws4: ["structure", "research"] },
    boostWhen: [
      { field: "domains", values: ["Finance", "Finance/Consulting", "Sustainability/Finance"] },
      { field: "problemTypes", values: ["analytical", "technical"] },
      { field: "decisionStyle", values: ["thinking", "analytical"] },
    ],
    matchThreshold: 0.75,
    bonus: 2.5,
    explanation: "Your structured, analytical mind and comfort with data-driven decisions are what financial analysis requires.",
  },
  // S24 — Project Management
  {
    id: "s24-project-management",
    name: "Project Management",
    requires: { int3: ["operator"], ws1: ["organized"], ws3: ["collaborative", "mixed"], env4: ["targets", "coaching"], car4: ["doer", "leader"] },
    boostWhen: [
      { field: "domains", values: ["Product Management", "Technology", "Consulting"] },
      { field: "archetypes", values: ["operator", "organizer"] },
      { field: "collaboration", values: ["team", "mixed"] },
    ],
    matchThreshold: 0.66,
    bonus: 2.5,
    explanation: "You bring organization, accountability, and people skills together.",
  },
  // S26 — Executive Leadership
  {
    id: "s26-executive-leadership",
    name: "Executive Leadership",
    requires: { car4: ["leader"], int2: ["strategic"], car3: ["manager"], car1: ["advancing"], val1: ["prestige"] },
    boostWhen: [
      { field: "trajectories", values: ["manager", "executive"] },
      { field: "groupRoles", values: ["leader"] },
      { field: "rewards", values: ["recognition", "wealth"] },
    ],
    matchThreshold: 0.66,
    bonus: 3,
    explanation: "Strategic vision, leadership instinct, and ambition combine to define the executive path.",
  },
  // S27 — Research Scientist
  {
    id: "s27-research-scientist",
    name: "Research Scientist",
    requires: { int1: ["investigative"], int2: ["scientific"], val1: ["mastery"], ws4: ["research"], env3: ["steady", "varied"], ws3: ["solo", "pair"] },
    boostWhen: [
      { field: "domains", values: ["Healthcare", "Data & Analytics"] },
      { field: "problemTypes", values: ["scientific", "analytical"] },
      { field: "coreValues", values: ["mastery"] },
    ],
    matchThreshold: 0.66,
    bonus: 3.5,
    explanation: "You have the patience, depth-seeking curiosity, and mastery drive that sustains years of research.",
  },
  // S30 — Public Service
  {
    id: "s30-public-service",
    name: "Public Service",
    requires: { int1: ["social"], int3: ["helper"], val1: ["purpose"], val2: ["purpose_over_wealth"], env3: ["steady", "varied"], car2: ["low", "calculated"] },
    boostWhen: [
      { field: "domains", values: ["Social Impact", "Education", "Healthcare", "Sustainability"] },
      { field: "coreValues", values: ["purpose", "benevolence"] },
      { field: "riskLevels", values: ["low", "moderate"] },
    ],
    matchThreshold: 0.66,
    bonus: 2.5,
    explanation: "You choose meaning over money and stability over thrill.",
  },
];

/**
 * Score synergy patterns between user answers and a career profile.
 * Checks all v2 synergy patterns and sums bonus points (capped at 15).
 *
 * @returns Bonus points in the range [0, 15].
 */
export function scoreSynergies(
  answers: Record<string, string[]>,
  profile: CareerProfile,
): number {
  let total = 0;

  for (const pattern of SYNERGY_PATTERNS_V2) {
    const requirementKeys = Object.keys(pattern.requires);
    const requirementCount = requirementKeys.length;
    let metCount = 0;

    for (const [dim, requiredValues] of Object.entries(pattern.requires)) {
      const userValues = (answers[dim] ?? []).map(v => v.toLowerCase());
      if (requiredValues.some(rv => userValues.includes(rv.toLowerCase()))) {
        metCount++;
      }
    }

    if (metCount === 0) continue;

    const requirementRatio = metCount / requirementCount;
    if (requirementRatio < pattern.matchThreshold) continue;

    // Check profile match
    let profileMatchCount = 0;
    for (const bc of pattern.boostWhen) {
      const profileValues = ((profile[bc.field] as string[]) ?? []).map(v => v.toLowerCase());
      if (bc.values.some(bv => profileValues.includes(bv.toLowerCase()))) {
        profileMatchCount++;
      }
    }

    if (profileMatchCount === 0) continue;

    const profileRatio = profileMatchCount / pattern.boostWhen.length;

    if (requirementRatio >= 1.0) {
      // Full synergy: all user answers match + scale by profile fit
      total += pattern.bonus * profileRatio;
    } else {
      // Partial synergy: threshold met but not all requirements — half bonus
      total += pattern.bonus * 0.5 * profileRatio;
    }
  }

  return Math.min(15, total);
}

// ── 5. Anti-Pattern Detection (20 patterns, top 10+ implemented) ───────

interface AntiPatternV2 {
  id: string;
  name: string;
  userCondition: Record<string, string[]>;
  profileCondition: { field: keyof CareerProfile; values: string[] }[];
  penalty: number;
  explanation: string;
}

const ANTI_PATTERNS_V2: AntiPatternV2[] = [
  // AP01 — Risk-Averse Entrepreneur
  {
    id: "ap01-risk-averse-entrepreneur",
    name: "Risk-Averse Entrepreneur",
    userCondition: { car2: ["low"] },
    profileCondition: [
      { field: "trajectories", values: ["entrepreneur", "founder"] },
      { field: "riskLevels", values: ["high"] },
    ],
    penalty: 3,
    explanation: "Entrepreneurship demands comfort with uncertainty. Your stability preference would create constant stress.",
  },
  // AP02 — Isolation-Hating Solo Worker
  {
    id: "ap02-isolation-hating-solo",
    name: "Isolation-Hating Solo Worker",
    userCondition: { val3: ["isolation"] },
    profileCondition: [
      { field: "collaboration", values: ["solo"] },
      { field: "teamSizes", values: ["solo"] },
    ],
    penalty: 2.5,
    explanation: "You dislike working alone, but this career involves significant independent work.",
  },
  // AP03 — Micromanaged Autonomy-Seeker
  {
    id: "ap03-micromanaged-autonomy-seeker",
    name: "Micromanaged Autonomy-Seeker",
    userCondition: { val1: ["autonomy"], val3: ["micromanaged"] },
    profileCondition: [
      { field: "managementStyles", values: ["targets", "directive", "structured"] },
    ],
    penalty: 2.5,
    explanation: "You value freedom and hate micromanagement. Careers with close oversight would drain you.",
  },
  // AP04 — Routine-Hating Conventional
  {
    id: "ap04-routine-hating-conventional",
    name: "Routine-Hating Conventional",
    userCondition: { val3: ["monotony"], ws1: ["open"] },
    profileCondition: [
      { field: "paces", values: ["steady"] },
      { field: "ambiguityStyle", values: ["structure"] },
    ],
    penalty: 2,
    explanation: "You crave novelty, but this career involves significant routine.",
  },
  // AP05 — Introvert in High-Social Role
  {
    id: "ap05-introvert-high-social",
    name: "Introvert in High-Social Role",
    userCondition: { ws3: ["solo"], env2: ["solo"] },
    profileCondition: [
      { field: "collaboration", values: ["team"] },
      { field: "teamSizes", values: ["large", "medium"] },
    ],
    penalty: 2.5,
    explanation: "You prefer working independently, but this career requires constant team interaction.",
  },
  // AP06 — Perfectionist in Fast-Pace
  {
    id: "ap06-perfectionist-fast-pace",
    name: "Perfectionist in Fast-Pace",
    userCondition: { ws1: ["cautious"], ws4: ["structure"], env3: ["steady"] },
    profileCondition: [
      { field: "paces", values: ["fast", "burst"] },
      { field: "ambiguityStyle", values: ["experiment"] },
    ],
    penalty: 2,
    explanation: "Your need for structure conflicts with 'ship fast, iterate later' mentality.",
  },
  // AP07 — Non-Analytical in Data Career
  {
    id: "ap07-non-analytical-data-career",
    name: "Non-Analytical in Data Career",
    userCondition: { int2: ["human", "creative"], ws2: ["feeling"] },
    profileCondition: [
      { field: "domains", values: ["Data & Analytics", "Finance"] },
      { field: "problemTypes", values: ["analytical", "technical"] },
    ],
    penalty: 2.5,
    explanation: "You're drawn to human and creative challenges, not data analysis.",
  },
  // AP08 — Low-Empathy in Care Role
  {
    id: "ap08-low-empathy-care-role",
    name: "Low-Empathy in Care Role",
    userCondition: { int1: ["investigative", "realistic"], ws2: ["thinking"], int3: ["builder", "operator"] },
    profileCondition: [
      { field: "domains", values: ["Healthcare", "Education", "Social Impact"] },
      { field: "archetypes", values: ["helper", "mentor", "counselor"] },
    ],
    penalty: 2,
    explanation: "Care-focused careers require deep empathy. Your analytical style would create a mismatch.",
  },
  // AP09 — Structure-Needer in Startup
  {
    id: "ap09-structure-needer-startup",
    name: "Structure-Needer in Startup",
    userCondition: { car2: ["low"], ws4: ["structure"], env4: ["targets"] },
    profileCondition: [
      { field: "riskLevels", values: ["high"] },
      { field: "ambiguityStyle", values: ["experiment", "pivot"] },
    ],
    penalty: 2.5,
    explanation: "You need structure and low risk, but startups are defined by ambiguity and pivots.",
  },
  // AP10 — Non-Verbal in Writing Career
  {
    id: "ap10-non-verbal-writing-career",
    name: "Non-Verbal in Writing Career",
    userCondition: { int1: ["realistic"], int2: ["technical"], int3: ["builder"] },
    profileCondition: [
      { field: "domains", values: ["Media & Journalism", "Marketing", "Media & Entertainment"] },
      { field: "archetypes", values: ["creator", "communicator", "storyteller"] },
    ],
    penalty: 2,
    explanation: "Writing-heavy careers need verbal fluency. Your hands-on orientation would be underutilized.",
  },
  // AP11 — Solo Leader Paradox
  {
    id: "ap11-solo-leader-paradox",
    name: "Solo Leader Paradox",
    userCondition: { car4: ["leader"], ws3: ["solo"], env2: ["solo"] },
    profileCondition: [
      { field: "trajectories", values: ["manager", "executive"] },
      { field: "teamSizes", values: ["large", "medium"] },
    ],
    penalty: 2,
    explanation: "You want to lead but prefer working alone. Management requires daily people interaction.",
  },
  // AP12 — Creative in Compliance
  {
    id: "ap12-creative-in-compliance",
    name: "Creative in Compliance",
    userCondition: { int1: ["artistic"], ws1: ["open"], ws4: ["experiment"] },
    profileCondition: [
      { field: "domains", values: ["Law & Policy", "Finance"] },
      { field: "archetypes", values: ["analyst", "enforcer"] },
      { field: "ambiguityStyle", values: ["structure"] },
    ],
    penalty: 2,
    explanation: "Your creative nature would chafe against rigid compliance frameworks.",
  },
];

/**
 * Score anti-patterns between user answers and a career profile.
 * Sums penalties from all triggered patterns (capped at 12).
 *
 * @returns A non-positive number in the range [-12, 0].
 */
export function scoreAntiPatterns(
  answers: Record<string, string[]>,
  profile: CareerProfile,
): number {
  let totalPenalty = 0;

  for (const ap of ANTI_PATTERNS_V2) {
    // Check all user conditions (all must be met)
    let userTrigger = true;
    for (const [dim, triggerValues] of Object.entries(ap.userCondition)) {
      const userValues = (answers[dim] ?? []).map(v => v.toLowerCase());
      if (!triggerValues.some(tv => userValues.includes(tv.toLowerCase()))) {
        userTrigger = false;
        break;
      }
    }
    if (!userTrigger) continue;

    // Check if any profile condition matches
    let profileConflict = false;
    for (const pc of ap.profileCondition) {
      const profileValues = ((profile[pc.field] as string[]) ?? []).map(v => v.toLowerCase());
      if (pc.values.some(pv => profileValues.includes(pv.toLowerCase()))) {
        profileConflict = true;
        break;
      }
    }

    if (profileConflict) {
      totalPenalty += ap.penalty;
    }
  }

  return -Math.min(12, totalPenalty);
}

// ── 6. Percentile Normalization ─────────────────────────────────────────

/**
 * Normalize raw scores into display-friendly percentiles in the range [15, 98].
 * Uses rank-order percentile mapping to ensure good visual spread.
 *
 * @returns Map from profileId to display score (15-98).
 */
export function normalizeToPercentile(
  scores: { profileId: string; rawScore: number }[],
): Map<string, number> {
  if (scores.length === 0) return new Map();

  // Sort ascending by raw score for rank-based percentile computation
  const sorted = [...scores].sort((a, b) => a.rawScore - b.rawScore);
  const n = sorted.length;
  const result = new Map<string, number>();

  for (let i = 0; i < n; i++) {
    // Percentile rank: (rank - 0.5) / n gives mid-rank percentile
    const percentileRaw = ((i + 0.5) / n) * 100;

    // Map to display range [15, 98]
    const display = Math.round(15 + (percentileRaw / 100) * (98 - 15));
    result.set(sorted[i].profileId, Math.min(98, Math.max(15, display)));
  }

  return result;
}

// ── 7. Result Categories ────────────────────────────────────────────────

/** Determine confidence level based on dimensional score spread and total */
function computeConfidence(dims: DimensionalScore): "high" | "medium" | "low" {
  // High confidence: total > 0.6 and no dimension below 0.2
  const dimValues = [dims.interest, dims.personality, dims.values, dims.environment, dims.stage];
  const minDim = Math.min(...dimValues);
  const nonZeroCount = dimValues.filter(d => d > 0.1).length;

  if (dims.total > 0.6 && minDim > 0.2 && nonZeroCount >= 4) return "high";
  if (dims.total > 0.4 && nonZeroCount >= 3) return "medium";
  return "low";
}

/** Generate 3 "why this fits" reasons from dimensional scores and answer data */
function generateWhyThisFits(
  profile: CareerProfile,
  dims: DimensionalScore,
  answers: Record<string, string[]>,
): string[] {
  const reasons: string[] = [];

  // Sort dimensions by strength to pick top reasons
  const dimEntries: [string, number][] = [
    ["interest", dims.interest],
    ["personality", dims.personality],
    ["values", dims.values],
    ["environment", dims.environment],
    ["stage", dims.stage],
  ];
  dimEntries.sort((a, b) => b[1] - a[1]);

  const reasonMap: Record<string, (p: CareerProfile, a: Record<string, string[]>) => string> = {
    interest: (p, a) => {
      const userInterests = (a.int1 ?? []).join(", ") || "your interests";
      return `Your ${userInterests} interests align strongly with ${p.title}'s core focus.`;
    },
    personality: (p, a) => {
      const style = (a.ws1 ?? [])[0] || "work style";
      return `Your ${style} working style matches how top ${p.title}s typically operate.`;
    },
    values: (p, a) => {
      const val = (a.val1 ?? [])[0] || "core values";
      return `Your drive for ${val} is central to what makes ${p.title} fulfilling.`;
    },
    environment: (p, a) => {
      const env = (a.env1 ?? [])[0] || "preferred environment";
      return `The typical ${p.title} environment (${env}) matches your preferences.`;
    },
    stage: (p, a) => {
      const stage = (a.car1 ?? [])[0] || "current career stage";
      return `At the ${stage} stage, ${p.title} offers an ideal entry pathway.`;
    },
  };

  for (const [dim] of dimEntries) {
    if (reasons.length >= 3) break;
    const generator = reasonMap[dim];
    if (generator) {
      reasons.push(generator(profile, answers));
    }
  }

  // Pad if needed
  while (reasons.length < 3) {
    reasons.push(`${profile.title} is a strong match across multiple dimensions of your profile.`);
  }

  return reasons;
}

/**
 * Categorize scored career matches into meaningful result groups.
 * Each profile is placed in exactly one category based on score, profile traits,
 * and dimensional balance.
 */
export function categorizeMatches(
  scored: { profile: CareerProfile; score: number; dimensions: DimensionalScore }[],
  userAnswers: Record<string, string[]>,
): CategorizedMatch[] {
  if (scored.length === 0) return [];

  // Sort by score descending
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const usedIds = new Set<string>();
  const results: CategorizedMatch[] = [];

  // Best Overall: highest score
  const best = sorted[0];
  results.push({
    category: "best_overall",
    profile: best.profile,
    score: best.score,
    confidence: computeConfidence(best.dimensions),
    dimensions: best.dimensions,
    whyThisFits: generateWhyThisFits(best.profile, best.dimensions, userAnswers),
  });
  usedIds.add(best.profile.id);

  // Fastest Path: shortest pathwayTime among top half
  const topHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const fastestPathCandidate = topHalf
    .filter(s => !usedIds.has(s.profile.id))
    .sort((a, b) => parsePathwayMonths(a.profile.pathwayTime) - parsePathwayMonths(b.profile.pathwayTime))[0];
  if (fastestPathCandidate) {
    results.push({
      category: "fastest_path",
      profile: fastestPathCandidate.profile,
      score: fastestPathCandidate.score,
      confidence: computeConfidence(fastestPathCandidate.dimensions),
      dimensions: fastestPathCandidate.dimensions,
      whyThisFits: generateWhyThisFits(fastestPathCandidate.profile, fastestPathCandidate.dimensions, userAnswers),
    });
    usedIds.add(fastestPathCandidate.profile.id);
  }

  // Highest Growth: profile with highest growth potential (use pathwayTime as inverse proxy)
  const growthCandidate = sorted
    .filter(s => !usedIds.has(s.profile.id))
    .sort((a, b) => {
      // Longer pathways imply higher growth ceiling; prefer high-score + long pathway
      const aGrowth = a.score * 0.5 + parsePathwayMonths(a.profile.pathwayTime) * 0.02;
      const bGrowth = b.score * 0.5 + parsePathwayMonths(b.profile.pathwayTime) * 0.02;
      return bGrowth - aGrowth;
    })[0];
  if (growthCandidate) {
    results.push({
      category: "highest_growth",
      profile: growthCandidate.profile,
      score: growthCandidate.score,
      confidence: computeConfidence(growthCandidate.dimensions),
      dimensions: growthCandidate.dimensions,
      whyThisFits: generateWhyThisFits(growthCandidate.profile, growthCandidate.dimensions, userAnswers),
    });
    usedIds.add(growthCandidate.profile.id);
  }

  // Hidden Gem: mid-range score with high dimensional diversity (no single weak dim)
  const hiddenGemCandidate = sorted
    .filter(s => !usedIds.has(s.profile.id))
    .slice(Math.floor(sorted.length * 0.2), Math.floor(sorted.length * 0.6))
    .sort((a, b) => {
      const aBalance = dimensionalBalance(a.dimensions);
      const bBalance = dimensionalBalance(b.dimensions);
      return bBalance - aBalance;
    })[0];
  if (hiddenGemCandidate) {
    results.push({
      category: "hidden_gem",
      profile: hiddenGemCandidate.profile,
      score: hiddenGemCandidate.score,
      confidence: computeConfidence(hiddenGemCandidate.dimensions),
      dimensions: hiddenGemCandidate.dimensions,
      whyThisFits: generateWhyThisFits(hiddenGemCandidate.profile, hiddenGemCandidate.dimensions, userAnswers),
    });
    usedIds.add(hiddenGemCandidate.profile.id);
  }

  // Stretch Goal: lower-scoring but with one very strong dimension
  const stretchCandidate = sorted
    .filter(s => !usedIds.has(s.profile.id))
    .slice(Math.floor(sorted.length * 0.3))
    .sort((a, b) => {
      const aMax = maxDimensionScore(a.dimensions);
      const bMax = maxDimensionScore(b.dimensions);
      return bMax - aMax;
    })[0];
  if (stretchCandidate) {
    results.push({
      category: "stretch_goal",
      profile: stretchCandidate.profile,
      score: stretchCandidate.score,
      confidence: computeConfidence(stretchCandidate.dimensions),
      dimensions: stretchCandidate.dimensions,
      whyThisFits: generateWhyThisFits(stretchCandidate.profile, stretchCandidate.dimensions, userAnswers),
    });
    usedIds.add(stretchCandidate.profile.id);
  }

  return results;
}

/** Parse "3-6 months" or "1-2 years" to approximate months */
function parsePathwayMonths(time: string): number {
  const lower = time.toLowerCase();
  const nums = lower.match(/(\d+)/g)?.map(Number) ?? [6];
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (lower.includes("year")) return avg * 12;
  return avg;
}

/** How balanced are the dimensional scores (higher = more balanced) */
function dimensionalBalance(dims: DimensionalScore): number {
  const values = [dims.interest, dims.personality, dims.values, dims.environment, dims.stage];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return mean - variance; // High mean + low variance = balanced
}

/** Maximum dimensional score (for stretch goal identification) */
function maxDimensionScore(dims: DimensionalScore): number {
  return Math.max(dims.interest, dims.personality, dims.values, dims.environment, dims.stage);
}

// ── 8. Public API ───────────────────────────────────────────────────────

/**
 * Score a single profile against user input using the v2 engine.
 * Produces a raw score combining dimensional cosine similarity,
 * skill overlap, synergy bonuses, and anti-pattern penalties.
 */
function scoreProfileV2(
  profile: CareerProfile,
  input: AssessmentInput,
): { rawScore: number; dimensions: DimensionalScore } {
  const a = extractAnswers(input);
  const dims = scoreDimensional(a, profile, profile.scoringWeights ?? undefined);

  // Base score from cosine similarity: scale to 0-70 point range
  let score = dims.total * 70;

  // Skill overlap: 0-10 points
  const userSkillsLower = new Set(input.currentSkills.map(s => s.toLowerCase()));
  const profileSkillsLower = profile.requiredSkills.map(s => s.toLowerCase());
  const skillMatchCount = profileSkillsLower.filter(s => userSkillsLower.has(s)).length;
  const skillOverlap = profileSkillsLower.length > 0
    ? (skillMatchCount / profileSkillsLower.length) * 10
    : 0;
  score += skillOverlap;

  // Domain affinity: 0-5 points
  const profileDomainsLower = new Set(profile.domains.map(d => d.toLowerCase()));
  let domainBoost = 0;
  for (let i = 0; i < input.interests.length; i++) {
    if (profileDomainsLower.has(input.interests[i].toLowerCase())) {
      domainBoost += i < 2 ? 2 : 0.5;
    }
  }
  score += Math.min(5, domainBoost);

  // Synergy bonus: 0-15 points
  score += scoreSynergies(a, profile);

  // Anti-pattern penalty: -12 to 0
  score += scoreAntiPatterns(a, profile);

  // Experience fit: -2 to 5
  score += scoreExperienceFit(input.experienceLevel, profile.experienceLevels);

  return { rawScore: Math.max(0, score), dimensions: dims };
}

// ── Salary & Growth Lookup ────────────────────────────────────────────────

/** Approximate salary ranges (USD) by career profile id */
const SALARY_RANGES: Record<string, { min: number; max: number }> = {
  "frontend-dev":         { min: 65000, max: 130000 },
  "backend-dev":          { min: 70000, max: 145000 },
  "fullstack-dev":        { min: 75000, max: 150000 },
  "mobile-dev":           { min: 70000, max: 140000 },
  "devops-sre":           { min: 85000, max: 165000 },
  "qa-engineer":          { min: 60000, max: 120000 },
  "data-scientist":       { min: 90000, max: 165000 },
  "data-analyst":         { min: 55000, max: 110000 },
  "ml-engineer":          { min: 100000, max: 180000 },
  "data-engineer":        { min: 85000, max: 160000 },
  "bi-analyst":           { min: 55000, max: 105000 },
  "ux-designer":          { min: 65000, max: 130000 },
  "ui-designer":          { min: 60000, max: 120000 },
  "ux-researcher":        { min: 70000, max: 135000 },
  "product-designer":     { min: 75000, max: 145000 },
  "product-manager":      { min: 90000, max: 170000 },
  "project-manager":      { min: 70000, max: 130000 },
  "scrum-master":         { min: 75000, max: 130000 },
  "technical-program-manager": { min: 100000, max: 175000 },
  "cybersecurity-analyst":{ min: 75000, max: 140000 },
  "cloud-architect":      { min: 110000, max: 190000 },
  "solutions-architect":  { min: 105000, max: 180000 },
  "technical-writer":     { min: 55000, max: 105000 },
  "marketing-analyst":    { min: 50000, max: 95000 },
  "digital-marketer":     { min: 45000, max: 90000 },
  "content-strategist":   { min: 50000, max: 100000 },
  "seo-specialist":       { min: 45000, max: 85000 },
  "financial-analyst":    { min: 60000, max: 120000 },
  "management-consultant":{ min: 80000, max: 170000 },
  "business-analyst":     { min: 60000, max: 115000 },
  "game-developer":       { min: 55000, max: 120000 },
  "blockchain-developer": { min: 90000, max: 175000 },
  "embedded-engineer":    { min: 75000, max: 145000 },
  "systems-engineer":     { min: 80000, max: 150000 },
  "network-engineer":     { min: 65000, max: 125000 },
  "database-admin":       { min: 65000, max: 125000 },
  "it-support":           { min: 40000, max: 75000 },
  "healthcare-admin":     { min: 50000, max: 100000 },
  "clinical-researcher":  { min: 60000, max: 120000 },
  "teacher-educator":     { min: 40000, max: 75000 },
  "instructional-designer": { min: 55000, max: 100000 },
  "hr-specialist":        { min: 50000, max: 95000 },
  "recruiter":            { min: 45000, max: 90000 },
  "sales-engineer":       { min: 80000, max: 160000 },
  "account-executive":    { min: 55000, max: 130000 },
  "supply-chain-analyst": { min: 55000, max: 100000 },
  "operations-manager":   { min: 65000, max: 130000 },
  "legal-analyst":        { min: 55000, max: 110000 },
  "compliance-officer":   { min: 60000, max: 120000 },
  "growth-hacker":        { min: 55000, max: 110000 },
  "financial-analyst":    { min: 60000, max: 120000 },
  "business-analyst":     { min: 60000, max: 115000 },
  "accountant":           { min: 50000, max: 95000 },
  "investment-analyst":   { min: 70000, max: 140000 },
  "investment-banker":    { min: 90000, max: 200000 },
  "sales-manager":        { min: 65000, max: 140000 },
  "account-executive":    { min: 55000, max: 130000 },
  "business-development-rep": { min: 45000, max: 90000 },
  "hr-manager":           { min: 60000, max: 115000 },
  "hr-business-partner":  { min: 65000, max: 120000 },
  "recruiter":            { min: 45000, max: 90000 },
  "corporate-trainer":    { min: 50000, max: 90000 },
  "career-coach":         { min: 45000, max: 85000 },
  "healthcare-administrator": { min: 55000, max: 110000 },
  "clinical-researcher":  { min: 60000, max: 120000 },
  "biotech-project-manager": { min: 80000, max: 150000 },
  "health-informatics-specialist": { min: 65000, max: 120000 },
  "graphic-designer":     { min: 45000, max: 90000 },
  "video-producer":       { min: 45000, max: 95000 },
  "copywriter":           { min: 45000, max: 90000 },
  "brand-strategist":     { min: 55000, max: 110000 },
  "security-analyst":     { min: 75000, max: 140000 },
  "penetration-tester":   { min: 80000, max: 150000 },
  "startup-founder":      { min: 40000, max: 200000 },
  "freelance-consultant": { min: 50000, max: 150000 },
  "sustainability-consultant": { min: 55000, max: 105000 },
  "esg-analyst":          { min: 60000, max: 110000 },
  "lawyer":               { min: 70000, max: 180000 },
  "paralegal":            { min: 40000, max: 75000 },
  "architect":            { min: 60000, max: 130000 },
  "civil-engineer":       { min: 65000, max: 120000 },
  "construction-manager": { min: 65000, max: 130000 },
  "journalist":           { min: 35000, max: 80000 },
  "pr-specialist":        { min: 45000, max: 90000 },
  "real-estate-agent":    { min: 40000, max: 120000 },
  "property-manager":     { min: 45000, max: 85000 },
  "electrician":          { min: 45000, max: 90000 },
  "plumber":              { min: 45000, max: 90000 },
  "hvac-technician":      { min: 45000, max: 85000 },
  "policy-analyst":       { min: 50000, max: 100000 },
  "urban-planner":        { min: 50000, max: 95000 },
  "game-designer":        { min: 50000, max: 110000 },
  "animator":             { min: 45000, max: 95000 },
  "film-director":        { min: 40000, max: 150000 },
  "musician":             { min: 30000, max: 90000 },
  "environmental-engineer": { min: 60000, max: 110000 },
  "conservation-biologist": { min: 45000, max: 85000 },
  "supply-chain-manager": { min: 65000, max: 120000 },
  "operations-manager":   { min: 65000, max: 130000 },
  "commercial-pilot":     { min: 80000, max: 180000 },
  "air-traffic-controller": { min: 70000, max: 140000 },
  "hotel-manager":        { min: 45000, max: 95000 },
  "event-planner":        { min: 40000, max: 80000 },
  "executive-chef":       { min: 45000, max: 100000 },
  "research-scientist":   { min: 65000, max: 130000 },
  "pharmacist":           { min: 110000, max: 160000 },
  "veterinarian":         { min: 80000, max: 130000 },
  "social-worker":        { min: 40000, max: 70000 },
  "counselor":            { min: 40000, max: 75000 },
  "nonprofit-manager":    { min: 45000, max: 85000 },
  "diplomat":             { min: 60000, max: 120000 },
  "instructional-designer": { min: 55000, max: 100000 },
  "physical-therapist":   { min: 70000, max: 110000 },
  "content-creator":      { min: 35000, max: 100000 },
  "social-media-manager": { min: 45000, max: 85000 },
};

/** Approximate growth outlook by domain */
const DOMAIN_GROWTH: Record<string, string> = {
  "Technology":              "High",
  "Data & Analytics":        "High",
  "Design & UX":             "Moderate-High",
  "Product Management":      "High",
  "Cybersecurity":           "Very High",
  "Cloud & Infrastructure":  "Very High",
  "Marketing":               "Moderate",
  "Finance":                 "Moderate",
  "Finance/Consulting":      "Moderate",
  "Consulting":              "Moderate",
  "Healthcare":              "High",
  "Healthcare/Product Management": "High",
  "Healthcare/Data & Analytics":   "High",
  "Education":               "Moderate",
  "Education/Consulting":    "Moderate",
  "Engineering":             "Moderate-High",
  "Legal":                   "Moderate",
  "Law & Policy":            "Moderate",
  "Sales":                   "Moderate",
  "E-commerce":              "Moderate-High",
  "E-commerce/Consulting":   "Moderate-High",
  "E-commerce/Technology":   "High",
  "Operations":              "Moderate",
  "Logistics & Operations":  "Moderate",
  "Human Resources":         "Moderate",
  "Media & Entertainment":   "Moderate",
  "Media & Journalism":      "Low-Moderate",
  "Design & UX/Media & Entertainment": "Moderate",
  "Marketing/Media & Entertainment":   "Moderate",
  "Media & Entertainment/Marketing":   "Moderate",
  "Sustainability":          "High",
  "Sustainability/Finance":  "High",
  "Architecture & Construction": "Moderate",
  "Real Estate":             "Moderate",
  "Trades & Skilled Labor":  "Moderate-High",
  "Arts & Entertainment":    "Low-Moderate",
  "Agriculture & Environment": "Moderate",
  "Aviation":                "Moderate",
  "Hospitality & Tourism":   "Moderate",
  "Science & Research":      "Moderate-High",
  "Social Services":         "Moderate",
};

function getSalaryRange(profile: CareerProfile): { min: number; max: number } {
  return SALARY_RANGES[profile.id] ?? { min: 50000, max: 100000 };
}

function getGrowthOutlook(profile: CareerProfile): string {
  return DOMAIN_GROWTH[profile.domain] ?? "Moderate";
}

/** Experience-career fit scoring (ported from v1) */
const EXPERIENCE_RANKS: Record<string, number> = {
  student: 0, junior: 1, mid: 2, senior: 3, expert: 4, executive: 5,
};

function scoreExperienceFit(experienceLevel: string, profileLevels: string[]): number {
  if (!experienceLevel || profileLevels.length === 0) return 0;
  const userRank = EXPERIENCE_RANKS[experienceLevel.toLowerCase()] ?? 1;
  const profileRanks = profileLevels
    .map(l => EXPERIENCE_RANKS[l.toLowerCase()] ?? -1)
    .filter(r => r >= 0);
  if (profileRanks.length === 0) return 0;
  if (profileRanks.includes(userRank)) return 5;
  const minDistance = Math.min(...profileRanks.map(pr => Math.abs(pr - userRank)));
  if (minDistance === 1) return 2.5;
  if (minDistance === 2) return 0;
  return -2;
}

/**
 * Get top career matches using the v2 scoring engine.
 * Returns results backward-compatible with v1's CareerMatch + SkillGap types,
 * plus optional categorized matches for frontends that support them.
 *
 * @param input  Assessment answers from the frontend
 * @param count  Number of flat matches to return (default 3)
 * @returns Career matches, skill gaps, archetype string, and categorized matches
 */
export function getTopCareerMatchesV2(
  input: AssessmentInput,
  count = 3,
): {
  careerMatches: CareerMatch[];
  skillGaps: SkillGap[];
  archetype?: string;
  categorizedMatches?: CategorizedMatch[];
} {
  const answers = extractAnswers(input);

  // Score all profiles
  const scored = ALL_PROFILES.map(profile => {
    const { rawScore, dimensions } = scoreProfileV2(profile, input);
    return { profile, rawScore, dimensions };
  });

  // Percentile normalization
  const percentiles = normalizeToPercentile(
    scored.map(s => ({ profileId: s.profile.id, rawScore: s.rawScore })),
  );

  // Attach display scores
  const withDisplayScores = scored.map(s => ({
    ...s,
    score: percentiles.get(s.profile.id) ?? 50,
  }));

  // Sort by display score descending
  withDisplayScores.sort((a, b) => b.score - a.score);

  // Build flat career matches with full data for frontend display
  const topProfiles = withDisplayScores.slice(0, count);
  const careerMatches: CareerMatch[] = topProfiles.map(({ profile, score, dimensions }) => ({
    title: profile.title,
    matchScore: score,
    description: profile.description,
    requiredSkills: profile.requiredSkills,
    pathwayTime: profile.pathwayTime,
    careerFamily: profile.domain,
    domain: profile.domain,
    whyThisFits: generateWhyThisFits(profile, dimensions, answers),
    salaryRange: getSalaryRange(profile),
    growthOutlook: getGrowthOutlook(profile),
  }));

  // Skill gaps from top matches
  const userSkillsLower = new Set(input.currentSkills.map(s => s.toLowerCase()));
  const allGaps: SkillGap[] = [];
  const seenSkills = new Set<string>();
  for (const { profile } of topProfiles) {
    for (const gap of profile.skillGaps) {
      const key = gap.skill.toLowerCase();
      if (!seenSkills.has(key) && !userSkillsLower.has(key)) {
        seenSkills.add(key);
        allGaps.push(gap);
      }
    }
  }

  // Categorize all scored results
  const categorizedMatches = categorizeMatches(
    withDisplayScores.map(s => ({ profile: s.profile, score: s.score, dimensions: s.dimensions })),
    answers,
  );

  // Derive archetype from top answers
  const archetype = deriveArchetype(answers);

  return {
    careerMatches,
    skillGaps: allGaps.slice(0, 5),
    archetype,
    categorizedMatches,
  };
}

/** Derive a human-readable archetype label from user answers */
function deriveArchetype(answers: Record<string, string[]>): string {
  const interest = (answers.int1 ?? [])[0] ?? "mixed";
  const style = (answers.int3 ?? [])[0] ?? "generalist";
  const approach = (answers.ws2 ?? [])[0] ?? "balanced";

  const archetypeMap: Record<string, string> = {
    "builder-thinking": "Analytical Builder",
    "builder-feeling": "Empathetic Builder",
    "builder-intuition": "Intuitive Builder",
    "builder-consensus": "Collaborative Builder",
    "thinker-thinking": "Deep Analyst",
    "thinker-feeling": "Reflective Thinker",
    "thinker-intuition": "Visionary Thinker",
    "thinker-consensus": "Collaborative Thinker",
    "helper-feeling": "Compassionate Guide",
    "helper-consensus": "Community Builder",
    "helper-thinking": "Structured Mentor",
    "helper-intuition": "Intuitive Counselor",
    "operator-organized": "Systems Organizer",
    "operator-thinking": "Efficiency Expert",
    "operator-consensus": "Team Orchestrator",
    "operator-intuition": "Adaptive Operator",
  };

  const key = `${style}-${approach}`;
  return archetypeMap[key] ?? `${capitalize(interest)} ${capitalize(style)}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── 9. RIASEC Score Computation ─────────────────────────────────────────

/** RIASEC code mappings from answer dimensions */
const RIASEC_SIGNALS: Record<keyof RIASECScores, { dims: Record<string, string[]>; weight: number }[]> = {
  realistic: [
    { dims: { int1: ["realistic"] }, weight: 40 },
    { dims: { int3: ["builder", "operator"] }, weight: 25 },
    { dims: { ws4: ["structure"] }, weight: 15 },
    { dims: { env1: ["onsite"] }, weight: 10 },
    { dims: { car4: ["doer"] }, weight: 10 },
  ],
  investigative: [
    { dims: { int1: ["investigative"] }, weight: 40 },
    { dims: { int2: ["scientific", "technical"] }, weight: 25 },
    { dims: { ws2: ["thinking"] }, weight: 15 },
    { dims: { ws4: ["research"] }, weight: 10 },
    { dims: { int3: ["thinker"] }, weight: 10 },
  ],
  artistic: [
    { dims: { int1: ["artistic"] }, weight: 40 },
    { dims: { int2: ["creative"] }, weight: 25 },
    { dims: { ws1: ["open"] }, weight: 10 },
    { dims: { ws4: ["experiment"] }, weight: 10 },
    { dims: { val1: ["autonomy"] }, weight: 8 },
    { dims: { car4: ["ideator"] }, weight: 7 },
  ],
  social: [
    { dims: { int1: ["social"] }, weight: 40 },
    { dims: { int2: ["human"] }, weight: 20 },
    { dims: { int3: ["helper"] }, weight: 15 },
    { dims: { ws1: ["empathetic"] }, weight: 10 },
    { dims: { ws3: ["collaborative"] }, weight: 8 },
    { dims: { val1: ["purpose"] }, weight: 7 },
  ],
  enterprising: [
    { dims: { int2: ["strategic"] }, weight: 30 },
    { dims: { car4: ["leader"] }, weight: 25 },
    { dims: { car2: ["high"] }, weight: 15 },
    { dims: { val4: ["wealth", "recognition"] }, weight: 15 },
    { dims: { val1: ["prestige"] }, weight: 8 },
    { dims: { car3: ["manager", "entrepreneur"] }, weight: 7 },
  ],
  conventional: [
    { dims: { ws1: ["organized", "cautious"] }, weight: 30 },
    { dims: { ws4: ["structure"] }, weight: 25 },
    { dims: { int3: ["operator"] }, weight: 20 },
    { dims: { env3: ["steady"] }, weight: 10 },
    { dims: { env4: ["targets"] }, weight: 8 },
    { dims: { ws2: ["thinking"] }, weight: 7 },
  ],
};

// ── V2 Likert-based scoring ────────────────────────────────────────────

/** Map likert-3 answer to 0-100 */
function likert3Score(val: string | undefined): number {
  if (!val) return 50;
  const v = val.toLowerCase();
  if (v === 'like') return 100;
  if (v === 'dislike') return 0;
  return 50; // neutral
}

/** Map likert-5 answer (1-5) to 0-100, optionally reverse-coded */
function likert5Score(val: string | undefined, reverse = false): number {
  if (!val) return 50;
  let n = parseInt(val, 10);
  if (isNaN(n) || n < 1 || n > 5) return 50;
  if (reverse) n = 6 - n;
  return (n - 1) * 25; // 1→0, 2→25, 3→50, 4→75, 5→100
}

/** Detect v2 answers by checking for ri_ or bf_ prefixed keys */
function isV2Answers(answers: Record<string, any>): boolean {
  return Object.keys(answers).some(k => k.startsWith('ri_') || k.startsWith('bf_'));
}

/** V2 RIASEC question ID prefixes → RIASEC type */
const V2_RIASEC_MAP: Record<string, keyof RIASECScores> = {
  'ri_r': 'realistic', 'ri_i': 'investigative', 'ri_a': 'artistic',
  'ri_s': 'social', 'ri_e': 'enterprising', 'ri_c': 'conventional',
};

/** V2 Big Five question ID prefixes → trait, with reverse-coded IDs */
const V2_BF_MAP: Record<string, keyof BigFiveScores> = {
  'bf_o': 'openness', 'bf_c': 'conscientiousness', 'bf_e': 'extraversion',
  'bf_a': 'agreeableness', 'bf_es': 'emotionalStability',
};
const V2_BF_REVERSE_CODED = new Set([
  'bf_o2', 'bf_o4', 'bf_c2', 'bf_c4', 'bf_e2', 'bf_e4', 'bf_a2', 'bf_a4', 'bf_es2', 'bf_es4',
]);

/**
 * Compute RIASEC scores from v2 likert-3 answers.
 * Each type has 4 questions (ri_r1-ri_r4 etc), scored like=100, neutral=50, dislike=0.
 */
export function computeRIASECV2(answers: Record<string, any>): RIASECScores {
  const sums: Record<keyof RIASECScores, number[]> = {
    realistic: [], investigative: [], artistic: [],
    social: [], enterprising: [], conventional: [],
  };

  for (const [key, val] of Object.entries(answers)) {
    // Match ri_r, ri_i, ri_a, ri_s, ri_e, ri_c prefixes
    const prefix = key.replace(/\d+$/, '');
    const type = V2_RIASEC_MAP[prefix];
    if (type) {
      const raw = Array.isArray(val) ? val[0] : val;
      sums[type].push(likert3Score(String(raw)));
    }
  }

  const result: RIASECScores = {
    realistic: 0, investigative: 0, artistic: 0,
    social: 0, enterprising: 0, conventional: 0,
  };
  for (const [type, scores] of Object.entries(sums) as [keyof RIASECScores, number[]][]) {
    result[type] = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }
  return result;
}

/**
 * Compute Big Five scores from v2 likert-5 answers.
 * Each trait has 4 questions, 2 normal + 2 reverse-coded.
 */
export function computeBigFiveV2(answers: Record<string, any>): BigFiveScores {
  const sums: Record<keyof BigFiveScores, number[]> = {
    openness: [], conscientiousness: [], extraversion: [],
    agreeableness: [], emotionalStability: [],
  };

  for (const [key, val] of Object.entries(answers)) {
    // Match bf_o, bf_c, bf_e, bf_a, bf_es prefixes
    // Try bf_es first (longer prefix), then bf_o, bf_c, bf_e, bf_a
    const prefix = key.startsWith('bf_es') ? 'bf_es' : key.replace(/\d+$/, '');
    const trait = V2_BF_MAP[prefix];
    if (trait) {
      const raw = Array.isArray(val) ? val[0] : val;
      const reverse = V2_BF_REVERSE_CODED.has(key);
      sums[trait].push(likert5Score(String(raw), reverse));
    }
  }

  const hasBfAnswers = Object.values(sums).some(arr => arr.length > 0);

  if (hasBfAnswers) {
    // Direct Big Five answers available — use them
    const result: BigFiveScores = {
      openness: 0, conscientiousness: 0, extraversion: 0,
      agreeableness: 0, emotionalStability: 0,
    };
    for (const [trait, scores] of Object.entries(sums) as [keyof BigFiveScores, number[]][]) {
      result[trait] = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 50;
    }
    return result;
  }

  // No Big Five questions answered (tier 1) — infer from RIASEC scores
  // Based on established RIASEC–Big Five correlations (Holland, 1997; Larson et al., 2002)
  const riasec = computeRIASECV2(answers);
  return inferBigFiveFromRIASEC(riasec);
}

/**
 * Infer approximate Big Five scores from RIASEC when Big Five questions
 * haven't been answered (tier 1 users). Uses established research correlations.
 */
function inferBigFiveFromRIASEC(r: RIASECScores): BigFiveScores {
  // Weighted blends based on meta-analytic correlations
  const openness = Math.round(r.artistic * 0.45 + r.investigative * 0.35 + r.enterprising * 0.10 + r.social * 0.10);
  const conscientiousness = Math.round(r.conventional * 0.40 + r.realistic * 0.30 + r.enterprising * 0.20 + r.investigative * 0.10);
  const extraversion = Math.round(r.enterprising * 0.40 + r.social * 0.35 + r.artistic * 0.15 + r.conventional * 0.10);
  const agreeableness = Math.round(r.social * 0.50 + r.conventional * 0.20 + r.artistic * 0.15 + r.realistic * 0.15);
  const emotionalStability = Math.round(r.conventional * 0.30 + r.realistic * 0.25 + r.investigative * 0.25 + r.enterprising * 0.20);

  return {
    openness: Math.min(100, Math.max(0, openness)),
    conscientiousness: Math.min(100, Math.max(0, conscientiousness)),
    extraversion: Math.min(100, Math.max(0, extraversion)),
    agreeableness: Math.min(100, Math.max(0, agreeableness)),
    emotionalStability: Math.min(100, Math.max(0, emotionalStability)),
  };
}

// ── V1 signal-based scoring (legacy) ───────────────────────────────────

/**
 * Compute RIASEC (Holland Code) scores from user answers.
 * Each of the six types is scored 0-100 based on answer signal strength.
 *
 * @param answers Normalized user answers (key -> string[])
 * @returns RIASEC scores object with each type 0-100
 */
export function computeRIASEC(answers: Record<string, string[]>): RIASECScores {
  const result: RIASECScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  for (const [type, signals] of Object.entries(RIASEC_SIGNALS) as [keyof RIASECScores, typeof RIASEC_SIGNALS[keyof RIASECScores]][]) {
    let score = 0;
    for (const signal of signals) {
      let signalMatched = false;
      for (const [dim, matchValues] of Object.entries(signal.dims)) {
        const userValues = (answers[dim] ?? []).map(v => v.toLowerCase());
        if (matchValues.some(mv => userValues.includes(mv.toLowerCase()))) {
          signalMatched = true;
          break;
        }
      }
      if (signalMatched) {
        score += signal.weight;
      }
    }
    result[type] = Math.min(100, score);
  }

  return result;
}

// ── 10. Big Five Score Computation ──────────────────────────────────────

/** Big Five personality trait mappings from answer dimensions */
const BIG_FIVE_SIGNALS: Record<keyof BigFiveScores, { dims: Record<string, string[]>; weight: number }[]> = {
  openness: [
    { dims: { ws1: ["open"] }, weight: 30 },
    { dims: { ws4: ["experiment"] }, weight: 25 },
    { dims: { int1: ["artistic"] }, weight: 15 },
    { dims: { int2: ["creative"] }, weight: 15 },
    { dims: { car4: ["ideator"] }, weight: 8 },
    { dims: { val3: ["monotony"] }, weight: 7 },
  ],
  conscientiousness: [
    { dims: { ws1: ["organized", "cautious"] }, weight: 30 },
    { dims: { ws4: ["structure"] }, weight: 25 },
    { dims: { int3: ["operator"] }, weight: 15 },
    { dims: { env3: ["steady"] }, weight: 10 },
    { dims: { env4: ["targets"] }, weight: 10 },
    { dims: { car4: ["doer"] }, weight: 10 },
  ],
  extraversion: [
    { dims: { ws3: ["collaborative"] }, weight: 25 },
    { dims: { int1: ["social"] }, weight: 20 },
    { dims: { env2: ["large", "medium"] }, weight: 15 },
    { dims: { car4: ["leader"] }, weight: 15 },
    { dims: { env3: ["fast"] }, weight: 10 },
    { dims: { val4: ["recognition"] }, weight: 8 },
    { dims: { int3: ["helper"] }, weight: 7 },
  ],
  agreeableness: [
    { dims: { ws1: ["empathetic"] }, weight: 30 },
    { dims: { ws2: ["feeling", "consensus"] }, weight: 25 },
    { dims: { int3: ["helper"] }, weight: 15 },
    { dims: { val1: ["purpose"] }, weight: 10 },
    { dims: { car4: ["harmonizer"] }, weight: 10 },
    { dims: { val4: ["impact"] }, weight: 10 },
  ],
  emotionalStability: [
    { dims: { ws1: ["organized", "cautious"] }, weight: 20 },
    { dims: { car2: ["moderate", "calculated"] }, weight: 25 },
    { dims: { ws4: ["structure", "research"] }, weight: 15 },
    { dims: { env3: ["steady"] }, weight: 15 },
    { dims: { ws2: ["thinking"] }, weight: 15 },
    { dims: { env4: ["mentorship", "coaching"] }, weight: 10 },
  ],
};

/**
 * Compute Big Five personality scores from user answers.
 * Each trait is scored 0-100 based on answer signal strength.
 *
 * @param answers Normalized user answers (key -> string[])
 * @returns Big Five scores object with each trait 0-100
 */
export function computeBigFive(answers: Record<string, string[]>): BigFiveScores {
  const result: BigFiveScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    emotionalStability: 0,
  };

  for (const [trait, signals] of Object.entries(BIG_FIVE_SIGNALS) as [keyof BigFiveScores, typeof BIG_FIVE_SIGNALS[keyof BigFiveScores]][]) {
    let score = 0;
    for (const signal of signals) {
      let signalMatched = false;
      for (const [dim, matchValues] of Object.entries(signal.dims)) {
        const userValues = (answers[dim] ?? []).map(v => v.toLowerCase());
        if (matchValues.some(mv => userValues.includes(mv.toLowerCase()))) {
          signalMatched = true;
          break;
        }
      }
      if (signalMatched) {
        score += signal.weight;
      }
    }
    result[trait] = Math.min(100, score);
  }

  return result;
}
