# PathWise Assessment Results Experience -- Complete UX Specification

**Version:** 1.0
**Date:** 2026-04-06
**Status:** Design Spec (Pre-Implementation)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Model Extensions](#2-data-model-extensions)
3. [Results Reveal Animation](#3-results-reveal-animation)
4. [Career Identity Card](#4-career-identity-card)
5. [Career Match Cards](#5-career-match-cards)
6. [Profile Comparison View](#6-profile-comparison-view)
7. [Career Explorer](#7-career-explorer)
8. [What-If Scenario Engine](#8-what-if-scenario-engine)
9. [Narrative Profile](#9-narrative-profile)
10. [Share & Save](#10-share--save)
11. [Micro-Feedback Between Phases](#11-micro-feedback-between-phases)
12. [Recalibration Flow](#12-recalibration-flow)
13. [State Management](#13-state-management)
14. [Component Tree](#14-component-tree)
15. [API Contracts](#15-api-contracts)
16. [Accessibility & Performance](#16-accessibility--performance)
17. [Responsive Breakpoints](#17-responsive-breakpoints)
18. [Archetype Definitions](#18-archetype-definitions)

---

## 1. Architecture Overview

### Current State

The assessment flow lives in `src/pages/Assessment/index.tsx` as a single 467-line component. Steps 0-5 collect answers, step 6 shows a spinner, step 7 renders a minimal card list of career matches. The backend (`backend/assessment/`) has a 4-layer expert system (career-brain, experience-modifiers, gap-patterns, combination-rules) scoring against ~91 career profiles across 3 profile files.

### Target State

Split the monolithic Assessment page into two distinct experiences:

```
src/pages/Assessment/
  index.tsx              -- Question flow (steps 0-5), refactored
  Assessment.css         -- Existing styles

src/pages/AssessmentResults/
  index.tsx              -- Results orchestrator (reveal + routing)
  AssessmentResults.css  -- Results-specific styles
  components/
    ResultsReveal.tsx          -- Analyzing animation + progressive messages
    CareerIdentityCard.tsx     -- The shareable "fingerprint" card
    CareerMatchCard.tsx        -- Individual match card (reusable)
    CareerMatchList.tsx        -- Top matches with staggered reveal
    ProfileComparison.tsx      -- Radar overlay + gap bars
    CareerExplorer.tsx         -- Filterable grid of all careers
    WhatIfEngine.tsx           -- Skill toggle + dynamic gauge
    NarrativeProfile.tsx       -- Second-person career story
    SharePanel.tsx             -- Share/download/export actions
    MicroFeedback.tsx          -- Phase-end insight cards
    RecalibrationFlow.tsx      -- "Doesn't feel right?" modal
    ArchetypeResolver.tsx      -- Maps scores to archetype names
  charts/
    RIASECHexagon.tsx          -- SVG hexagonal radar chart
    BigFiveBarChart.tsx        -- Horizontal bar chart for OCEAN
    MatchGauge.tsx             -- Circular gauge (0-100%)
    ComparisonRadar.tsx        -- Dual-polygon radar overlay
    SkillGapBars.tsx           -- Progress bars with target markers
  hooks/
    useResultsReveal.ts        -- Animation sequencing
    useWhatIf.ts               -- Skill toggle + score recalculation
    useArchetype.ts            -- Archetype derivation from scores
    useNarrative.ts            -- Template-based narrative generation
    useCareerExplorer.ts       -- Filter/sort/pagination state
```

### Data Flow

```
Assessment Submit
  --> POST /assessment (existing)
  --> Backend: career-brain scores all 91 profiles
  --> Response: { careerMatches, skillGaps, strengths, values, personalityType }
  --> Navigate to /app/results with state
  --> ResultsReveal plays analyzing animation (3s)
  --> ArchetypeResolver computes archetype from raw answers
  --> CareerMatchList reveals cards with stagger
  --> Full results page available for exploration
```

---

## 2. Data Model Extensions

### New Frontend Types (`src/types/index.ts`)

```typescript
// ── RIASEC Profile ──────────────────────────────────────────────────
export interface RIASECProfile {
  realistic: number;      // 0-100
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

// ── Big Five (OCEAN) Profile ────────────────────────────────────────
export interface BigFiveProfile {
  openness: number;       // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ── Career Archetype ────────────────────────────────────────────────
export interface CareerArchetype {
  id: string;                       // e.g., "strategic-builder"
  name: string;                     // e.g., "The Strategic Builder"
  tagline: string;                  // e.g., "You build systems that scale"
  primaryRIASEC: string;            // Dominant RIASEC dimension
  secondaryRIASEC: string;          // Secondary RIASEC dimension
  dominantTrait: string;            // Dominant Big Five trait
  description: string;              // 2-3 sentence summary
}

// ── Extended Career Match (superset of existing CareerMatch) ───────
export interface ExtendedCareerMatch {
  title: string;
  matchScore: number;               // 0-100
  description: string;
  requiredSkills: string[];
  pathwayTime: string;
  domain: string;
  careerFamily: string;             // e.g., "Engineering", "Design"
  whyThisFits: string[];            // 3 bullet points from user answers
  salaryRange: { min: number; max: number; currency: string };
  growthOutlook: 'high' | 'moderate' | 'stable' | 'declining';
  educationRequired: string;
  dayInTheLife: string;             // 2-sentence narrative
  remoteFriendliness: 'fully_remote' | 'hybrid' | 'onsite' | 'varies';
  whatIfSkills: WhatIfSkill[];      // Skills that improve match
  skillGaps: SkillGapDetail[];
}

// ── What-If Skill ───────────────────────────────────────────────────
export interface WhatIfSkill {
  skill: string;
  currentScore: number;             // Match score without this skill
  projectedScore: number;           // Match score with this skill
  delta: number;                    // projectedScore - currentScore
  estimatedTime: string;            // e.g., "~3 months"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resourceUrl?: string;
}

// ── Skill Gap Detail ────────────────────────────────────────────────
export interface SkillGapDetail {
  skill: string;
  userLevel: number;                // 0-100
  requiredLevel: number;            // 0-100
  importance: 'critical' | 'important' | 'nice_to_have';
  gap: number;                      // requiredLevel - userLevel
}

// ── Match Score Tier ────────────────────────────────────────────────
export type MatchTier = 'excellent' | 'strong' | 'good' | 'developing';

export interface MatchTierConfig {
  tier: MatchTier;
  label: string;
  range: [number, number];
  color: string;                    // CSS custom property reference
}

// ── Full Assessment Results (enriched) ──────────────────────────────
export interface FullAssessmentResults {
  userId: string;
  completedAt: string;
  archetype: CareerArchetype;
  riasec: RIASECProfile;
  bigFive: BigFiveProfile;
  topMatches: ExtendedCareerMatch[];  // Top 5, ranked
  allMatches: ExtendedCareerMatch[];  // All 91 profiles, ranked
  strengths: string[];
  values: string[];
  personalityType: string;
  narrativeProfile: string;           // 500+ word generated text
  rawAnswers: Record<string, string[]>;
}

// ── Recalibration Feedback ──────────────────────────────────────────
export interface RecalibrationFeedback {
  expectedCareer: string;
  surprisingResult: string;
  offDimension: string;
  freeText?: string;
}
```

### Backend Response Extension

The existing `POST /assessment` response returns `careerMatches` with basic fields. The enriched results require a new endpoint or response shape:

```typescript
// NEW: POST /assessment/full-results
// Called after initial assessment submit, computes enriched data
interface FullResultsParams {
  userId: string;
}

interface FullResultsResponse {
  archetype: CareerArchetype;
  riasec: RIASECProfile;
  bigFive: BigFiveProfile;
  topMatches: ExtendedCareerMatch[];
  allMatches: ExtendedCareerMatch[];  // Paginated: first 20, load more
  narrativeProfile: string;
}
```

### Score Tier Constants

```typescript
export const MATCH_TIERS: MatchTierConfig[] = [
  { tier: 'excellent',  label: 'Excellent Match',   range: [85, 100], color: 'var(--secondary)' },       // Deep teal #006a62
  { tier: 'strong',     label: 'Strong Match',      range: [70, 84],  color: 'var(--secondary-light)' }, // Teal #00a396
  { tier: 'good',       label: 'Good Match',        range: [55, 69],  color: 'var(--surface-container-high)' },
  { tier: 'developing', label: 'Developing Match',  range: [40, 54],  color: 'var(--copper)' },          // Warm neutral #8b4f2c
];

export function getMatchTier(score: number): MatchTierConfig {
  return MATCH_TIERS.find(t => score >= t.range[0] && score <= t.range[1])
    ?? MATCH_TIERS[MATCH_TIERS.length - 1];
}
```

---

## 3. Results Reveal Animation

### Purpose
Replace the current static spinner (step 6) with a progressive, storytelling reveal that builds anticipation and perceived intelligence.

### Component: `ResultsReveal.tsx`

#### Animation Sequence (Total: ~4.5 seconds)

| Time     | Event                                | Visual                                                    |
|----------|--------------------------------------|-----------------------------------------------------------|
| 0.0s     | Phase starts                         | Fade in card with centered content                        |
| 0.0-1.2s | Message 1: "Mapping your career DNA" | Text fades in, abstract DNA helix illustration pulses     |
| 1.2-2.4s | Message 2: "Scoring 91 career paths" | Text crossfades, counter animates 0 to 91                 |
| 2.4-3.6s | Message 3: "Finding your strengths"  | Text crossfades, strength icons appear one by one          |
| 3.6-4.0s | Transition                           | Messages fade out, card expands to full width              |
| 4.0s+    | Results reveal                       | Archetype card slides up, match cards stagger in (0.3s ea) |

#### State Machine

```typescript
type RevealPhase =
  | 'analyzing_1'   // "Mapping your career DNA..."
  | 'analyzing_2'   // "Scoring 91 career paths..."
  | 'analyzing_3'   // "Finding your unique strengths..."
  | 'transitioning'  // Brief pause before reveal
  | 'archetype'      // Archetype card celebration
  | 'matches'        // Match cards stagger in
  | 'complete';      // Full results interactive
```

#### Hook: `useResultsReveal.ts`

```typescript
interface UseResultsRevealReturn {
  phase: RevealPhase;
  progress: number;           // 0-100 for progress bar
  currentMessage: string;
  isComplete: boolean;
  skipReveal: () => void;     // Allow impatient users to skip
}
```

#### Design Specs

- **Container:** Full viewport height, centered, `var(--surface-lumina)` background
- **Messages:** `font-family: var(--font-display)`, 1.5rem, `var(--on-surface)`, `opacity` transition 0.4s
- **Progress indicator:** Thin line at top of card, `var(--secondary)` fill, animated width
- **Skip affordance:** Small "Skip" text link in bottom-right, `var(--on-surface-muted)`, appears after 1.5s
- **Celebration moment (archetype reveal):** Card scales from 0.95 to 1.0 with `var(--transition-spring)`, subtle `box-shadow: var(--shadow-glow)` pulse, 3-4 small teal sparkle particles using CSS `@keyframes` (no heavy library)

#### Accessibility

- `aria-live="polite"` region wrapping the message text so screen readers announce each phase
- `role="progressbar"` on the progress indicator with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Skip button receives focus if user presses Tab during animation
- `prefers-reduced-motion: reduce` media query: collapse all animations to instant, show results immediately

#### Edge Cases

- **Slow network (data arrives after animation):** Animation loops on phase 3 with "Almost there..." until data arrives, max 15s then show error state
- **Fast network (data arrives before animation):** Data is cached, animation still plays minimum 3s for UX quality (skip button available)
- **Error during analysis:** Transition to error card with retry CTA after animation completes phase 2

---

## 4. Career Identity Card ("Career Fingerprint")

### Purpose
A visually distinctive, shareable card that summarizes the user's assessment profile. Functions as both a results header and a social sharing artifact.

### Component: `CareerIdentityCard.tsx`

#### Layout (Desktop: 720px wide, Mobile: full-width)

```
+------------------------------------------------------------------+
|                                                                    |
|  [PathWise logo, small]                    [Share icon]            |
|                                                                    |
|  -------- YOUR CAREER FINGERPRINT --------                         |
|                                                                    |
|  +---------------------------+  +----------------------------+     |
|  |                           |  |                            |     |
|  |    RIASEC Hexagon         |  |    "The Strategic Builder" |     |
|  |    (radar chart,          |  |                            |     |
|  |     filled polygon)       |  |    "You build systems     |     |
|  |                           |  |     that scale."           |     |
|  |                           |  |                            |     |
|  +---------------------------+  |    Big Five Bars:          |     |
|                                 |    O ████████░░ 82         |     |
|                                 |    C █████████░ 91         |     |
|                                 |    E ██████░░░░ 64         |     |
|                                 |    A █████░░░░░ 55         |     |
|                                 |    N ██░░░░░░░░ 23         |     |
|                                 +----------------------------+     |
|                                                                    |
|  TOP MATCHES                                                       |
|  1. Data Engineer .......................... 92%                    |
|  2. Solutions Architect .................... 87%                    |
|  3. DevOps Engineer ........................ 84%                    |
|                                                                    |
|  pathwise.app                                                      |
+------------------------------------------------------------------+
```

#### Social Sharing Dimensions

- **OG Image:** 1200 x 630px (standard Open Graph)
- **Twitter Card:** 1200 x 630px (same asset)
- **Instagram Story:** 1080 x 1920px (vertical variant)
- **Download:** PNG at 2x resolution (2400 x 1260px) for crisp rendering

#### RIASEC Hexagon Chart: `RIASECHexagon.tsx`

```typescript
interface RIASECHexagonProps {
  profile: RIASECProfile;
  size?: number;            // Default 240px
  fillColor?: string;       // Default var(--secondary) at 20% opacity
  strokeColor?: string;     // Default var(--secondary)
  showLabels?: boolean;     // Default true
  animate?: boolean;        // Default true, polygon draws in
}
```

- **SVG-based**, no canvas (accessible, scalable, server-renderable for OG images)
- **Six vertices:** R (top), I (top-right), A (bottom-right), S (bottom), E (bottom-left), C (top-left)
- **Grid:** 3 concentric hexagons at 33%, 66%, 100% in `var(--outline-variant)`
- **User polygon:** Filled `var(--secondary)` at 15% opacity, stroke `var(--secondary)` 2px
- **Labels:** Abbreviated (R, I, A, S, E, C) with full name on hover/focus
- **Animation:** Polygon vertices animate from center to final positions, 0.6s ease-out, staggered by vertex

#### Big Five Bar Chart: `BigFiveBarChart.tsx`

```typescript
interface BigFiveBarChartProps {
  profile: BigFiveProfile;
  orientation?: 'horizontal' | 'vertical';  // Default horizontal
  showValues?: boolean;                      // Default true
  animate?: boolean;                         // Default true
}
```

- **Five horizontal bars**, each with:
  - Label: Single letter (O, C, E, A, N) + full name on hover
  - Bar: `var(--secondary)` filled portion, `var(--surface-container)` unfilled
  - Value: Number right-aligned
- **Bar height:** 28px with 8px gap
- **Animation:** Bars grow from 0 to value, 0.4s each, 0.1s stagger

#### Archetype Display

- **Name:** `font-family: var(--font-display)`, `font-weight: 800`, `2rem`, `var(--on-surface)`
- **Tagline:** `font-family: var(--font-body)`, `font-weight: 400`, `1rem`, `var(--on-surface-variant)`
- **Container:** `var(--surface-lumina)` background, `var(--radius-xl)` corners, `var(--shadow-md)`

#### Deriving RIASEC from Raw Answers

The current assessment collects RIASEC-adjacent data through questions int1, int2, int3. The derivation maps:

```typescript
// In hooks/useArchetype.ts
function deriveRIASEC(rawAnswers: Record<string, string[]>): RIASECProfile {
  const scores: RIASECProfile = {
    realistic: 0, investigative: 0, artistic: 0,
    social: 0, enterprising: 0, conventional: 0,
  };

  // int1: Direct RIASEC mapping
  const int1Map: Record<string, keyof RIASECProfile> = {
    realistic: 'realistic',
    investigative: 'investigative',
    artistic: 'artistic',
    social: 'social',
  };

  // int2: Problem type -> RIASEC
  const int2Map: Record<string, keyof RIASECProfile> = {
    technical: 'realistic',
    human: 'social',
    creative: 'artistic',
    strategic: 'enterprising',
    scientific: 'investigative',
  };

  // int3: Archetype -> RIASEC
  const int3Map: Record<string, keyof RIASECProfile> = {
    builder: 'realistic',
    thinker: 'investigative',
    operator: 'conventional',
    helper: 'social',
  };

  // ws1: Reaction style -> RIASEC secondary signals
  const ws1Map: Record<string, keyof RIASECProfile> = {
    open: 'artistic',
    cautious: 'conventional',
    organized: 'conventional',
    empathetic: 'social',
  };

  // car1: Career stage -> Enterprising signal
  const car1Map: Record<string, keyof RIASECProfile> = {
    exploring: 'artistic',
    building: 'realistic',
    advancing: 'enterprising',
    pivoting: 'investigative',
  };

  // car4: Group role -> RIASEC
  const car4Map: Record<string, keyof RIASECProfile> = {
    leader: 'enterprising',
    ideator: 'artistic',
    doer: 'realistic',
    harmonizer: 'social',
  };

  // Weight: int1 and int2 are primary (30 pts each), int3 (20 pts),
  // ws1/car1/car4 are secondary (10 pts each). Total possible: 100 per dimension.
  const apply = (map: Record<string, keyof RIASECProfile>, key: string, points: number) => {
    for (const val of (rawAnswers[key] ?? [])) {
      const dim = map[val];
      if (dim) scores[dim] = Math.min(100, scores[dim] + points);
    }
  };

  apply(int1Map, 'int1', 30);
  apply(int2Map, 'int2', 30);
  apply(int3Map, 'int3', 20);
  apply(ws1Map, 'ws1', 10);
  apply(car1Map, 'car1', 10);
  apply(car4Map, 'car4', 10);

  // Normalize: scale so max dimension = 100
  const max = Math.max(...Object.values(scores), 1);
  const scale = 100 / max;
  for (const k of Object.keys(scores) as (keyof RIASECProfile)[]) {
    scores[k] = Math.round(scores[k] * scale);
  }

  return scores;
}
```

#### Deriving Big Five from Raw Answers

```typescript
function deriveBigFive(rawAnswers: Record<string, string[]>): BigFiveProfile {
  const scores: BigFiveProfile = {
    openness: 50, conscientiousness: 50, extraversion: 50,
    agreeableness: 50, neuroticism: 50,
  };

  // ws1: open -> +O, cautious -> +N, organized -> +C, empathetic -> +A
  const ws1Effects: Record<string, Partial<BigFiveProfile>> = {
    open:       { openness: 25, neuroticism: -10 },
    cautious:   { neuroticism: 15, conscientiousness: 10 },
    organized:  { conscientiousness: 25, openness: -5 },
    empathetic: { agreeableness: 25, extraversion: 5 },
  };

  // ws2: thinking -> +C -A, feeling -> +A +O, intuition -> +O, consensus -> +A +E
  const ws2Effects: Record<string, Partial<BigFiveProfile>> = {
    thinking:  { conscientiousness: 15, agreeableness: -10 },
    feeling:   { agreeableness: 15, openness: 10 },
    intuition: { openness: 20 },
    consensus: { agreeableness: 10, extraversion: 10 },
  };

  // ws3: solo -> -E, collaborative -> +E +A, mixed -> neutral, pair -> +A
  const ws3Effects: Record<string, Partial<BigFiveProfile>> = {
    solo:          { extraversion: -20 },
    collaborative: { extraversion: 20, agreeableness: 10 },
    mixed:         { openness: 5 },
    pair:          { agreeableness: 10 },
  };

  // ws4: structure -> +C, experiment -> +O, consult -> +A +E, research -> +O +C
  const ws4Effects: Record<string, Partial<BigFiveProfile>> = {
    structure:  { conscientiousness: 20 },
    experiment: { openness: 20, neuroticism: -5 },
    consult:    { agreeableness: 10, extraversion: 10 },
    research:   { openness: 15, conscientiousness: 10 },
  };

  // val3: monotony -> +O (needs novelty), no_impact -> +C, micromanaged -> -N, isolation -> +E
  const val3Effects: Record<string, Partial<BigFiveProfile>> = {
    monotony:     { openness: 15 },
    no_impact:    { conscientiousness: 10 },
    micromanaged: { neuroticism: -10, openness: 10 },
    isolation:    { extraversion: 15 },
  };

  // car4: leader -> +E, ideator -> +O, doer -> +C, harmonizer -> +A
  const car4Effects: Record<string, Partial<BigFiveProfile>> = {
    leader:     { extraversion: 20, conscientiousness: 5 },
    ideator:    { openness: 20, extraversion: 5 },
    doer:       { conscientiousness: 20, neuroticism: -5 },
    harmonizer: { agreeableness: 20, extraversion: 5 },
  };

  const applyEffects = (effects: Record<string, Partial<BigFiveProfile>>, key: string) => {
    for (const val of (rawAnswers[key] ?? [])) {
      const fx = effects[val];
      if (fx) {
        for (const [trait, delta] of Object.entries(fx)) {
          scores[trait as keyof BigFiveProfile] =
            Math.max(0, Math.min(100, scores[trait as keyof BigFiveProfile] + (delta ?? 0)));
        }
      }
    }
  };

  applyEffects(ws1Effects, 'ws1');
  applyEffects(ws2Effects, 'ws2');
  applyEffects(ws3Effects, 'ws3');
  applyEffects(ws4Effects, 'ws4');
  applyEffects(val3Effects, 'val3');
  applyEffects(car4Effects, 'car4');

  return scores;
}
```

---

## 5. Career Match Cards

### Component: `CareerMatchCard.tsx`

```typescript
interface CareerMatchCardProps {
  match: ExtendedCareerMatch;
  rank: number;                    // 1-based position
  isTopMatch?: boolean;            // Rank 1 gets celebration styling
  isSelected?: boolean;            // For compare selection
  onBuildRoadmap: () => void;
  onCompare: () => void;
  onSave: () => void;
  onWhatIf: () => void;
  animationDelay?: number;         // Stagger delay in ms
}
```

#### Card Layout

```
+------------------------------------------------------------------+
|  #1                                                [Save icon]    |
|                                                                    |
|  +--------+                                                        |
|  | 87%    |  Data Engineer                                        |
|  | gauge  |  Technology / Data & Analytics                        |
|  | Strong |                                                        |
|  | Match  |  $95k - $145k  |  High growth  |  Bachelor's+        |
|  +--------+                                                        |
|                                                                    |
|  WHY THIS FITS YOU                                                |
|  * Your investigative mindset aligns with data exploration        |
|  * Your preference for structure suits pipeline architecture      |
|  * Your mastery-driven values match deep technical specialization |
|                                                                    |
|  A DAY IN THE LIFE                                                |
|  "You start your morning reviewing data pipeline alerts, then    |
|  spend focused hours designing ETL workflows that transform raw   |
|  data into insights that drive business decisions."               |
|                                                                    |
|  WHAT IF?                                                         |
|  Learn Python .......... +8% match (~2 months)                    |
|  Learn SQL ............. +12% match (~3 months)   [toggle]        |
|  Learn Apache Spark .... +5% match (~4 months)    [toggle]        |
|                                                                    |
|  [Build Roadmap]    [Compare]                                     |
+------------------------------------------------------------------+
```

#### Match Gauge: `MatchGauge.tsx`

```typescript
interface MatchGaugeProps {
  score: number;           // 0-100
  size?: number;           // Default 80px
  animate?: boolean;       // Default true
  showTierLabel?: boolean; // Default true
}
```

- **SVG circular gauge:** 270-degree arc (not full circle, gap at bottom)
- **Track:** `var(--surface-container)` 6px stroke
- **Fill:** Tier-colored stroke, animated `stroke-dashoffset`
- **Center:** Score number in `var(--font-display)`, `font-weight: 700`, tier-appropriate color
- **Label below gauge:** Tier label text (e.g., "Strong Match")

#### Score Tier Visual Mapping

| Range    | Tier       | Label              | Gauge Color                | Card Accent               |
|----------|------------|--------------------|-----------------------------|---------------------------|
| 85-100%  | Excellent  | "Excellent Match"  | `var(--secondary)` #006a62  | Left border 4px secondary |
| 70-84%   | Strong     | "Strong Match"     | `var(--secondary-light)` #00a396 | Left border 4px secondary-light |
| 55-69%   | Good       | "Good Match"       | `var(--tertiary-container)` #caa842 | Left border 4px tertiary |
| 40-54%   | Developing | "Developing Match" | `var(--copper)` #8b4f2c    | Left border 4px copper    |

#### "Why This Fits You" Generation

Derived on the frontend from raw answers matched against the career profile traits. Each bullet maps one user answer dimension to a career requirement:

```typescript
function generateWhyThisFits(
  rawAnswers: Record<string, string[]>,
  profile: CareerProfile,
): string[] {
  const reasons: string[] = [];

  // Map user interest type to career domain
  const interestMap: Record<string, string> = {
    realistic: 'hands-on building mindset',
    investigative: 'investigative mindset',
    artistic: 'creative thinking',
    social: 'people-first approach',
  };
  for (const val of (rawAnswers.int1 ?? [])) {
    if (profile.interests.includes(val)) {
      reasons.push(`Your ${interestMap[val] ?? val} aligns with ${profile.domain.toLowerCase()} work`);
    }
  }

  // Map work style to career environment
  const styleMap: Record<string, string> = {
    open: 'adaptability',
    cautious: 'analytical caution',
    organized: 'preference for structure',
    empathetic: 'emotional intelligence',
  };
  for (const val of (rawAnswers.ws1 ?? [])) {
    reasons.push(`Your ${styleMap[val] ?? val} suits this role's demands`);
  }

  // Map values to career rewards
  const valueMap: Record<string, string> = {
    mastery: 'mastery-driven values match deep technical specialization',
    autonomy: 'need for autonomy fits this role\'s independent nature',
    purpose: 'purpose-driven values align with this career\'s social impact',
    prestige: 'ambition aligns with this career\'s advancement opportunities',
  };
  for (const val of (rawAnswers.val1 ?? [])) {
    if (valueMap[val]) reasons.push(`Your ${valueMap[val]}`);
  }

  return reasons.slice(0, 3); // Max 3 bullets
}
```

#### Card States

| State     | Visual                                                            |
|-----------|-------------------------------------------------------------------|
| Default   | White card, left border accent, shadow-sm                         |
| Hover     | shadow-md, translate-y -2px                                       |
| Focus     | 2px outline var(--secondary), offset 2px                          |
| Selected  | secondary background at 5% opacity, checkmark on Compare button   |
| Top Match | Subtle gradient top border (secondary to secondary-light), sparkle icon |
| Loading   | Skeleton: gauge circle + 3 text lines + 2 button rectangles      |
| Error     | "Could not load details" with retry link                          |

#### "Day in the Life" Narratives

Pre-authored in career profile data. Each profile includes a 2-sentence `dayInTheLife` field written in second person:

```
"You start your morning reviewing data pipeline alerts, then spend
focused hours designing ETL workflows that transform raw data into
insights that drive business decisions."
```

These are stored in the career profile definitions (`career-profiles.ts`, `career-profiles-2.ts`, `career-profiles-3.ts`) as a new field.

---

## 6. Profile Comparison View

### Component: `ProfileComparison.tsx`

```typescript
interface ProfileComparisonProps {
  userProfile: RIASECProfile;
  careerIdeal: RIASECProfile;       // Derived from career profile traits
  skillGaps: SkillGapDetail[];
  careerTitle: string;
}
```

#### Layout

```
+------------------------------------------------------------------+
|  YOUR PROFILE vs DATA ENGINEER IDEAL                              |
|                                                                    |
|  +----------------------------+  +-----------------------------+  |
|  |                            |  |  SKILL ALIGNMENT            |  |
|  |  Dual Radar Chart          |  |                             |  |
|  |  (user = filled teal,     |  |  Python                     |  |
|  |   ideal = dashed outline)  |  |  [====|=====------] 60/90  |  |
|  |                            |  |  ^^^^^^^^^ target marker    |  |
|  |  Legend:                   |  |                             |  |
|  |  ■ You  ◻ Career Ideal   |  |  SQL                        |  |
|  |                            |  |  [========|==------] 70/85  |  |
|  +----------------------------+  |                             |  |
|                                  |  Communication              |  |
|  ALIGNMENT SUMMARY               |  [============|--] 88/80   |  |
|  ✓ Exceeds: Social,             |  ✓ Exceeds target          |  |
|    Investigative                  |                             |  |
|  ▲ Gaps: Conventional,          +-----------------------------+  |
|    Realistic                                                      |
+------------------------------------------------------------------+
```

#### Comparison Radar: `ComparisonRadar.tsx`

```typescript
interface ComparisonRadarProps {
  userProfile: RIASECProfile;
  idealProfile: RIASECProfile;
  size?: number;                   // Default 280px
}
```

- **User polygon:** `var(--secondary)` filled at 15% opacity, solid 2px stroke
- **Career ideal polygon:** `var(--copper)` dashed 2px stroke, no fill
- **Exceed segments:** Where user > ideal, vertex highlighted with small `var(--secondary)` dot
- **Gap segments:** Where user < ideal, vertex highlighted with small `var(--copper)` dot (amber, NOT red)
- **Legend:** Inline below chart, two items with colored squares

#### Skill Gap Bars: `SkillGapBars.tsx`

```typescript
interface SkillGapBarsProps {
  gaps: SkillGapDetail[];
  maxVisible?: number;             // Default 6, "Show more" for rest
}
```

- **Each bar:**
  - Label left-aligned, importance badge (critical/important/nice-to-have) right-aligned
  - Track: full width, `var(--surface-container)`, 12px height, `var(--radius-sm)` corners
  - User level: filled portion in `var(--secondary)`
  - Target marker: Vertical line at `requiredLevel` position, 2px, `var(--copper)`, 20px height (extends above and below bar)
  - If user exceeds target: bar color changes to `var(--secondary)`, checkmark badge
  - If gap exists: remaining portion between user and target shown as striped pattern in `var(--copper)` at 20%

#### Color Rules (Critical -- No Red)

- **Exceeds requirement:** `var(--secondary)` (#006a62) deep teal + checkmark icon
- **Gap exists:** `var(--copper)` (#8b4f2c) warm amber + arrow-up icon
- **Large gap (>30 points):** `var(--copper)` with bolder weight, priority flag
- **Never use red, orange-red, or any danger/error color for gaps.** Gaps are opportunities, not failures.

---

## 7. Career Explorer

### Component: `CareerExplorer.tsx`

```typescript
interface CareerExplorerProps {
  allMatches: ExtendedCareerMatch[];
  onSelect: (match: ExtendedCareerMatch) => void;
  onCompare: (matches: ExtendedCareerMatch[]) => void;
}
```

#### Layout

```
+------------------------------------------------------------------+
|  EXPLORE ALL CAREERS                                    91 found  |
|                                                                    |
|  [Search field ___________________________]                       |
|                                                                    |
|  Filters:                                                          |
|  [Domain v]  [Salary v]  [Growth v]  [Remote v]  [Education v]   |
|                                                                    |
|  Sort: [Match Score v]  [Grid|List toggle]                        |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+          |
|  | 92%      |  | 87%      |  | 84%      |  | 81%      |          |
|  | Data     |  | Solutions|  | DevOps   |  | ML       |          |
|  | Engineer |  | Architect|  | Engineer |  | Engineer |          |
|  | Tech     |  | Tech     |  | Tech     |  | Tech     |          |
|  | $95-145k |  | $120-180k|  | $100-160k|  | $110-170k|          |
|  | ▲ High   |  | ▲ High   |  | ▲ High   |  | ▲ High   |          |
|  | [Compare]|  | [Compare]|  | [Compare]|  | [Compare]|          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                    |
|  +----------+  +----------+  +----------+  +----------+          |
|  | ...      |  | ...      |  | ...      |  | ...      |          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                    |
|  [Load More (showing 20 of 91)]                                   |
+------------------------------------------------------------------+
```

#### Filter Definitions

| Filter             | Type        | Options                                                                 |
|--------------------|-------------|-------------------------------------------------------------------------|
| Domain             | Multi-select | Technology, Data & Analytics, Marketing, Finance, Design & UX, Product Management, Healthcare, Education, E-commerce, Sustainability, Media & Entertainment, Consulting, Law & Policy, Architecture & Construction, Arts & Entertainment, Science & Research, Hospitality & Tourism, Trades & Skilled Labor, Logistics & Operations, Social Services, Agriculture & Environment |
| Salary Range       | Range slider | $30k - $250k+, step $10k                                               |
| Growth Outlook     | Multi-select | High, Moderate, Stable, Declining                                      |
| Remote-Friendliness| Multi-select | Fully Remote, Hybrid, On-site, Varies                                  |
| Education          | Multi-select | No degree required, Certificate, Associate's, Bachelor's, Master's+    |

#### Sort Options

| Option       | Direction | Default |
|-------------|-----------|---------|
| Match Score | Desc      | Yes     |
| Salary (mid)| Desc      |         |
| Growth      | Desc      |         |
| Alphabetical| Asc       |         |

#### Hook: `useCareerExplorer.ts`

```typescript
interface UseCareerExplorerReturn {
  filteredMatches: ExtendedCareerMatch[];
  totalCount: number;
  visibleCount: number;
  filters: ExplorerFilters;
  setFilter: (key: keyof ExplorerFilters, value: any) => void;
  clearFilters: () => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loadMore: () => void;
  hasMore: boolean;
  compareList: ExtendedCareerMatch[];     // Max 4
  addToCompare: (match: ExtendedCareerMatch) => void;
  removeFromCompare: (title: string) => void;
  isInCompare: (title: string) => boolean;
}
```

#### Pagination Strategy

- **Initial load:** 20 cards (above the fold on most screens)
- **Load more:** 20 per batch, button at bottom
- **No infinite scroll** (users need orientation and control)
- **Client-side filtering** (91 profiles is small enough; no server round-trips for filters)

#### Compare Mode

- **Max 4 careers** in compare list
- **Sticky compare bar** at bottom when 2+ selected: "[Career A] [Career B] [Career C] -- Compare Now"
- **Compare view:** Side-by-side columns showing match score, salary, growth, required skills, with highlight on best-in-row

#### Mini Card States

| State    | Visual                                                      |
|----------|-------------------------------------------------------------|
| Default  | White card, shadow-sm, mini gauge top-left                   |
| Hover    | shadow-md, scale 1.02                                        |
| Focus    | 2px outline var(--secondary)                                 |
| Selected | secondary border 2px, checkmark overlay on Compare button    |
| Empty    | "No careers match your filters. Try broadening your search." |

---

## 8. What-If Scenario Engine

### Purpose
Let users explore how learning specific skills would change their match scores. Creates a tangible connection between learning effort and career outcomes.

### Component: `WhatIfEngine.tsx`

```typescript
interface WhatIfEngineProps {
  match: ExtendedCareerMatch;
  userSkills: string[];
  onSkillToggle: (skill: string, enabled: boolean) => void;
}
```

#### Layout

```
+------------------------------------------------------------------+
|  WHAT IF YOU LEARNED...                                           |
|                                                                    |
|  Current match: 79%  -->  Projected: 91%  (+12%)                  |
|  [============================------]  -->  [==================================--]  |
|                                                                    |
|  Toggle skills to see impact:                                     |
|                                                                    |
|  [x] SQL .................. +12% match  (~3 months)  HIGH IMPACT  |
|  [x] Python ............... +8% match   (~2 months)  HIGH IMPACT  |
|  [ ] Apache Spark ......... +5% match   (~4 months)  MED IMPACT   |
|  [ ] dbt .................. +3% match   (~2 months)  MED IMPACT   |
|  [ ] Data Modeling ........ +2% match   (~3 months)  LOW IMPACT   |
|                                                                    |
|  Sorted by: Impact per effort                                     |
|                                                                    |
|  Total time investment: ~5 months for +20% improvement            |
|  [Start Learning Path]                                            |
+------------------------------------------------------------------+
```

#### Hook: `useWhatIf.ts`

```typescript
interface UseWhatIfReturn {
  baseScore: number;
  projectedScore: number;
  delta: number;
  enabledSkills: Set<string>;
  toggleSkill: (skill: string) => void;
  totalTimeEstimate: string;
  sortedSkills: WhatIfSkill[];      // By impact-per-effort desc
}
```

#### Score Recalculation Logic

The What-If engine does **not** call the backend. It uses a simplified client-side heuristic:

```typescript
function calculateWhatIfDelta(
  currentScore: number,
  missingSkill: string,
  requiredSkills: string[],
  userSkills: string[],
): number {
  // Each missing required skill accounts for an equal share of the gap
  const totalGap = 100 - currentScore;
  const missingCount = requiredSkills.filter(s =>
    !userSkills.some(us => us.toLowerCase() === s.toLowerCase())
  ).length;
  if (missingCount === 0) return 0;

  // Base impact: proportional share of the gap
  const baseImpact = totalGap / missingCount;

  // Weight by skill importance (first 2 required skills are "critical")
  const skillIndex = requiredSkills.findIndex(s =>
    s.toLowerCase() === missingSkill.toLowerCase()
  );
  const importanceMultiplier = skillIndex < 2 ? 1.3 : skillIndex < 4 ? 1.0 : 0.7;

  return Math.round(baseImpact * importanceMultiplier);
}
```

#### Impact Tiers

| Delta     | Label         | Badge Color               |
|-----------|---------------|---------------------------|
| >= 8%     | HIGH IMPACT   | `var(--secondary)`        |
| 4-7%      | MED IMPACT    | `var(--tertiary-container)`|
| 1-3%      | LOW IMPACT    | `var(--on-surface-muted)` |

#### Gauge Animation

When user toggles a skill on/off, the projected gauge animates smoothly:
- Duration: 0.4s
- Easing: `cubic-bezier(0.33, 1, 0.68, 1)` (same as `var(--transition-base)`)
- The delta number counts up/down during animation

#### Sorting: Impact per Effort

```typescript
function impactPerEffort(skill: WhatIfSkill): number {
  const monthsMap: Record<string, number> = {
    beginner: 2, intermediate: 3, advanced: 5,
  };
  const months = monthsMap[skill.difficulty] ?? 3;
  return skill.delta / months; // Higher = better ROI
}
```

---

## 9. Narrative Profile

### Purpose
A 500+ word second-person narrative that reads like 16Personalities type descriptions. Warm, insightful, specific to the user's answers. Generated entirely on the frontend from templates.

### Component: `NarrativeProfile.tsx`

```typescript
interface NarrativeProfileProps {
  archetype: CareerArchetype;
  riasec: RIASECProfile;
  bigFive: BigFiveProfile;
  rawAnswers: Record<string, string[]>;
  topMatches: ExtendedCareerMatch[];
}
```

#### Template Structure

The narrative is assembled from 6 sections, each with multiple variant paragraphs selected based on the user's dominant traits:

```typescript
interface NarrativeSection {
  id: string;
  title: string;
  variants: {
    condition: (riasec: RIASECProfile, bigFive: BigFiveProfile, answers: Record<string, string[]>) => boolean;
    text: string;  // Template with {placeholders}
  }[];
}

const NARRATIVE_SECTIONS: NarrativeSection[] = [
  {
    id: 'opening',
    title: '',  // No visible title, just flows
    variants: [
      {
        condition: (r) => r.investigative >= 70 && r.realistic >= 50,
        text: `You are a builder who thinks in systems. Where others see isolated problems, you see interconnected patterns waiting to be optimized. Your mind naturally gravitates toward understanding *how things work* -- not just on the surface, but at the deepest architectural level. This isn't mere curiosity; it's a drive toward mastery that shapes everything from how you approach your morning tasks to how you envision your career trajectory.`,
      },
      {
        condition: (r) => r.artistic >= 70 && r.social >= 50,
        text: `You are a creator who builds for people. Your imagination doesn't operate in a vacuum -- it's constantly calibrated by empathy, by an awareness of how your work will land with real human beings. You see the world not just as it is, but as it could be, and you feel a genuine pull to make that vision tangible. Whether you're designing an experience, crafting a narrative, or solving a problem, your first instinct is to ask: "How will this feel for the person on the other end?"`,
      },
      {
        condition: (r) => r.enterprising >= 70,
        text: `You are someone who naturally takes the lead. Not because you crave authority, but because you see opportunities where others see obstacles, and you can't help but want to mobilize people toward them. Your energy is directional -- it points toward growth, toward impact, toward building something that matters at scale. You think in terms of strategy and leverage, always asking "What's the highest-impact move here?"`,
      },
      {
        condition: (r) => r.social >= 70,
        text: `You are drawn to people and the spaces between them. Your deepest professional satisfaction comes not from solo achievements, but from moments of genuine connection -- helping someone break through a barrier, facilitating a difficult conversation, or creating an environment where others can do their best work. You have an instinct for reading rooms, sensing unspoken tensions, and knowing exactly when someone needs support versus space.`,
      },
      // ... more variants for other combinations
      {
        // Default fallback
        condition: () => true,
        text: `You bring a distinctive blend of abilities to your career. Your assessment reveals a profile that doesn't fit neatly into one box -- and that's your advantage. You can move between analytical and creative modes, between independent focus and collaborative energy, adapting to what the situation demands. This versatility means you're well-suited for roles that reward range over narrow specialization.`,
      },
    ],
  },
  {
    id: 'work_style',
    title: 'How You Work',
    variants: [
      {
        condition: (_, b) => b.conscientiousness >= 75,
        text: `Structure is your superpower. You don't just make plans -- you make plans that account for contingencies, dependencies, and realistic timelines. When a project feels chaotic, you're the person who brings order without killing momentum. Your colleagues may not always appreciate this in the moment, but they notice when things run smoothly, and that's usually because you engineered it that way. You thrive when expectations are clear, milestones are defined, and progress is measurable.`,
      },
      {
        condition: (_, b) => b.openness >= 75,
        text: `You need novelty the way some people need coffee -- without it, you start to stagnate. Routine is your kryptonite; what energizes you is the unknown, the uncharted, the "nobody's tried this before." You're at your best when you can experiment freely, iterate quickly, and learn from failures without judgment. Your workspace -- whether physical or digital -- probably reflects this: a mix of half-finished explorations, bookmarked rabbit holes, and connections between ideas that only you can see.`,
      },
      {
        condition: (_, b) => b.extraversion >= 75,
        text: `You think best out loud. Collaboration isn't just a preference -- it's how your brain does its best processing. Bouncing ideas off others, debating approaches, and synthesizing different perspectives is where your insights come from. You're energized by team dynamics and naturally gravitate toward roles where communication is as important as technical skill. Solo deep-work sessions recharge some people; for you, they're something to push through before returning to the energy of the group.`,
      },
      {
        condition: (_, b) => b.agreeableness >= 75,
        text: `You lead with empathy. In any team setting, you're attuned to the emotional undercurrents -- who's frustrated, who's disengaged, who needs acknowledgment. This isn't softness; it's a sophisticated form of intelligence that makes you exceptionally effective in roles requiring trust, consensus-building, and relationship management. You naturally create psychological safety around you, which means people share their real concerns and best ideas in your presence.`,
      },
      {
        condition: () => true,
        text: `Your work style is balanced and adaptable. You can focus deeply when a problem demands it, but you're equally comfortable switching to collaborative mode when the situation calls for group input. This flexibility is rarer than it seems -- many professionals lean heavily toward one mode or the other. Your ability to shift makes you effective across a wider range of professional contexts.`,
      },
    ],
  },
  {
    id: 'strengths',
    title: 'Your Core Strengths',
    variants: [
      {
        condition: (r, b) => r.investigative >= 60 && b.conscientiousness >= 60,
        text: `Your greatest professional asset is your ability to combine analytical depth with follow-through. Many people can analyze; fewer can translate that analysis into action. You don't just identify problems -- you architect solutions and see them through to implementation. This makes you particularly valuable in roles where rigorous thinking must lead to tangible outcomes: engineering, data science, strategic planning, or technical leadership.`,
      },
      {
        condition: (r, b) => r.artistic >= 60 && b.openness >= 60,
        text: `Your greatest professional asset is creative problem-solving. You approach challenges from angles others don't consider, and you're comfortable with the ambiguity that creative work demands. You see connections between disparate fields and ideas, which means your solutions often feel novel without being impractical. This makes you particularly valuable in roles where innovation matters: design, product development, content strategy, or any field where "we've always done it this way" is a problem, not an answer.`,
      },
      {
        condition: (r, b) => r.social >= 60 && b.agreeableness >= 60,
        text: `Your greatest professional asset is your ability to understand and influence people. You read situations with nuance, adapt your communication style to your audience, and build trust quickly. This isn't just "being nice" -- it's a form of strategic intelligence that makes you effective in roles requiring negotiation, mentorship, customer relationships, or team leadership. Organizations run on relationships, and you're fluent in that language.`,
      },
      {
        condition: () => true,
        text: `Your greatest professional asset is your versatility. You can hold multiple perspectives simultaneously, switch between analytical and creative modes, and operate effectively in both structured and ambiguous environments. While specialists go deep, you go wide -- and in today's cross-functional work environments, that breadth is increasingly valued.`,
      },
    ],
  },
  {
    id: 'growth_areas',
    title: 'Where You Can Grow',
    variants: [
      {
        condition: (_, b) => b.neuroticism >= 60,
        text: `Your sensitivity to risk and potential problems is a genuine asset in many professional contexts -- it makes you thorough and careful. But it can also hold you back from taking the calculated risks that career growth often requires. You might delay applying for a stretch role, overthink a decision until the window closes, or avoid visibility because failure feels too costly. The growth opportunity here isn't to stop caring -- it's to develop a more calibrated relationship with uncertainty, where you can distinguish between productive caution and fear-based avoidance.`,
      },
      {
        condition: (_, b) => b.extraversion <= 40,
        text: `Your preference for focused, independent work is a strength -- but it can sometimes limit your visibility and influence. In most organizations, career advancement requires not just doing great work, but being *seen* doing great work. This doesn't mean becoming someone you're not; it means strategically increasing your surface area: presenting your work, contributing in meetings, and building relationships with people outside your immediate team. The goal is expanding your comfort zone incrementally, not abandoning it.`,
      },
      {
        condition: (_, b) => b.conscientiousness <= 40,
        text: `Your flexibility and adaptability are genuine strengths, but they can sometimes manifest as difficulty with sustained follow-through on less exciting tasks. You start strong on new projects but may lose momentum when the work becomes routine or the novelty fades. The growth opportunity is building systems -- not just relying on motivation. External accountability, structured milestones, and deliberate habit formation can help you channel your creative energy into consistent output.`,
      },
      {
        condition: () => true,
        text: `Like any professional, your growth edge lies at the boundary of your comfort zone. Your assessment suggests you operate most naturally in a specific mode -- the opportunity is to develop complementary capabilities that make you more well-rounded without losing your distinctive strengths. The most effective professionals aren't those without weaknesses; they're those who understand their patterns well enough to compensate deliberately.`,
      },
    ],
  },
  {
    id: 'ideal_environment',
    title: 'Your Ideal Work Environment',
    variants: [], // Populated from environment answers (env1-env4)
  },
  {
    id: 'career_direction',
    title: 'Where You Are Headed',
    variants: [], // Populated from career answers (car1-car4) + top matches
  },
];
```

#### Environment Section Generation (Dynamic)

```typescript
function generateEnvironmentSection(answers: Record<string, string[]>, topMatches: ExtendedCareerMatch[]): string {
  const env = (answers.env1 ?? [])[0] ?? 'flexible';
  const team = (answers.env2 ?? [])[0] ?? 'medium';
  const pace = (answers.env3 ?? [])[0] ?? 'steady';
  const mgmt = (answers.env4 ?? [])[0] ?? 'mentorship';

  const envMap: Record<string, string> = {
    remote: 'You do your best work when you control your environment. A fully remote setup lets you structure your day around your energy cycles, eliminate commute friction, and create the focused conditions your brain needs to produce quality output.',
    hybrid: 'You thrive with a blend of in-person collaboration and focused remote work. The ideal setup gives you office days for meetings, brainstorming, and relationship-building, with home days for deep work that requires uninterrupted concentration.',
    onsite: 'You draw energy from being physically present with your team. The spontaneous conversations, the ability to tap someone on the shoulder, the shared rhythm of an office -- these aren\'t just conveniences, they\'re how you do your best thinking.',
    flexible: 'You resist rigid categorization even in your work setup. Some weeks you want the buzz of an office; other weeks you need cave-like solitude. The ideal employer for you offers genuine flexibility, trusting you to choose the environment that serves the task at hand.',
  };

  const teamMap: Record<string, string> = {
    small: 'You prefer small, tight-knit teams where everyone wears multiple hats and bureaucracy is minimal.',
    medium: 'Mid-sized teams suit you: enough specialization to go deep, but small enough that your individual contribution is visible and valued.',
    large: 'You appreciate the structure and resources that come with larger organizations -- clear career paths, defined processes, and the stability to plan long-term.',
    solo: 'You\'re most effective as an independent operator. You set your own priorities, manage your own time, and deliver results without needing external coordination.',
  };

  const paceMap: Record<string, string> = {
    fast: 'You\'re energized by urgency. A fast-paced environment where you ship quickly, iterate based on feedback, and always have the next challenge queued up keeps you engaged.',
    steady: 'You value sustainability over speed. A pace that allows for thoughtful work, proper recovery, and long-term thinking is where you produce your best outcomes.',
    burst: 'Your energy comes in waves -- periods of intense output followed by needed recovery. Sprint-based work cultures suit you perfectly.',
    varied: 'You thrive when the pace varies with the season -- intense periods of delivery balanced by quieter stretches for learning and planning.',
  };

  const mgmtMap: Record<string, string> = {
    handsoff: 'You need trust and autonomy from leadership. The ideal manager checks in weekly, removes blockers, and otherwise stays out of your way.',
    mentorship: 'You value managers who invest in your growth -- regular feedback, career conversations, and skill development are what help you thrive.',
    targets: 'You perform best with clear expectations and regular accountability. Defined weekly targets give you the structure to focus and deliver.',
    coaching: 'You appreciate leaders who ask guiding questions rather than giving directives -- the kind of coaching that develops your judgment, not just your output.',
  };

  return [
    envMap[env] ?? envMap.flexible,
    teamMap[team] ?? teamMap.medium,
    paceMap[pace] ?? paceMap.steady,
    mgmtMap[mgmt] ?? mgmtMap.mentorship,
  ].join(' ');
}
```

#### Career Direction Section (Dynamic)

```typescript
function generateCareerDirection(
  answers: Record<string, string[]>,
  topMatches: ExtendedCareerMatch[],
  archetype: CareerArchetype,
): string {
  const stage = (answers.car1 ?? [])[0] ?? 'building';
  const trajectory = (answers.car3 ?? [])[0] ?? 'generalist';
  const top3 = topMatches.slice(0, 3).map(m => m.title);

  const stageIntro: Record<string, string> = {
    exploring: `You're in exploration mode, and that's exactly where you should be. This is the phase for testing hypotheses about what work feels meaningful, not committing prematurely to a path you'll outgrow.`,
    building: `You're in a building phase -- you've identified your general direction and now you're accumulating the skills and experience to become genuinely good at what you do.`,
    advancing: `You're ready to level up. The foundation is there; now it's about leveraging your experience into roles with greater scope, influence, and compensation.`,
    pivoting: `You're making a deliberate career change, which takes more courage than most people realize. The good news: your transferable skills are more portable than you think.`,
  };

  const trajectoryText: Record<string, string> = {
    specialist: `Your instinct is to go deep rather than wide. You'd rather be the undisputed expert in one domain than a competent generalist across many. This serves you well in roles like ${top3[0] ?? 'your top match'}, where depth of expertise directly translates to impact and earning potential.`,
    generalist: `You're drawn to breadth over depth -- understanding many domains well enough to see connections others miss. This "T-shaped" approach is increasingly valued, especially in roles like ${top3[0] ?? 'your top match'} where cross-functional fluency is essential.`,
    manager: `You see your future in leadership: managing people, setting strategy, and multiplying your impact through others. Roles like ${top3[0] ?? 'your top match'} offer clear management tracks that align with this vision.`,
    entrepreneur: `You have the entrepreneurial itch -- the desire to build something of your own, on your own terms. While ${top3[0] ?? 'your top match'} might be your near-term path, your long-term trajectory likely involves founding or co-founding something.`,
  };

  return [
    stageIntro[stage] ?? stageIntro.building,
    trajectoryText[trajectory] ?? trajectoryText.generalist,
    `Based on your complete profile as ${archetype.name}, your strongest career alignment points toward ${top3.join(', ')}.`,
    `Each of these paths leverages your core strengths while offering room for the growth your assessment reveals you're seeking.`,
  ].join(' ');
}
```

#### Display Specs

- **Container:** `var(--surface-lumina)` card, max-width 680px, `var(--radius-xl)` corners
- **Section titles:** `font-family: var(--font-display)`, `font-weight: 700`, `1.25rem`, `var(--secondary)`, underline accent
- **Body text:** `font-family: var(--font-body)`, `font-weight: 400`, `1rem`, `line-height: 1.75`, `var(--on-surface)`, max-width 65ch
- **Paragraph spacing:** `var(--spacing-6)`
- **Reading time estimate:** "~3 min read" badge at top-right

---

## 10. Share & Save

### Component: `SharePanel.tsx`

```typescript
interface SharePanelProps {
  archetype: CareerArchetype;
  topMatches: ExtendedCareerMatch[];
  userId: string;
}
```

#### Actions

| Action            | Implementation                                                  | Notes                                    |
|-------------------|-----------------------------------------------------------------|------------------------------------------|
| Download Card     | `html2canvas` on CareerIdentityCard, save as PNG                | 2x resolution, includes watermark        |
| Share to LinkedIn | `window.open` with pre-filled share URL + OG tags               | Requires OG meta route at `/share/{id}`  |
| Share to Twitter  | `window.open` with intent URL, pre-filled text                  | "I'm {archetype.name}! pathwise.app"     |
| Copy Link         | `navigator.clipboard.writeText(shareUrl)`                       | Toast confirmation on copy               |
| Save to Profile   | `POST /assessment/save` (already happens on submit)             | Visual confirmation, not a new action    |
| PDF Export        | Client-side PDF generation via `jspdf` + `html2canvas`          | Full results: card + matches + narrative |

#### OG Share Route

New page at `/share/:assessmentId` (public, no auth required):

```
src/pages/ShareResults/
  index.tsx         -- Server-rendered share page with OG meta tags
```

This page renders a simplified, read-only view of the Career Identity Card with:
- `<meta property="og:image" content="{card-image-url}" />`
- `<meta property="og:title" content="I'm The Strategic Builder | PathWise" />`
- `<meta property="og:description" content="My top career match: Data Engineer (92%)" />`

#### Share URL Format

```
https://pathwise.app/share/{shortId}
```

Where `shortId` is a base62 encoding of the assessment row ID. The backend returns this in the assessment response.

---

## 11. Micro-Feedback Between Phases

### Purpose
Provide reward loops between assessment phases. After each major section completes, show a brief insight card revealing partial results. These create dopamine hits that sustain engagement through a 6-step assessment.

### Component: `MicroFeedback.tsx`

```typescript
interface MicroFeedbackProps {
  phase: number;                    // 0-5
  rawAnswers: Record<string, string[]>;
  onContinue: () => void;
}
```

#### Phase Insights

| After Phase | Insight Content                                                | Data Source             |
|-------------|----------------------------------------------------------------|------------------------|
| 0 (Interests) | "Your interest profile leans {primaryRIASEC}-{secondaryRIASEC}" | Partial RIASEC from int1-int3 |
| 1 (Work Style) | "You show high {dominantTrait} and strong {secondaryTrait}" | Partial Big Five from ws1-ws4 |
| 2 (Values)     | "You prioritize {topValue1} and {topValue2}"                | val1-val4 answers |
| 3 (Environment)| "You thrive in {envType} settings at a {pace} pace"         | env1-env4 answers |
| 4 (Career)     | "You're on a {trajectory} track with {riskLevel} risk comfort" | car1-car4 answers |

#### Display

- **Trigger:** Appears between steps, before the next phase's questions load
- **Layout:** Centered card, narrower than question cards (max-width 480px)
- **Icon:** Phase-specific Lucide icon (Compass, Brain, Heart, Building2, TrendingUp)
- **Text:** `var(--font-display)`, `1.125rem`, `var(--on-surface)`
- **Accent:** Thin top border in `var(--secondary)`
- **Duration:** Auto-dismiss after 3s, or tap "Continue" to proceed immediately
- **Animation:** Slide up + fade in, 0.3s ease-out

#### Implementation in Assessment Flow

Insert `MicroFeedback` between step transitions:

```typescript
// In Assessment/index.tsx
const [showingInsight, setShowingInsight] = useState(false);

const advanceStep = () => {
  if (step < 5) {
    setShowingInsight(true);
    setTimeout(() => {
      setShowingInsight(false);
      setStep(s => s + 1);
    }, 3000);
  }
};
```

---

## 12. Recalibration Flow ("This Doesn't Feel Right?")

### Purpose
Graceful handling of assessment skepticism. Collects structured feedback to improve the system, and gives users psychological permission to trust results that initially feel unfamiliar.

### Component: `RecalibrationFlow.tsx`

```typescript
interface RecalibrationFlowProps {
  currentMatches: ExtendedCareerMatch[];
  onSubmit: (feedback: RecalibrationFeedback) => void;
  onClose: () => void;
}
```

#### Trigger

Small text link at the bottom of the results page:

```
"These results don't feel accurate?"
```

Styled: `var(--on-surface-muted)`, `0.875rem`, underline on hover. No prominent placement (this is for edge cases, not the happy path).

#### Flow (3-4 questions, slide-over panel)

**Step 1: Expected Career**
```
"What career did you expect to see in your results?"
[Text input, placeholder: "e.g., UX Designer"]
[Skip]  [Next]
```

**Step 2: Surprise Factor**
```
"What surprised you most?"
( ) My top match seems unrelated to my interests
( ) I expected a higher/lower match for a specific career
( ) The personality description doesn't sound like me
( ) Other: [text input]
[Back]  [Next]
```

**Step 3: Dimension Check**
```
"Which part of your profile feels most off?"
( ) My interest profile (RIASEC hexagon)
( ) My personality traits (Big Five bars)
( ) My work style description
( ) My values assessment
( ) None specifically, it just doesn't click
[Back]  [Submit]
```

**Step 4: Acknowledgment (not a question)**
```
"Thank you for the feedback. Here's what to know:

Assessment results reveal patterns you may not consciously recognize.
Sometimes unfamiliar results reflect genuine strengths you haven't
explored yet.

Your feedback helps us improve. If you'd like to explore further,
you can retake the assessment anytime from Settings."

[Got it]
```

#### Backend Endpoint

```typescript
// NEW: POST /assessment/feedback
interface AssessmentFeedbackParams {
  userId: string;
  expectedCareer: string;
  surprisingResult: string;
  offDimension: string;
  freeText?: string;
  timestamp: string;
}
```

Stores in a `assessment_feedback` table for analytics. Does NOT auto-modify results.

---

## 13. State Management

### Global State (Zustand)

```typescript
// src/store/assessmentResultsStore.ts
interface AssessmentResultsState {
  // Core results data
  results: FullAssessmentResults | null;
  isLoading: boolean;
  error: string | null;

  // Reveal state
  revealPhase: RevealPhase;
  revealComplete: boolean;

  // Explorer state
  explorerFilters: ExplorerFilters;
  explorerSort: SortOption;
  compareList: ExtendedCareerMatch[];  // Max 4

  // What-If state
  activeWhatIfCareer: string | null;
  enabledWhatIfSkills: Record<string, Set<string>>;  // careerTitle -> skill set

  // Actions
  setResults: (results: FullAssessmentResults) => void;
  advanceReveal: () => void;
  skipReveal: () => void;
  setExplorerFilter: (key: string, value: any) => void;
  clearExplorerFilters: () => void;
  setExplorerSort: (sort: SortOption) => void;
  addToCompare: (match: ExtendedCareerMatch) => void;
  removeFromCompare: (title: string) => void;
  toggleWhatIfSkill: (career: string, skill: string) => void;
  reset: () => void;
}
```

### Server State (TanStack Query)

```typescript
// Fetching saved results (for returning users)
useQuery({
  queryKey: ['assessment-results', userId],
  queryFn: () => assessment.getFullResults(userId),
  staleTime: 5 * 60 * 1000,  // 5 min
  enabled: !!userId,
});

// Submitting recalibration feedback
useMutation({
  mutationFn: (feedback: RecalibrationFeedback) =>
    assessment.submitFeedback({ ...feedback, userId }),
  onSuccess: () => toast.success('Feedback submitted'),
});
```

### Data Flow Diagram

```
Assessment Submit (existing)
  |
  v
POST /assessment --> careerMatches, skillGaps, rawAnswers persisted
  |
  v
Navigate to /app/results (pass via route state OR re-fetch)
  |
  v
ResultsPage mounts
  |
  +--> Zustand store: setResults(enrichedData)
  |
  +--> useResultsReveal: start animation sequence
  |
  +--> useArchetype: derive archetype from rawAnswers
  |
  +--> useNarrative: generate 500+ word narrative from templates
  |
  v
RevealPhase: analyzing_1 -> analyzing_2 -> analyzing_3 -> archetype -> matches -> complete
  |
  v
Full results page interactive:
  +--> CareerIdentityCard (archetype + charts)
  +--> CareerMatchList (top 5 with stagger)
  +--> NarrativeProfile (generated text)
  +--> CareerExplorer (filterable grid)
  +--> WhatIfEngine (per-match drill-down)
  +--> ProfileComparison (per-match drill-down)
  +--> SharePanel (download/share actions)
  +--> RecalibrationFlow (bottom link)
```

---

## 14. Component Tree

```
AssessmentResultsPage
  |
  +-- ResultsReveal (phase < 'complete')
  |     |
  |     +-- ProgressBar (aria-progressbar)
  |     +-- AnalyzingMessage (aria-live="polite")
  |     +-- SkipButton
  |
  +-- ResultsContent (phase === 'complete')
        |
        +-- CareerIdentityCard
        |     +-- ArchetypeDisplay
        |     +-- RIASECHexagon
        |     +-- BigFiveBarChart
        |     +-- TopMatchesSummary
        |     +-- ShareButton (corner)
        |
        +-- CareerMatchList
        |     +-- CareerMatchCard (x5, staggered)
        |           +-- MatchGauge
        |           +-- WhyThisFits
        |           +-- DayInTheLife
        |           +-- WhatIfPreview (collapsed, 2 skills)
        |           +-- ActionButtons (Build Roadmap | Compare | Save)
        |
        +-- NarrativeProfile
        |     +-- SectionBlock (x6)
        |     +-- ReadingTimeEstimate
        |
        +-- Tabs / Accordion for deep-dives:
        |     +-- Tab: "Explore All Careers"
        |     |     +-- CareerExplorer
        |     |           +-- SearchField
        |     |           +-- FilterBar
        |     |           +-- SortControls
        |     |           +-- MiniMatchCard (grid, paginated)
        |     |           +-- CompareBar (sticky, 2-4 selected)
        |     |
        |     +-- Tab: "What-If Scenarios"
        |     |     +-- WhatIfEngine
        |     |           +-- CareerSelector (dropdown of top matches)
        |     |           +-- ProjectedGauge
        |     |           +-- SkillToggleList
        |     |           +-- ImpactSummary
        |     |
        |     +-- Tab: "Profile Comparison"
        |           +-- ProfileComparison
        |                 +-- ComparisonRadar
        |                 +-- AlignmentSummary
        |                 +-- SkillGapBars
        |
        +-- SharePanel
        |     +-- DownloadButton
        |     +-- SocialShareButtons (LinkedIn, Twitter, Copy)
        |     +-- PDFExportButton
        |
        +-- RecalibrationLink ("These results don't feel accurate?")
              +-- RecalibrationFlow (slide-over panel)
```

---

## 15. API Contracts

### Existing Endpoints (No Changes)

| Method | Path                           | Purpose                        |
|--------|--------------------------------|-------------------------------|
| POST   | /assessment                    | Submit answers, get matches    |
| GET    | /assessment/:userId            | Retrieve saved results         |
| POST   | /assessment/certificates       | Certificate recommendations    |
| POST   | /assessment/career-recommendations | Portfolio/networking/jobs   |
| POST   | /assessment/skill-gap-analysis | Detailed skill gap analysis    |

### New Endpoints Required

#### POST /assessment/full-results

Enriches basic results with extended career data, RIASEC/Big Five profiles, and narrative.

```typescript
// Request
{ userId: string }

// Response
{
  archetype: CareerArchetype;
  riasec: RIASECProfile;
  bigFive: BigFiveProfile;
  topMatches: ExtendedCareerMatch[];    // Top 5
  allMatches: ExtendedCareerMatch[];    // All ranked (paginated)
  narrativeProfile: string;
  shareId: string;                       // For share URL
}
```

**Implementation note:** RIASEC/BigFive derivation and narrative generation could run on either frontend or backend. Recommendation: **frontend derivation** for RIASEC/BigFive/archetype (pure functions, no secrets needed), **backend storage** of the share-ready card data (for OG image generation).

#### POST /assessment/feedback

Stores recalibration feedback.

```typescript
// Request
{
  userId: string;
  expectedCareer: string;
  surprisingResult: string;
  offDimension: string;
  freeText?: string;
}

// Response
{ success: boolean }
```

#### GET /share/:shareId

Public endpoint returning OG-tagged HTML for social sharing. No auth required.

```typescript
// Response: Server-rendered HTML with meta tags
// <meta property="og:image" content="..." />
// <meta property="og:title" content="I'm The Strategic Builder | PathWise" />
```

---

## 16. Accessibility & Performance

### Accessibility (WCAG 2.1 AA)

| Element                | Requirement                                                       |
|------------------------|------------------------------------------------------------------|
| Results reveal         | `aria-live="polite"` on message region; `role="progressbar"` on bar |
| RIASEC hexagon         | `role="img"` + `aria-label="Your RIASEC interest profile: Investigative 85, Realistic 72, ..."` |
| Big Five bars          | Each bar has `role="meter"`, `aria-valuenow`, `aria-label`        |
| Match gauge            | `role="meter"` with value text                                    |
| Career cards           | `role="article"`, heading structure, landmark navigation           |
| Filter controls        | `aria-expanded`, `aria-controls`, proper label associations        |
| Compare bar            | `aria-live="assertive"` for add/remove announcements               |
| What-If toggles        | `role="switch"`, `aria-checked`, announce projected score change   |
| Recalibration modal    | Focus trap, `role="dialog"`, `aria-modal="true"`, Escape closes   |
| Keyboard navigation    | Full tab order through all interactive elements; Enter/Space activates |
| Skip link              | "Skip to results" when reveal is playing                           |
| Color contrast         | All text meets 4.5:1 (verified against teal on white surfaces)     |
| Reduced motion         | `prefers-reduced-motion: reduce` disables all animations, instant reveal |

### Performance

| Target               | Strategy                                                          |
|----------------------|------------------------------------------------------------------|
| LCP < 2.5s           | Critical CSS inlined; charts lazy-loaded after reveal completes   |
| FID < 100ms          | No blocking computation during reveal; RIASEC/BigFive calc deferred |
| CLS < 0.1            | Fixed-height skeleton for each section; no layout shift on data arrival |
| Bundle size           | `html2canvas` and `jspdf` dynamic imports (only on share/export click) |
| Chart rendering       | SVG (not canvas) for RIASEC/BigFive; minimal DOM nodes             |
| Career explorer       | Client-side filter (91 items, no server round-trip); virtualization not needed |
| Image generation      | OG card image generated server-side via Satori or saved on assessment submit |

### Code Splitting

```typescript
// Lazy load heavy components
const CareerExplorer = lazy(() => import('./components/CareerExplorer'));
const WhatIfEngine = lazy(() => import('./components/WhatIfEngine'));
const ProfileComparison = lazy(() => import('./components/ProfileComparison'));
const SharePanel = lazy(() => import('./components/SharePanel'));
const RecalibrationFlow = lazy(() => import('./components/RecalibrationFlow'));
```

---

## 17. Responsive Breakpoints

### 375px (Mobile)

- **Identity Card:** Full-width, stacked layout (hexagon above, Big Five below)
- **Match Cards:** Full-width, single column, gauge inline with title
- **Career Explorer:** Single-column grid, filters in collapsible drawer
- **What-If:** Full-width, skills list vertical
- **Narrative:** Full-width, 1rem font, 1.65 line-height
- **Tabs:** Horizontal scroll tabs (not stacked)
- **Compare bar:** Fixed bottom, compact (career initials, not full names)

### 768px (Tablet)

- **Identity Card:** 2-column (hexagon left, traits right)
- **Match Cards:** Full-width but with more horizontal detail spread
- **Career Explorer:** 2-column grid
- **Compare bar:** Full names visible

### 1024px (Desktop)

- **Identity Card:** 720px centered, 2-column
- **Match Cards:** Full-width within 800px container
- **Career Explorer:** 3-column grid
- **What-If:** 2-column (gauge left, skills right)
- **Profile Comparison:** 2-column (radar left, bars right)

### 1440px (Wide)

- **Max-width container:** 1200px centered
- **Career Explorer:** 4-column grid
- **Side-by-side views available for comparison**

---

## 18. Archetype Definitions

### Complete Archetype Map (20 Archetypes)

Each archetype is derived from the user's dominant RIASEC dimension + secondary RIASEC + dominant Big Five trait. The resolver picks the closest match using weighted distance.

```typescript
export const ARCHETYPES: CareerArchetype[] = [
  // ── Realistic-Primary Archetypes ──────────────────────────────
  {
    id: 'strategic-builder',
    name: 'The Strategic Builder',
    tagline: 'You build systems that scale.',
    primaryRIASEC: 'realistic',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'conscientiousness',
    description: 'Methodical, hands-on, and driven by tangible outcomes. You combine engineering instincts with analytical depth to create things that work reliably at scale.',
  },
  {
    id: 'pragmatic-maker',
    name: 'The Pragmatic Maker',
    tagline: 'You turn ideas into reality.',
    primaryRIASEC: 'realistic',
    secondaryRIASEC: 'enterprising',
    dominantTrait: 'extraversion',
    description: 'You are the bridge between vision and execution. Where others theorize, you prototype. Your bias toward action is balanced by enough strategic thinking to build things worth building.',
  },

  // ── Investigative-Primary Archetypes ──────────────────────────
  {
    id: 'analytical-architect',
    name: 'The Analytical Architect',
    tagline: 'You find the pattern behind the pattern.',
    primaryRIASEC: 'investigative',
    secondaryRIASEC: 'realistic',
    dominantTrait: 'conscientiousness',
    description: 'Rigorous, systematic, and relentlessly curious. You don\'t just solve problems -- you redesign the frameworks that generate them. Your thinking is architecturally sound and empirically grounded.',
  },
  {
    id: 'creative-explorer',
    name: 'The Creative Explorer',
    tagline: 'You connect dots nobody else sees.',
    primaryRIASEC: 'investigative',
    secondaryRIASEC: 'artistic',
    dominantTrait: 'openness',
    description: 'Your curiosity has no boundaries. You move between disciplines with ease, pulling insights from unexpected places and synthesizing them into novel solutions. Your mind is a pattern-recognition engine that thrives on complexity.',
  },
  {
    id: 'truth-seeker',
    name: 'The Truth Seeker',
    tagline: 'You follow evidence wherever it leads.',
    primaryRIASEC: 'investigative',
    secondaryRIASEC: 'conventional',
    dominantTrait: 'conscientiousness',
    description: 'Meticulous, evidence-driven, and intellectually honest. You have a rare ability to set aside assumptions and let data guide your conclusions, even when those conclusions are uncomfortable.',
  },

  // ── Artistic-Primary Archetypes ───────────────────────────────
  {
    id: 'visionary-creator',
    name: 'The Visionary Creator',
    tagline: 'You imagine what doesn\'t exist yet.',
    primaryRIASEC: 'artistic',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'openness',
    description: 'You live at the intersection of imagination and intellect. Your creative output isn\'t random -- it\'s informed by deep understanding. You create things that are both beautiful and smart.',
  },
  {
    id: 'empathetic-designer',
    name: 'The Empathetic Designer',
    tagline: 'You design for humans, not users.',
    primaryRIASEC: 'artistic',
    secondaryRIASEC: 'social',
    dominantTrait: 'agreeableness',
    description: 'Your creativity is fueled by empathy. You don\'t just design experiences -- you advocate for the people who will use them. Your work is human-centered in the truest sense.',
  },
  {
    id: 'bold-innovator',
    name: 'The Bold Innovator',
    tagline: 'You break conventions with purpose.',
    primaryRIASEC: 'artistic',
    secondaryRIASEC: 'enterprising',
    dominantTrait: 'openness',
    description: 'You challenge the status quo not for shock value, but because you see better possibilities. Your creative confidence is backed by strategic instincts that turn disruption into value.',
  },

  // ── Social-Primary Archetypes ─────────────────────────────────
  {
    id: 'empathetic-guide',
    name: 'The Empathetic Guide',
    tagline: 'You help people become who they are.',
    primaryRIASEC: 'social',
    secondaryRIASEC: 'artistic',
    dominantTrait: 'agreeableness',
    description: 'Your deepest fulfillment comes from facilitating growth in others. You have an intuitive read on people\'s potential and a gentle persistence in helping them realize it.',
  },
  {
    id: 'community-catalyst',
    name: 'The Community Catalyst',
    tagline: 'You bring people together around purpose.',
    primaryRIASEC: 'social',
    secondaryRIASEC: 'enterprising',
    dominantTrait: 'extraversion',
    description: 'You see the connective tissue between people and ideas that others miss. Your talent is creating spaces -- physical or digital -- where collaboration naturally emerges and impact multiplies.',
  },
  {
    id: 'nurturing-strategist',
    name: 'The Nurturing Strategist',
    tagline: 'You protect and develop what matters.',
    primaryRIASEC: 'social',
    secondaryRIASEC: 'conventional',
    dominantTrait: 'conscientiousness',
    description: 'You combine deep caring with practical execution. Where others offer sympathy, you offer systems: processes, structures, and plans that turn good intentions into sustained outcomes.',
  },

  // ── Enterprising-Primary Archetypes ───────────────────────────
  {
    id: 'visionary-leader',
    name: 'The Visionary Leader',
    tagline: 'You see the future and rally others toward it.',
    primaryRIASEC: 'enterprising',
    secondaryRIASEC: 'social',
    dominantTrait: 'extraversion',
    description: 'You don\'t just lead -- you inspire. Your ability to articulate a compelling vision and mobilize diverse teams toward it is your defining professional asset. You think in terms of leverage and multiplied impact.',
  },
  {
    id: 'calculated-disruptor',
    name: 'The Calculated Disruptor',
    tagline: 'You take smart risks for outsized returns.',
    primaryRIASEC: 'enterprising',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'openness',
    description: 'Your entrepreneurial instincts are sharpened by analytical rigor. You don\'t gamble -- you identify asymmetric opportunities where the upside vastly outweighs the risk, then move decisively.',
  },
  {
    id: 'ambitious-executor',
    name: 'The Ambitious Executor',
    tagline: 'You turn ambition into achievement.',
    primaryRIASEC: 'enterprising',
    secondaryRIASEC: 'realistic',
    dominantTrait: 'conscientiousness',
    description: 'You combine competitive drive with operational excellence. Your ambition isn\'t abstract -- it\'s channeled into disciplined execution, measurable targets, and a relentless focus on results.',
  },
  {
    id: 'charismatic-connector',
    name: 'The Charismatic Connector',
    tagline: 'You open doors others didn\'t know existed.',
    primaryRIASEC: 'enterprising',
    secondaryRIASEC: 'social',
    dominantTrait: 'agreeableness',
    description: 'Your superpower is relationships. You build networks that create value for everyone involved, and you do it with genuine warmth, not transactional calculation. People trust you because you earn it.',
  },

  // ── Conventional-Primary Archetypes ───────────────────────────
  {
    id: 'systems-guardian',
    name: 'The Systems Guardian',
    tagline: 'You make complex things run smoothly.',
    primaryRIASEC: 'conventional',
    secondaryRIASEC: 'realistic',
    dominantTrait: 'conscientiousness',
    description: 'You find deep satisfaction in order, efficiency, and reliability. Where others see tedious processes, you see elegant systems. Your attention to detail and process discipline make you the person everyone relies on when precision matters.',
  },
  {
    id: 'precision-analyst',
    name: 'The Precision Analyst',
    tagline: 'You find truth in the numbers.',
    primaryRIASEC: 'conventional',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'conscientiousness',
    description: 'You combine methodical rigor with intellectual curiosity. Your analyses are thorough, your conclusions are defensible, and your recommendations are grounded in evidence that others can trust.',
  },

  // ── Cross-Dimensional Archetypes ──────────────────────────────
  {
    id: 'renaissance-mind',
    name: 'The Renaissance Mind',
    tagline: 'You defy categorization -- and that\'s your edge.',
    primaryRIASEC: 'artistic',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'openness',
    description: 'You don\'t fit neatly into one box, and that\'s precisely your advantage. Your ability to move fluidly between creative, analytical, and interpersonal modes makes you exceptionally adaptable and valuable in roles that reward range.',
  },
  {
    id: 'quiet-powerhouse',
    name: 'The Quiet Powerhouse',
    tagline: 'You deliver impact without the noise.',
    primaryRIASEC: 'investigative',
    secondaryRIASEC: 'realistic',
    dominantTrait: 'conscientiousness',
    description: 'You let your work speak for itself. While others jockey for visibility, you focus on producing outcomes of undeniable quality. Your influence is earned through competence, not volume.',
  },
  {
    id: 'adaptive-navigator',
    name: 'The Adaptive Navigator',
    tagline: 'You thrive wherever the current takes you.',
    primaryRIASEC: 'social',
    secondaryRIASEC: 'investigative',
    dominantTrait: 'openness',
    description: 'You combine social intelligence with intellectual curiosity, making you remarkably effective in fluid, cross-functional environments. You read situations quickly, adapt your approach, and find the path forward even in uncharted territory.',
  },
];
```

### Archetype Resolution Algorithm

```typescript
// In hooks/useArchetype.ts

function resolveArchetype(riasec: RIASECProfile, bigFive: BigFiveProfile): CareerArchetype {
  // Step 1: Find top 2 RIASEC dimensions
  const riasecEntries = Object.entries(riasec) as [string, number][];
  riasecEntries.sort((a, b) => b[1] - a[1]);
  const primary = riasecEntries[0][0];
  const secondary = riasecEntries[1][0];

  // Step 2: Find dominant Big Five trait
  const bigFiveEntries = Object.entries(bigFive) as [string, number][];
  bigFiveEntries.sort((a, b) => b[1] - a[1]);
  const dominantTrait = bigFiveEntries[0][0];

  // Step 3: Score each archetype by weighted match
  let bestMatch: CareerArchetype = ARCHETYPES[ARCHETYPES.length - 1]; // fallback
  let bestScore = -1;

  for (const arch of ARCHETYPES) {
    let score = 0;

    // Primary RIASEC match (weight: 3)
    if (arch.primaryRIASEC === primary) score += 3;
    else if (arch.primaryRIASEC === secondary) score += 1;

    // Secondary RIASEC match (weight: 2)
    if (arch.secondaryRIASEC === secondary) score += 2;
    else if (arch.secondaryRIASEC === primary) score += 0.5;

    // Dominant trait match (weight: 2)
    if (arch.dominantTrait === dominantTrait) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = arch;
    }
  }

  return bestMatch;
}
```

---

## Design Token Reference

All components use existing PathWise design tokens from `src/index.css`:

| Token                          | Value       | Usage in Results                          |
|--------------------------------|-------------|-------------------------------------------|
| `--surface`                    | #eefcfe     | Page background                           |
| `--surface-lumina`             | #faf9fe     | Card backgrounds                          |
| `--surface-bright`             | #ffffff     | Inner card surfaces                       |
| `--surface-container`          | #ddebed     | Chart backgrounds, bar tracks             |
| `--secondary`                  | #006a62     | Primary accent, Excellent tier, chart fills|
| `--secondary-light`            | #00a396     | Strong tier, hover states                 |
| `--copper`                     | #8b4f2c     | Gap indicators (warm, not red), accents   |
| `--tertiary-container`         | #caa842     | Good tier, medium impact badges           |
| `--on-surface`                 | #1a1c1f     | Primary text                              |
| `--on-surface-variant`         | #49454f     | Secondary text                            |
| `--on-surface-muted`           | #78747e     | Tertiary text, captions                   |
| `--outline-variant`            | rgba(73,69,79,0.10) | Borders, chart grid lines          |
| `--font-display`               | Manrope     | Headings, archetype name, scores          |
| `--font-body`                  | Inter       | Body text, descriptions                   |
| `--radius-xl`                  | 1.5rem      | Card corners                              |
| `--shadow-md`                  | primary-tinted | Card hover elevation                   |
| `--shadow-glow`                | primary-tinted | Archetype celebration glow             |
| `--transition-base`            | 0.3s ease-out | Standard interactions                  |
| `--transition-spring`          | 0.5s spring | Celebration moments                       |

---

## Implementation Priority

### Phase 1 (MVP -- ship first)
1. Results Reveal animation (replacing current spinner)
2. Archetype resolver + Identity Card (header only, no sharing yet)
3. Enhanced Career Match Cards (with "Why This Fits" + tier gauges)
4. Narrative Profile (template engine + 6 sections)

### Phase 2 (Depth)
5. Career Explorer (filterable grid)
6. What-If Scenario Engine
7. Profile Comparison (radar overlay + gap bars)
8. Micro-Feedback between assessment phases

### Phase 3 (Social + Polish)
9. Share & Save (card download, social sharing, OG route)
10. PDF export
11. Recalibration Flow
12. Compare mode in Career Explorer

---

## Open Questions

1. **OG Image Generation:** Server-side (Satori/Vercel OG) vs. client-side (html2canvas on submit, upload to storage)?
   - Recommendation: Server-side via Satori at the `/share/:id` route for reliability.

2. **Career profile data enrichment:** The existing 91 profiles lack `dayInTheLife`, `salaryRange`, `growthOutlook`, `remoteFriendliness`, and `educationRequired` fields. These need to be authored and added to `career-profiles.ts` (et al.).
   - Estimate: ~2-3 hours of content authoring across 91 profiles.

3. **What-If accuracy:** The client-side heuristic is approximate. Should we expose a backend endpoint that re-runs the actual scoring engine with hypothetical skill additions?
   - Recommendation: Start with client-side heuristic (simpler, faster); add backend accuracy endpoint in Phase 2 if users report disconnect between What-If projections and actual retake results.

4. **Narrative tone calibration:** The template-based approach produces good-but-predictable text. Should we eventually add an LLM layer (optional, user-triggered) for more personalized narratives?
   - Recommendation: Templates for v1 (no API dependency, instant generation, fully offline). LLM enhancement as a premium feature in v2.
