/**
 * Career Brain — Local AI-Free Matching Engine
 *
 * Scores 50 career profiles against user assessment answers
 * using weighted multi-dimensional matching. No external API needed.
 */

import type { CareerProfile, SkillGapEntry, CertEntry, RecEntry, MilestoneEntry } from "./career-profiles";
import { CAREER_PROFILES_PART1 } from "./career-profiles";
import { CAREER_PROFILES_PART2 } from "./career-profiles-2";
import { CAREER_PROFILES_3 } from "./career-profiles-3";
import { getExperienceModifier, routeResourcesByStyle } from "./experience-modifiers";
import { matchGapPattern, getStageModifier } from "./gap-patterns";
import { evaluateRules, applyRuleOverlays, type RuleContext } from "./combination-rules";

const ALL_PROFILES: CareerProfile[] = [...CAREER_PROFILES_PART1, ...CAREER_PROFILES_PART2, ...CAREER_PROFILES_3];

// ── Types matching existing backend interfaces ──────────────────────────

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

export interface AssessmentInput {
  workStyle: string;
  strengths: string[];
  values: string[];
  currentSkills: string[];
  experienceLevel: string;
  interests: string[];       // selected domains
  currentRole?: string;
  personalityType?: string;
  // Raw answer IDs from the questionnaire (each key maps to selected values array)
  answers?: Record<string, string | string[]>;
}

// ── Scoring Engine ──────────────────────────────────────────────────────

/** Calculate overlap percentage between two string arrays */
function overlapScore(userItems: string[], profileItems: string[]): number {
  if (profileItems.length === 0) return 0;
  const userSet = new Set(userItems.map(s => s.toLowerCase()));
  const matches = profileItems.filter(p => userSet.has(p.toLowerCase())).length;
  return matches / profileItems.length;
}

/**
 * Score a multi-select answer against a profile's trait array.
 * Each selected value contributes weight/N points (N = number of selections),
 * so picking 2 matches out of 3 selections scores 2/3 of the full weight.
 * Bonus: if ALL selections match, add 15% bonus (strong alignment signal).
 * Penalty: if NO selections match, return 0 (clear mismatch signal).
 */
function multiTraitMatch(userValues: string[], profileTraits: string[], weight: number): number {
  if (userValues.length === 0) return 0;
  const profileSet = new Set(profileTraits.map(t => t.toLowerCase()));
  const matches = userValues.filter(v => profileSet.has(v.toLowerCase())).length;
  if (matches === 0) return 0;
  const baseScore = (matches / userValues.length) * weight;
  // Bonus for perfect alignment (all user selections match)
  const bonus = matches === userValues.length ? weight * 0.15 : 0;
  return Math.min(weight * 1.1, baseScore + bonus); // Cap at 110% of weight
}

/** Normalise a raw answer entry (string or string[]) to a string array */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Extract raw answer values from personalityType and strengths */
function extractAnswers(input: AssessmentInput): Record<string, string[]> {
  if (input.answers && Object.keys(input.answers).length > 0) {
    // Normalise every value to string[]
    const normalised: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(input.answers)) {
      normalised[k] = toArray(v);
    }
    return normalised;
  }

  // Reconstruct from personalityType format: "int1-ws2-car1"
  const parts = (input.personalityType || "").split("-");
  const extracted: Record<string, string[]> = {};

  if (parts[0] && parts[0] !== "mixed") extracted.int1 = [parts[0]];
  if (parts[1] && parts[1] !== "balanced") extracted.ws2 = [parts[1]];
  if (parts[2]) extracted.car1 = [parts[2]];

  // Extract from strengths array (format: "technical problem-solving", "open mindset", etc.)
  for (const s of input.strengths) {
    const lower = s.toLowerCase();
    // int2 extraction
    if (lower.includes("technical")) extracted.int2 = ["technical"];
    else if (lower.includes("human")) extracted.int2 = ["human"];
    else if (lower.includes("creative")) extracted.int2 = ["creative"];
    else if (lower.includes("strategic")) extracted.int2 = ["strategic"];
    else if (lower.includes("scientific")) extracted.int2 = ["scientific"];
    // ws1 extraction
    if (lower.includes("open")) extracted.ws1 = ["open"];
    else if (lower.includes("cautious")) extracted.ws1 = ["cautious"];
    else if (lower.includes("organized")) extracted.ws1 = ["organized"];
    else if (lower.includes("empathetic")) extracted.ws1 = ["empathetic"];
    // car4 extraction
    if (lower.includes("leader")) extracted.car4 = ["leader"];
    else if (lower.includes("ideator")) extracted.car4 = ["ideator"];
    else if (lower.includes("doer")) extracted.car4 = ["doer"];
    else if (lower.includes("harmonizer")) extracted.car4 = ["harmonizer"];
    // ws4 extraction
    if (lower.includes("structure")) extracted.ws4 = ["structure"];
    else if (lower.includes("experiment")) extracted.ws4 = ["experiment"];
    else if (lower.includes("consult")) extracted.ws4 = ["consult"];
  }

  // Extract from values array
  for (const v of input.values) {
    if (["autonomy", "prestige", "purpose", "mastery"].includes(v)) extracted.val1 = [v];
    if (["purpose_over_wealth", "wealth_over_stability", "balance_over_creativity"].includes(v)) extracted.val2 = [v];
    if (["monotony", "no_impact", "micromanaged", "isolation"].includes(v)) extracted.val3 = [v];
    if (["wealth", "recognition", "learning", "impact"].includes(v)) extracted.val4 = [v];
  }

  // workStyle maps to ws3
  extracted.ws3 = [input.workStyle || "mixed"];

  return extracted;
}

