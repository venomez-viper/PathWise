# PathWise Scoring Engine v2 -- Technical Specification

**Status:** Draft  
**Author:** Architecture Team  
**Date:** 2026-04-06  
**Replaces:** `career-brain.ts` v1 scoring (weighted overlap + linear normalization)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Type System](#3-core-type-system)
4. [Per-Career Dimensional Weighting](#4-per-career-dimensional-weighting)
5. [Non-Compensatory Thresholds](#5-non-compensatory-thresholds)
6. [Cosine Similarity Scoring](#6-cosine-similarity-scoring)
7. [Expanded Synergy Patterns](#7-expanded-synergy-patterns)
8. [Expanded Anti-Patterns](#8-expanded-anti-patterns)
9. [Confidence Scoring](#9-confidence-scoring)
10. [Percentile Normalization](#10-percentile-normalization)
11. [What-If Score Calculation](#11-what-if-score-calculation)
12. [Career Family Clustering](#12-career-family-clustering)
13. [Result Categories](#13-result-categories)
14. [Scoring Pipeline](#14-scoring-pipeline)
15. [Migration Strategy](#15-migration-strategy)
16. [Open Questions](#16-open-questions)

---

## 1. Executive Summary

### Problem

The v1 scoring engine uses uniform weights across all careers, simple set-overlap scoring, and an arbitrary linear normalization curve. This produces match scores that cluster in the 65-90 range with poor discriminatory power. Careers with fundamentally different trait importance (e.g., Surgeon vs. UX Designer) are scored on the same weight vector, diluting signal.

### Solution

v2 introduces per-career weight vectors, cosine similarity for multi-dimensional matching, non-compensatory thresholds for hard requirements, percentile-based normalization, confidence scoring, and structured result categories. The engine moves from "weighted overlap counting" to "vector space matching with career-specific geometry."

### Key Changes from v1

| Aspect | v1 | v2 |
|--------|----|----|
| Weighting | Fixed weights for all careers | Per-career weight vectors |
| Scoring | Set overlap + multiTraitMatch | Cosine similarity + dimensional weighting |
| Thresholds | None | Non-compensatory minimums |
| Normalization | Linear curve (78/70) | Percentile-based ranking |
| Synergies | 10 patterns | 27 patterns |
| Anti-patterns | 8 patterns | 17 patterns |
| Confidence | None | 3-tier confidence with consistency scoring |
| Result shape | Flat ranked list | Categorized results with What-If scenarios |
| Career families | None | 20 families with intra-family ranking |

---

## 2. Architecture Overview

```
                                    SCORING PIPELINE v2
                                    
User Answers (80 questions)
        |
        v
+-------+--------+
| Answer Parser   |  -- Normalizes raw answers into typed trait vectors
+-------+--------+
        |
        v
+-------+-----------+       +---------------------+
| Trait Vector       |       | Career Profile DB   |
| Builder            |       | (90+ profiles)      |
+-------+-----------+       +----------+----------+
        |                              |
        v                              v
+-------+------------------------------+----------+
| Per-Career Dimensional Scorer                    |
|                                                  |
|  1. Check non-compensatory thresholds            |
|  2. Build user vector per dimension              |
|  3. Build career vector per dimension            |
|  4. Compute cosine similarity per dimension      |
|  5. Apply career-specific weight vector          |
|  6. Score synergy patterns                       |
|  7. Score anti-patterns                          |
|  8. Apply experience fit + domain affinity       |
|  9. Apply personality coherence multiplier       |
+-------+------------------------------------------+
        |
        v
+-------+-----------+
| Raw Score Array    |  -- One raw score per career profile
+-------+-----------+
        |
        v
+-------+-----------+       +---------------------+
| Percentile         |       | Confidence           |
| Normalizer         |       | Calculator           |
+-------+-----------+       +----------+----------+
        |                              |
        v                              v
+-------+------------------------------+----------+
| Result Categorizer                               |
|                                                  |
|  - Best Overall Match                            |
|  - Fastest Path                                  |
|  - Highest Growth                                |
|  - Hidden Gem                                    |
|  - Stretch Goal                                  |
+-------+------------------------------------------+
        |
        v
+-------+-----------+       +---------------------+
| What-If Engine     |       | Career Family        |
|                    |       | Clusterer            |
+-------+-----------+       +----------+----------+
        |                              |
        v                              v
+-------+------------------------------+----------+
| Final Result                                     |
| AssessmentResultV2                               |
+--------------------------------------------------+
```

---

## 3. Core Type System

### 3.1 Input Types

```typescript
/**
 * Normalized user trait vector built from all 80 assessment answers.
 * Each dimension maps to a sparse vector where keys are trait values
 * and values are signal strength (0-1).
 */
interface UserTraitVector {
  /** RIASEC interest codes with strength */
  interests: Record<string, number>;
  /** Problem-solving style strengths */
  problemTypes: Record<string, number>;
  /** Archetype identification strengths */
  archetypes: Record<string, number>;
  /** Work style preferences */
  workStyles: Record<string, number>;
  /** Decision-making style */
  decisionStyle: Record<string, number>;
  /** Collaboration preference */
  collaboration: Record<string, number>;
  /** Ambiguity tolerance */
  ambiguityStyle: Record<string, number>;
  /** Core values hierarchy */
  coreValues: Record<string, number>;
  /** Value tradeoff preferences */
  tradeoffs: Record<string, number>;
  /** Frustration signals (inverse fit indicators) */
  frustrations: Record<string, number>;
  /** Reward motivators */
  rewards: Record<string, number>;
  /** Environment preferences */
  environments: Record<string, number>;
  /** Team size preferences */
  teamSizes: Record<string, number>;
  /** Work pace preferences */
  paces: Record<string, number>;
  /** Management style preferences */
  managementStyles: Record<string, number>;
  /** Career stage self-assessment */
  careerStages: Record<string, number>;
  /** Risk tolerance */
  riskLevels: Record<string, number>;
  /** Trajectory preference */
  trajectories: Record<string, number>;
  /** Group role identification */
  groupRoles: Record<string, number>;
}

/**
 * The 19 scoreable dimensions, matching UserTraitVector keys.
 */
type ScoringDimension = keyof UserTraitVector;

/**
 * All 19 dimensions enumerated for iteration.
 */
const ALL_DIMENSIONS: ScoringDimension[] = [
  'interests', 'problemTypes', 'archetypes',
  'workStyles', 'decisionStyle', 'collaboration', 'ambiguityStyle',
  'coreValues', 'tradeoffs', 'frustrations', 'rewards',
  'environments', 'teamSizes', 'paces', 'managementStyles',
  'careerStages', 'riskLevels', 'trajectories', 'groupRoles',
];
```

### 3.2 Career Profile Extensions

```typescript
/**
 * v2 extension fields added to CareerProfile.
 * These are additive -- all v1 fields remain.
 */
interface CareerProfileV2Extension {
  /**
   * Per-career weight vector. Each weight is 0-1, representing how
   * important this dimension is for THIS specific career.
   * Weights are normalized at scoring time so they sum to 1.0.
   */
  dimensionWeights: CareerDimensionWeights;

  /**
   * Hard requirements that cannot be compensated by other strengths.
   * If any threshold is not met, the career is flagged as
   * "threshold-blocked" and moved to Stretch Goal category.
   */
  thresholds?: CareerThresholds;

  /**
   * Career family this profile belongs to.
   */
  familyId: CareerFamilyId;

  /**
   * Industry growth rate for "Highest Growth" categorization.
   * Annual growth percentage from BLS/industry data.
   */
  industryGrowthRate?: number;

  /**
   * Skills that are acquirable (for What-If scoring).
   * Each maps a skill name to the projected score delta if acquired.
   */
  acquirableSkills?: AcquirableSkill[];
}

type CareerProfileV2 = CareerProfile & CareerProfileV2Extension;
```

---

## 4. Per-Career Dimensional Weighting

### 4.1 Weight Vector Interface

```typescript
/**
 * Per-career importance weights for each scoring dimension.
 * All values 0-1. Normalized to sum to 1.0 at scoring time.
 *
 * The six high-level categories group the 19 dimensions:
 *   Interest:     interests, problemTypes, archetypes
 *   Personality:  workStyles, decisionStyle, collaboration, ambiguityStyle
 *   Values:       coreValues, tradeoffs, frustrations, rewards
 *   Environment:  environments, teamSizes, paces, managementStyles
 *   Stage:        careerStages, riskLevels, trajectories, groupRoles
 *   Skills:       (handled separately via overlap scoring)
 */
interface CareerDimensionWeights {
  // Interest dimensions
  interests: number;
  problemTypes: number;
  archetypes: number;
  // Personality dimensions
  workStyles: number;
  decisionStyle: number;
  collaboration: number;
  ambiguityStyle: number;
  // Values dimensions
  coreValues: number;
  tradeoffs: number;
  frustrations: number;
  rewards: number;
  // Environment dimensions
  environments: number;
  teamSizes: number;
  paces: number;
  managementStyles: number;
  // Stage dimensions
  careerStages: number;
  riskLevels: number;
  trajectories: number;
  groupRoles: number;
}

/**
 * Convenience type for the six high-level category weights
 * used when defining career profiles at a higher level of abstraction.
 * These get expanded into full CareerDimensionWeights via a
 * distribution function.
 */
interface CareerCategoryWeights {
  interestWeight: number;      // distributed across interests, problemTypes, archetypes
  personalityWeight: number;   // distributed across workStyles, decisionStyle, collaboration, ambiguityStyle
  valuesWeight: number;        // distributed across coreValues, tradeoffs, frustrations, rewards
  aptitudeWeight: number;      // applied to skill overlap scoring
  environmentWeight: number;   // distributed across environments, teamSizes, paces, managementStyles
  stageWeight: number;         // distributed across careerStages, riskLevels, trajectories, groupRoles
}
```

### 4.2 Weight Distribution Function

```typescript
/**
 * Expands 6 category weights into 19 dimension weights.
 * Within each category, weight is distributed equally unless
 * a per-dimension override is provided.
 *
 * @param category  High-level 6-weight vector
 * @param overrides Optional per-dimension overrides (0-1)
 * @returns Normalized 19-dimension weight vector summing to 1.0
 */
function expandCategoryWeights(
  category: CareerCategoryWeights,
  overrides?: Partial<CareerDimensionWeights>,
): CareerDimensionWeights {
  const base: CareerDimensionWeights = {
    // Interest: split evenly across 3 dimensions
    interests:     category.interestWeight / 3,
    problemTypes:  category.interestWeight / 3,
    archetypes:    category.interestWeight / 3,
    // Personality: split evenly across 4 dimensions
    workStyles:    category.personalityWeight / 4,
    decisionStyle: category.personalityWeight / 4,
    collaboration: category.personalityWeight / 4,
    ambiguityStyle:category.personalityWeight / 4,
    // Values: split evenly across 4 dimensions
    coreValues:    category.valuesWeight / 4,
    tradeoffs:     category.valuesWeight / 4,
    frustrations:  category.valuesWeight / 4,
    rewards:       category.valuesWeight / 4,
    // Environment: split evenly across 4 dimensions
    environments:  category.environmentWeight / 4,
    teamSizes:     category.environmentWeight / 4,
    paces:         category.environmentWeight / 4,
    managementStyles: category.environmentWeight / 4,
    // Stage: split evenly across 4 dimensions
    careerStages:  category.stageWeight / 4,
    riskLevels:    category.stageWeight / 4,
    trajectories:  category.stageWeight / 4,
    groupRoles:    category.stageWeight / 4,
  };

  // Apply overrides
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        base[key as keyof CareerDimensionWeights] = value;
      }
    }
  }

  // Normalize to sum to 1.0
  const sum = Object.values(base).reduce((a, b) => a + b, 0);
  if (sum === 0) throw new Error('Weight vector cannot be all zeros');

  for (const key of Object.keys(base) as (keyof CareerDimensionWeights)[]) {
    base[key] /= sum;
  }

  return base;
}
```

### 4.3 Example Career Weight Profiles

```typescript
const CAREER_WEIGHT_EXAMPLES: Record<string, CareerCategoryWeights> = {
  // Software Engineering: high aptitude + interest, moderate personality
  'software-engineer': {
    interestWeight: 0.30,
    personalityWeight: 0.15,
    valuesWeight: 0.15,
    aptitudeWeight: 0.25,
    environmentWeight: 0.05,
    stageWeight: 0.10,
  },

  // Social Worker: high values + personality, low aptitude
  'social-worker': {
    interestWeight: 0.15,
    personalityWeight: 0.30,
    valuesWeight: 0.30,
    aptitudeWeight: 0.05,
    environmentWeight: 0.10,
    stageWeight: 0.10,
  },

  // Data Scientist: high aptitude + interest, moderate values
  'data-scientist': {
    interestWeight: 0.25,
    personalityWeight: 0.10,
    valuesWeight: 0.15,
    aptitudeWeight: 0.30,
    environmentWeight: 0.05,
    stageWeight: 0.15,
  },

  // Product Manager: balanced across most dimensions
  'product-manager': {
    interestWeight: 0.20,
    personalityWeight: 0.25,
    valuesWeight: 0.20,
    aptitudeWeight: 0.10,
    environmentWeight: 0.10,
    stageWeight: 0.15,
  },

  // Surgeon: extreme aptitude + personality, strict thresholds
  'surgeon': {
    interestWeight: 0.20,
    personalityWeight: 0.25,
    valuesWeight: 0.15,
    aptitudeWeight: 0.25,
    environmentWeight: 0.05,
    stageWeight: 0.10,
  },

  // UX Designer: high interest + personality, moderate values
  'ux-designer': {
    interestWeight: 0.30,
    personalityWeight: 0.20,
    valuesWeight: 0.20,
    aptitudeWeight: 0.10,
    environmentWeight: 0.10,
    stageWeight: 0.10,
  },

  // Management Consultant: balanced with high stage + personality
  'management-consultant': {
    interestWeight: 0.15,
    personalityWeight: 0.25,
    valuesWeight: 0.15,
    aptitudeWeight: 0.15,
    environmentWeight: 0.10,
    stageWeight: 0.20,
  },

  // Entrepreneur: high values + stage, moderate interest
  'entrepreneur': {
    interestWeight: 0.15,
    personalityWeight: 0.15,
    valuesWeight: 0.25,
    aptitudeWeight: 0.10,
    environmentWeight: 0.05,
    stageWeight: 0.30,
  },
};
```

---

## 5. Non-Compensatory Thresholds

### 5.1 Interface

```typescript
/**
 * Hard minimum requirements for a career.
 * If ANY threshold is not met, the career is flagged as "threshold-blocked"
 * and moved to the "Stretch Goal" category regardless of raw score.
 *
 * Threshold scores are on a 0-1 scale matching the user's trait vector values.
 */
interface CareerThresholds {
  /**
   * RIASEC interest types that MUST appear in user's top-3 interests.
   * If user does not have any of these, career is blocked.
   */
  requiredInterests?: string[];

  /**
   * Minimum trait values for personality-related dimensions.
   * The user's trait vector value for this dimension must be >= minScore.
   */
  minPersonalityTraits?: Array<{
    dimension: ScoringDimension;
    trait: string;
    minScore: number;  // 0-1
  }>;

  /**
   * Values that MUST appear in user's value hierarchy.
   */
  requiredValues?: string[];

  /**
   * Minimum skill levels (from self-assessment).
   */
  minAptitudes?: Array<{
    skill: string;
    minLevel: 'beginner' | 'intermediate' | 'advanced';
  }>;

  /**
   * Risk tolerance minimum (some careers require accepting risk).
   */
  minRiskTolerance?: 'low' | 'moderate' | 'high';
}
```

### 5.2 Threshold Evaluation

```typescript
interface ThresholdResult {
  passed: boolean;
  /** Which thresholds were not met */
  failures: ThresholdFailure[];
  /** Overall pass ratio (0-1) for partial credit in Stretch Goal ranking */
  passRatio: number;
}

interface ThresholdFailure {
  type: 'interest' | 'personality' | 'value' | 'aptitude' | 'risk';
  requirement: string;
  userValue: string | number;
  requiredValue: string | number;
  /** What-if hint: what would the user need to develop? */
  developmentHint: string;
}

/**
 * Evaluate non-compensatory thresholds for a career against user traits.
 */
function evaluateThresholds(
  user: UserTraitVector,
  userSkills: Record<string, string>,
  userRiskLevel: string,
  thresholds: CareerThresholds,
): ThresholdResult {
  const failures: ThresholdFailure[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Check required interests
  if (thresholds.requiredInterests) {
    totalChecks++;
    const userTopInterests = Object.entries(user.interests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k.toLowerCase());

    const hasRequired = thresholds.requiredInterests.some(
      ri => userTopInterests.includes(ri.toLowerCase())
    );

    if (hasRequired) {
      passedChecks++;
    } else {
      failures.push({
        type: 'interest',
        requirement: `Top-3 interest must include: ${thresholds.requiredInterests.join(' or ')}`,
        userValue: userTopInterests.join(', '),
        requiredValue: thresholds.requiredInterests.join(' or '),
        developmentHint: `Explore ${thresholds.requiredInterests[0]}-oriented activities to build genuine interest`,
      });
    }
  }

  // Check minimum personality traits
  if (thresholds.minPersonalityTraits) {
    for (const req of thresholds.minPersonalityTraits) {
      totalChecks++;
      const userScore = user[req.dimension]?.[req.trait] ?? 0;

      if (userScore >= req.minScore) {
        passedChecks++;
      } else {
        failures.push({
          type: 'personality',
          requirement: `${req.dimension}.${req.trait} >= ${req.minScore}`,
          userValue: userScore,
          requiredValue: req.minScore,
          developmentHint: `Develop ${req.trait} through deliberate practice and self-awareness exercises`,
        });
      }
    }
  }

  // Check required values
  if (thresholds.requiredValues) {
    totalChecks++;
    const userValues = Object.keys(user.coreValues).filter(
      k => user.coreValues[k] > 0.3  // Threshold for "having" a value
    );

    const hasRequired = thresholds.requiredValues.some(
      rv => userValues.includes(rv.toLowerCase())
    );

    if (hasRequired) {
      passedChecks++;
    } else {
      failures.push({
        type: 'value',
        requirement: `Must hold value: ${thresholds.requiredValues.join(' or ')}`,
        userValue: userValues.join(', '),
        requiredValue: thresholds.requiredValues.join(' or '),
        developmentHint: `Reflect on whether ${thresholds.requiredValues[0]} aligns with your long-term goals`,
      });
    }
  }

  // Check minimum aptitudes
  if (thresholds.minAptitudes) {
    const SKILL_RANK: Record<string, number> = {
      none: 0, beginner: 1, intermediate: 2, advanced: 3,
    };

    for (const req of thresholds.minAptitudes) {
      totalChecks++;
      const userLevel = userSkills[req.skill] ?? 'none';
      const userRank = SKILL_RANK[userLevel.toLowerCase()] ?? 0;
      const reqRank = SKILL_RANK[req.minLevel] ?? 0;

      if (userRank >= reqRank) {
        passedChecks++;
      } else {
        failures.push({
          type: 'aptitude',
          requirement: `${req.skill} >= ${req.minLevel}`,
          userValue: userLevel,
          requiredValue: req.minLevel,
          developmentHint: `Build ${req.skill} from ${userLevel} to ${req.minLevel} through structured learning`,
        });
      }
    }
  }

  // Check risk tolerance
  if (thresholds.minRiskTolerance) {
    totalChecks++;
    const RISK_RANK: Record<string, number> = { low: 1, moderate: 2, high: 3 };
    const userRisk = RISK_RANK[userRiskLevel.toLowerCase()] ?? 1;
    const reqRisk = RISK_RANK[thresholds.minRiskTolerance] ?? 1;

    if (userRisk >= reqRisk) {
      passedChecks++;
    } else {
      failures.push({
        type: 'risk',
        requirement: `Risk tolerance >= ${thresholds.minRiskTolerance}`,
        userValue: userRiskLevel,
        requiredValue: thresholds.minRiskTolerance,
        developmentHint: `This career involves ${thresholds.minRiskTolerance} risk -- consider if you can grow into this comfort zone`,
      });
    }
  }

  return {
    passed: failures.length === 0,
    failures,
    passRatio: totalChecks === 0 ? 1.0 : passedChecks / totalChecks,
  };
}
```

### 5.3 Example Threshold Profiles

```typescript
const THRESHOLD_EXAMPLES: Record<string, CareerThresholds> = {
  'surgeon': {
    requiredInterests: ['realistic', 'investigative'],
    minPersonalityTraits: [
      { dimension: 'workStyles', trait: 'organized', minScore: 0.7 },
      { dimension: 'decisionStyle', trait: 'analytical', minScore: 0.6 },
    ],
    minAptitudes: [
      { skill: 'Biology/Chemistry', minLevel: 'intermediate' },
    ],
    minRiskTolerance: 'moderate',
  },

  'entrepreneur': {
    minPersonalityTraits: [
      { dimension: 'ambiguityStyle', trait: 'experiment', minScore: 0.5 },
    ],
    requiredValues: ['autonomy'],
    minRiskTolerance: 'high',
  },

  'air-traffic-controller': {
    requiredInterests: ['realistic', 'conventional'],
    minPersonalityTraits: [
      { dimension: 'workStyles', trait: 'organized', minScore: 0.8 },
      { dimension: 'paces', trait: 'fast', minScore: 0.6 },
    ],
  },

  'data-scientist': {
    requiredInterests: ['investigative'],
    minPersonalityTraits: [
      { dimension: 'decisionStyle', trait: 'analytical', minScore: 0.5 },
    ],
    minAptitudes: [
      { skill: 'Statistics/Math', minLevel: 'intermediate' },
    ],
  },
};
```

---

## 6. Cosine Similarity Scoring

### 6.1 Vector Construction

The key insight: both user answers and career profiles define **sparse vectors** in the same trait space. Instead of counting set overlaps, we compute cosine similarity between these vectors for each of the 19 dimensions.

```typescript
/**
 * Build a numeric vector for a dimension from the user's trait vector.
 *
 * For each possible trait value in the dimension's vocabulary,
 * the user gets a score of:
 *   - 1.0 if it was their primary selection
 *   - 0.7 if it was a secondary selection
 *   - 0.4 if it was a tertiary selection
 *   - 0.0 if not selected
 *
 * This creates a dense numeric vector over the full vocabulary.
 */
function buildUserDimensionVector(
  userTraits: Record<string, number>,
  vocabulary: string[],
): number[] {
  return vocabulary.map(trait => userTraits[trait.toLowerCase()] ?? 0);
}

/**
 * Build a numeric vector for a dimension from a career profile.
 *
 * Career profiles list traits as string arrays (e.g., interests: ['artistic', 'realistic']).
 * We convert to a numeric vector:
 *   - 1.0 if the trait is listed (all listed traits are equally important)
 *   - 0.0 if not listed
 */
function buildCareerDimensionVector(
  profileTraits: string[],
  vocabulary: string[],
): number[] {
  const traitSet = new Set(profileTraits.map(t => t.toLowerCase()));
  return vocabulary.map(trait => traitSet.has(trait.toLowerCase()) ? 1.0 : 0.0);
}
```

### 6.2 Cosine Similarity

```typescript
/**
 * Compute cosine similarity between two numeric vectors.
 * Returns value in [-1, 1], but practically [0, 1] for our use case
 * since all values are non-negative.
 *
 * cos(A, B) = (A . B) / (||A|| * ||B||)
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // Guard: if either vector is zero, similarity is 0
  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}
```

### 6.3 Vocabulary Registry

```typescript
/**
 * The full vocabulary for each scoring dimension.
 * Built from the union of all values seen across all career profiles.
 * This is the "coordinate system" for our vector space.
 */
const DIMENSION_VOCABULARIES: Record<ScoringDimension, string[]> = {
  interests: [
    'artistic', 'conventional', 'enterprising',
    'investigative', 'realistic', 'social',
  ],
  problemTypes: [
    'analytical', 'creative', 'human', 'scientific',
    'strategic', 'technical',
  ],
  archetypes: [
    'builder', 'connector', 'creator', 'guardian',
    'helper', 'mentor', 'optimizer', 'visionary',
  ],
  workStyles: [
    'cautious', 'empathetic', 'methodical', 'open', 'organized',
  ],
  decisionStyle: [
    'analytical', 'feeling', 'intuitive', 'thinking',
  ],
  collaboration: [
    'mixed', 'solo', 'team',
  ],
  ambiguityStyle: [
    'consult', 'experiment', 'structure',
  ],
  coreValues: [
    'autonomy', 'impact', 'mastery', 'prestige', 'purpose', 'stability',
  ],
  tradeoffs: [
    'balance_over_creativity', 'creativity_over_stability',
    'purpose_over_wealth', 'wealth_over_stability',
  ],
  frustrations: [
    'isolation', 'micromanaged', 'monotony',
    'no_impact', 'tech_debt', 'unclear_requirements',
  ],
  rewards: [
    'impact', 'learning', 'problem_solving', 'recognition', 'wealth',
  ],
  environments: [
    'hybrid', 'office', 'onsite', 'remote',
  ],
  teamSizes: [
    'large', 'medium', 'small', 'solo',
  ],
  paces: [
    'burst', 'fast', 'steady', 'variable',
  ],
  managementStyles: [
    'collaborative', 'directive', 'handsoff',
    'mentorship', 'structured', 'targets',
  ],
  careerStages: [
    'building', 'established', 'exploring', 'pivoting',
  ],
  riskLevels: [
    'high', 'low', 'moderate',
  ],
  trajectories: [
    'entrepreneur', 'executive', 'founder', 'generalist',
    'manager', 'specialist',
  ],
  groupRoles: [
    'analyst', 'doer', 'harmonizer', 'ideator', 'leader',
  ],
};
```

### 6.4 Full Dimensional Score

```typescript
/**
 * Score a single career profile against a user's trait vector
 * using cosine similarity weighted by the career's dimension weights.
 *
 * Returns a raw score in [0, 1] before synergy/anti-pattern adjustments.
 */
function scoreDimensional(
  user: UserTraitVector,
  profile: CareerProfileV2,
): number {
  const weights = profile.dimensionWeights;
  let weightedSum = 0;

  for (const dim of ALL_DIMENSIONS) {
    const vocab = DIMENSION_VOCABULARIES[dim];
    const userVec = buildUserDimensionVector(user[dim], vocab);
    const careerVec = buildCareerDimensionVector(
      (profile[dim] as string[]) ?? [],
      vocab,
    );

    const similarity = cosineSimilarity(userVec, careerVec);
    weightedSum += similarity * weights[dim];
  }

  // weights already sum to 1.0, so weightedSum is in [0, 1]
  return weightedSum;
}
```

---

## 7. Expanded Synergy Patterns

### 7.1 Updated Interface

```typescript
interface SynergyPatternV2 {
  id: string;
  name: string;
  /** Required user traits: dimension -> required trait values (any match) */
  requires: Record<string, string[]>;
  /** Profile conditions that activate this synergy */
  boostWhen: Array<{ field: keyof CareerProfileV2; values: string[] }>;
  /** Max bonus (added to raw score as fraction, e.g., 0.05 = 5% boost) */
  bonus: number;
  /** Minimum fraction of requirements that must be met for partial credit */
  minMatchRatio: number;
}
```

### 7.2 All 27 Synergy Patterns

```typescript
const SYNERGY_PATTERNS_V2: SynergyPatternV2[] = [
  // ── Technical Careers ──────────────────────────────────────────────

  // 1. Engineering Core (carried from v1)
  {
    id: 'engineering-core',
    name: 'Engineering Core',
    requires: { int3: ['builder'], int2: ['technical'], ws3: ['solo', 'mixed'] },
    boostWhen: [
      { field: 'domains', values: ['Technology'] },
      { field: 'archetypes', values: ['builder', 'optimizer'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 2. Technical Leadership
  {
    id: 'tech-leadership',
    name: 'Technical Leadership',
    requires: {
      int2: ['analytical', 'technical'],
      car3: ['manager', 'executive'],
      ws1: ['organized'],
    },
    boostWhen: [
      { field: 'trajectories', values: ['manager', 'executive'] },
      { field: 'groupRoles', values: ['leader'] },
      { field: 'domains', values: ['Technology'] },
    ],
    bonus: 0.07,
    minMatchRatio: 0.66,
  },

  // 3. Data Scientist
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    requires: {
      int1: ['investigative'],
      int2: ['analytical', 'scientific'],
      val1: ['mastery'],
    },
    boostWhen: [
      { field: 'domains', values: ['Data & Analytics', 'Research', 'Science'] },
      { field: 'problemTypes', values: ['analytical', 'scientific'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 4. DevOps/Infrastructure
  {
    id: 'devops-infra',
    name: 'DevOps & Infrastructure',
    requires: {
      int3: ['builder', 'optimizer'],
      ws1: ['organized', 'methodical'],
      ws4: ['structure'],
    },
    boostWhen: [
      { field: 'domains', values: ['Technology', 'Cybersecurity'] },
      { field: 'paces', values: ['steady'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 5. Security Specialist
  {
    id: 'security-specialist',
    name: 'Security Specialist',
    requires: {
      int1: ['investigative'],
      int3: ['guardian', 'optimizer'],
      ws1: ['cautious', 'organized'],
    },
    boostWhen: [
      { field: 'domains', values: ['Cybersecurity', 'Technology'] },
      { field: 'archetypes', values: ['guardian'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 6. AI/ML Engineer
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    requires: {
      int1: ['investigative'],
      int2: ['scientific', 'analytical'],
      ws4: ['experiment'],
    },
    boostWhen: [
      { field: 'domains', values: ['Data & Analytics', 'Technology', 'Research'] },
      { field: 'problemTypes', values: ['scientific'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // ── Creative Careers ───────────────────────────────────────────────

  // 7. Creative Designer (carried from v1)
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    requires: { int2: ['creative'], int1: ['artistic'], val1: ['autonomy'] },
    boostWhen: [
      { field: 'domains', values: ['Design & UX', 'Media & Entertainment', 'Marketing'] },
      { field: 'archetypes', values: ['creator', 'visionary'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 8. Design Thinking
  {
    id: 'design-thinking',
    name: 'Design Thinking',
    requires: {
      int1: ['artistic', 'social'],
      ws1: ['open', 'empathetic'],
      int2: ['creative', 'human'],
    },
    boostWhen: [
      { field: 'domains', values: ['Design & UX', 'Education & Training'] },
      { field: 'archetypes', values: ['creator', 'helper'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 9. Content Creator
  {
    id: 'content-creator',
    name: 'Content Creator',
    requires: {
      int1: ['artistic'],
      int3: ['creator'],
      val1: ['autonomy', 'purpose'],
    },
    boostWhen: [
      { field: 'domains', values: ['Media & Entertainment', 'Marketing'] },
      { field: 'trajectories', values: ['entrepreneur', 'specialist'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // ── Business & Management ──────────────────────────────────────────

  // 10. Management Track (carried from v1)
  {
    id: 'management-track',
    name: 'Management Track',
    requires: { int2: ['strategic'], car4: ['leader'], car3: ['manager', 'executive'] },
    boostWhen: [
      { field: 'trajectories', values: ['manager', 'executive'] },
      { field: 'groupRoles', values: ['leader'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 11. Creative Entrepreneur
  {
    id: 'creative-entrepreneur',
    name: 'Creative Entrepreneur',
    requires: {
      int1: ['artistic', 'enterprising'],
      car2: ['high'],
      ws1: ['open'],
      val1: ['autonomy'],
    },
    boostWhen: [
      { field: 'trajectories', values: ['entrepreneur', 'founder'] },
      { field: 'riskLevels', values: ['high'] },
    ],
    bonus: 0.07,
    minMatchRatio: 0.5,
  },

  // 12. Strategic Consultant
  {
    id: 'strategic-consultant',
    name: 'Strategic Consultant',
    requires: {
      int2: ['strategic', 'analytical'],
      car4: ['leader', 'analyst'],
      ws2: ['thinking'],
    },
    boostWhen: [
      { field: 'domains', values: ['Consulting', 'Finance', 'Strategy'] },
      { field: 'problemTypes', values: ['strategic'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 13. Entrepreneur Signal (carried from v1, enhanced)
  {
    id: 'entrepreneur-signal',
    name: 'Entrepreneur Signal',
    requires: {
      car2: ['high'],
      val1: ['autonomy'],
      car4: ['ideator'],
      ws4: ['experiment'],
    },
    boostWhen: [
      { field: 'trajectories', values: ['entrepreneur', 'founder'] },
      { field: 'riskLevels', values: ['high'] },
    ],
    bonus: 0.07,
    minMatchRatio: 0.5,
  },

  // 14. Financial Analyst
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    requires: {
      int1: ['conventional', 'investigative'],
      int2: ['analytical'],
      ws1: ['organized', 'methodical'],
    },
    boostWhen: [
      { field: 'domains', values: ['Finance', 'Consulting'] },
      { field: 'problemTypes', values: ['analytical'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 15. Sales Leader
  {
    id: 'sales-leader',
    name: 'Sales Leader',
    requires: {
      int1: ['enterprising', 'social'],
      car4: ['leader'],
      val4: ['wealth', 'recognition'],
    },
    boostWhen: [
      { field: 'domains', values: ['Sales', 'Business Development'] },
      { field: 'rewards', values: ['wealth', 'recognition'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // ── Social & Healthcare ────────────────────────────────────────────

  // 16. Social Educator (carried from v1)
  {
    id: 'social-educator',
    name: 'Social Educator',
    requires: { int3: ['helper', 'mentor'], int1: ['social'], val1: ['purpose', 'impact'] },
    boostWhen: [
      { field: 'domains', values: ['Education & Training', 'Social Impact', 'Healthcare'] },
      { field: 'archetypes', values: ['helper', 'mentor'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 17. Healthcare Leader
  {
    id: 'healthcare-leader',
    name: 'Healthcare Leader',
    requires: {
      int1: ['social'],
      ws1: ['organized', 'empathetic'],
      val1: ['purpose', 'impact'],
    },
    boostWhen: [
      { field: 'domains', values: ['Healthcare', 'Social Impact'] },
      { field: 'trajectories', values: ['manager', 'specialist'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 18. Counselor/Therapist
  {
    id: 'counselor-therapist',
    name: 'Counselor/Therapist',
    requires: {
      int1: ['social'],
      ws1: ['empathetic'],
      int3: ['helper'],
      val1: ['purpose'],
    },
    boostWhen: [
      { field: 'domains', values: ['Healthcare', 'Social Impact'] },
      { field: 'archetypes', values: ['helper'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.5,
  },

  // 19. Community Builder
  {
    id: 'community-builder',
    name: 'Community Builder',
    requires: {
      int1: ['social', 'enterprising'],
      int3: ['connector'],
      ws3: ['team'],
    },
    boostWhen: [
      { field: 'collaboration', values: ['team'] },
      { field: 'teamSizes', values: ['large', 'medium'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // ── Research & Science ─────────────────────────────────────────────

  // 20. Research Scientist (carried from v1)
  {
    id: 'research-scientist',
    name: 'Research Scientist',
    requires: { int1: ['investigative'], int2: ['scientific'], val1: ['mastery'] },
    boostWhen: [
      { field: 'domains', values: ['Research', 'Science', 'Healthcare', 'Data & Analytics'] },
      { field: 'problemTypes', values: ['scientific', 'analytical'] },
    ],
    bonus: 0.06,
    minMatchRatio: 0.66,
  },

  // 21. Academic/Professor
  {
    id: 'academic-professor',
    name: 'Academic/Professor',
    requires: {
      int1: ['investigative', 'social'],
      int3: ['mentor'],
      val1: ['mastery', 'purpose'],
    },
    boostWhen: [
      { field: 'domains', values: ['Education & Training', 'Research'] },
      { field: 'archetypes', values: ['mentor'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // ── Cross-Functional ───────────────────────────────────────────────

  // 22. Deep Specialist (carried from v1)
  {
    id: 'deep-specialist',
    name: 'Deep Specialist',
    requires: { val1: ['mastery'], car3: ['specialist'], ws2: ['thinking', 'analytical'] },
    boostWhen: [
      { field: 'trajectories', values: ['specialist'] },
      { field: 'coreValues', values: ['mastery'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 23. Product Thinker
  {
    id: 'product-thinker',
    name: 'Product Thinker',
    requires: {
      int2: ['strategic', 'human'],
      int3: ['visionary'],
      ws3: ['team', 'mixed'],
    },
    boostWhen: [
      { field: 'domains', values: ['Technology', 'Design & UX'] },
      { field: 'archetypes', values: ['visionary'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 24. Operations Excellence
  {
    id: 'operations-excellence',
    name: 'Operations Excellence',
    requires: {
      ws1: ['organized', 'methodical'],
      int3: ['optimizer'],
      ws4: ['structure'],
    },
    boostWhen: [
      { field: 'domains', values: ['Operations', 'Supply Chain', 'Logistics'] },
      { field: 'archetypes', values: ['optimizer'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 25. Legal Mind
  {
    id: 'legal-mind',
    name: 'Legal Mind',
    requires: {
      int1: ['investigative', 'enterprising'],
      ws2: ['analytical', 'thinking'],
      ws1: ['organized'],
    },
    boostWhen: [
      { field: 'domains', values: ['Legal', 'Compliance', 'Government'] },
      { field: 'decisionStyle', values: ['analytical'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },

  // 26. Communicator-Collaborator (carried from v1, enhanced)
  {
    id: 'communicator-collab',
    name: 'Communicator-Collaborator',
    requires: {
      int1: ['social'],
      int3: ['helper', 'connector'],
      ws3: ['team'],
      ws1: ['empathetic'],
    },
    boostWhen: [
      { field: 'collaboration', values: ['team'] },
      { field: 'teamSizes', values: ['large', 'medium'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.5,
  },

  // 27. Sustainability Champion
  {
    id: 'sustainability-champion',
    name: 'Sustainability Champion',
    requires: {
      val1: ['purpose', 'impact'],
      val2: ['purpose_over_wealth'],
      int1: ['social', 'investigative'],
    },
    boostWhen: [
      { field: 'domains', values: ['Social Impact', 'Environment', 'Government'] },
      { field: 'coreValues', values: ['purpose', 'impact'] },
    ],
    bonus: 0.05,
    minMatchRatio: 0.66,
  },
];
```

---

## 8. Expanded Anti-Patterns

### 8.1 Updated Interface

```typescript
interface AntiPatternV2 {
  id: string;
  name: string;
  /** User answer conditions that trigger this anti-pattern */
  userCondition: Record<string, string[]>;
  /** Profile conditions that activate the penalty */
  profileCondition: Array<{ field: keyof CareerProfileV2; values: string[] }>;
  /** Penalty as fraction of total score (e.g., 0.05 = 5% reduction) */
  penalty: number;
  /** Explanation shown to user when this pattern fires */
  explanation: string;
}
```

### 8.2 All 17 Anti-Patterns

```typescript
const ANTI_PATTERNS_V2: AntiPatternV2[] = [
  // ── Risk Mismatches ────────────────────────────────────────────────

  // 1. Risk-averse person + high-risk career
  {
    id: 'risk-averse-entrepreneur',
    name: 'Risk-Averse vs. Entrepreneurial Path',
    userCondition: { car2: ['low'] },
    profileCondition: [{ field: 'trajectories', values: ['entrepreneur', 'founder'] }],
    penalty: 0.08,
    explanation: 'This career involves significant financial and professional risk, which conflicts with your preference for stability.',
  },

  // 2. High-risk person + extremely stable career
  {
    id: 'risk-seeker-bureaucracy',
    name: 'Risk Seeker vs. Bureaucratic Stability',
    userCondition: { car2: ['high'], ws4: ['experiment'] },
    profileCondition: [
      { field: 'riskLevels', values: ['low'] },
      { field: 'managementStyles', values: ['structured', 'directive'] },
    ],
    penalty: 0.05,
    explanation: 'This career prioritizes stability and structure, which may feel constraining given your appetite for risk.',
  },

  // ── Social/Isolation Mismatches ────────────────────────────────────

  // 3. Isolation-averse + solo work
  {
    id: 'isolation-hates-solo',
    name: 'Social Person vs. Solo Work',
    userCondition: { val3: ['isolation'] },
    profileCondition: [
      { field: 'teamSizes', values: ['solo'] },
      { field: 'collaboration', values: ['solo'] },
    ],
    penalty: 0.06,
    explanation: 'This career involves significant solo work, conflicting with your need for social connection.',
  },

  // 4. Solo worker + large team requirement
  {
    id: 'solo-hates-large-team',
    name: 'Solo Worker vs. Large Team',
    userCondition: { ws3: ['solo'] },
    profileCondition: [{ field: 'teamSizes', values: ['large'] }],
    penalty: 0.05,
    explanation: 'This career requires extensive teamwork in large groups, which conflicts with your solo work preference.',
  },

  // 5. Team player + isolation-heavy work
  {
    id: 'team-player-hates-isolation',
    name: 'Team Player vs. Isolated Work',
    userCondition: { ws3: ['team'] },
    profileCondition: [{ field: 'collaboration', values: ['solo'] }],
    penalty: 0.05,
    explanation: 'This career is primarily solo work, which may not satisfy your collaborative nature.',
  },

  // ── Management Style Mismatches ────────────────────────────────────

  // 6. Micromanaged frustration + directive management
  {
    id: 'micromanaged-hates-targets',
    name: 'Autonomy Seeker vs. Directive Management',
    userCondition: { val3: ['micromanaged'] },
    profileCondition: [{ field: 'managementStyles', values: ['targets', 'directive', 'structured'] }],
    penalty: 0.06,
    explanation: 'This career typically involves directive management, which conflicts with your frustration with micromanagement.',
  },

  // 7. Autonomy value + directive management
  {
    id: 'autonomy-hates-directive',
    name: 'Autonomy Value vs. Directive Culture',
    userCondition: { val1: ['autonomy'] },
    profileCondition: [{ field: 'managementStyles', values: ['directive', 'targets'] }],
    penalty: 0.05,
    explanation: 'This career operates under structured oversight, which may feel restrictive for someone who values autonomy.',
  },

  // 8. Structure seeker + hands-off management
  {
    id: 'structure-seeker-handsoff',
    name: 'Structure Seeker vs. Hands-Off Management',
    userCondition: { ws4: ['structure'], ws1: ['organized'] },
    profileCondition: [{ field: 'managementStyles', values: ['handsoff'] }],
    penalty: 0.04,
    explanation: 'This career typically has minimal management structure, which may feel unmoored for someone who prefers clear direction.',
  },

  // ── Pace Mismatches ────────────────────────────────────────────────

  // 9. Steady pace + fast-paced career
  {
    id: 'steady-hates-fast',
    name: 'Steady Pace vs. Fast Environment',
    userCondition: { env3: ['steady'] },
    profileCondition: [{ field: 'paces', values: ['fast', 'burst'] }],
    penalty: 0.05,
    explanation: 'This career moves at a fast or burst pace, which may cause stress for someone who prefers a steady rhythm.',
  },

  // 10. Fast pace + slow/steady career
  {
    id: 'fast-hates-steady',
    name: 'Fast Mover vs. Slow Career',
    userCondition: { env3: ['fast'] },
    profileCondition: [{ field: 'paces', values: ['steady'] }],
    penalty: 0.04,
    explanation: 'This career moves at a steady, deliberate pace, which may feel slow for someone who thrives on speed.',
  },

  // ── Value Mismatches ───────────────────────────────────────────────

  // 11. Monotony frustration + routine work
  {
    id: 'monotony-hates-routine',
    name: 'Variety Seeker vs. Routine Work',
    userCondition: { val3: ['monotony'] },
    profileCondition: [
      { field: 'paces', values: ['steady'] },
      { field: 'ambiguityStyle', values: ['structure'] },
    ],
    penalty: 0.04,
    explanation: 'This career involves structured, repeatable processes, which may feel monotonous.',
  },

  // 12. Purpose-driven person + wealth-focused career
  {
    id: 'purpose-vs-wealth',
    name: 'Purpose-Driven vs. Wealth-Focused',
    userCondition: { val2: ['purpose_over_wealth'], val1: ['purpose'] },
    profileCondition: [{ field: 'rewards', values: ['wealth'] }],
    penalty: 0.04,
    explanation: 'This career is primarily motivated by financial reward, which may not align with your purpose-driven values.',
  },

  // 13. Wealth-driven person + low-compensation career
  {
    id: 'wealth-vs-purpose',
    name: 'Wealth-Driven vs. Mission-Focused',
    userCondition: { val4: ['wealth'], val2: ['wealth_over_stability'] },
    profileCondition: [
      { field: 'coreValues', values: ['purpose'] },
      { field: 'rewards', values: ['impact'] },
    ],
    penalty: 0.04,
    explanation: 'This career prioritizes impact over compensation, which may not meet your financial goals.',
  },

  // ── Experience Mismatches ──────────────────────────────────────────

  // 14. Student targeting executive-only roles
  {
    id: 'student-executive',
    name: 'Student vs. Executive Track',
    userCondition: { car1: ['exploring'] },
    profileCondition: [{ field: 'experienceLevels', values: ['expert'] }],
    penalty: 0.06,
    explanation: 'This career requires significant experience. It is positioned as a stretch goal with a clear development path.',
  },

  // 15. Feeling decision-maker + pure analytical role
  {
    id: 'feeling-vs-analytical',
    name: 'Feeling Decision Maker vs. Pure Analytics',
    userCondition: { ws2: ['feeling'] },
    profileCondition: [
      { field: 'decisionStyle', values: ['analytical'] },
      { field: 'problemTypes', values: ['analytical'] },
    ],
    penalty: 0.04,
    explanation: 'This career relies heavily on analytical decision-making, which differs from your intuitive/feeling approach.',
  },

  // ── Environment Mismatches ─────────────────────────────────────────

  // 16. Remote-only person + onsite-only career
  {
    id: 'remote-vs-onsite',
    name: 'Remote Worker vs. Onsite Requirement',
    userCondition: { env1: ['remote'] },
    profileCondition: [{ field: 'environments', values: ['onsite'] }],
    penalty: 0.04,
    explanation: 'This career typically requires onsite presence, conflicting with your remote work preference.',
  },

  // 17. No-impact frustration + admin/process-heavy career
  {
    id: 'impact-vs-process',
    name: 'Impact Seeker vs. Process-Heavy',
    userCondition: { val3: ['no_impact'] },
    profileCondition: [
      { field: 'archetypes', values: ['optimizer'] },
      { field: 'ambiguityStyle', values: ['structure'] },
    ],
    penalty: 0.03,
    explanation: 'This career is process-optimization focused, which may feel lacking in visible impact.',
  },
];
```

---

## 9. Confidence Scoring

### 9.1 Interface

```typescript
interface MatchConfidence {
  /** Match percentage (0-100) after normalization */
  score: number;
  /** Confidence tier based on data quality */
  confidence: 'high' | 'medium' | 'low';
  /** How internally consistent the user's answers are (0-1) */
  consistencyScore: number;
  /** How many of the 19 dimensions had sufficient data to score */
  dimensionsCovered: number;
  /** Total dimensions (always 19) */
  totalDimensions: number;
  /** Specific dimensions that lacked data */
  missingDimensions: ScoringDimension[];
}
```

### 9.2 Consistency Calculation

```typescript
/**
 * Measure internal consistency of user answers.
 *
 * Consistency is measured by checking for contradictions across
 * dimensions that should be correlated. For example:
 *   - Solo collaboration preference + large team environment = inconsistent
 *   - Risk-averse + entrepreneur trajectory = inconsistent
 *   - Purpose value + wealth reward as #1 = inconsistent
 *
 * Returns 0-1 where 1.0 = perfectly consistent.
 */
interface ConsistencyCheck {
  dimensionA: ScoringDimension;
  traitA: string;
  dimensionB: ScoringDimension;
  traitB: string;
  /** 'aligned' = both should be present, 'conflicting' = one excludes other */
  relationship: 'aligned' | 'conflicting';
}

const CONSISTENCY_CHECKS: ConsistencyCheck[] = [
  // Collaboration + Team Size alignment
  { dimensionA: 'collaboration', traitA: 'solo', dimensionB: 'teamSizes', traitB: 'large', relationship: 'conflicting' },
  { dimensionA: 'collaboration', traitA: 'team', dimensionB: 'teamSizes', traitB: 'solo', relationship: 'conflicting' },
  // Risk + Trajectory alignment
  { dimensionA: 'riskLevels', traitA: 'low', dimensionB: 'trajectories', traitB: 'entrepreneur', relationship: 'conflicting' },
  { dimensionA: 'riskLevels', traitA: 'high', dimensionB: 'ambiguityStyle', traitB: 'structure', relationship: 'conflicting' },
  // Values + Rewards alignment
  { dimensionA: 'coreValues', traitA: 'purpose', dimensionB: 'rewards', traitB: 'wealth', relationship: 'conflicting' },
  { dimensionA: 'coreValues', traitA: 'autonomy', dimensionB: 'managementStyles', traitB: 'directive', relationship: 'conflicting' },
  // Work style coherence
  { dimensionA: 'workStyles', traitA: 'organized', dimensionB: 'ambiguityStyle', traitB: 'structure', relationship: 'aligned' },
  { dimensionA: 'workStyles', traitA: 'open', dimensionB: 'ambiguityStyle', traitB: 'experiment', relationship: 'aligned' },
  // Pace + frustration coherence
  { dimensionA: 'paces', traitA: 'steady', dimensionB: 'frustrations', traitB: 'monotony', relationship: 'conflicting' },
];

function calculateConsistency(user: UserTraitVector): number {
  let checks = 0;
  let consistent = 0;

  for (const check of CONSISTENCY_CHECKS) {
    const hasA = (user[check.dimensionA]?.[check.traitA] ?? 0) > 0.3;
    const hasB = (user[check.dimensionB]?.[check.traitB] ?? 0) > 0.3;

    if (!hasA && !hasB) continue; // No data for this check
    checks++;

    if (check.relationship === 'conflicting') {
      // Consistent if NOT both present
      if (!(hasA && hasB)) consistent++;
    } else {
      // Consistent if both present or both absent
      if (hasA === hasB) consistent++;
    }
  }

  return checks === 0 ? 1.0 : consistent / checks;
}
```

### 9.3 Confidence Tier Assignment

```typescript
function calculateConfidence(
  user: UserTraitVector,
  answeredQuestions: number,
  totalQuestions: number,
): MatchConfidence {
  // Count dimensions with sufficient data
  const coveredDimensions: ScoringDimension[] = [];
  const missingDimensions: ScoringDimension[] = [];

  for (const dim of ALL_DIMENSIONS) {
    const traitValues = Object.values(user[dim]);
    const hasData = traitValues.some(v => v > 0);
    if (hasData) {
      coveredDimensions.push(dim);
    } else {
      missingDimensions.push(dim);
    }
  }

  const dimensionCoverage = coveredDimensions.length / ALL_DIMENSIONS.length;
  const questionCoverage = answeredQuestions / totalQuestions;
  const consistencyScore = calculateConsistency(user);

  // Confidence tier based on composite signal
  const compositeConfidence = (
    dimensionCoverage * 0.4 +
    questionCoverage * 0.3 +
    consistencyScore * 0.3
  );

  let confidence: 'high' | 'medium' | 'low';
  if (compositeConfidence >= 0.75 && consistencyScore >= 0.6) {
    confidence = 'high';
  } else if (compositeConfidence >= 0.5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    score: 0, // Filled in later by normalization
    confidence,
    consistencyScore,
    dimensionsCovered: coveredDimensions.length,
    totalDimensions: ALL_DIMENSIONS.length,
    missingDimensions,
  };
}
```

---

## 10. Percentile Normalization

### 10.1 Design Rationale

v1 uses an arbitrary linear curve:
```
rawPct < 30 ? rawPct * 0.8 : 20 + (rawPct - 30) * (78/70)
```

This produces compressed scores with poor discrimination. v2 uses percentile-based ranking against all scored careers.

### 10.2 Implementation

```typescript
interface ScoredCareer {
  profile: CareerProfileV2;
  rawScore: number;
  synergyBonus: number;
  antiPatternPenalty: number;
  domainAffinity: number;
  experienceFit: number;
  coherenceMultiplier: number;
  thresholdResult: ThresholdResult;
  /** Composite raw score before normalization */
  compositeRaw: number;
}

/**
 * Normalize raw scores to percentiles across all career profiles.
 *
 * Algorithm:
 * 1. Compute raw composite score for all ~90 profiles.
 * 2. Rank by composite score descending.
 * 3. Convert rank to percentile: percentile = (1 - rank / totalProfiles) * 100
 * 4. Apply floor (5) and ceiling (99) for display purposes.
 * 5. Top match always gets at least 85.
 * 6. Spacing: ensure minimum 2-point gap between adjacent matches for clarity.
 *
 * This produces scores that are RELATIVE to the user's profile,
 * not absolute quality measures.
 */
function normalizeToPercentiles(scored: ScoredCareer[]): Map<string, number> {
  // Sort by composite raw score descending
  const sorted = [...scored].sort((a, b) => b.compositeRaw - a.compositeRaw);
  const total = sorted.length;
  const result = new Map<string, number>();

  for (let i = 0; i < total; i++) {
    const career = sorted[i];
    // Percentile: how many profiles this one beats
    const rawPercentile = ((total - 1 - i) / (total - 1)) * 100;

    // Apply floor and ceiling
    let percentile = Math.max(5, Math.min(99, Math.round(rawPercentile)));

    // Top match floor
    if (i === 0) {
      percentile = Math.max(85, percentile);
    }

    result.set(career.profile.id, percentile);
  }

  // Enforce minimum 2-point gap in top 10
  const topTen = sorted.slice(0, 10);
  for (let i = 1; i < topTen.length; i++) {
    const current = result.get(topTen[i].profile.id)!;
    const previous = result.get(topTen[i - 1].profile.id)!;
    if (previous - current < 2) {
      result.set(topTen[i].profile.id, previous - 2);
    }
  }

  return result;
}
```

---

## 11. What-If Score Calculation

### 11.1 Interface

```typescript
interface WhatIfScenario {
  /** Skill or trait the user could develop */
  skill: string;
  /** Current match score (percentile) */
  currentScore: number;
  /** Projected score if skill is acquired */
  projectedScore: number;
  /** Score improvement */
  delta: number;
  /** Estimated effort to acquire this skill */
  effort: 'low' | 'medium' | 'high';
  /** Estimated time investment */
  timeEstimate: string;
  /** Why this matters for the career */
  rationale: string;
}

interface AcquirableSkill {
  skill: string;
  /** Which dimension(s) this skill affects */
  affectedDimensions: ScoringDimension[];
  /** Trait values that would be boosted */
  boostedTraits: Record<ScoringDimension, Record<string, number>>;
  effort: 'low' | 'medium' | 'high';
  timeEstimate: string;
}
```

### 11.2 Computation

```typescript
/**
 * For each top career match, compute What-If scenarios by simulating
 * the addition of each acquirable skill to the user's trait vector.
 *
 * Performance note: This is O(careers * acquirableSkills). For top-10
 * careers with avg 5 acquirable skills each, this is 50 re-scores.
 * Each re-score is O(dimensions * vocabularySize) ~ O(19 * 10) = O(190).
 * Total: ~9,500 ops -- negligible.
 */
function computeWhatIf(
  user: UserTraitVector,
  career: CareerProfileV2,
  currentScore: number,
): WhatIfScenario[] {
  if (!career.acquirableSkills) return [];

  const scenarios: WhatIfScenario[] = [];

  for (const skill of career.acquirableSkills) {
    // Clone user vector and apply skill boost
    const boostedUser = deepCloneTraitVector(user);

    for (const [dim, traits] of Object.entries(skill.boostedTraits)) {
      const dimension = dim as ScoringDimension;
      for (const [trait, boost] of Object.entries(traits)) {
        boostedUser[dimension][trait] =
          Math.min(1.0, (boostedUser[dimension][trait] ?? 0) + boost);
      }
    }

    // Re-score with boosted vector
    const rawBoosted = scoreDimensional(boostedUser, career);
    // Apply same synergy/anti-pattern scoring
    const boostedComposite = rawBoosted; // simplified for spec

    // Delta in raw score, projected to percentile shift
    const rawDelta = boostedComposite - (currentScore / 100);
    const projectedScore = Math.min(99, currentScore + Math.round(rawDelta * 100));

    if (projectedScore > currentScore) {
      scenarios.push({
        skill: skill.skill,
        currentScore,
        projectedScore,
        delta: projectedScore - currentScore,
        effort: skill.effort,
        timeEstimate: skill.timeEstimate,
        rationale: `Developing ${skill.skill} would strengthen your fit in ${skill.affectedDimensions.join(', ')}`,
      });
    }
  }

  // Sort by delta descending (highest impact first)
  return scenarios.sort((a, b) => b.delta - a.delta);
}
```

---

## 12. Career Family Clustering

### 12.1 Family Definitions

```typescript
type CareerFamilyId =
  | 'software-engineering'
  | 'data-analytics'
  | 'design-creative'
  | 'product-management'
  | 'business-strategy'
  | 'finance-accounting'
  | 'sales-marketing'
  | 'healthcare-clinical'
  | 'healthcare-admin'
  | 'education-training'
  | 'social-impact'
  | 'legal-compliance'
  | 'science-research'
  | 'operations-logistics'
  | 'hr-people'
  | 'media-communications'
  | 'cybersecurity'
  | 'trades-skilled'
  | 'government-public'
  | 'entrepreneurship';

interface CareerFamily {
  id: CareerFamilyId;
  name: string;
  description: string;
  /** RIASEC codes most associated with this family */
  primaryInterests: string[];
  /** Industry growth bracket */
  growthOutlook: 'declining' | 'stable' | 'growing' | 'booming';
  /** Average salary range for context */
  salaryRange: { low: number; mid: number; high: number };
}

const CAREER_FAMILIES: CareerFamily[] = [
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    description: 'Building and maintaining software systems',
    primaryInterests: ['investigative', 'realistic'],
    growthOutlook: 'booming',
    salaryRange: { low: 70000, mid: 120000, high: 200000 },
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    description: 'Extracting insights from data to drive decisions',
    primaryInterests: ['investigative', 'conventional'],
    growthOutlook: 'booming',
    salaryRange: { low: 65000, mid: 110000, high: 180000 },
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    description: 'Visual, interaction, and experience design',
    primaryInterests: ['artistic', 'social'],
    growthOutlook: 'growing',
    salaryRange: { low: 50000, mid: 90000, high: 150000 },
  },
  {
    id: 'product-management',
    name: 'Product Management',
    description: 'Defining and delivering products that solve user problems',
    primaryInterests: ['enterprising', 'social'],
    growthOutlook: 'growing',
    salaryRange: { low: 80000, mid: 130000, high: 200000 },
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy & Consulting',
    description: 'Strategic advisory and business transformation',
    primaryInterests: ['enterprising', 'investigative'],
    growthOutlook: 'stable',
    salaryRange: { low: 70000, mid: 120000, high: 250000 },
  },
  {
    id: 'finance-accounting',
    name: 'Finance & Accounting',
    description: 'Financial analysis, planning, and reporting',
    primaryInterests: ['conventional', 'investigative'],
    growthOutlook: 'stable',
    salaryRange: { low: 55000, mid: 95000, high: 200000 },
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing',
    description: 'Revenue generation and brand building',
    primaryInterests: ['enterprising', 'artistic'],
    growthOutlook: 'growing',
    salaryRange: { low: 45000, mid: 85000, high: 180000 },
  },
  {
    id: 'healthcare-clinical',
    name: 'Healthcare (Clinical)',
    description: 'Direct patient care and clinical practice',
    primaryInterests: ['social', 'investigative'],
    growthOutlook: 'booming',
    salaryRange: { low: 50000, mid: 100000, high: 350000 },
  },
  {
    id: 'healthcare-admin',
    name: 'Healthcare Administration',
    description: 'Managing healthcare organizations and systems',
    primaryInterests: ['enterprising', 'social'],
    growthOutlook: 'growing',
    salaryRange: { low: 60000, mid: 100000, high: 180000 },
  },
  {
    id: 'education-training',
    name: 'Education & Training',
    description: 'Teaching, curriculum design, and learning facilitation',
    primaryInterests: ['social', 'artistic'],
    growthOutlook: 'stable',
    salaryRange: { low: 40000, mid: 65000, high: 120000 },
  },
  {
    id: 'social-impact',
    name: 'Social Impact & Nonprofit',
    description: 'Driving positive social change',
    primaryInterests: ['social', 'enterprising'],
    growthOutlook: 'growing',
    salaryRange: { low: 40000, mid: 65000, high: 130000 },
  },
  {
    id: 'legal-compliance',
    name: 'Legal & Compliance',
    description: 'Legal practice, policy, and regulatory compliance',
    primaryInterests: ['investigative', 'conventional'],
    growthOutlook: 'stable',
    salaryRange: { low: 55000, mid: 105000, high: 250000 },
  },
  {
    id: 'science-research',
    name: 'Science & Research',
    description: 'Scientific inquiry, R&D, and academic research',
    primaryInterests: ['investigative', 'realistic'],
    growthOutlook: 'growing',
    salaryRange: { low: 50000, mid: 85000, high: 150000 },
  },
  {
    id: 'operations-logistics',
    name: 'Operations & Logistics',
    description: 'Supply chain management and operational efficiency',
    primaryInterests: ['conventional', 'realistic'],
    growthOutlook: 'stable',
    salaryRange: { low: 45000, mid: 75000, high: 140000 },
  },
  {
    id: 'hr-people',
    name: 'HR & People Operations',
    description: 'Talent management, culture, and organizational development',
    primaryInterests: ['social', 'enterprising'],
    growthOutlook: 'growing',
    salaryRange: { low: 50000, mid: 80000, high: 150000 },
  },
  {
    id: 'media-communications',
    name: 'Media & Communications',
    description: 'Journalism, PR, content strategy, and media production',
    primaryInterests: ['artistic', 'enterprising'],
    growthOutlook: 'stable',
    salaryRange: { low: 40000, mid: 70000, high: 140000 },
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Protecting systems, networks, and data',
    primaryInterests: ['investigative', 'realistic'],
    growthOutlook: 'booming',
    salaryRange: { low: 70000, mid: 115000, high: 200000 },
  },
  {
    id: 'trades-skilled',
    name: 'Skilled Trades & Technical',
    description: 'Hands-on technical work requiring specialized training',
    primaryInterests: ['realistic', 'conventional'],
    growthOutlook: 'growing',
    salaryRange: { low: 35000, mid: 65000, high: 120000 },
  },
  {
    id: 'government-public',
    name: 'Government & Public Service',
    description: 'Public administration and civil service',
    primaryInterests: ['social', 'conventional'],
    growthOutlook: 'stable',
    salaryRange: { low: 45000, mid: 80000, high: 150000 },
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Starting and scaling new ventures',
    primaryInterests: ['enterprising', 'artistic'],
    growthOutlook: 'growing',
    salaryRange: { low: 0, mid: 90000, high: 500000 },
  },
];
```

### 12.2 Clustering Function

```typescript
/**
 * Group scored careers by family and return the best match
 * within each family.
 */
interface FamilyResult {
  family: CareerFamily;
  bestMatch: {
    career: CareerProfileV2;
    score: number;
    confidence: MatchConfidence;
  };
  /** Additional strong matches in this family (score within 10% of best) */
  alternates: Array<{
    career: CareerProfileV2;
    score: number;
  }>;
}

function clusterByFamily(
  scored: ScoredCareer[],
  percentiles: Map<string, number>,
  confidences: Map<string, MatchConfidence>,
): FamilyResult[] {
  const familyMap = new Map<CareerFamilyId, ScoredCareer[]>();

  for (const s of scored) {
    const familyId = s.profile.familyId;
    const list = familyMap.get(familyId) ?? [];
    list.push(s);
    familyMap.set(familyId, list);
  }

  const results: FamilyResult[] = [];

  for (const family of CAREER_FAMILIES) {
    const careers = familyMap.get(family.id);
    if (!careers || careers.length === 0) continue;

    // Sort by percentile within family
    careers.sort((a, b) =>
      (percentiles.get(b.profile.id) ?? 0) - (percentiles.get(a.profile.id) ?? 0)
    );

    const best = careers[0];
    const bestPercentile = percentiles.get(best.profile.id) ?? 0;

    const alternates = careers.slice(1).filter(c => {
      const score = percentiles.get(c.profile.id) ?? 0;
      return score >= bestPercentile * 0.9; // within 10%
    });

    results.push({
      family,
      bestMatch: {
        career: best.profile,
        score: bestPercentile,
        confidence: confidences.get(best.profile.id)!,
      },
      alternates: alternates.map(c => ({
        career: c.profile,
        score: percentiles.get(c.profile.id) ?? 0,
      })),
    });
  }

  // Sort families by best match score descending
  results.sort((a, b) => b.bestMatch.score - a.bestMatch.score);

  return results;
}
```

---

## 13. Result Categories

### 13.1 Interface

```typescript
interface CategorizedResult {
  category: ResultCategory;
  career: CareerProfileV2;
  score: number;
  confidence: MatchConfidence;
  /** Why this career is in this category */
  rationale: string;
  /** What-If scenarios for this career */
  whatIfScenarios: WhatIfScenario[];
  /** Threshold failures (if any) */
  thresholdFailures: ThresholdFailure[];
}

type ResultCategory =
  | 'best-overall'
  | 'fastest-path'
  | 'highest-growth'
  | 'hidden-gem'
  | 'stretch-goal';

interface AssessmentResultV2 {
  /** Top matches by category */
  categorized: CategorizedResult[];
  /** Best match within each career family */
  familyResults: FamilyResult[];
  /** Overall confidence in results */
  overallConfidence: MatchConfidence;
  /** Full ranked list (for exploration UI) */
  allRanked: Array<{
    career: CareerProfileV2;
    score: number;
    category: ResultCategory | null;
  }>;
}
```

### 13.2 Categorization Logic

```typescript
/**
 * Assign categories to top career matches.
 *
 * Rules:
 * - "Best Overall":  Highest percentile score with high confidence.
 * - "Fastest Path":  Highest score weighted by current skill overlap.
 *                    Formula: percentile * (1 + skillOverlap * 0.3)
 * - "Highest Growth": Highest score among careers with growthOutlook
 *                     of 'booming' or 'growing'. Weighted by growth rate.
 * - "Hidden Gem":    High score (top 20%) but in a domain the user did
 *                    NOT select as an interest. Indicates surprising fit.
 * - "Stretch Goal":  Threshold-blocked career with highest passRatio.
 *                    Always includes development hints.
 */
function categorizeResults(
  scored: ScoredCareer[],
  percentiles: Map<string, number>,
  confidences: Map<string, MatchConfidence>,
  user: UserTraitVector,
  userInterests: string[],
  userSkills: string[],
): CategorizedResult[] {
  const results: CategorizedResult[] = [];
  const used = new Set<string>(); // prevent one career appearing in multiple categories

  // Sort by percentile
  const byPercentile = [...scored].sort((a, b) =>
    (percentiles.get(b.profile.id) ?? 0) - (percentiles.get(a.profile.id) ?? 0)
  );

  // 1. Best Overall -- highest percentile
  const bestOverall = byPercentile.find(s => s.thresholdResult.passed && !used.has(s.profile.id));
  if (bestOverall) {
    used.add(bestOverall.profile.id);
    results.push({
      category: 'best-overall',
      career: bestOverall.profile,
      score: percentiles.get(bestOverall.profile.id) ?? 0,
      confidence: confidences.get(bestOverall.profile.id)!,
      rationale: 'Strongest overall alignment across interests, values, personality, and work style.',
      whatIfScenarios: computeWhatIf(user, bestOverall.profile, percentiles.get(bestOverall.profile.id) ?? 0),
      thresholdFailures: [],
    });
  }

  // 2. Fastest Path -- best score weighted by existing skill overlap
  const userSkillsLower = new Set(userSkills.map(s => s.toLowerCase()));
  const byFastestPath = [...scored]
    .filter(s => s.thresholdResult.passed && !used.has(s.profile.id))
    .map(s => {
      const skillOverlap = s.profile.requiredSkills.filter(
        sk => userSkillsLower.has(sk.toLowerCase())
      ).length / Math.max(1, s.profile.requiredSkills.length);
      const fastScore = (percentiles.get(s.profile.id) ?? 0) * (1 + skillOverlap * 0.3);
      return { scored: s, fastScore, skillOverlap };
    })
    .sort((a, b) => b.fastScore - a.fastScore);

  if (byFastestPath.length > 0 && byFastestPath[0].scored.profile.id !== bestOverall?.profile.id) {
    const fastest = byFastestPath[0];
    used.add(fastest.scored.profile.id);
    results.push({
      category: 'fastest-path',
      career: fastest.scored.profile,
      score: percentiles.get(fastest.scored.profile.id) ?? 0,
      confidence: confidences.get(fastest.scored.profile.id)!,
      rationale: `You already have ${Math.round(fastest.skillOverlap * 100)}% of the required skills. This is the shortest path to a strong career match.`,
      whatIfScenarios: computeWhatIf(user, fastest.scored.profile, percentiles.get(fastest.scored.profile.id) ?? 0),
      thresholdFailures: [],
    });
  }

  // 3. Highest Growth -- best score among growing/booming careers
  const byGrowth = [...scored]
    .filter(s => {
      if (used.has(s.profile.id)) return false;
      if (!s.thresholdResult.passed) return false;
      const family = CAREER_FAMILIES.find(f => f.id === s.profile.familyId);
      return family?.growthOutlook === 'booming' || family?.growthOutlook === 'growing';
    })
    .sort((a, b) => {
      const aScore = percentiles.get(a.profile.id) ?? 0;
      const bScore = percentiles.get(b.profile.id) ?? 0;
      const aGrowth = a.profile.industryGrowthRate ?? 0;
      const bGrowth = b.profile.industryGrowthRate ?? 0;
      // Weight: 70% match score, 30% growth rate
      return (bScore * 0.7 + bGrowth * 0.3) - (aScore * 0.7 + aGrowth * 0.3);
    });

  if (byGrowth.length > 0) {
    const growth = byGrowth[0];
    used.add(growth.profile.id);
    const family = CAREER_FAMILIES.find(f => f.id === growth.profile.familyId);
    results.push({
      category: 'highest-growth',
      career: growth.profile,
      score: percentiles.get(growth.profile.id) ?? 0,
      confidence: confidences.get(growth.profile.id)!,
      rationale: `The ${family?.name ?? growth.profile.domain} field is ${family?.growthOutlook ?? 'growing'} with strong demand for talent.`,
      whatIfScenarios: computeWhatIf(user, growth.profile, percentiles.get(growth.profile.id) ?? 0),
      thresholdFailures: [],
    });
  }

  // 4. Hidden Gem -- high score in a domain user didn't select
  const userInterestsLower = new Set(userInterests.map(i => i.toLowerCase()));
  const byHiddenGem = [...scored]
    .filter(s => {
      if (used.has(s.profile.id)) return false;
      if (!s.thresholdResult.passed) return false;
      const percentile = percentiles.get(s.profile.id) ?? 0;
      if (percentile < 70) return false; // Must be top ~30%
      // Domain must NOT be in user's selected interests
      const inUserDomains = s.profile.domains.some(d => userInterestsLower.has(d.toLowerCase()));
      return !inUserDomains;
    })
    .sort((a, b) => (percentiles.get(b.profile.id) ?? 0) - (percentiles.get(a.profile.id) ?? 0));

  if (byHiddenGem.length > 0) {
    const gem = byHiddenGem[0];
    used.add(gem.profile.id);
    results.push({
      category: 'hidden-gem',
      career: gem.profile,
      score: percentiles.get(gem.profile.id) ?? 0,
      confidence: confidences.get(gem.profile.id)!,
      rationale: `You might not have considered ${gem.profile.title}, but your traits align strongly with this career -- especially your ${identifyStrongestDimension(user, gem.profile)}.`,
      whatIfScenarios: computeWhatIf(user, gem.profile, percentiles.get(gem.profile.id) ?? 0),
      thresholdFailures: [],
    });
  }

  // 5. Stretch Goal -- highest passRatio among threshold-blocked careers
  const byStretch = [...scored]
    .filter(s => !s.thresholdResult.passed && !used.has(s.profile.id))
    .sort((a, b) => {
      // Rank by passRatio (how close they are) * raw percentile
      const aComposite = a.thresholdResult.passRatio * (percentiles.get(a.profile.id) ?? 0);
      const bComposite = b.thresholdResult.passRatio * (percentiles.get(b.profile.id) ?? 0);
      return bComposite - aComposite;
    });

  if (byStretch.length > 0) {
    const stretch = byStretch[0];
    used.add(stretch.profile.id);
    results.push({
      category: 'stretch-goal',
      career: stretch.profile,
      score: percentiles.get(stretch.profile.id) ?? 0,
      confidence: confidences.get(stretch.profile.id)!,
      rationale: `You meet ${Math.round(stretch.thresholdResult.passRatio * 100)}% of the requirements for ${stretch.profile.title}. With focused development, this is an achievable stretch goal.`,
      whatIfScenarios: computeWhatIf(user, stretch.profile, percentiles.get(stretch.profile.id) ?? 0),
      thresholdFailures: stretch.thresholdResult.failures,
    });
  }

  return results;
}

/**
 * Identify which dimension contributes most to a career match.
 * Used for generating Hidden Gem rationale text.
 */
function identifyStrongestDimension(
  user: UserTraitVector,
  profile: CareerProfileV2,
): string {
  let bestDim: ScoringDimension = 'interests';
  let bestSim = 0;

  for (const dim of ALL_DIMENSIONS) {
    const vocab = DIMENSION_VOCABULARIES[dim];
    const userVec = buildUserDimensionVector(user[dim], vocab);
    const careerVec = buildCareerDimensionVector(
      (profile[dim] as string[]) ?? [],
      vocab,
    );
    const sim = cosineSimilarity(userVec, careerVec);
    if (sim > bestSim) {
      bestSim = sim;
      bestDim = dim;
    }
  }

  const DIMENSION_LABELS: Record<ScoringDimension, string> = {
    interests: 'interests',
    problemTypes: 'problem-solving approach',
    archetypes: 'work archetype',
    workStyles: 'work style',
    decisionStyle: 'decision-making style',
    collaboration: 'collaboration preference',
    ambiguityStyle: 'ambiguity tolerance',
    coreValues: 'core values',
    tradeoffs: 'value tradeoffs',
    frustrations: 'workplace frustrations',
    rewards: 'reward motivations',
    environments: 'environment preference',
    teamSizes: 'team size preference',
    paces: 'pace preference',
    managementStyles: 'management style fit',
    careerStages: 'career stage alignment',
    riskLevels: 'risk tolerance',
    trajectories: 'career trajectory',
    groupRoles: 'group role',
  };

  return DIMENSION_LABELS[bestDim];
}
```

---

## 14. Scoring Pipeline

### 14.1 Main Entry Point

```typescript
/**
 * v2 scoring pipeline: the main entry point for assessment.
 *
 * Replaces getTopCareerMatches() from v1.
 */
function scoreAssessmentV2(
  input: AssessmentInput,
  profiles: CareerProfileV2[],
): AssessmentResultV2 {
  // ── Step 1: Build user trait vector ──
  const userVector = buildUserTraitVector(input);

  // ── Step 2: Calculate confidence ──
  const answeredCount = input.answers
    ? Object.keys(input.answers).length
    : estimateAnsweredQuestions(input);
  const overallConfidence = calculateConfidence(userVector, answeredCount, 80);

  // ── Step 3: Score all profiles ──
  const scored: ScoredCareer[] = profiles.map(profile => {
    // Dimensional cosine similarity score (0-1)
    const rawDimensional = scoreDimensional(userVector, profile);

    // Synergy bonus (0-0.15 max)
    const synergyBonus = scoreSynergiesV2(
      extractAnswers(input),
      profile,
    );

    // Anti-pattern penalty (0-0.15 max)
    const antiPatternPenalty = scoreAntiPatternsV2(
      extractAnswers(input),
      profile,
    );

    // Domain affinity (0-0.10 max)
    const domainAffinity = scoreDomainAffinityV2(input.interests, profile.domains);

    // Experience fit (-0.05 to +0.10)
    const experienceFit = scoreExperienceFitV2(
      input.experienceLevel,
      profile.experienceLevels,
    );

    // Personality coherence multiplier (0.90 - 1.08)
    const coherence = personalityCoherenceV2(userVector, profile);
    const coherenceMultiplier = 0.90 + (coherence * 0.18);

    // Non-compensatory thresholds
    const thresholdResult = profile.thresholds
      ? evaluateThresholds(
          userVector,
          { ...input.currentSkills?.reduce((acc, s) => ({ ...acc, [s]: 'intermediate' }), {}) ?? {} },
          extractAnswers(input).car2?.[0] ?? 'moderate',
          profile.thresholds,
        )
      : { passed: true, failures: [], passRatio: 1.0 };

    // Composite raw score
    const compositeRaw = (
      rawDimensional +
      synergyBonus -
      antiPatternPenalty +
      domainAffinity +
      experienceFit
    ) * coherenceMultiplier;

    return {
      profile,
      rawScore: rawDimensional,
      synergyBonus,
      antiPatternPenalty,
      domainAffinity,
      experienceFit,
      coherenceMultiplier,
      thresholdResult,
      compositeRaw,
    };
  });

  // ── Step 4: Percentile normalization ──
  const percentiles = normalizeToPercentiles(scored);

  // ── Step 5: Build confidence map ──
  const confidences = new Map<string, MatchConfidence>();
  for (const s of scored) {
    const conf = { ...overallConfidence };
    conf.score = percentiles.get(s.profile.id) ?? 0;
    confidences.set(s.profile.id, conf);
  }

  // ── Step 6: Categorize results ──
  const categorized = categorizeResults(
    scored,
    percentiles,
    confidences,
    userVector,
    input.interests,
    input.currentSkills,
  );

  // ── Step 7: Career family clustering ──
  const familyResults = clusterByFamily(scored, percentiles, confidences);

  // ── Step 8: Build full ranked list ──
  const allRanked = scored
    .sort((a, b) => (percentiles.get(b.profile.id) ?? 0) - (percentiles.get(a.profile.id) ?? 0))
    .map(s => ({
      career: s.profile,
      score: percentiles.get(s.profile.id) ?? 0,
      category: categorized.find(c => c.career.id === s.profile.id)?.category ?? null,
    }));

  return {
    categorized,
    familyResults,
    overallConfidence,
    allRanked,
  };
}
```

### 14.2 Score Decomposition (for debugging/transparency)

```typescript
/**
 * Returns a detailed breakdown of how a career's score was computed.
 * Useful for debugging and for showing users "why this match."
 */
interface ScoreBreakdown {
  careerId: string;
  careerTitle: string;
  /** Per-dimension cosine similarity (0-1 each) */
  dimensionScores: Record<ScoringDimension, {
    similarity: number;
    weight: number;
    weightedContribution: number;
  }>;
  /** Synergy patterns that fired */
  activeSynergies: Array<{ name: string; bonus: number }>;
  /** Anti-patterns that fired */
  activeAntiPatterns: Array<{ name: string; penalty: number; explanation: string }>;
  /** Raw composite before normalization */
  rawComposite: number;
  /** Final percentile */
  percentile: number;
  /** Threshold status */
  thresholdStatus: ThresholdResult;
}
```

---

## 15. Migration Strategy

### 15.1 Phases

**Phase 1: Data Model Extension (1 week)**
- Add `CareerProfileV2Extension` fields to the profile type.
- Write a migration script that generates default `dimensionWeights` for all 90 profiles based on their domain.
- Assign `familyId` to all profiles.
- No scoring changes yet.

**Phase 2: Cosine Similarity Scoring (1 week)**
- Implement `UserTraitVector` builder from existing `extractAnswers()`.
- Implement vocabulary registry.
- Implement `scoreDimensional()`.
- Run in shadow mode: compute both v1 and v2 scores, log delta.
- Validate v2 scores produce reasonable ranking order.

**Phase 3: Synergies, Anti-Patterns, Thresholds (1 week)**
- Port 10 existing synergies to v2 format, add 17 new patterns.
- Port 8 existing anti-patterns to v2 format, add 9 new patterns.
- Add threshold definitions for careers where hard requirements exist.
- Shadow mode comparison continues.

**Phase 4: Normalization + Confidence (3 days)**
- Implement percentile normalization.
- Implement confidence scoring.
- Replace v1 normalization curve.

**Phase 5: Result Categories + What-If + Families (1 week)**
- Implement categorization logic.
- Implement What-If engine.
- Implement career family clustering.
- Build new result shape (`AssessmentResultV2`).

**Phase 6: Frontend Integration (1 week)**
- Update result display components to show categories.
- Add What-If UI.
- Add career family browser.
- Add confidence indicators.

**Phase 7: A/B Testing + Rollout (2 weeks)**
- Feature-flag v2 for 10% of users.
- Monitor: score distribution, user engagement with results, click-through to roadmaps.
- Iterate on weight vectors based on engagement data.
- Full rollout.

### 15.2 Backward Compatibility

The v2 `scoreAssessmentV2()` function produces a superset of v1 output. For backward compat:

```typescript
/** Adapter: convert v2 result to v1 shape for existing consumers */
function toV1Shape(v2Result: AssessmentResultV2): {
  careerMatches: CareerMatch[];
  skillGaps: SkillGap[];
} {
  const topThree = v2Result.categorized.slice(0, 3);
  return {
    careerMatches: topThree.map(c => ({
      title: c.career.title,
      matchScore: c.score,
      description: c.career.description,
      requiredSkills: c.career.requiredSkills,
      pathwayTime: c.career.pathwayTime,
    })),
    skillGaps: [], // Computed separately via existing analyzeSkillGapsForRole
  };
}
```

---

## 16. Open Questions

1. **Weight Vector Tuning:** How do we validate per-career weight vectors? Options:
   - Expert review (career counselors rate dimension importance per career)
   - Data-driven: analyze user engagement with results post-scoring
   - Hybrid: expert-seeded, data-refined

2. **Threshold Strictness:** Should threshold-blocked careers be completely hidden, or always shown as Stretch Goals? Current design: always shown with development hints.

3. **What-If Granularity:** Should What-If scenarios include soft skills (e.g., "develop empathy") or only hard skills (e.g., "learn Python")? Soft skill What-Ifs are harder to quantify effort for.

4. **Career Profile Count:** The spec assumes expansion from ~90 to 150+ profiles. Should we prioritize breadth (more families) or depth (more specializations within existing families)?

5. **Consistency Score Impact:** Should low consistency scores reduce the match percentile, or only affect the confidence label? Current design: confidence label only.

6. **Growth Data Source:** Where does `industryGrowthRate` come from? Options: BLS projections (updated annually), LinkedIn Workforce Report, or manual curation.

7. **Mobile (iOS) Parity:** The iOS app consumes assessment results via API. The new result shape is larger -- do we need a compact response variant?

---

## Appendix A: Score Formula Summary

```
For each career C:

  1. dimensionalScore = SUM over d in dimensions:
       cosineSimilarity(user[d], C[d]) * C.weights[d]
     // Range: [0, 1]

  2. synergyBonus = SUM of matched synergy pattern bonuses
     // Range: [0, ~0.15]

  3. antiPatternPenalty = SUM of matched anti-pattern penalties
     // Range: [0, ~0.15]

  4. domainAffinity = weighted domain interest overlap
     // Range: [0, 0.10]

  5. experienceFit = experience level alignment bonus/penalty
     // Range: [-0.05, 0.10]

  6. coherenceMultiplier = 0.90 + (personalityCoherence * 0.18)
     // Range: [0.90, 1.08]

  7. compositeRaw = (dimensionalScore + synergyBonus - antiPatternPenalty
                     + domainAffinity + experienceFit) * coherenceMultiplier

  8. percentile = rank(compositeRaw) over all careers, normalized to [5, 99]

  9. thresholdCheck = evaluateThresholds(user, C.thresholds)
     // If failed: career is categorized as "stretch-goal"

  10. category = categorize(percentile, thresholdCheck, skillOverlap, growthRate, domainSurprise)
```

## Appendix B: Dimension-to-Question Mapping

The 80-question assessment maps to the 19 scoring dimensions as follows:

| Dimension | Question IDs | Questions |
|-----------|-------------|-----------|
| interests | int1 | Primary RIASEC interest |
| problemTypes | int2 | Problem-solving approach |
| archetypes | int3 | Work archetype identification |
| workStyles | ws1 | Work style preference |
| decisionStyle | ws2 | Decision-making approach |
| collaboration | ws3 | Collaboration preference |
| ambiguityStyle | ws4 | Ambiguity handling |
| coreValues | val1 | Core value ranking |
| tradeoffs | val2 | Value tradeoff choice |
| frustrations | val3 | Workplace frustration signal |
| rewards | val4 | Reward motivation |
| environments | env1 | Environment preference |
| teamSizes | env2 | Team size preference |
| paces | env3 | Pace preference |
| managementStyles | env4 | Management style preference |
| careerStages | car1 | Career stage self-assessment |
| riskLevels | car2 | Risk tolerance |
| trajectories | car3 | Career trajectory |
| groupRoles | car4 | Group role identification |

Note: Some questions provide signal to multiple dimensions. The trait vector builder handles this by distributing weight across affected dimensions.
