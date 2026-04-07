/**
 * Career Brain — Local AI-Free Matching Engine
 *
 * Scores 50 career profiles against user assessment answers
 * using weighted multi-dimensional matching. No external API needed.
 */

import type { CareerProfile, SkillGapEntry, CertEntry, RecEntry, MilestoneEntry } from "./career-profiles";
import { CAREER_PROFILES_PART1 } from "./career-profiles";
import { CAREER_PROFILES_PART2 } from "./career-profiles-2";
import { getExperienceModifier, routeResourcesByStyle } from "./experience-modifiers";
import { matchGapPattern, getStageModifier } from "./gap-patterns";
import { evaluateRules, applyRuleOverlays, type RuleContext } from "./combination-rules";

const ALL_PROFILES: CareerProfile[] = [...CAREER_PROFILES_PART1, ...CAREER_PROFILES_PART2];

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
 */
function multiTraitMatch(userValues: string[], profileTraits: string[], weight: number): number {
  if (userValues.length === 0) return 0;
  const perValue = weight / userValues.length;
  const matches = userValues.filter(v => profileTraits.includes(v)).length;
  return matches * perValue;
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

/** Score a single career profile against user input */
function scoreProfile(profile: CareerProfile, input: AssessmentInput): number {
  const a = extractAnswers(input);
  let score = 0;

  // ── Interest dimension (25 points max) ──
  score += multiTraitMatch(a.int1 ?? [], profile.interests, 8);
  score += multiTraitMatch(a.int2 ?? [], profile.problemTypes, 8);
  score += multiTraitMatch(a.int3 ?? [], profile.archetypes, 9);

  // ── Work style dimension (15 points max) ──
  score += multiTraitMatch(a.ws1 ?? [], profile.workStyles, 4);
  score += multiTraitMatch(a.ws2 ?? [], profile.decisionStyle, 4);
  score += multiTraitMatch(a.ws3 ?? [], profile.collaboration, 4);
  score += multiTraitMatch(a.ws4 ?? [], profile.ambiguityStyle, 3);

  // ── Values dimension (20 points max) ──
  score += multiTraitMatch(a.val1 ?? [], profile.coreValues, 6);
  score += multiTraitMatch(a.val2 ?? [], profile.tradeoffs, 5);
  score += multiTraitMatch(a.val3 ?? [], profile.frustrations, 4);
  score += multiTraitMatch(a.val4 ?? [], profile.rewards, 5);

  // ── Environment dimension (10 points max) ──
  score += multiTraitMatch(a.env1 ?? [], profile.environments, 3);
  score += multiTraitMatch(a.env2 ?? [], profile.teamSizes, 3);
  score += multiTraitMatch(a.env3 ?? [], profile.paces, 2);
  score += multiTraitMatch(a.env4 ?? [], profile.managementStyles, 2);

  // ── Career stage dimension (15 points max) ──
  score += multiTraitMatch(a.car1 ?? [], profile.careerStages, 5);
  score += multiTraitMatch(a.car2 ?? [], profile.riskLevels, 3);
  score += multiTraitMatch(a.car3 ?? [], profile.trajectories, 4);
  score += multiTraitMatch(a.car4 ?? [], profile.groupRoles, 3);

  // ── Skills/domain overlap (15 points max) ──
  score += overlapScore(input.currentSkills, profile.requiredSkills) * 8;
  score += overlapScore(input.interests, profile.domains) * 4;
  score += (profile.experienceLevels.includes(input.experienceLevel) ? 1 : 0) * 3;

  // Normalize to 0-100 range, with floor of 45 and ceiling of 97
  // Max theoretical raw score is ~100 (all dimensions match perfectly)
  const normalized = Math.round(Math.min(97, Math.max(45, score)));

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