// ── Synergy Patterns ──────────────────────────────────────────────────
// Cross-dimensional answer combos that are stronger signals than individual answers.
// Each pattern specifies required answer values across multiple dimensions, the
// profile domains/traits it boosts, and the max bonus points it contributes.

interface SynergyPattern {
  name: string;
  /** Required answers: key = answer dimension, value = any of these must be present */
  requires: Record<string, string[]>;
  /** Profile fields that must contain at least one of these values for the bonus to apply */
  boostWhen: { field: keyof CareerProfile; values: string[] }[];
  /** Max bonus points when all conditions are met */
  bonus: number;
}

const SYNERGY_PATTERNS: SynergyPattern[] = [
  // 1. Engineering signal: builder + technical + solo
  {
    name: "engineering-core",
    requires: { int3: ["builder"], int2: ["technical"], ws3: ["solo", "mixed"] },
    boostWhen: [
      { field: "domains", values: ["Technology"] },
      { field: "archetypes", values: ["builder", "optimizer"] },
    ],
    bonus: 3,
  },
  // 2. Social/education signal: helper + social interest + purpose value
  {
    name: "social-educator",
    requires: { int3: ["helper", "mentor"], int1: ["social"], val1: ["purpose", "impact"] },
    boostWhen: [
      { field: "domains", values: ["Education & Training", "Social Impact", "Healthcare"] },
      { field: "archetypes", values: ["helper", "mentor"] },
    ],
    bonus: 3,
  },
  // 3. Management signal: strategic + leader + manager trajectory
  {
    name: "management-track",
    requires: { int2: ["strategic"], car4: ["leader"], car3: ["manager", "executive"] },
    boostWhen: [
      { field: "trajectories", values: ["manager", "executive"] },
      { field: "groupRoles", values: ["leader"] },
    ],
    bonus: 3,
  },
  // 4. Creative/design signal: creative + artistic + autonomy
  {
    name: "creative-designer",
    requires: { int2: ["creative"], int1: ["artistic"], val1: ["autonomy"] },
    boostWhen: [
      { field: "domains", values: ["Design & UX", "Media & Entertainment", "Marketing"] },
      { field: "archetypes", values: ["creator", "visionary"] },
    ],
    bonus: 3,
  },
  // 5. Analyst signal: investigative + analytical + organized
  {
    name: "analyst-core",
    requires: { int1: ["investigative"], int2: ["analytical"], ws1: ["organized", "methodical"] },
    boostWhen: [
      { field: "domains", values: ["Data & Analytics", "Finance", "Research"] },
      { field: "problemTypes", values: ["analytical", "technical"] },
    ],
    bonus: 2.5,
  },
  // 6. Entrepreneur signal: high risk + autonomy + ideator
  {
    name: "entrepreneur-signal",
    requires: { car2: ["high"], val1: ["autonomy"], car4: ["ideator"] },
    boostWhen: [
      { field: "trajectories", values: ["entrepreneur", "founder"] },
      { field: "riskLevels", values: ["high"] },
    ],
    bonus: 2.5,
  },
  // 7. Research/science signal: investigative + scientific + mastery
  {
    name: "research-scientist",
    requires: { int1: ["investigative"], int2: ["scientific"], val1: ["mastery"] },
    boostWhen: [
      { field: "domains", values: ["Research", "Science", "Healthcare", "Data & Analytics"] },
      { field: "problemTypes", values: ["scientific", "analytical"] },
    ],
    bonus: 2.5,
  },
  // 8. DevOps/infra signal: builder + organized + structure + steady pace
  {
    name: "infra-ops",
    requires: { int3: ["builder", "optimizer"], ws1: ["organized"], ws4: ["structure"] },
    boostWhen: [
      { field: "domains", values: ["Technology", "Cybersecurity"] },
      { field: "paces", values: ["steady"] },
    ],
    bonus: 2,
  },
  // 9. Communicator signal: social + helper + team collab
  {
    name: "communicator-collab",
    requires: { int1: ["social"], int3: ["helper", "connector"], ws3: ["team"] },
    boostWhen: [
      { field: "collaboration", values: ["team"] },
      { field: "teamSizes", values: ["large", "medium"] },
    ],
    bonus: 2,
  },
  // 10. Specialist depth signal: mastery + specialist trajectory + thinking decision
  {
    name: "deep-specialist",
    requires: { val1: ["mastery"], car3: ["specialist"], ws2: ["thinking", "analytical"] },
    boostWhen: [
      { field: "trajectories", values: ["specialist"] },
      { field: "coreValues", values: ["mastery"] },
    ],
    bonus: 2,
  },
];

