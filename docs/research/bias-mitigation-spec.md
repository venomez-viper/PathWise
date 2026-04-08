# PathWise Career Assessment -- Bias Mitigation System

> **Version:** 1.0  
> **Date:** 2026-04-06  
> **Status:** Technical Specification  
> **Depends on:** [assessment-question-bank.md](./assessment-question-bank.md), `backend/assessment/career-brain.ts`  
> **Scope:** Detection, correction, and continuous improvement of cognitive biases in the PathWise career assessment pipeline  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Social Desirability Detection](#3-social-desirability-detection)
4. [Consistency Checking](#4-consistency-checking)
5. [Response Pattern Detection](#5-response-pattern-detection)
6. [Anchoring Bias Mitigation](#6-anchoring-bias-mitigation)
7. [Dunning-Kruger Compensation](#7-dunning-kruger-compensation)
8. [Gender and Cultural Bias Mitigation](#8-gender-and-cultural-bias-mitigation)
9. [Confidence Weighting System](#9-confidence-weighting-system)
10. [Recalibration Flow](#10-recalibration-flow)
11. [Data Model and Migration](#11-data-model-and-migration)
12. [API Contract](#12-api-contract)
13. [Integration with Career Brain](#13-integration-with-career-brain)
14. [Failure Modes](#14-failure-modes)
15. [Open Questions](#15-open-questions)

---

## 1. Overview

### Problem

Career assessments are systematically distorted by cognitive biases:

- **Social desirability** -- users present idealized rather than authentic selves
- **Inconsistency** -- contradictory answers from inattention or confusion
- **Straight-lining / random responding** -- disengaged users produce garbage data
- **Anchoring** -- early questions / partial results bias later answers
- **Dunning-Kruger** -- self-assessed aptitude is reliably miscalibrated
- **Stereotype threat** -- gendered / cultural framing activates identity-based distortions
- **Satisficing** -- rushing through without genuine reflection

### Solution

A layered bias mitigation system that operates at three stages:

1. **Pre-assessment** -- question design, randomization, calibration items
2. **During assessment** -- real-time pattern detection, response timing capture
3. **Post-assessment** -- score adjustment, confidence weighting, recalibration feedback loop

### Design Principles

- **Non-punitive** -- bias detection adjusts scores toward accuracy, never penalizes users
- **Transparent where helpful** -- users see confidence bands, not raw "you failed a lie detector"
- **Incremental** -- each module is independently deployable; the system degrades gracefully
- **Data-driven evolution** -- recalibration feedback improves question design over time

---

## 2. Architecture

```
                                                 
  Frontend (Assessment Page)                     Backend (assessment service)
  ┌──────────────────────────┐                   ┌───────────────────────────────────┐
  │                          │                   │                                   │
  │  QuestionRenderer        │   POST /assess    │  BiasDetectionPipeline            │
  │  ├─ TimingCapture        │ ─────────────────>│  ├─ SocialDesirabilityDetector     │
  │  ├─ RandomizationEngine  │                   │  ├─ ConsistencyChecker             │
  │  └─ CalibrationItems     │                   │  ├─ ResponsePatternDetector        │
  │                          │                   │  ├─ DunningKrugerCompensator       │
  │  RecalibrationModal      │   POST /recalib   │  ├─ ConfidenceWeighter             │
  │  └─ DimensionFeedback    │ ─────────────────>│  └─ ScoreAdjuster                 │
  │                          │                   │                                   │
  └──────────────────────────┘                   │  CareerBrain (existing)            │
                                                 │  └─ receives adjusted scores       │
                                                 │                                   │
                                                 │  RecalibrationAggregator           │
                                                 │  └─ question_bias_log table        │
                                                 └───────────────────────────────────┘
```

### Data Flow

1. Frontend captures answers + response times + randomization seed
2. Backend runs bias detection pipeline, producing a `BiasReport`
3. `ScoreAdjuster` applies corrections to raw dimension scores
4. Adjusted scores feed into existing `getTopCareerMatches()` in `career-brain.ts`
5. Results include confidence bands derived from bias report
6. Optional recalibration feedback loops back to improve question design

---

## 3. Social Desirability Detection

### 3.1 Trap Items

Four items with universally desirable answers that virtually no honest respondent would endorse at maximum strength. These are interspersed across phases -- one per phase in Phases 1-4.

```typescript
// backend/assessment/bias/social-desirability.ts

/**
 * Social desirability trap items.
 * Inserted into the question flow at specific positions (see randomization engine).
 * Response scale: strongly_disagree (0) | disagree (1) | neutral (2) | agree (3) | strongly_agree (4)
 */
export const DESIRABILITY_TRAPS = [
  {
    id: 'sd_1',
    text: 'I never get frustrated with colleagues, even when they miss deadlines',
    phase: 1,                         // inserted in RIASEC phase
    highDesirability: 'strongly_agree' as const,
    threshold: 3,                     // agree or strongly_agree counts as endorsement
  },
  {
    id: 'sd_2',
    text: 'I always give 100% effort on every task, including ones I find boring',
    phase: 2,                         // inserted in Work Style phase
    highDesirability: 'strongly_agree' as const,
    threshold: 3,
  },
  {
    id: 'sd_3',
    text: 'I have never procrastinated on an important task',
    phase: 3,                         // inserted in Values phase
    highDesirability: 'strongly_agree' as const,
    threshold: 3,
  },
  {
    id: 'sd_4',
    text: 'I am equally productive every day regardless of my mood or energy',
    phase: 4,                         // inserted in Environment phase
    highDesirability: 'strongly_agree' as const,
    threshold: 3,
  },
] as const;

export type DesirabilityTrapId = typeof DESIRABILITY_TRAPS[number]['id'];
```

### 3.2 Scoring

```typescript
export interface DesirabilityResult {
  /** Number of trap items endorsed (0-4) */
  endorsedCount: number;
  /** Which specific traps were endorsed */
  endorsedItems: DesirabilityTrapId[];
  /** Regression factor to apply to self-enhancing dimensions */
  regressionFactor: number;
  /** Human-readable severity */
  severity: 'none' | 'mild' | 'moderate' | 'high';
}

/**
 * Compute social desirability score from trap item responses.
 *
 * Regression strategy: pull self-enhancing dimension scores toward the
 * population mean. This is standard practice in personality assessment
 * (see: Paulhus Deception Scales, Edwards Social Desirability Scale).
 */
export function detectSocialDesirability(
  trapAnswers: Record<DesirabilityTrapId, number>,
): DesirabilityResult {
  const endorsed: DesirabilityTrapId[] = [];

  for (const trap of DESIRABILITY_TRAPS) {
    const answer = trapAnswers[trap.id];
    if (answer !== undefined && answer >= trap.threshold) {
      endorsed.push(trap.id);
    }
  }

  const count = endorsed.length;

  let regressionFactor: number;
  let severity: DesirabilityResult['severity'];

  if (count >= 3) {
    // 3-4 endorsed: regress self-enhancing dimensions 20% toward mean
    regressionFactor = 0.20;
    severity = 'high';
  } else if (count === 2) {
    // 2 endorsed: regress 10%
    regressionFactor = 0.10;
    severity = 'moderate';
  } else {
    // 0-1: no adjustment (one endorsement is within normal range)
    regressionFactor = 0;
    severity = count === 1 ? 'mild' : 'none';
  }

  return {
    endorsedCount: count,
    endorsedItems: endorsed,
    regressionFactor,
    severity,
  };
}

/**
 * Self-enhancing dimensions: dimensions where social desirability inflates scores.
 * These map to the existing question IDs in the assessment.
 */
const SELF_ENHANCING_DIMENSIONS = [
  'ws1',   // openness to change (claiming openness is desirable)
  'ws4',   // ambiguity handling (claiming structure is desirable)
  'car4',  // group role (claiming leadership is desirable)
  'val1',  // core value (claiming purpose is desirable)
] as const;

/**
 * Apply desirability regression to raw dimension scores.
 *
 * Formula: adjusted = raw - regressionFactor * (raw - populationMean)
 * This pulls extreme scores toward the mean proportionally.
 */
export function adjustForDesirability(
  rawScores: Record<string, number>,
  desirability: DesirabilityResult,
  populationMeans: Record<string, number>,
): Record<string, number> {
  if (desirability.regressionFactor === 0) return { ...rawScores };

  const adjusted = { ...rawScores };
  for (const dim of SELF_ENHANCING_DIMENSIONS) {
    if (adjusted[dim] !== undefined && populationMeans[dim] !== undefined) {
      const raw = adjusted[dim];
      const mean = populationMeans[dim];
      adjusted[dim] = raw - desirability.regressionFactor * (raw - mean);
    }
  }
  return adjusted;
}
```

### 3.3 Population Means

Population means are bootstrapped from initial data and updated via a rolling average:

```typescript
/**
 * Initial population means (bootstrapped from assessment design norms).
 * Updated in production via rolling average of all completed assessments.
 * Stored in assessment_metadata table, refreshed daily via cron.
 */
export const INITIAL_POPULATION_MEANS: Record<string, number> = {
  ws1: 2.0,   // openness: midpoint of 0-4 scale
  ws4: 2.0,   // ambiguity handling
  car4: 2.0,  // group role
  val1: 2.0,  // core value
};
```

---

## 4. Consistency Checking

### 4.1 Consistency Pairs

Six pairs of questions that measure the same underlying construct from different angles. Large discrepancies indicate inattentive or confused responding.

```typescript
// backend/assessment/bias/consistency.ts

/**
 * Each pair links two question IDs that should correlate.
 * The mapping defines which answer values are considered "aligned."
 *
 * maxDiscrepancy: maximum allowed distance on the alignment scale
 * before flagging. Distance is computed as the absolute difference
 * between the normalized alignment scores (0.0 to 1.0) of each answer.
 */
export const CONSISTENCY_PAIRS = [
  {
    q1: 'ri_r1',                  // "enjoy assembling/testing hardware"
    q2: 'ws3',                    // "prefer solo deep work vs collaborative"
    construct: 'hands-on preference',
    alignment: {
      // Realistic interest + solo/mixed work style = consistent
      q1High: ['like'],
      q2High: ['solo', 'mixed'],
    },
    maxDiscrepancy: 0.5,
  },
  {
    q1: 'ri_s1',                  // "enjoy mentoring/tutoring" (Social RIASEC)
    q2: 'int3',                   // "you'd rather be known for: helper"
    construct: 'social orientation',
    alignment: {
      q1High: ['like'],
      q2High: ['helper'],
    },
    maxDiscrepancy: 0.5,
  },
  {
    q1: 'val1',                   // "autonomy vs prestige vs purpose vs mastery"
    q2: 'val3',                   // "what frustrates you most"
    construct: 'autonomy drive',
    alignment: {
      // autonomy value + micromanaged frustration = consistent
      q1High: ['autonomy'],
      q2High: ['micromanaged'],
    },
    maxDiscrepancy: 0.5,
  },
  {
    q1: 'ws1',                    // "project plan scrapped: excited vs uneasy"
    q2: 'ws4',                    // "handle ambiguity: structure vs experiment"
    construct: 'openness to uncertainty',
    alignment: {
      q1High: ['open'],
      q2High: ['experiment'],
    },
    maxDiscrepancy: 0.5,
  },
  {
    q1: 'int2',                   // "which problem excites you: technical"
    q2: 'int3',                   // "you'd rather be known for: builder"
    construct: 'technical orientation',
    alignment: {
      q1High: ['technical'],
      q2High: ['builder'],
    },
    maxDiscrepancy: 0.5,
  },
  {
    q1: 'car3',                   // "in five years: specialist vs manager"
    q2: 'car4',                   // "in group work: leader vs doer"
    construct: 'leadership aspiration',
    alignment: {
      q1High: ['manager'],
      q2High: ['leader'],
    },
    maxDiscrepancy: 0.5,
  },
] as const;

export interface ConsistencyResult {
  /** Overall consistency score (0.0 = completely inconsistent, 1.0 = perfectly consistent) */
  score: number;
  /** Which construct pairs were flagged as inconsistent */
  flags: ConsistencyFlag[];
  /** Whether overall consistency is below the acceptable threshold */
  isBelowThreshold: boolean;
}

export interface ConsistencyFlag {
  construct: string;
  q1Id: string;
  q2Id: string;
  discrepancy: number;
  q1Answer: string;
  q2Answer: string;
}

/**
 * Compute consistency across all defined pairs.
 *
 * For each pair, we check whether the user's answers to q1 and q2 are
 * directionally aligned (both in the "high" set, both in the "low" set,
 * or mixed). A pair scores 1.0 if aligned, 0.0 if misaligned, 0.5 if
 * one answer is in the aligned set and the other is neutral.
 *
 * Overall consistency = mean of all pair scores.
 * Threshold: 0.4 (below this, flag the entire assessment).
 */
export function computeConsistency(
  answers: Record<string, string | string[]>,
): ConsistencyResult {
  const flags: ConsistencyFlag[] = [];
  let totalScore = 0;
  let pairCount = 0;

  for (const pair of CONSISTENCY_PAIRS) {
    const a1 = normalizeAnswer(answers[pair.q1]);
    const a2 = normalizeAnswer(answers[pair.q2]);

    if (!a1 || !a2) continue; // skip if either question wasn't answered
    pairCount++;

    const q1Aligned = pair.alignment.q1High.some(
      v => a1.toLowerCase() === v.toLowerCase()
    );
    const q2Aligned = pair.alignment.q2High.some(
      v => a2.toLowerCase() === v.toLowerCase()
    );

    let pairScore: number;
    if (q1Aligned === q2Aligned) {
      // Both aligned or both not aligned = consistent
      pairScore = 1.0;
    } else {
      // One aligned, one not = inconsistent
      pairScore = 0.0;
    }

    totalScore += pairScore;

    if (pairScore < (1.0 - pair.maxDiscrepancy)) {
      flags.push({
        construct: pair.construct,
        q1Id: pair.q1,
        q2Id: pair.q2,
        discrepancy: 1.0 - pairScore,
        q1Answer: a1,
        q2Answer: a2,
      });
    }
  }

  const overallScore = pairCount > 0 ? totalScore / pairCount : 1.0;

  return {
    score: overallScore,
    flags,
    isBelowThreshold: overallScore < 0.4,
  };
}

function normalizeAnswer(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}
```

---

## 5. Response Pattern Detection

### 5.1 Straight-Lining Detection

```typescript
// backend/assessment/bias/pattern-detection.ts

export interface PatternDetectionResult {
  straightLining: boolean;
  randomResponding: boolean;
  rushing: boolean;
  /** Combined data quality flag */
  dataQuality: 'good' | 'suspect' | 'unreliable';
  details: PatternDetails;
}

export interface PatternDetails {
  longestStreak: number;
  streakValue: string | null;
  averageResponseTimeMs: number;
  cronbachAlphas: Record<string, number>;
  rushingQuestionCount: number;
  totalQuestionCount: number;
}

/**
 * Detect straight-lining: same answer selected 8+ times consecutively.
 *
 * This catches users who click the same position (e.g., always "A")
 * without reading questions. The threshold of 8 was chosen because
 * legitimate consistent answering rarely exceeds 6-7 in a row across
 * heterogeneous question content.
 */
export function detectStraightlining(
  orderedAnswers: Array<{ questionId: string; value: string }>,
): { detected: boolean; longestStreak: number; streakValue: string | null } {
  if (orderedAnswers.length < 8) {
    return { detected: false, longestStreak: 0, streakValue: null };
  }

  let maxStreak = 1;
  let currentStreak = 1;
  let maxStreakValue = orderedAnswers[0]?.value ?? null;
  let currentValue = orderedAnswers[0]?.value;

  for (let i = 1; i < orderedAnswers.length; i++) {
    if (orderedAnswers[i].value === currentValue) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakValue = currentValue;
      }
    } else {
      currentValue = orderedAnswers[i].value;
      currentStreak = 1;
    }
  }

  return {
    detected: maxStreak >= 8,
    longestStreak: maxStreak,
    streakValue: maxStreak >= 8 ? maxStreakValue : null,
  };
}
```

### 5.2 Random Responding Detection

```typescript
/**
 * Detect random responding via internal consistency (Cronbach's alpha).
 *
 * Cronbach's alpha measures how well items within a dimension correlate.
 * For a well-designed assessment, alpha should be >= 0.6 per dimension.
 * If ALL dimensions fall below 0.4, the user is likely responding randomly.
 *
 * We compute alpha for each RIASEC dimension (which has 4 items each,
 * enough for a meaningful estimate).
 */
export function detectRandomResponding(
  dimensionScores: Record<string, number[]>,
): { detected: boolean; alphas: Record<string, number> } {
  const alphas: Record<string, number> = {};
  let belowThresholdCount = 0;
  let dimensionCount = 0;

  for (const [dimension, scores] of Object.entries(dimensionScores)) {
    if (scores.length < 3) continue; // need at least 3 items for alpha
    dimensionCount++;

    const alpha = computeCronbachAlpha(scores);
    alphas[dimension] = alpha;

    if (alpha < 0.4) {
      belowThresholdCount++;
    }
  }

  // Random responding: majority of dimensions have alpha < 0.4
  const detected = dimensionCount > 0 && belowThresholdCount > dimensionCount / 2;

  return { detected, alphas };
}

/**
 * Cronbach's alpha for a set of item scores.
 *
 * alpha = (k / (k-1)) * (1 - sum(itemVariances) / totalVariance)
 *
 * Where k = number of items.
 * Returns a value between 0 and 1 (can be negative for adversarial data).
 */
function computeCronbachAlpha(scores: number[]): number {
  const k = scores.length;
  if (k < 2) return 0;

  const mean = scores.reduce((a, b) => a + b, 0) / k;
  const totalVariance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / k;

  if (totalVariance === 0) return 0;

  // For single-item "variance," use deviation from own mean
  // In practice, this is computed across users for the same item.
  // For within-user detection, we use the variance of the item scores
  // within the dimension as a proxy.
  const itemVariance = scores.reduce((sum, s) => {
    const dev = s - mean;
    return sum + (dev * dev) / k;
  }, 0);

  return (k / (k - 1)) * (1 - itemVariance / totalVariance);
}
```

**Implementation note:** True Cronbach's alpha requires item-level variance across multiple respondents. For within-user random detection, we use a simplified proxy: if the user's answers within a single RIASEC dimension show no coherent pattern (e.g., "Like" for one Realistic item, "Dislike" for another nearly identical one), the variance ratio flags it. In production, the full cross-user alpha should be computed as a batch job and used as the authoritative metric.

### 5.3 Speed Detection

```typescript
/**
 * Detect rushing: average response time below 1.5 seconds per question.
 *
 * Research indicates minimum cognitive processing time for Likert-style
 * items is approximately 2 seconds (Huang et al., 2012). Below 1.5s
 * indicates the user is not reading the question text.
 *
 * We also flag individual questions answered in < 800ms as "skimmed."
 */
export function detectRushing(
  responseTimes: Array<{ questionId: string; durationMs: number }>,
): {
  detected: boolean;
  averageMs: number;
  skimmedQuestions: string[];
  rushingPercentage: number;
} {
  if (responseTimes.length === 0) {
    return { detected: false, averageMs: 0, skimmedQuestions: [], rushingPercentage: 0 };
  }

  const totalMs = responseTimes.reduce((sum, rt) => sum + rt.durationMs, 0);
  const averageMs = totalMs / responseTimes.length;

  const skimmedQuestions = responseTimes
    .filter(rt => rt.durationMs < 800)
    .map(rt => rt.questionId);

  const rushingPercentage = skimmedQuestions.length / responseTimes.length;

  return {
    detected: averageMs < 1500,
    averageMs,
    skimmedQuestions,
    rushingPercentage,
  };
}
```

### 5.4 Combined Data Quality Assessment

```typescript
/**
 * Combine all pattern detection signals into a single data quality verdict.
 *
 * - "good": no flags triggered
 * - "suspect": one flag triggered (apply adjustments, proceed with results)
 * - "unreliable": two or more flags (show results with heavy caveats,
 *   suggest retaking the assessment)
 */
export function assessDataQuality(
  straightLining: boolean,
  randomResponding: boolean,
  rushing: boolean,
): 'good' | 'suspect' | 'unreliable' {
  const flagCount = [straightLining, randomResponding, rushing]
    .filter(Boolean).length;

  if (flagCount >= 2) return 'unreliable';
  if (flagCount === 1) return 'suspect';
  return 'good';
}
```

---

## 6. Anchoring Bias Mitigation

### 6.1 Question Randomization Engine

```typescript
// frontend: src/lib/assessment-randomization.ts

export interface RandomizationConfig {
  /** Seed for deterministic shuffling (stored per session for reproducibility) */
  seed: number;
  /** Maximum consecutive questions from the same RIASEC type */
  maxConsecutiveSameType: number;
  /** Whether to randomize option order within questions */
  randomizeOptions: boolean;
}

/**
 * Seeded PRNG (Mulberry32) for deterministic randomization.
 * The seed is generated once per assessment session and sent to the backend
 * so the original question order can be reconstructed for analysis.
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface QuestionItem {
  id: string;
  riasecType?: string;  // R, I, A, S, E, C -- only for RIASEC phase
  options: Array<{ value: string; label: string }>;
}

/**
 * Randomize questions within a phase with constraints:
 *
 * 1. No RIASEC type appears more than maxConsecutiveSameType times in a row
 * 2. Option order within each question is shuffled
 * 3. For value-pair questions, which value appears first is randomized
 * 4. Desirability trap items are inserted at random positions (not first or last)
 *
 * Algorithm: Fisher-Yates shuffle with constraint repair.
 * If a shuffle violates the consecutive-type constraint, swap the offending
 * item with the next item of a different type.
 */
export function randomizePhase(
  questions: QuestionItem[],
  config: RandomizationConfig,
): QuestionItem[] {
  const rng = mulberry32(config.seed);

  // Step 1: Fisher-Yates shuffle
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Step 2: Repair consecutive-type violations (RIASEC phase only)
  if (shuffled.some(q => q.riasecType)) {
    repairConsecutiveTypes(shuffled, config.maxConsecutiveSameType, rng);
  }

  // Step 3: Randomize option order within each question
  if (config.randomizeOptions) {
    for (const q of shuffled) {
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }
    }
  }

  return shuffled;
}

function repairConsecutiveTypes(
  questions: QuestionItem[],
  maxConsecutive: number,
  rng: () => number,
): void {
  for (let i = maxConsecutive; i < questions.length; i++) {
    const current = questions[i].riasecType;
    if (!current) continue;

    // Check if the last maxConsecutive items all have the same type
    let allSame = true;
    for (let j = 1; j <= maxConsecutive; j++) {
      if (questions[i - j]?.riasecType !== current) {
        allSame = false;
        break;
      }
    }

    if (allSame) {
      // Find next item with a different type and swap
      for (let k = i + 1; k < questions.length; k++) {
        if (questions[k].riasecType !== current) {
          [questions[i], questions[k]] = [questions[k], questions[i]];
          break;
        }
      }
    }
  }
}
```

### 6.2 Counter-Anchoring After Micro-Feedback

The existing assessment shows brief feedback between phases. After each micro-feedback screen, insert a de-anchoring prompt:

```typescript
// frontend: src/components/DeAnchoringPrompt.tsx

export interface DeAnchoringPromptProps {
  phase: number;
  onContinue: (response: DeAnchoringResponse) => void;
}

export interface DeAnchoringResponse {
  /** Free-text: what feels most true, ignoring what they just saw */
  freeResponse: string;
  /** Did the micro-feedback feel accurate? */
  feedbackAccuracy: 'spot_on' | 'mostly_right' | 'somewhat_off' | 'way_off';
}

/**
 * Prompt text varies by phase to avoid repetition:
 *
 * Phase 1->2: "Setting aside what you just saw, what type of work
 *              genuinely excites you on a Sunday afternoon?"
 *
 * Phase 2->3: "Forget the labels for a moment -- describe your ideal
 *              workday in one sentence."
 *
 * Phase 3->4: "If money and status didn't exist, what would you
 *              spend your time doing?"
 *
 * Phase 4->5: "What's one thing about your career goals that no
 *              assessment could capture?"
 */
export const DE_ANCHORING_PROMPTS: Record<number, string> = {
  1: 'Setting aside what you just saw, what type of work genuinely excites you on a Sunday afternoon?',
  2: 'Forget the labels for a moment -- describe your ideal workday in one sentence.',
  3: 'If money and status didn\'t exist, what would you spend your time doing?',
  4: 'What\'s one thing about your career goals that no assessment could capture?',
};
```

### 6.3 De-Anchoring Scoring Use

The de-anchoring free-text responses are stored but not algorithmically scored in v1. They serve two purposes:

1. **Cognitive reset** -- the act of reflecting breaks the anchoring effect
2. **Future NLP analysis** -- when PathWise adds NLP capabilities, these responses become a ground-truth signal for validating assessment accuracy

---

## 7. Dunning-Kruger Compensation

### 7.1 Calibration Items

Three general-knowledge questions with confidence ratings, presented before the aptitude self-assessment (Step 5: Skills & Experience).

```typescript
// backend/assessment/bias/dunning-kruger.ts

export interface CalibrationItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  /** Index of correct answer in options array */
  correctIndex: number;
}

export const CALIBRATION_ITEMS: CalibrationItem[] = [
  {
    id: 'cal_1',
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Canberra', 'Melbourne', 'Brisbane'],
    correctAnswer: 'Canberra',
    correctIndex: 1,
  },
  {
    id: 'cal_2',
    question: 'Which planet in our solar system has the most known moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correctAnswer: 'Saturn',
    correctIndex: 1,
  },
  {
    id: 'cal_3',
    question: 'What year did World War I end?',
    options: ['1916', '1917', '1918', '1919'],
    correctAnswer: '1918',
    correctIndex: 2,
  },
];

export type ConfidenceLevel = 25 | 50 | 75 | 100;

export interface CalibrationAnswer {
  itemId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
}
```

### 7.2 Calibration Factor Computation

```typescript
export interface CalibrationResult {
  /** Factor to multiply aptitude self-assessments by */
  factor: number;
  /** Raw over/under confidence magnitude */
  calibrationGap: number;
  /** Human-readable label */
  label: 'overconfident' | 'well_calibrated' | 'underconfident';
  /** Per-item breakdown for debugging */
  itemResults: CalibrationAnswer[];
}

/**
 * Compute calibration factor from general-knowledge calibration items.
 *
 * Method:
 * 1. For each item, compare confidence (25-100%) to accuracy (0 or 100%).
 * 2. Compute the mean confidence and mean accuracy across all items.
 * 3. calibrationGap = meanConfidence - meanAccuracy
 *    - Positive gap = overconfident (Dunning-Kruger effect)
 *    - Zero gap = well-calibrated
 *    - Negative gap = underconfident (imposter syndrome)
 * 4. Convert gap to a multiplicative factor for aptitude self-assessment:
 *    - factor = 1.0 - (gap / 200)
 *    - Clamped to [0.70, 1.30] to prevent extreme adjustments
 *
 * Example:
 *   User gets 1/3 correct (accuracy = 33%) but averages 83% confidence.
 *   Gap = 83 - 33 = 50. Factor = 1.0 - 50/200 = 0.75.
 *   Their "expert" self-rating on Python becomes 0.75 * expert = advanced.
 */
export function computeCalibration(
  calibrationAnswers: CalibrationAnswer[],
): CalibrationResult {
  if (calibrationAnswers.length === 0) {
    return {
      factor: 1.0,
      calibrationGap: 0,
      label: 'well_calibrated',
      itemResults: [],
    };
  }

  const meanConfidence =
    calibrationAnswers.reduce((sum, a) => sum + a.confidence, 0) /
    calibrationAnswers.length;

  const meanAccuracy =
    (calibrationAnswers.filter(a => a.isCorrect).length /
      calibrationAnswers.length) *
    100;

  const gap = meanConfidence - meanAccuracy;

  // Convert gap to factor: 50-point gap -> 0.75x, -50-point gap -> 1.25x
  const rawFactor = 1.0 - gap / 200;
  const factor = Math.max(0.70, Math.min(1.30, rawFactor));

  let label: CalibrationResult['label'];
  if (gap > 15) label = 'overconfident';
  else if (gap < -15) label = 'underconfident';
  else label = 'well_calibrated';

  return { factor, calibrationGap: gap, label, itemResults: calibrationAnswers };
}
```

### 7.3 Applying Calibration to Aptitude Self-Assessment

```typescript
/**
 * Aptitude skill levels in the existing system (from experience-modifiers.ts).
 * These map to numeric values for calibration adjustment.
 */
const SKILL_LEVEL_VALUES: Record<string, number> = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const VALUE_TO_LEVEL: Record<number, string> = {
  0: 'none',
  1: 'beginner',
  2: 'intermediate',
  3: 'advanced',
  4: 'expert',
};

/**
 * Adjust self-reported skill levels using the calibration factor.
 *
 * Only adjusts downward for overconfidence (factor < 1.0).
 * Underconfidence adjustment (factor > 1.0) is capped more
 * conservatively since inflating skills has higher downside risk.
 */
export function adjustAptitudeForCalibration(
  selfReportedSkills: Record<string, string>,
  calibration: CalibrationResult,
): Record<string, string> {
  const adjusted: Record<string, string> = {};

  for (const [skill, level] of Object.entries(selfReportedSkills)) {
    const numericValue = SKILL_LEVEL_VALUES[level] ?? 0;
    let adjustedValue: number;

    if (calibration.factor < 1.0) {
      // Overconfident: apply full factor
      adjustedValue = numericValue * calibration.factor;
    } else {
      // Underconfident: apply half the upward adjustment (conservative)
      const boost = (calibration.factor - 1.0) * 0.5 + 1.0;
      adjustedValue = numericValue * boost;
    }

    // Round to nearest valid level, clamped to [0, 4]
    const clamped = Math.max(0, Math.min(4, Math.round(adjustedValue)));
    adjusted[skill] = VALUE_TO_LEVEL[clamped] ?? 'none';
  }

  return adjusted;
}
```

---

## 8. Gender and Cultural Bias Mitigation

### 8.1 Gendered Language Audit

All question text has been audited against these rules. This section defines the automated linting rules for future question additions.

```typescript
// backend/assessment/bias/language-audit.ts

/**
 * Patterns that indicate gendered or culturally biased language.
 * Used as a lint step in CI for any changes to question bank files.
 */
export const BIAS_PATTERNS = {
  genderedOccupations: [
    /\b(fireman|policeman|chairman|businessman|stewardess|waitress|actress)\b/i,
    /\b(male nurse|female engineer|lady doctor|woman scientist)\b/i,
  ],
  genderedPronouns: [
    /\b(he|him|his|she|her|hers)\b/i,  // flag for review; "they/them" preferred
  ],
  culturalAssumptions: [
    /\b(Super Bowl|Thanksgiving|Fourth of July|prom|homecoming)\b/i,
    /\b(freshman|sophomore|junior|senior)\b/i,  // US education terms
    /\b(401k|IRA|Social Security)\b/i,           // US financial terms
    /\$([\d,]+)/,                                 // USD-specific amounts
  ],
  idioms: [
    /\b(ballpark|home run|touchdown|slam dunk|curveball)\b/i,  // US sports
    /\b(pulling your weight|burning the midnight oil)\b/i,
    /\b(piece of cake|low-hanging fruit)\b/i,
  ],
  stereotypeActivation: [
    /\bnursing\b.*\b(caring|gentle|nurturing)\b/i,
    /\bengineering\b.*\b(logical|analytical|tough)\b/i,
    /\bleadership\b.*\b(assertive|dominant|aggressive)\b/i,
  ],
} as const;

export interface AuditFinding {
  questionId: string;
  pattern: string;
  category: keyof typeof BIAS_PATTERNS;
  matchedText: string;
  suggestion: string;
}

/**
 * Audit a set of question texts for bias patterns.
 * Designed to run in CI as a lint step.
 */
export function auditQuestionText(
  questions: Array<{ id: string; text: string }>,
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  for (const q of questions) {
    for (const [category, patterns] of Object.entries(BIAS_PATTERNS)) {
      for (const pattern of patterns) {
        const match = q.text.match(pattern);
        if (match) {
          findings.push({
            questionId: q.id,
            pattern: pattern.source,
            category: category as keyof typeof BIAS_PATTERNS,
            matchedText: match[0],
            suggestion: getSuggestion(category as keyof typeof BIAS_PATTERNS, match[0]),
          });
        }
      }
    }
  }

  return findings;
}

function getSuggestion(category: keyof typeof BIAS_PATTERNS, matched: string): string {
  switch (category) {
    case 'genderedOccupations':
      return `Replace "${matched}" with a gender-neutral term (e.g., firefighter, police officer, chairperson)`;
    case 'genderedPronouns':
      return `Consider using "they/them/their" or rephrasing to avoid gendered pronouns`;
    case 'culturalAssumptions':
      return `Replace "${matched}" with a culturally neutral equivalent`;
    case 'idioms':
      return `Replace "${matched}" with plain language that translates across cultures`;
    case 'stereotypeActivation':
      return `Rephrase to decouple the occupation from the stereotyped trait`;
    default:
      return `Review for potential bias: "${matched}"`;
  }
}
```

### 8.2 Cultural Context: Collectivist vs. Individualist Framing

```typescript
/**
 * Decision-context question from cross-cultural career research.
 * Determines whether the user's career decision-making is primarily
 * individual or collective, which affects how to interpret values
 * and work-environment answers.
 *
 * This is inserted as env5 in the Environment phase.
 */
export const CULTURAL_CONTEXT_QUESTION = {
  id: 'env5',
  q: 'When making a major career decision, whose input matters most?',
  options: [
    { value: 'self', label: 'My own analysis -- I trust my judgment' },
    { value: 'family', label: 'My family\'s perspective -- their support matters deeply' },
    { value: 'mentors', label: 'Mentors and advisors -- I seek expert guidance' },
    { value: 'community', label: 'My community\'s expectations -- I consider my role in the group' },
  ],
} as const;

export type DecisionContext = 'individualist' | 'collectivist' | 'balanced';

/**
 * Map the cultural context answer to a framing adjustment.
 *
 * - Individualist (self, mentors): interpret autonomy/prestige values at face value
 * - Collectivist (family, community): interpret autonomy as "autonomy for the group" --
 *   weight impact/purpose values higher, reduce weight on prestige
 * - Balanced: no adjustment
 */
export function classifyDecisionContext(answer: string): DecisionContext {
  switch (answer) {
    case 'self':
      return 'individualist';
    case 'family':
    case 'community':
      return 'collectivist';
    case 'mentors':
      return 'balanced';
    default:
      return 'balanced';
  }
}

/**
 * Adjust values scores based on cultural framing.
 *
 * For collectivist users:
 * - Boost "purpose" and "impact" values by 15%
 * - Reduce "prestige" value by 10% (prestige in collectivist cultures
 *   often means "family honor" not "personal status")
 * - Weight "isolation" frustration higher (collectivist users find
 *   isolation more frustrating than the raw score suggests)
 */
export function adjustForCulturalContext(
  valuesScores: Record<string, number>,
  context: DecisionContext,
): Record<string, number> {
  if (context === 'balanced' || context === 'individualist') {
    return { ...valuesScores };
  }

  const adjusted = { ...valuesScores };

  // Collectivist adjustments
  if (adjusted['purpose'] !== undefined) adjusted['purpose'] *= 1.15;
  if (adjusted['impact'] !== undefined) adjusted['impact'] *= 1.15;
  if (adjusted['prestige'] !== undefined) adjusted['prestige'] *= 0.90;
  if (adjusted['isolation'] !== undefined) adjusted['isolation'] *= 1.20;

  return adjusted;
}
```

### 8.3 Existing Assessment Audit Results

The current PathWise question bank (assessment-question-bank.md) was designed with activity-based phrasing per O*NET methodology. The RIASEC phase explicitly avoids occupational titles in stems. Current audit status:

- **Gendered language:** PASS -- no gendered terms found
- **Cultural assumptions:** PASS -- no US-specific references in question stems
- **Stereotype activation:** PASS -- questions describe activities, not identity groups
- **Idioms:** One finding: "wears many hats" in env2 option -- recommend replacing with "handles varied responsibilities"

---

## 9. Confidence Weighting System

### 9.1 Per-Answer Confidence from Response Time

```typescript
// backend/assessment/bias/confidence.ts

export interface WeightedAnswer {
  questionId: string;
  value: string | string[];
  responseTimeMs: number;
  implicitConfidence: number;
}

/**
 * Derive implicit confidence from response time.
 *
 * The relationship between response time and confidence follows a U-curve:
 * - Very fast (< 2s): high confidence OR not reading (check rushing flag)
 * - Medium (2-8s): moderate confidence, normal deliberation
 * - Slow (8-20s): low confidence, high deliberation
 * - Very slow (> 20s): likely distracted, not meaningful signal
 *
 * We use a piecewise function clamped to [0.0, 1.0].
 * If the rushing flag is active, fast responses get LOW confidence instead.
 */
export function deriveImplicitConfidence(
  responseTimeMs: number,
  isRushing: boolean,
): number {
  const seconds = responseTimeMs / 1000;

  if (seconds > 20) {
    // Likely distracted -- assign neutral confidence
    return 0.5;
  }

  if (seconds < 2) {
    // Fast: high confidence if not rushing, low if rushing
    return isRushing ? 0.2 : 0.9;
  }

  if (seconds <= 8) {
    // Normal range: linear interpolation from 0.8 (2s) to 0.5 (8s)
    return 0.8 - ((seconds - 2) / 6) * 0.3;
  }

  // Slow (8-20s): deliberating, lower confidence
  // Linear from 0.5 (8s) to 0.3 (20s)
  return 0.5 - ((seconds - 8) / 12) * 0.2;
}
```

### 9.2 Dimension-Level Confidence

```typescript
export interface DimensionConfidence {
  dimension: string;
  confidence: number;
  components: {
    answerCount: number;
    consistency: number;       // from consistency checker
    responseTimeVariance: number;
    meanImplicitConfidence: number;
  };
}

/**
 * Compute confidence for an entire dimension (e.g., "Realistic" RIASEC score).
 *
 * Confidence is a composite of:
 * 1. Answer count (more answers = higher confidence) -- 30% weight
 * 2. Internal consistency for this dimension -- 35% weight
 * 3. Mean implicit confidence from response times -- 20% weight
 * 4. Response time variance (low variance = consistent engagement) -- 15% weight
 *
 * Returns a value in [0.0, 1.0].
 */
export function computeDimensionConfidence(
  answers: WeightedAnswer[],
  expectedCount: number,
  consistencyScore: number,
): DimensionConfidence & { confidence: number } {
  if (answers.length === 0) {
    return {
      dimension: '',
      confidence: 0,
      components: {
        answerCount: 0,
        consistency: 0,
        responseTimeVariance: 0,
        meanImplicitConfidence: 0,
      },
    };
  }

  // Component 1: Answer completeness
  const completeness = Math.min(1.0, answers.length / expectedCount);

  // Component 2: Consistency (passed in from consistency checker)
  const consistency = consistencyScore;

  // Component 3: Mean implicit confidence
  const meanConfidence =
    answers.reduce((sum, a) => sum + a.implicitConfidence, 0) / answers.length;

  // Component 4: Response time variance (normalized)
  const times = answers.map(a => a.responseTimeMs);
  const meanTime = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + (t - meanTime) ** 2, 0) / times.length;
  const normalizedVariance = Math.max(0, 1.0 - variance / 100_000_000);
  // 100M ms^2 = high variance threshold (10s standard deviation)

  const confidence =
    completeness * 0.30 +
    consistency * 0.35 +
    meanConfidence * 0.20 +
    normalizedVariance * 0.15;

  return {
    dimension: '',
    confidence: Math.max(0, Math.min(1.0, confidence)),
    components: {
      answerCount: answers.length,
      consistency,
      responseTimeVariance: variance,
      meanImplicitConfidence: meanConfidence,
    },
  };
}
```

### 9.3 Confidence Bands in Results

```typescript
/**
 * Convert dimension confidence to a display band shown alongside results.
 *
 * High confidence (>= 0.7): solid recommendation, tight band
 * Medium confidence (0.4-0.7): directional signal, wider band
 * Low confidence (< 0.4): exploratory signal, suggest deeper assessment
 */
export type ConfidenceBand = 'high' | 'medium' | 'low';

export function toConfidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

/**
 * User-facing confidence messaging.
 * Never says "we don't trust your answers" -- frames as signal strength.
 */
export const CONFIDENCE_MESSAGES: Record<ConfidenceBand, string> = {
  high: 'Strong signal -- your answers show a clear and consistent pattern in this area.',
  medium: 'Directional signal -- we see a pattern but it could sharpen with more exploration.',
  low: 'Early signal -- consider exploring this area more before making decisions.',
};
```

---

## 10. Recalibration Flow

### 10.1 Data Model

```typescript
// backend/assessment/bias/recalibration.ts

export interface RecalibrationData {
  userId: string;
  assessmentId: string;
  /** Which result surprised the user */
  surprisedBy: string;
  /** What career they expected to see */
  expectedCareer: string;
  /** Per-dimension accuracy feedback */
  dimensionFeedback: DimensionFeedbackItem[];
  /** Overall accuracy rating */
  overallAccuracy: 1 | 2 | 3 | 4 | 5;
  /** Timestamp */
  submittedAt: string;
}

export interface DimensionFeedbackItem {
  dimension: string;
  direction: 'too_high' | 'too_low' | 'accurate';
}
```

### 10.2 Individual Score Adjustment

```typescript
/**
 * Apply recalibration feedback to adjust the user's scores.
 *
 * When a user says a dimension is "too_high" or "too_low," we apply
 * a modest adjustment (10% toward the indicated direction) and re-run
 * career matching.
 *
 * This is NOT a free override -- the adjustment is capped and logged.
 * Users can recalibrate at most once per assessment to prevent gaming.
 */
export function applyRecalibration(
  currentScores: Record<string, number>,
  feedback: DimensionFeedbackItem[],
  populationMeans: Record<string, number>,
): Record<string, number> {
  const adjusted = { ...currentScores };
  const RECALIBRATION_MAGNITUDE = 0.10;

  for (const item of feedback) {
    if (item.direction === 'accurate') continue;

    const current = adjusted[item.dimension];
    const mean = populationMeans[item.dimension];
    if (current === undefined || mean === undefined) continue;

    if (item.direction === 'too_high') {
      // Pull toward mean (reduce score)
      adjusted[item.dimension] = current - RECALIBRATION_MAGNITUDE * (current - mean);
    } else {
      // Push away from mean (increase score)
      adjusted[item.dimension] = current + RECALIBRATION_MAGNITUDE * Math.abs(current - mean);
    }
  }

  return adjusted;
}
```

### 10.3 Aggregate Question Bias Detection

```typescript
/**
 * Aggregate recalibration feedback to detect systematically biased questions.
 *
 * If > 30% of users who recalibrate flag the same dimension as "too_high"
 * or "too_low," that dimension's questions are candidates for revision.
 *
 * This runs as a scheduled batch job (daily or weekly).
 */
export interface QuestionBiasReport {
  dimension: string;
  tooHighPercentage: number;
  tooLowPercentage: number;
  accuratePercentage: number;
  totalFeedbackCount: number;
  flagged: boolean;
  flagDirection: 'systematically_high' | 'systematically_low' | null;
}

export function computeQuestionBiasReport(
  allFeedback: DimensionFeedbackItem[],
  dimension: string,
): QuestionBiasReport {
  const dimFeedback = allFeedback.filter(f => f.dimension === dimension);
  const total = dimFeedback.length;

  if (total < 10) {
    // Insufficient data
    return {
      dimension,
      tooHighPercentage: 0,
      tooLowPercentage: 0,
      accuratePercentage: 0,
      totalFeedbackCount: total,
      flagged: false,
      flagDirection: null,
    };
  }

  const tooHigh = dimFeedback.filter(f => f.direction === 'too_high').length;
  const tooLow = dimFeedback.filter(f => f.direction === 'too_low').length;
  const accurate = dimFeedback.filter(f => f.direction === 'accurate').length;

  const tooHighPct = tooHigh / total;
  const tooLowPct = tooLow / total;

  let flagged = false;
  let flagDirection: QuestionBiasReport['flagDirection'] = null;

  if (tooHighPct > 0.30) {
    flagged = true;
    flagDirection = 'systematically_high';
  } else if (tooLowPct > 0.30) {
    flagged = true;
    flagDirection = 'systematically_low';
  }

  return {
    dimension,
    tooHighPercentage: tooHighPct,
    tooLowPercentage: tooLowPct,
    accuratePercentage: accurate / total,
    totalFeedbackCount: total,
    flagged,
    flagDirection,
  };
}
```

---

## 11. Data Model and Migration

### 11.1 New Tables

```sql
-- Migration: 3_add_bias_mitigation.up.sql

-- Stores per-assessment bias detection results
CREATE TABLE assessment_bias_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL REFERENCES assessments(user_id) ON DELETE CASCADE,
    assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Social desirability
    sd_endorsed_count    SMALLINT NOT NULL DEFAULT 0,
    sd_endorsed_items    JSONB NOT NULL DEFAULT '[]',
    sd_regression_factor REAL NOT NULL DEFAULT 0,

    -- Consistency
    consistency_score      REAL NOT NULL DEFAULT 1.0,
    consistency_flags      JSONB NOT NULL DEFAULT '[]',
    consistency_below_threshold BOOLEAN NOT NULL DEFAULT FALSE,

    -- Pattern detection
    straight_lining    BOOLEAN NOT NULL DEFAULT FALSE,
    random_responding  BOOLEAN NOT NULL DEFAULT FALSE,
    rushing            BOOLEAN NOT NULL DEFAULT FALSE,
    data_quality       TEXT NOT NULL DEFAULT 'good' CHECK (data_quality IN ('good', 'suspect', 'unreliable')),
    avg_response_time_ms INTEGER,
    longest_streak     SMALLINT DEFAULT 0,

    -- Dunning-Kruger calibration
    calibration_factor     REAL NOT NULL DEFAULT 1.0,
    calibration_gap        REAL NOT NULL DEFAULT 0,
    calibration_label      TEXT DEFAULT 'well_calibrated',

    -- Cultural context
    decision_context       TEXT DEFAULT 'balanced',

    -- Confidence
    dimension_confidences  JSONB NOT NULL DEFAULT '{}',

    -- Metadata
    randomization_seed     INTEGER,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bias_reports_user_id ON assessment_bias_reports(user_id);
CREATE INDEX idx_bias_reports_data_quality ON assessment_bias_reports(data_quality);

-- Stores response timing data per question
CREATE TABLE assessment_response_times (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL,
    question_id   TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL,
    answer_value  TEXT NOT NULL,
    phase         SMALLINT NOT NULL,
    position_in_phase SMALLINT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_response_times_user_id ON assessment_response_times(user_id);

-- Stores recalibration feedback
CREATE TABLE assessment_recalibrations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          TEXT NOT NULL,
    surprised_by     TEXT,
    expected_career  TEXT,
    dimension_feedback JSONB NOT NULL DEFAULT '[]',
    overall_accuracy SMALLINT NOT NULL CHECK (overall_accuracy BETWEEN 1 AND 5),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recalibrations_user_id ON assessment_recalibrations(user_id);

-- Aggregate question bias signals (populated by batch job)
CREATE TABLE question_bias_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension        TEXT NOT NULL,
    report_date      DATE NOT NULL,
    too_high_pct     REAL NOT NULL,
    too_low_pct      REAL NOT NULL,
    accurate_pct     REAL NOT NULL,
    total_feedback   INTEGER NOT NULL,
    flagged          BOOLEAN NOT NULL DEFAULT FALSE,
    flag_direction   TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_bias_dimension ON question_bias_log(dimension, report_date);

-- Population means for desirability regression (updated by batch job)
CREATE TABLE assessment_population_means (
    dimension    TEXT PRIMARY KEY,
    mean_value   REAL NOT NULL,
    sample_size  INTEGER NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 11.2 Assessments Table Update

```sql
-- Add columns to existing assessments table for bias-adjusted results
ALTER TABLE assessments
    ADD COLUMN IF NOT EXISTS bias_report_id UUID REFERENCES assessment_bias_reports(id),
    ADD COLUMN IF NOT EXISTS adjusted_scores JSONB,
    ADD COLUMN IF NOT EXISTS confidence_bands JSONB,
    ADD COLUMN IF NOT EXISTS recalibrated BOOLEAN NOT NULL DEFAULT FALSE;
```

---

## 12. API Contract

### 12.1 Extended Submit Assessment

The existing `POST /assessment` endpoint gains additional fields in the request body:

```typescript
export interface SubmitAssessmentParamsV2 extends SubmitAssessmentParams {
  /** Response timing per question (captured by frontend) */
  responseTimes: Array<{
    questionId: string;
    durationMs: number;
    phase: number;
    positionInPhase: number;
  }>;

  /** Social desirability trap answers */
  trapAnswers: Record<string, number>;

  /** Calibration item answers */
  calibrationAnswers: Array<{
    itemId: string;
    selectedAnswer: string;
    confidence: 25 | 50 | 75 | 100;
  }>;

  /** Cultural context answer */
  culturalContext: string;

  /** Randomization seed used by frontend */
  randomizationSeed: number;

  /** De-anchoring responses (optional, stored for future analysis) */
  deAnchoringResponses?: Array<{
    phase: number;
    freeResponse: string;
    feedbackAccuracy: string;
  }>;
}
```

### 12.2 Extended Response

```typescript
export interface AssessmentResultV2 extends AssessmentResult {
  /** Per-dimension confidence bands */
  confidenceBands: Record<string, ConfidenceBand>;
  /** Overall data quality indicator */
  dataQuality: 'good' | 'suspect' | 'unreliable';
  /** Whether calibration was applied */
  calibrationApplied: boolean;
  calibrationLabel: 'overconfident' | 'well_calibrated' | 'underconfident';
  /** Message shown if data quality is suspect/unreliable */
  qualityMessage?: string;
}
```

### 12.3 Recalibration Endpoint

```
POST /assessment/recalibrate

Request:
  RecalibrationData (see section 10.1)

Response:
  {
    result: AssessmentResultV2;
    adjustmentsSummary: string;  // human-readable summary of what changed
  }
```

### 12.4 Admin: Bias Analytics

```
GET /admin/bias-analytics

Response:
  {
    dataQualityDistribution: { good: number; suspect: number; unreliable: number };
    averageDesirabilityScore: number;
    averageCalibrationGap: number;
    flaggedDimensions: QuestionBiasReport[];
    recalibrationRate: number;  // % of users who use recalibration
  }
```

---

## 13. Integration with Career Brain

### 13.1 Pipeline Orchestration

The bias mitigation pipeline sits between raw answer collection and the existing `getTopCareerMatches()` call in `assessment.ts`:

```typescript
// backend/assessment/bias/pipeline.ts

import { detectSocialDesirability, adjustForDesirability } from './social-desirability';
import { computeConsistency } from './consistency';
import { detectStraightlining, detectRushing, assessDataQuality } from './pattern-detection';
import { computeCalibration, adjustAptitudeForCalibration } from './dunning-kruger';
import { classifyDecisionContext, adjustForCulturalContext } from './language-audit';
import { deriveImplicitConfidence, computeDimensionConfidence, toConfidenceBand } from './confidence';

export interface BiasReport {
  socialDesirability: {
    endorsedCount: number;
    regressionFactor: number;
    severity: string;
  };
  consistency: {
    score: number;
    flags: Array<{ construct: string; discrepancy: number }>;
    isBelowThreshold: boolean;
  };
  patterns: {
    straightLining: boolean;
    randomResponding: boolean;
    rushing: boolean;
    dataQuality: 'good' | 'suspect' | 'unreliable';
  };
  calibration: {
    factor: number;
    gap: number;
    label: string;
  };
  culturalContext: string;
  dimensionConfidences: Record<string, number>;
  confidenceBands: Record<string, string>;
}

/**
 * Run the full bias detection and correction pipeline.
 *
 * Order of operations:
 * 1. Pattern detection (data quality gate)
 * 2. Social desirability detection
 * 3. Consistency checking
 * 4. Dunning-Kruger calibration
 * 5. Cultural context adjustment
 * 6. Confidence weighting
 * 7. Score adjustment (composite of all above)
 *
 * If data quality is "unreliable," scores are still computed but
 * the response includes a strong caveat and suggestion to retake.
 */
export function runBiasPipeline(
  rawAnswers: Record<string, string | string[]>,
  trapAnswers: Record<string, number>,
  calibrationAnswers: Array<{
    itemId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    confidence: 25 | 50 | 75 | 100;
  }>,
  responseTimes: Array<{ questionId: string; durationMs: number }>,
  culturalContextAnswer: string,
  populationMeans: Record<string, number>,
): {
  biasReport: BiasReport;
  adjustedAnswers: Record<string, string | string[]>;
  adjustedSkills: Record<string, string>;
} {
  // 1. Pattern detection
  const orderedAnswers = responseTimes.map(rt => ({
    questionId: rt.questionId,
    value: String(rawAnswers[rt.questionId] ?? ''),
  }));
  const straightLine = detectStraightlining(orderedAnswers);
  const rushing = detectRushing(responseTimes);
  const dataQuality = assessDataQuality(
    straightLine.detected,
    false, // random responding computed separately with dimension scores
    rushing.detected,
  );

  // 2. Social desirability
  const desirability = detectSocialDesirability(
    trapAnswers as Record<'sd_1' | 'sd_2' | 'sd_3' | 'sd_4', number>,
  );

  // 3. Consistency
  const consistency = computeConsistency(rawAnswers);

  // 4. Dunning-Kruger calibration
  const calibration = computeCalibration(calibrationAnswers);

  // 5. Cultural context
  const culturalContext = classifyDecisionContext(culturalContextAnswer);

  // 6. Confidence weighting
  const isRushing = rushing.detected;
  const weightedAnswers = responseTimes.map(rt => ({
    questionId: rt.questionId,
    value: rawAnswers[rt.questionId] ?? '',
    responseTimeMs: rt.durationMs,
    implicitConfidence: deriveImplicitConfidence(rt.durationMs, isRushing),
  }));

  // Compute per-dimension confidence (placeholder: group by question prefix)
  const dimensionConfidences: Record<string, number> = {};
  const confidenceBands: Record<string, string> = {};

  const dimensionGroups: Record<string, typeof weightedAnswers> = {};
  for (const wa of weightedAnswers) {
    const prefix = wa.questionId.replace(/[_\d]+$/, '');
    if (!dimensionGroups[prefix]) dimensionGroups[prefix] = [];
    dimensionGroups[prefix].push(wa);
  }

  for (const [dim, group] of Object.entries(dimensionGroups)) {
    const dc = computeDimensionConfidence(group, 4, consistency.score);
    dimensionConfidences[dim] = dc.confidence;
    confidenceBands[dim] = toConfidenceBand(dc.confidence);
  }

  // 7. Build bias report
  const biasReport: BiasReport = {
    socialDesirability: {
      endorsedCount: desirability.endorsedCount,
      regressionFactor: desirability.regressionFactor,
      severity: desirability.severity,
    },
    consistency: {
      score: consistency.score,
      flags: consistency.flags.map(f => ({
        construct: f.construct,
        discrepancy: f.discrepancy,
      })),
      isBelowThreshold: consistency.isBelowThreshold,
    },
    patterns: {
      straightLining: straightLine.detected,
      randomResponding: false, // computed post-scoring
      rushing: rushing.detected,
      dataQuality,
    },
    calibration: {
      factor: calibration.factor,
      gap: calibration.calibrationGap,
      label: calibration.label,
    },
    culturalContext,
    dimensionConfidences,
    confidenceBands,
  };

  // Note: actual score adjustment happens in the caller (assessment.ts)
  // by calling adjustForDesirability, adjustAptitudeForCalibration, etc.
  // This pipeline returns the report; the caller applies it.

  return {
    biasReport,
    adjustedAnswers: rawAnswers, // caller applies adjustments
    adjustedSkills: {},          // caller applies calibration
  };
}
```

### 13.2 Integration Point in assessment.ts

The integration touches the `submitAssessment` handler. The bias pipeline runs before `getTopCareerMatches()`:

```typescript
// In submitAssessment handler (assessment.ts), after parameter validation:

// 1. Run bias pipeline
const { biasReport } = runBiasPipeline(
  params.rawAnswers ?? {},
  params.trapAnswers,
  params.calibrationAnswers.map(ca => ({
    ...ca,
    isCorrect: CALIBRATION_ITEMS.find(ci => ci.id === ca.itemId)?.correctAnswer === ca.selectedAnswer,
  })),
  params.responseTimes,
  params.culturalContext,
  await getPopulationMeans(),  // from assessment_population_means table
);

// 2. Apply score adjustments before career matching
//    (desirability regression, calibration, cultural context)

// 3. Pass adjusted data to getTopCareerMatches()

// 4. Store bias report in assessment_bias_reports table

// 5. Include confidence bands in response
```

---

## 14. Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Frontend fails to capture response times | No rushing/confidence detection | Default to neutral confidence (0.5); log warning |
| User skips calibration items | No Dunning-Kruger compensation | Skip calibration; factor = 1.0 |
| User doesn't answer trap items | No social desirability check | Skip; regressionFactor = 0 |
| Population means table empty (cold start) | Desirability regression uses wrong baseline | Fall back to `INITIAL_POPULATION_MEANS` constants |
| Bias pipeline throws exception | Assessment blocked entirely | **Critical:** wrap pipeline in try/catch; on failure, proceed with raw scores and log the error. Never block assessment completion. |
| Data quality = "unreliable" | Results may be misleading | Show results with caveats + "retake" prompt. Do NOT refuse to show results. |
| Recalibration endpoint fails | User stuck with inaccurate results | Return existing results unchanged; surface error to user with retry option |

### Graceful Degradation Guarantee

Every module in the bias pipeline is independently optional. If any module fails or receives insufficient data, the pipeline continues with that module's output set to its neutral/default value. The career brain always receives valid input and always produces results.

---

## 15. Open Questions

1. **Trap item visibility** -- Should we disclose to users that some questions measure response style? Ethical best practice says yes (debrief after results), but it may reduce trap effectiveness.

2. **Recalibration limit** -- Currently capped at one recalibration per assessment. Should we allow multiple with diminishing adjustment magnitude?

3. **Population means update frequency** -- Daily cron vs. on-every-100th-assessment? Depends on user volume.

4. **Calibration item selection** -- The three general-knowledge items are fixed. Should we rotate from a pool to prevent memorization by repeat users?

5. **NLP for de-anchoring responses** -- When should we invest in analyzing free-text de-anchoring responses? This is low priority until v2 question bank is live.

6. **A/B testing framework** -- Should we instrument the bias pipeline to A/B test different regression factors and thresholds? This would allow data-driven tuning but adds implementation complexity.

7. **Privacy implications** -- Response timing data is behavioral metadata. Should it be subject to the same retention policies as PII? Recommend treating it as sensitive data with the same TTL.

---

## Appendix A: Phased Rollout Plan

| Phase | Modules | Effort | Prerequisite |
|-------|---------|--------|-------------|
| **Phase 1** | Response timing capture (frontend), rushing detection, straight-lining detection | 1 sprint | None |
| **Phase 2** | Social desirability traps, consistency pairs, data quality flag | 1 sprint | Phase 1 |
| **Phase 3** | Dunning-Kruger calibration, cultural context question | 1 sprint | Phase 1 |
| **Phase 4** | Confidence weighting, confidence bands in UI | 1 sprint | Phases 1-3 |
| **Phase 5** | Recalibration flow (frontend + backend), aggregate bias detection | 1 sprint | Phases 1-4 |
| **Phase 6** | Question randomization engine, de-anchoring prompts | 1 sprint | Phase 2 |
| **Phase 7** | Admin bias analytics dashboard, population means auto-update | 1 sprint | Phase 5 |

---

## Appendix B: Testing Strategy

### Unit Tests (mandatory per module)

- `social-desirability.test.ts`: 0, 1, 2, 3, 4 endorsements; regression math
- `consistency.test.ts`: all-consistent, all-inconsistent, mixed, missing answers
- `pattern-detection.test.ts`: exactly 7 straight (no flag), 8 straight (flag), random alpha thresholds
- `dunning-kruger.test.ts`: overconfident, underconfident, well-calibrated, empty input
- `confidence.test.ts`: fast/slow/distracted timing, dimension aggregation
- `recalibration.test.ts`: too_high/too_low/accurate adjustments, capping behavior
- `language-audit.test.ts`: all bias patterns with positive and negative examples

### Integration Tests

- Full pipeline with realistic answer sets (happy path)
- Pipeline with all-default inputs (cold start / missing data)
- Pipeline with adversarial inputs (all traps endorsed + rushing + straight-lining)
- Recalibration flow end-to-end: submit -> view results -> recalibrate -> verify adjusted results

### E2E Tests (Playwright)

- Complete assessment with response timing capture verification
- Calibration items flow: answer + confidence selection
- Recalibration modal: "This doesn't feel right?" -> dimension feedback -> updated results
- Data quality warning display for rushing users