// ── Anti-Patterns ─────────────────────────────────────────────────────
// Answer-profile combos that actively conflict. Penalty is subtracted.

interface AntiPattern {
  name: string;
  /** User answers that trigger this anti-pattern */
  userCondition: Record<string, string[]>;
  /** Profile fields that must contain one of these values for the penalty to apply */
  profileCondition: { field: keyof CareerProfile; values: string[] }[];
  /** Penalty points (positive number, will be subtracted) */
  penalty: number;
}

const ANTI_PATTERNS: AntiPattern[] = [
  // 1. Low risk + entrepreneur trajectory
  {
    name: "risk-averse-entrepreneur",
    userCondition: { car2: ["low"] },
    profileCondition: [{ field: "trajectories", values: ["entrepreneur", "founder"] }],
    penalty: 2.5,
  },
  // 2. Isolation frustration + solo team size
  {
    name: "isolation-hates-solo",
    userCondition: { val3: ["isolation"] },
    profileCondition: [{ field: "teamSizes", values: ["solo"] }, { field: "collaboration", values: ["solo"] }],
    penalty: 2,
  },
  // 3. Micromanaged frustration + targets management style
  {
    name: "micromanaged-hates-targets",
    userCondition: { val3: ["micromanaged"] },
    profileCondition: [{ field: "managementStyles", values: ["targets", "directive", "structured"] }],
    penalty: 2,
  },
  // 4. Steady pace preference + fast-only profiles
  {
    name: "steady-hates-fast",
    userCondition: { env3: ["steady"] },
    profileCondition: [{ field: "paces", values: ["fast", "burst"] }],
    penalty: 1.5,
  },
  // 5. Solo preference + large team profiles
  {
    name: "solo-hates-large-team",
    userCondition: { ws3: ["solo"] },
    profileCondition: [{ field: "teamSizes", values: ["large"] }],
    penalty: 1.5,
  },
  // 6. Monotony frustration + profiles with routine/repetitive traits
  {
    name: "monotony-hates-routine",
    userCondition: { val3: ["monotony"] },
    profileCondition: [{ field: "paces", values: ["steady"] }, { field: "ambiguityStyle", values: ["structure"] }],
    penalty: 1,
  },
  // 7. Autonomy value + directive management
  {
    name: "autonomy-hates-directive",
    userCondition: { val1: ["autonomy"] },
    profileCondition: [{ field: "managementStyles", values: ["directive", "targets", "structured"] }],
    penalty: 1.5,
  },
  // 8. Team preference + solo-heavy profiles
  {
    name: "team-player-hates-isolation",
    userCondition: { ws3: ["team"] },
    profileCondition: [{ field: "collaboration", values: ["solo"] }],
    penalty: 1.5,
  },
];

// ── Cross-Dimensional Synergy Scoring (max 10 points) ─────────────────

function scoreSynergies(a: Record<string, string[]>, profile: CareerProfile): number {
  let total = 0;
  for (const pattern of SYNERGY_PATTERNS) {
    // Check if user answers satisfy all required dimensions
    let allRequirementsMet = true;
    let requirementCount = 0;
    let metCount = 0;

    for (const [dim, requiredValues] of Object.entries(pattern.requires)) {
      requirementCount++;
      const userValues = (a[dim] ?? []).map(v => v.toLowerCase());
      const hasMatch = requiredValues.some(rv => userValues.includes(rv.toLowerCase()));
      if (hasMatch) {
        metCount++;
      } else {
        allRequirementsMet = false;
      }
    }

    if (metCount === 0) continue;

    // Check if profile matches the boost conditions
    let profileMatchCount = 0;
    for (const bc of pattern.boostWhen) {
      const profileValues = (profile[bc.field] as string[]) ?? [];
      const profileLower = profileValues.map(v => v.toLowerCase());
      if (bc.values.some(bv => profileLower.includes(bv.toLowerCase()))) {
        profileMatchCount++;
      }
    }

    if (profileMatchCount === 0) continue;

    // Scale bonus: full bonus if all requirements met, partial if most met
    const requirementRatio = metCount / requirementCount;
    const profileRatio = profileMatchCount / pattern.boostWhen.length;

    if (allRequirementsMet) {
      // Full synergy: all user answers match + profile matches
      total += pattern.bonus * profileRatio;
    } else if (requirementRatio >= 0.66) {
      // Partial synergy: 2 out of 3 requirements met — give half bonus
      total += pattern.bonus * 0.5 * profileRatio;
    }
    // Less than 66% match: no synergy bonus
  }

  return Math.min(10, total);
}

// ── Anti-Pattern Penalty (max -8 points) ──────────────────────────────

function scoreAntiPatterns(a: Record<string, string[]>, profile: CareerProfile): number {
  let totalPenalty = 0;

  for (const ap of ANTI_PATTERNS) {
    // Check if user answers trigger this anti-pattern
    let userTrigger = true;
    for (const [dim, triggerValues] of Object.entries(ap.userCondition)) {
      const userValues = (a[dim] ?? []).map(v => v.toLowerCase());
      if (!triggerValues.some(tv => userValues.includes(tv.toLowerCase()))) {
        userTrigger = false;
        break;
      }
    }

    if (!userTrigger) continue;

    // Check if profile has the conflicting traits
    let profileConflict = false;
    for (const pc of ap.profileCondition) {
      const profileValues = (profile[pc.field] as string[]) ?? [];
      const profileLower = profileValues.map(v => v.toLowerCase());
      if (pc.values.some(pv => profileLower.includes(pv.toLowerCase()))) {
        profileConflict = true;
        break;
      }
    }

    if (profileConflict) {
      totalPenalty += ap.penalty;
    }
  }

  return Math.min(8, totalPenalty);
}

// ── Domain Affinity Boost (max 5 points) ──────────────────────────────
// Tiered: top 1-2 interest selections = primary (big boost), 3-6 = secondary (moderate).

function scoreDomainAffinity(interests: string[], profileDomains: string[]): number {
  if (interests.length === 0 || profileDomains.length === 0) return 0;

  const profileDomainsLower = new Set(profileDomains.map(d => d.toLowerCase()));
  let boost = 0;

  for (let i = 0; i < interests.length; i++) {
    if (profileDomainsLower.has(interests[i].toLowerCase())) {
      if (i < 2) {
        // Primary domain (first 2 picks): 2 points each, max 4
        boost += 2;
      } else {
        // Secondary domain (picks 3-6): 0.5 points each, max ~2
        boost += 0.5;
      }
    }
  }

  return Math.min(5, boost);
}

// ── Experience-Career Fit (max 5 points) ──────────────────────────────
// Boost when experience level matches profile requirements, penalise mismatches.

const EXPERIENCE_RANKS: Record<string, number> = {
  student: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  expert: 4,
  executive: 5,
};

function scoreExperienceFit(experienceLevel: string, profileLevels: string[]): number {
  if (!experienceLevel || profileLevels.length === 0) return 0;

  const userRank = EXPERIENCE_RANKS[experienceLevel.toLowerCase()] ?? 1;

  // Find the closest profile level
  const profileRanks = profileLevels
    .map(l => EXPERIENCE_RANKS[l.toLowerCase()] ?? -1)
    .filter(r => r >= 0);

  if (profileRanks.length === 0) return 0;

  // Direct match: full boost
  if (profileRanks.includes(userRank)) return 5;

  // Check distance to nearest matching level
  const minDistance = Math.min(...profileRanks.map(pr => Math.abs(pr - userRank)));

  if (minDistance === 1) return 2.5;  // Adjacent level: partial boost
  if (minDistance === 2) return 0;    // Two levels away: neutral
  return -2;                           // Very mismatched: mild penalty (student→expert, expert→student)
}

// ── Personality Coherence (contributes to spread, not separate points) ─
// Cosine-similarity-like alignment between user trait vector and profile trait vector.
// Used as a multiplier on the base score to reward/penalise coherent vs scattered profiles.

function personalityCoherence(a: Record<string, string[]>, profile: CareerProfile): number {
  // Build simple "trait presence" vectors for user and profile, then measure alignment.
  // We map each answer dimension to the profile's corresponding trait array and
  // count how many of the user's total answers align vs total possible.

  const dimensionMap: [string, keyof CareerProfile][] = [
    ["int1", "interests"], ["int2", "problemTypes"], ["int3", "archetypes"],
    ["ws1", "workStyles"], ["ws2", "decisionStyle"], ["ws3", "collaboration"], ["ws4", "ambiguityStyle"],
    ["val1", "coreValues"], ["val2", "tradeoffs"], ["val3", "frustrations"], ["val4", "rewards"],
    ["env1", "environments"], ["env2", "teamSizes"], ["env3", "paces"], ["env4", "managementStyles"],
    ["car1", "careerStages"], ["car2", "riskLevels"], ["car3", "trajectories"], ["car4", "groupRoles"],
  ];

  let matches = 0;
  let total = 0;

  for (const [answerKey, profileKey] of dimensionMap) {
    const userValues = a[answerKey] ?? [];
    if (userValues.length === 0) continue;

    total++;
    const profileValues = new Set(((profile[profileKey] as string[]) ?? []).map(v => v.toLowerCase()));
    const hasMatch = userValues.some(uv => profileValues.has(uv.toLowerCase()));
    if (hasMatch) matches++;
  }

  if (total === 0) return 1.0; // No data, neutral multiplier

  // Return a coherence ratio from 0 to 1
  return matches / total;
}

/** Score a single career profile against user input */
function scoreProfile(profile: CareerProfile, input: AssessmentInput): number {
  const a = extractAnswers(input);
  let score = 0;

  // ── Interest dimension (20 points max, was 25) ──
  score += multiTraitMatch(a.int1 ?? [], profile.interests, 6.5);
  score += multiTraitMatch(a.int2 ?? [], profile.problemTypes, 6.5);
  score += multiTraitMatch(a.int3 ?? [], profile.archetypes, 7);

  // ── Work style dimension (12 points max, was 15) ──
  score += multiTraitMatch(a.ws1 ?? [], profile.workStyles, 3);
  score += multiTraitMatch(a.ws2 ?? [], profile.decisionStyle, 3);
  score += multiTraitMatch(a.ws3 ?? [], profile.collaboration, 3.5);
  score += multiTraitMatch(a.ws4 ?? [], profile.ambiguityStyle, 2.5);

  // ── Values dimension (18 points max, was 20) ──
  score += multiTraitMatch(a.val1 ?? [], profile.coreValues, 5.5);
  score += multiTraitMatch(a.val2 ?? [], profile.tradeoffs, 4.5);
  score += multiTraitMatch(a.val3 ?? [], profile.frustrations, 3.5);
  score += multiTraitMatch(a.val4 ?? [], profile.rewards, 4.5);

  // ── Environment dimension (8 points max, was 10) ──
  score += multiTraitMatch(a.env1 ?? [], profile.environments, 2);
  score += multiTraitMatch(a.env2 ?? [], profile.teamSizes, 2.5);
  score += multiTraitMatch(a.env3 ?? [], profile.paces, 1.5);
  score += multiTraitMatch(a.env4 ?? [], profile.managementStyles, 2);

  // ── Career stage dimension (12 points max, was 15) ──
  score += multiTraitMatch(a.car1 ?? [], profile.careerStages, 4);
  score += multiTraitMatch(a.car2 ?? [], profile.riskLevels, 2.5);
  score += multiTraitMatch(a.car3 ?? [], profile.trajectories, 3);
  score += multiTraitMatch(a.car4 ?? [], profile.groupRoles, 2.5);

  // ── Skills/domain overlap (10 points max, was 15) ──
  score += overlapScore(input.currentSkills, profile.requiredSkills) * 6;
  score += overlapScore(input.interests, profile.domains) * 2;
  score += (profile.experienceLevels.includes(input.experienceLevel) ? 1 : 0) * 2;

  // ── Cross-dimensional synergy (10 points max, NEW) ──
  score += scoreSynergies(a, profile);

  // ── Anti-pattern penalty (-8 points max, NEW) ──
  score -= scoreAntiPatterns(a, profile);

  // ── Domain affinity boost (5 points max, NEW) ──
  score += scoreDomainAffinity(input.interests, profile.domains);

  // ── Experience-career fit (5 points max, NEW) ──
  score += scoreExperienceFit(input.experienceLevel, profile.experienceLevels);

  // ── Personality coherence multiplier ──
  // Coherence adjusts the final score: highly coherent profiles get a small boost,
  // scattered/inconsistent matches get pulled down slightly.
  // Range: 0.92 (very incoherent) to 1.06 (very coherent)
  const coherence = personalityCoherence(a, profile);
  const coherenceMultiplier = 0.92 + (coherence * 0.14);
  score *= coherenceMultiplier;

  // ── Normalize to 0-100 ──
  // Max theoretical raw score is ~100 (all dimensions + synergies match perfectly)
  // Use a more honest scale: floor of 15 so bad matches look bad,
  // ceiling of 98 so perfect matches feel earned
  // Apply a curve: boost mid-range scores slightly for better spread
  const rawPct = Math.min(100, Math.max(0, score));
  const curved = rawPct < 30
    ? rawPct * 0.8                     // Compress low scores
    : 20 + (rawPct - 30) * (78 / 70);  // Spread 30-100 across 20-98
  const normalized = Math.round(Math.min(98, Math.max(15, curved)));

  return normalized;
}

// ── Public API ──────────────────────────────────────────────────────────

/** Get top N career matches for user input */
export function getTopCareerMatches(input: AssessmentInput, count = 3): {
  careerMatches: CareerMatch[];
  skillGaps: SkillGap[];
} {
  const scored = ALL_PROFILES.map(profile => ({
    profile,
    score: scoreProfile(profile, input),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const topProfiles = scored.slice(0, count);

  const careerMatches: CareerMatch[] = topProfiles.map(({ profile, score }) => ({
    title: profile.title,
    matchScore: score,
    description: profile.description,
    requiredSkills: profile.requiredSkills,
    pathwayTime: profile.pathwayTime,
  }));

  // Combine skill gaps from top match, deduped
  const topProfile = topProfiles[0].profile;
  const userSkillsLower = new Set(input.currentSkills.map(s => s.toLowerCase()));

  // Filter out skills user already has, take from top profile + supplement from #2
  const allGaps: SkillGap[] = [];
  const seen = new Set<string>();

  for (const p of topProfiles) {
    for (const gap of p.profile.skillGaps) {
      const key = gap.skill.toLowerCase();
      if (!seen.has(key) && !userSkillsLower.has(key)) {
        seen.add(key);
        allGaps.push(gap);
      }
    }
  }

  return {
    careerMatches,
    skillGaps: allGaps.slice(0, 5),
  };
}

/** Get certificate recommendations for a target role */
export function getCertificatesForRole(targetRole: string, skillGaps: string[]): CertEntry[] {
  const profile = findProfileByTitle(targetRole);
  if (!profile) return getGenericCerts(skillGaps);
  return profile.certifications;
}

/** Get career recommendations (portfolio, networking, job targets) for a role */
export function getCareerRecsForRole(targetRole: string): {
  portfolio: RecEntry[];
  networking: RecEntry[];
  jobApplications: RecEntry[];
} {
  const profile = findProfileByTitle(targetRole);
  if (!profile) return getGenericRecs(targetRole);
  return {
    portfolio: profile.portfolioProjects,
    networking: profile.networkingRecs,
    jobApplications: profile.jobTargets,
  };
}

/** Extended context for the enhanced skill gap analysis */
export interface SkillGapContext {
  targetRole: string;
  currentSkills: string[];
  technicalSkills: Record<string, string>;
  softSkills: Record<string, string>;
  biggestGap?: string;
  yearsExperience?: string;
  experienceLevel?: string;
  learningStyle?: string[];
  careerStage?: string;
  riskTolerance?: string;
  workStyle?: string;
  trajectory?: string;
  values?: string[];
  domains?: string[];
}

/** Enhanced skill gap result with modifier-driven advice */
export interface EnhancedSkillGapResult {
  skillGaps: Array<SkillGap & { currentLevel: string; targetLevel: string; resources?: Array<{ style: string; name: string; url: string; duration: string; cost: string }> }>;
  summary: string;
  topPriority: string;
  gapAdvice?: { category: string; adviceSnippet: string; actionItems: string[] };
  experienceTier?: string;
  matchedRules?: string[];
}

/** Get skill gap analysis for a target role — enhanced with modifier layers */
export function analyzeSkillGapsForRole(
  targetRole: string,
  currentSkills: string[],
  technicalSkills: Record<string, string>,
  softSkills: Record<string, string>,
  biggestGap?: string,
  context?: Partial<SkillGapContext>,
): EnhancedSkillGapResult {
  const profile = findProfileByTitle(targetRole);
  const userSkillsLower = new Set(currentSkills.map(s => s.toLowerCase()));

  // ── Layer 1: Experience modifier ──
  const expMod = getExperienceModifier(
    context?.experienceLevel || "junior",
    context?.yearsExperience,
  );

  // ── Layer 2: Gap pattern matching ──
  const gapMatch = biggestGap ? matchGapPattern(biggestGap) : null;

  // ── Layer 3: Career stage modifier ──
  const stageMod = getStageModifier(
    context?.careerStage || "building",
    context?.riskTolerance || "moderate",
  );

  if (!profile) {
    const fallbackSummary = `${expMod.summaryPrefix} To transition into ${targetRole}, focus on building core competencies through structured learning paths.`;
    return {
      skillGaps: [
        { skill: "Core Technical Skills", importance: "high", learningResource: "Coursera Professional Certificate", currentLevel: "beginner", targetLevel: "intermediate" },
        { skill: "Industry Knowledge", importance: "high", learningResource: "LinkedIn Learning", currentLevel: "beginner", targetLevel: "intermediate" },
      ],
      summary: fallbackSummary,
      topPriority: "Core technical skills for your target role",
      experienceTier: expMod.resourceTier,
    };
  }

  // ── Base skill gaps from profile ──
  const gaps = profile.skillGaps
    .filter(g => !userSkillsLower.has(g.skill.toLowerCase()))
    .map(g => {
      const techLevel = technicalSkills[g.skill] || "none";
      const softLevel = softSkills[g.skill] || "none";
      const currentLevel = techLevel !== "none" ? techLevel : softLevel !== "none" ? softLevel : "beginner";
      // Adjust target level based on experience tier
      let targetLevel = g.importance === "high" ? "advanced" : "intermediate";
      if (expMod.resourceTier === "foundational" && targetLevel === "advanced") {
        targetLevel = "intermediate"; // Don't overwhelm beginners
      }
      // Route learning resources by preferred style
      const preferredStyles = context?.learningStyle || [];
      const styledResources = preferredStyles.length > 0
        ? routeResourcesByStyle(g.skill, preferredStyles)
        : undefined;
      return {
        ...g,
        currentLevel,
        targetLevel,
        // Override learningResource with best-match styled resource
        learningResource: styledResources?.[0]?.name || g.learningResource,
        resources: styledResources,
      };
    });

  // ── Gap pattern boost: reorder based on user's self-identified gap ──
  if (gapMatch) {
    for (const boostSkill of gapMatch.priorityBoost) {
      const boostLower = boostSkill.toLowerCase();
      const idx = gaps.findIndex(g => g.skill.toLowerCase().includes(boostLower));
      if (idx > 0) {
        const [matched] = gaps.splice(idx, 1);
        gaps.unshift(matched);
      }
    }
  }
  // Also do direct text matching on biggestGap
  if (biggestGap?.trim()) {
    const userGapLower = biggestGap.trim().toLowerCase();
    const matchIdx = gaps.findIndex(g =>
      g.skill.toLowerCase().includes(userGapLower) || userGapLower.includes(g.skill.toLowerCase())
    );
    if (matchIdx > 0) {
      const [matched] = gaps.splice(matchIdx, 1);
      gaps.unshift(matched);
    }
  }

  // ── Stage modifier: boost/suppress skill categories ──
  for (const boost of stageMod.priorityShift) {
    const idx = gaps.findIndex(g => g.skill.toLowerCase().includes(boost.toLowerCase()));
    if (idx > 1) { // Move up but not past position 0 (gap-pattern has priority)
      const [matched] = gaps.splice(idx, 1);
      gaps.splice(1, 0, matched);
    }
  }

  // ── Layer 4: Combination rules ──
  const ruleContext: RuleContext = {
    experienceLevel: context?.experienceLevel || "junior",
    careerStage: context?.careerStage || "building",
    workStyle: context?.workStyle || "mixed",
    riskTolerance: context?.riskTolerance || "moderate",
    trajectory: context?.trajectory || "generalist",
    values: context?.values || [],
    technicalSkills,
    softSkills,
    domains: context?.domains || [],
    learningStyle: context?.learningStyle || [],
  };
  const matchedRules = evaluateRules(ruleContext);

  // Apply rule overlays to gaps (boost/suppress importance)
  const overlayResult = applyRuleOverlays(
    matchedRules,
    "", // We'll build summary separately
    gaps,
    [], // milestones handled elsewhere
  );

  // ── Build summary from all layers ──
  const highPriority = gaps.find(g => g.importance === "high");
  const gapCount = gaps.length;

  // Start with experience-appropriate prefix
  let summary = expMod.summaryPrefix + " ";

  // Use stage modifier template if available, else build default
  if (stageMod.summaryTemplate) {
    summary += stageMod.summaryTemplate
      .replace("{role}", profile.title)
      .replace("{gaps}", String(gapCount))
      .replace("{topSkill}", highPriority?.skill || "technical depth");
  } else {
    summary += `Focus on closing ${gapCount} key skill gaps to become competitive for ${profile.title}.`;
  }

  // Add gap-specific advice
  if (gapMatch) {
    summary += " " + gapMatch.adviceSnippet;
  }

  // Add combination rule advice (top 2 rules max)
  for (const rule of matchedRules.slice(0, 2)) {
    if (rule.additionalAdvice) {
      summary += " " + rule.additionalAdvice;
    }
  }

  return {
    skillGaps: overlayResult.gaps as any,
    summary,
    topPriority: highPriority?.skill || gaps[0]?.skill || "Industry-specific knowledge",
    gapAdvice: gapMatch ? {
      category: gapMatch.category,
      adviceSnippet: gapMatch.adviceSnippet,
      actionItems: gapMatch.actionItems,
    } : undefined,
    experienceTier: expMod.resourceTier,
    matchedRules: matchedRules.slice(0, 5).map(r => r.name),
  };
}

/** Get pre-built roadmap milestones for a target role */
export function getMilestonesForRole(targetRole: string): MilestoneEntry[] {
  const profile = findProfileByTitle(targetRole);
  if (!profile) return getGenericMilestones(targetRole);
  return profile.milestones;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function findProfileByTitle(title: string): CareerProfile | undefined {
  const lower = title.toLowerCase();
  return ALL_PROFILES.find(p =>
    p.title.toLowerCase() === lower ||
    p.title.toLowerCase().includes(lower) ||
    lower.includes(p.title.toLowerCase())
  );
}

function getGenericCerts(skillGaps: string[]): CertEntry[] {
  return skillGaps.slice(0, 4).map(skill => ({
    skill,
    certName: `${skill} Professional Certificate`,
    provider: "Coursera",
    url: "https://www.coursera.org/professional-certificates",
    duration: "3-6 months part-time",
    level: "Beginner",
    cost: "Free to audit, $49/month for certificate",
    whyRecommended: `Build foundational ${skill} skills recognized by employers.`,
  }));
}

function getGenericRecs(targetRole: string): {
  portfolio: RecEntry[];
  networking: RecEntry[];
  jobApplications: RecEntry[];
} {
  return {
    portfolio: [
      { type: "portfolio", title: `${targetRole} Showcase Project`, description: "Build a portfolio project demonstrating key skills for this role.", platform: "GitHub", url: "https://github.com", why: "Portfolio projects are the #1 way to stand out.", actionStep: "Create a project brief and start building today." },
      { type: "portfolio", title: "Personal Website", description: "Create a professional portfolio site showcasing your work.", platform: "GitHub Pages", url: "https://pages.github.com", why: "A personal site establishes your professional presence.", actionStep: "Set up a GitHub Pages site with your resume and projects." },
    ],
    networking: [
      { type: "networking", title: "LinkedIn Industry Groups", description: "Join professional groups related to your target role.", platform: "LinkedIn", url: "https://www.linkedin.com/groups/", why: "70% of jobs are found through networking.", actionStep: "Send 3 connection requests to people in your target role today." },
      { type: "networking", title: "Industry Meetups", description: "Attend local or virtual meetups in your field.", platform: "Meetup", url: "https://www.meetup.com", why: "In-person connections lead to referrals.", actionStep: "Find and RSVP to one meetup happening this month." },
    ],
    jobApplications: [
      { type: "job_application", title: "LinkedIn Jobs", description: `Search for ${targetRole} positions.`, platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Largest professional job board.", actionStep: "Set up job alerts for your target role and apply to 3 positions this week." },
      { type: "job_application", title: "Indeed", description: `Browse ${targetRole} openings across industries.`, platform: "Indeed", url: "https://www.indeed.com", why: "Wide range of positions from startups to enterprises.", actionStep: "Upload your resume and apply to 2 positions today." },
    ],
  };
}

function getGenericMilestones(targetRole: string): MilestoneEntry[] {
  return [
    { title: "Foundation", description: `Build core skills for ${targetRole}`, tasks: ["Research role requirements", "Identify top 3 skills to learn", "Set up learning environment", "Start first online course"], estimatedWeeks: 3 },
    { title: "Core Skills", description: "Develop primary technical competencies", tasks: ["Complete foundational course", "Build first practice project", "Join relevant online community"], estimatedWeeks: 4 },
    { title: "Applied Learning", description: "Apply skills to real-world scenarios", tasks: ["Build portfolio project #1", "Get feedback from peers", "Iterate on project quality"], estimatedWeeks: 4 },
    { title: "Professional Portfolio", description: "Create materials for job applications", tasks: ["Polish portfolio project", "Update resume for target role", "Write role-specific cover letter template"], estimatedWeeks: 3 },
    { title: "Networking & Outreach", description: "Build professional connections", tasks: ["Attend 2 industry events", "Connect with 10 professionals on LinkedIn", "Request 2 informational interviews"], estimatedWeeks: 3 },
    { title: "Job Search", description: "Active application and interview preparation", tasks: ["Apply to 10+ positions", "Practice common interview questions", "Prepare technical portfolio walkthrough", "Follow up on applications"], estimatedWeeks: 4 },
  ];
}
