# PathWise Career Assessment v2 -- Complete UX Specification

**Status:** Design spec (pre-implementation)
**Last updated:** 2026-04-06
**Authored by:** Design + Engineering (full-stack spec)

---

## Table of Contents

1. [Design Philosophy & Rationale](#1-design-philosophy--rationale)
2. [Information Architecture](#2-information-architecture)
3. [Screen-by-Screen Specification](#3-screen-by-screen-specification)
4. [Component Library](#4-component-library)
5. [State Management & Persistence](#5-state-management--persistence)
6. [Animation & Motion Design](#6-animation--motion-design)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Accessibility Specification](#8-accessibility-specification)
9. [Backend Integration Contract](#9-backend-integration-contract)
10. [Migration from v1](#10-migration-from-v1)

---

## 1. Design Philosophy & Rationale

### Why Redesign

The current assessment (`src/pages/Assessment/index.tsx`) shows all questions per section on a single scrollable card. This creates two problems:

1. **Cognitive overload** -- users see 3-4 questions stacked with 4-5 options each, making the screen feel heavy and test-like.
2. **Completion anxiety** -- the progress bar shows "Step 3 of 6" but each step contains multiple questions, so users cannot gauge true progress.

Research (16Personalities, BetterUp, Plum.io) shows that **one question per screen** increases assessment completion rates by 15-25%. The user perceives rapid progress because each answer advances the entire screen.

### Design System Alignment

All screens use the existing PathWise "Zen Stone" design tokens from `src/index.css`:

| Token | Value | Usage in Assessment |
|-------|-------|-------------------|
| `--surface` | `#eefcfe` | Full-screen background behind cards |
| `--surface-container-lowest` | `#ffffff` | Question card background |
| `--surface-container-low` | `#e8f6f8` | Unselected option buttons |
| `--copper` | `#8b4f2c` | Selected state, eyebrow text, active accents |
| `--secondary` | `#006a62` | Phase 1/4/6 teal accent color |
| `--on-surface` | `#1a1c1f` | Primary text |
| `--on-surface-variant` | `#49454f` | Secondary/descriptive text |
| `--on-surface-muted` | `#78747e` | Hints, progress labels |
| `--font-display` | Manrope | Headings, progress, scores |
| `--font-body` | Inter | Body text, option labels |
| `--radius-2xl` | `2rem` | Question card corners |
| `--radius-full` | `9999px` | Buttons, chips, progress bar |
| `--shadow-sm` | Primary-tinted | Card elevation |
| `--transition-base` | `0.3s cubic-bezier(0.33, 1, 0.68, 1)` | Default transitions |
| `--transition-spring` | `0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` | Selection bounce |

### Phase Color Accents

Each phase uses a subtle accent color for its progress indicator and selected-state halo. These do NOT replace the copper selection color -- they add a phase-specific tint to the progress bar and transition screens.

| Phase | Accent | CSS Variable | Hex |
|-------|--------|-------------|-----|
| 1. RIASEC Interests | Teal | `--secondary` | `#006a62` |
| 2. Big Five Personality | Warm Copper | `--copper` | `#8b4f2c` |
| 3. Values | Gold | `--tertiary-container` | `#caa842` |
| 4. Work DNA | Teal | `--secondary` | `#006a62` |
| 5. Aptitudes | Warm Copper | `--copper` | `#8b4f2c` |
| 6. Life Context | Teal | `--secondary` | `#006a62` |

---

## 2. Information Architecture

### Flow Map

```
[Welcome Screen]
       |
       v
[Phase 1: RIASEC Interests] -- 24 questions, one per screen
       |
       v
[Transition 1: Interest Summary]
       |
       v
[Phase 2: Big Five Personality] -- 20 questions, one per screen
       |
       v
[Transition 2: Personality Summary]
       |
       v
[Phase 3: Values] -- 12 questions (11 forced-choice + 1 ranking)
       |
       v
[Transition 3: Values Summary]
       |
       v
[Phase 4: Work DNA] -- 10 questions, one per screen
       |
       v
[Transition 4: Partial Results Teaser] <-- KEY RETENTION HOOK
       |
       v
[Phase 5: Aptitudes] -- 8 questions, one per screen
       |
       v
[Transition 5: Almost There]
       |
       v
[Phase 6: Life Context] -- 8 questions, mixed formats
       |
       v
[Analyzing Screen] -- 8s animated loader
       |
       v
[Results / Career Matches]
```

### Question Budget

| Phase | Questions | Format | Est. Time |
|-------|-----------|--------|-----------|
| Welcome | 0 | Read + CTA | 15s |
| Phase 1: RIASEC | 24 | Like / Neutral / Dislike | 3.5 min |
| Transition 1 | 0 | Auto-advance | 2s |
| Phase 2: Big Five | 20 | 5-point Likert | 3 min |
| Transition 2 | 0 | Auto-advance | 2s |
| Phase 3: Values | 12 | Forced-choice pairs + ranking | 2 min |
| Transition 3 | 0 | Auto-advance | 2s |
| Phase 4: Work DNA | 10 | Scenario + 4 options | 2 min |
| Transition 4 | 0 | Tap to continue | 3s |
| Phase 5: Aptitudes | 8 | 5-point behavioral scale | 1.5 min |
| Transition 5 | 0 | Auto-advance | 2s |
| Phase 6: Context | 8 | Mixed (dropdown, chips, select) | 2 min |
| Analyzing | 0 | Animated sequence | 8s |
| **Total** | **82** | | **~15 min** |

### Resume Flow (returning user)

```
[App Mount]
    |
    v
[Check localStorage for `pw_assessment_v2`]
    |
    +-- Found with < 100% completion
    |       |
    |       v
    |   [Resume Modal]
    |   "You left off on Phase X, Question Y"
    |   [Resume] [Start Over]
    |
    +-- Not found or completed
            |
            v
        [Welcome Screen]
```

---

## 3. Screen-by-Screen Specification

### 3.0 Welcome Screen

**Purpose:** Set expectations, reduce anxiety, build excitement.

**Layout (wireframe):**
```
+--------------------------------------------------+
|                                                  |
|           [Panda mascot: celebrating]            |
|                  (120px)                         |
|                                                  |
|         Discover Your Career DNA                 |
|    (display-lg, Manrope 800, centered)          |
|                                                  |
|  A 15-minute assessment powered by career        |
|  science. No wrong answers.                      |
|    (body, Inter 400, --on-surface-variant)       |
|                                                  |
|  +--------------------------------------------+ |
|  |  [clock icon]  Takes about 15 minutes      | |
|  +--------------------------------------------+ |
|  |  [target icon] Career matches              | |
|  +--------------------------------------------+ |
|  |  [user icon]   Personality profile          | |
|  +--------------------------------------------+ |
|  |  [zap icon]    Skill insights              | |
|  +--------------------------------------------+ |
|    (feature list: icon + label, stacked)        |
|                                                  |
|         [ Start Assessment ]                     |
|    (btn, dark teal gradient, full-width mobile) |
|                                                  |
+--------------------------------------------------+
```

**Visual details:**
- Background: `var(--surface)` full bleed
- Card: `var(--surface-container-lowest)`, `border-radius: var(--radius-2xl)`, `max-width: 520px`, centered
- Panda: `<Panda mood="celebrating" size={120} animate />` with a gentle float animation (3s ease-in-out infinite, translateY 0 to -8px)
- Headline: `font-family: var(--font-display)`, `font-weight: 800`, `font-size: clamp(1.75rem, 3.5vw, 2.25rem)`, `color: var(--on-surface)`
- Subtext: `font-size: 1rem`, `color: var(--on-surface-variant)`, `line-height: 1.6`
- Feature list items: `background: var(--surface-container-low)`, `border-radius: var(--radius-xl)`, `padding: 0.85rem 1.15rem`, icon color `var(--secondary)`, text `var(--on-surface)` weight 600
- CTA button: `background: linear-gradient(135deg, #334042, #4a5759)`, full-width on mobile, `max-width: 320px` on desktop, `padding: 1rem 2.25rem`, `border-radius: var(--radius-full)`

**Interactions:**
- CTA hover: `translateY(-2px)`, shadow deepens
- CTA focus: `box-shadow: 0 0 0 3px rgba(0, 106, 98, 0.3)` (teal focus ring)
- Keyboard: Enter/Space triggers CTA

---

### 3.1 Phase Progress Bar (persistent header)

**Appears on every question screen (Phases 1-6). NOT shown on welcome, transitions, analyzing, or results.**

**Layout (wireframe):**
```
+--------------------------------------------------+
|  Phase 1 of 6  [===-----] What Energizes You?   |
|                 (micro-progress within phase)    |
+--------------------------------------------------+
```

**Two-tier progress system:**

**Tier 1: Phase indicator (top)**
```
+--------------------------------------------------+
|  [1] [2] [3] [4] [5] [6]                        |
|   ^                                              |
|   active: filled circle with phase accent color  |
|   completed: filled circle with checkmark        |
|   upcoming: hollow circle, --surface-container   |
+--------------------------------------------------+
```
- Phase dots: 28px diameter circles
- Active: filled with phase accent color, white number inside
- Completed: filled with `var(--secondary)`, white checkmark icon
- Upcoming: `background: var(--surface-container)`, `color: var(--on-surface-muted)` number
- Dots connected by a 2px line: completed sections colored, upcoming gray
- Spacing: `gap: 0` (line connects them), container centered, `max-width: 280px`

**Tier 2: Micro-progress bar (below dots)**
```
+--------------------------------------------------+
|  [==========-----------]  8 / 24                 |
+--------------------------------------------------+
```
- Full-width bar within the card, `height: 3px`
- Track: `var(--surface-container)`
- Fill: phase accent color, `transition: width 0.4s ease`
- Label (right-aligned): `font-size: 0.72rem`, `color: var(--on-surface-muted)`, `font-weight: 600`
- Shows question number within current phase (e.g., "8 / 24"), NOT global count

**Tier 3: Phase header**
- Phase name in eyebrow style: `font-size: 0.68rem`, `font-weight: 700`, `letter-spacing: 0.12em`, `text-transform: uppercase`, `color: [phase accent]`

---

### 3.2 Phase 1: RIASEC Interests (24 questions)

**Header:** "What Energizes You?"
**Format:** Statement card with 3-button response (Like / Neutral / Dislike)
**Phase accent:** Teal (`var(--secondary)`)

**Question screen layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1 active]                          |
|  [====-------]  3 / 24                           |
|                                                  |
|  WHAT ENERGIZES YOU?                             |
|  (eyebrow, teal)                                 |
|                                                  |
|  "I enjoy figuring out how                       |
|   machines and tools work."                      |
|  (display text, Manrope 700, 1.4rem, centered)  |
|                                                  |
|                                                  |
|  [ Dislike ]  [ Neutral ]  [ Like ]              |
|  (3-button row, pill shape, equal width)        |
|                                                  |
+--------------------------------------------------+
```

**Statement card:**
- The statement is the entire focus of the screen
- `font-family: var(--font-display)`, `font-weight: 700`, `font-size: clamp(1.15rem, 3vw, 1.4rem)`
- `color: var(--on-surface)`, `text-align: center`, `line-height: 1.4`
- `max-width: 440px`, centered with `margin: 0 auto`
- Quotes rendered as styled open/close marks in `var(--on-surface-muted)` at `font-size: 2rem`

**Response buttons (Like / Neutral / Dislike):**
- Horizontal row, 3 equal-width buttons
- Container: `display: grid`, `grid-template-columns: 1fr 1fr 1fr`, `gap: 12px`
- Each button: `padding: 0.85rem 0`, `border-radius: var(--radius-full)`, `font-weight: 600`, `font-size: 0.88rem`
- Default: `background: var(--surface-container-low)`, `color: var(--on-surface-variant)`
- Hover: `background: var(--surface-container)`, `transform: translateY(-1px)`
- Selected states:
  - **Like:** `background: var(--secondary)`, `color: #fff`, `box-shadow: 0 4px 16px rgba(0, 106, 98, 0.25)`
  - **Neutral:** `background: var(--surface-container-high)`, `color: var(--on-surface)`
  - **Dislike:** `background: var(--surface-container)`, `color: var(--on-surface-variant)`, `opacity: 0.85`
- Icons inside buttons (optional, Lucide): Like = `ThumbsUp` 16px, Neutral = `Minus` 16px, Dislike = `ThumbsDown` 16px
- Selection triggers auto-advance to next question after 300ms delay (no Continue button needed for this format)

**Auto-advance behavior:**
- On selection: button scales to 0.97, color changes immediately (150ms)
- After 300ms pause: screen slides left, next question slides in from right
- User can tap Back arrow (top-left) to return to previous question -- answer is preserved

**RIASEC question content (24 statements):**

Each maps to one of the 6 RIASEC types (R/I/A/S/E/C). 4 statements per type:

| # | Statement | RIASEC |
|---|-----------|--------|
| 1 | I enjoy figuring out how machines and tools work. | R |
| 2 | I like building or assembling things with my hands. | R |
| 3 | I prefer working outdoors or with physical materials. | R |
| 4 | I find satisfaction in fixing or repairing broken things. | R |
| 5 | I enjoy analyzing data to find hidden patterns. | I |
| 6 | I like reading scientific or technical articles. | I |
| 7 | I prefer solving complex puzzles and abstract problems. | I |
| 8 | I'm drawn to understanding how systems work at a deep level. | I |
| 9 | I enjoy creating visual art, music, or writing. | A |
| 10 | I like designing layouts, interfaces, or physical spaces. | A |
| 11 | I prefer open-ended projects where I set the direction. | A |
| 12 | I'm drawn to work that lets me express original ideas. | A |
| 13 | I enjoy helping people work through personal challenges. | S |
| 14 | I like teaching, mentoring, or coaching others. | S |
| 15 | I prefer roles that involve a lot of teamwork and collaboration. | S |
| 16 | I find meaning in work that directly improves people's lives. | S |
| 17 | I enjoy persuading others or pitching ideas. | E |
| 18 | I like taking charge of projects and setting goals for a team. | E |
| 19 | I'm drawn to competitive environments with clear winners. | E |
| 20 | I prefer roles with high visibility and leadership opportunity. | E |
| 21 | I enjoy organizing files, schedules, or systems. | C |
| 22 | I like working with detailed data and records. | C |
| 23 | I prefer clear procedures and step-by-step processes. | C |
| 24 | I find satisfaction in accuracy and getting every detail right. | C |

**Scoring:** Like = +2, Neutral = +1, Dislike = 0. Sum per RIASEC type (max 8 per type). Top 2-3 types become the RIASEC code.

---

### 3.3 Transition Screen 1 (after Phase 1)

**Layout (wireframe):**
```
+--------------------------------------------------+
|                                                  |
|        [Panda mood: happy, size: 100]            |
|                                                  |
|           Great start!                           |
|  (Manrope 800, 1.5rem, centered)                |
|                                                  |
|  Your interests lean toward                      |
|  Investigative & Artistic                        |
|  (body text + bold colored labels)              |
|                                                  |
|  [Phase dots showing 1 complete, 2 next]        |
|                                                  |
|  Auto-advance in 2s or tap to continue          |
|  (--on-surface-muted, 0.75rem)                  |
|                                                  |
+--------------------------------------------------+
```

**Visual details:**
- Full card, centered, same card styling as question screens
- Panda: `<Panda mood="happy" size={100} animate />`
- Headline: `font-family: var(--font-display)`, `font-weight: 800`, `font-size: 1.5rem`
- Computed labels (top 2 RIASEC): displayed as colored chips with teal background
  - `background: rgba(0, 106, 98, 0.08)`, `color: var(--secondary)`, `font-weight: 700`, `padding: 0.4rem 1rem`, `border-radius: var(--radius-full)`
- Auto-advance countdown: subtle 2s timer, circular progress ring around the panda (2px stroke, teal, animates clockwise)
- Tap anywhere on card to advance immediately
- Back button hidden on transition screens

**Computation for labels:**
```typescript
const riasecNames: Record<string, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic',
  S: 'Social', E: 'Enterprising', C: 'Conventional'
};
// Sum Like/Neutral/Dislike scores, take top 2
```

---

### 3.4 Phase 2: Big Five Personality (20 questions)

**Header:** "Your Work Personality"
**Format:** 5-point Likert scale (horizontal pill buttons)
**Phase accent:** Warm Copper (`var(--copper)`)

**Question screen layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1 done, 2 active]                 |
|  [=====------]  7 / 20                           |
|                                                  |
|  YOUR WORK PERSONALITY                           |
|  (eyebrow, copper)                               |
|                                                  |
|  "I tend to start tasks well                     |
|   ahead of deadlines."                           |
|  (display text, centered)                        |
|                                                  |
|  Strongly                              Strongly  |
|  Disagree                                Agree   |
|  [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]                 |
|  (5 pill buttons, equal width)                   |
|                                                  |
+--------------------------------------------------+
```

**Likert scale buttons:**
- Container: `display: grid`, `grid-template-columns: repeat(5, 1fr)`, `gap: 8px`
- Each button: `aspect-ratio: 1` on mobile (square), `min-height: 52px`, `border-radius: var(--radius-xl)`
- Default: `background: var(--surface-container-low)`, number label in `var(--on-surface-muted)`
- Hover: `background: var(--surface-container)`
- Selected: `background: var(--copper)`, `color: #fff`, `box-shadow: 0 4px 16px rgba(139, 79, 44, 0.25)`, `transform: scale(1.05)`
- Adjacent to selected (for visual gradient effect): `background: rgba(139, 79, 44, 0.06)`
- Anchors at ends: "Strongly Disagree" (left) and "Strongly Agree" (right), `font-size: 0.7rem`, `color: var(--on-surface-muted)`, `font-weight: 500`
- Auto-advance on selection (300ms delay, same as Phase 1)

**Big Five questions (20 statements, 4 per trait):**

| # | Statement | Trait | Direction |
|---|-----------|-------|-----------|
| 1 | I tend to start tasks well ahead of deadlines. | Conscientiousness | + |
| 2 | I keep my workspace and files well organized. | Conscientiousness | + |
| 3 | I sometimes leave things unfinished when I lose interest. | Conscientiousness | - |
| 4 | I follow through on commitments even when it's inconvenient. | Conscientiousness | + |
| 5 | I enjoy meeting new people and striking up conversations. | Extraversion | + |
| 6 | I feel energized after group brainstorming sessions. | Extraversion | + |
| 7 | I prefer to think before speaking up in meetings. | Extraversion | - |
| 8 | I'm usually the one to suggest team social events. | Extraversion | + |
| 9 | I get excited by unexpected changes to plans. | Openness | + |
| 10 | I enjoy exploring ideas that have no obvious practical use. | Openness | + |
| 11 | I prefer tried-and-true methods over experimental approaches. | Openness | - |
| 12 | I actively seek out perspectives that differ from my own. | Openness | + |
| 13 | I prioritize maintaining good relationships at work, even when it means compromising. | Agreeableness | + |
| 14 | I find it easy to see situations from other people's point of view. | Agreeableness | + |
| 15 | I'm comfortable pushing back on ideas I disagree with. | Agreeableness | - |
| 16 | I naturally volunteer to help colleagues who are struggling. | Agreeableness | + |
| 17 | I stay calm and focused under tight deadlines. | Emotional Stability | + |
| 18 | Criticism from my manager rarely affects my mood for long. | Emotional Stability | + |
| 19 | I tend to worry about things that might go wrong. | Emotional Stability | - |
| 20 | I recover quickly from setbacks and disappointments. | Emotional Stability | + |

**Scoring:** 1-5 scale. Reverse-score negative-direction items (score = 6 - raw). Average per trait. Top 2 traits by absolute distance from midpoint (3.0) are highlighted.

---

### 3.5 Transition Screen 2 (after Phase 2)

**Layout:** Same structure as Transition 1.
- Panda mood: `thinking`
- Headline: "Interesting!"
- Body: "You show strong **[Trait 1]** and **[Trait 2]**"
- Trait labels as copper-tinted chips: `background: rgba(139, 79, 44, 0.08)`, `color: var(--copper)`
- Auto-advance 2s

---

### 3.6 Phase 3: Values (12 questions)

**Header:** "What Matters to You?"
**Phase accent:** Gold (`var(--tertiary-container)`)

**Two formats within this phase:**

#### Format A: Forced-Choice Pairs (Questions 1-11)

**Layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1,2 done, 3 active]               |
|  [====-------]  5 / 12                           |
|                                                  |
|  WHAT MATTERS TO YOU?                            |
|  (eyebrow, gold)                                 |
|                                                  |
|  Which matters more to you?                      |
|  (sub-heading, 0.88rem)                          |
|                                                  |
|  +--------------------------------------------+ |
|  |                                            | |
|  |     High salary with long hours            | |
|  |                                            | |
|  +--------------------------------------------+ |
|                                                  |
|                   OR                             |
|  (centered divider, --on-surface-muted)         |
|                                                  |
|  +--------------------------------------------+ |
|  |                                            | |
|  |     Moderate salary with flexible hours    | |
|  |                                            | |
|  +--------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
```

**Forced-choice button styling:**
- Each option: full-width button, `min-height: 72px`, `padding: 1.25rem 1.5rem`, `border-radius: var(--radius-2xl)`
- Default: `background: var(--surface-container-low)`, `color: var(--on-surface)`, `font-weight: 600`, `font-size: 0.95rem`, `text-align: center`
- Hover: `background: var(--surface-container)`, `transform: translateY(-2px)`, `box-shadow: var(--shadow-sm)`
- Selected: `background: var(--copper)`, `color: #fff`, `box-shadow: 0 4px 20px rgba(139, 79, 44, 0.2)`
- "OR" divider: `font-size: 0.75rem`, `font-weight: 700`, `letter-spacing: 0.1em`, `color: var(--on-surface-muted)`, flanked by `1px solid var(--surface-container)` lines
- Auto-advance on selection (300ms)

**Values pairs (11 forced-choice):**

| # | Option A | Option B | Dimension |
|---|----------|----------|-----------|
| 1 | High salary with long hours | Moderate salary with flexible hours | Wealth vs Balance |
| 2 | Prestigious title at a big company | Meaningful role at a small nonprofit | Status vs Purpose |
| 3 | Stable job you find boring | Risky job you find thrilling | Security vs Stimulation |
| 4 | Lead a team of 20 people | Be the top individual contributor | Power vs Mastery |
| 5 | Work on cutting-edge technology | Work on proven, reliable systems | Innovation vs Tradition |
| 6 | Travel 50% of the time for work | Never leave your home office | Adventure vs Comfort |
| 7 | Solve the same type of problem expertly | Solve a new type of problem each week | Depth vs Variety |
| 8 | Full creative freedom with no mentorship | Clear guidance with limited autonomy | Independence vs Structure |
| 9 | Help 1,000 people a little | Help 10 people profoundly | Breadth vs Depth of Impact |
| 10 | Fast promotion with heavy politics | Slow growth in a supportive culture | Ambition vs Harmony |
| 11 | Remote work, isolated from team | Office work, embedded in team culture | Autonomy vs Belonging |

#### Format B: Value Ranking Exercise (Question 12)

**Layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1,2 done, 3 active]               |
|  [===========]  12 / 12                          |
|                                                  |
|  WHAT MATTERS TO YOU?                            |
|                                                  |
|  Drag to rank these values from                  |
|  most to least important:                        |
|                                                  |
|  [ 1. Financial Security        ] [drag handle] |
|  [ 2. Work-Life Balance         ] [drag handle] |
|  [ 3. Creative Expression       ] [drag handle] |
|  [ 4. Helping Others            ] [drag handle] |
|  [ 5. Career Advancement        ] [drag handle] |
|                                                  |
|  (drag handles: GripVertical icon, 16px)        |
|                                                  |
|         [ Continue ]                             |
|  (btn, needed here since no auto-advance)       |
+--------------------------------------------------+
```

**Ranking interaction:**
- 5 value items in a vertical list
- Each item: `padding: 1rem 1.25rem`, `border-radius: var(--radius-xl)`, `background: var(--surface-container-low)`, full-width
- Drag handle: `GripVertical` Lucide icon (16px), `color: var(--on-surface-muted)`, positioned right side
- Rank number: `font-weight: 800`, `color: var(--copper)`, `font-family: var(--font-display)`, `font-size: 1rem`, positioned left
- On drag: item lifts with `box-shadow: var(--shadow-md)`, `scale: 1.02`, `background: var(--surface-container-lowest)`, others compress to make space
- Drop zones highlighted with 2px dashed `var(--surface-container-high)` border
- Touch support: long-press (200ms) activates drag on mobile, items have `min-height: 56px` for comfortable touch targets
- Alternative to drag (accessibility): tap an item to select it, then tap its destination slot; or use arrow keys when focused
- **Continue button required** for this question (no auto-advance since ranking needs explicit confirmation)

**Initial order:** Randomized per user session to prevent order bias.

**Values displayed:** Financial Security, Work-Life Balance, Creative Expression, Helping Others, Career Advancement. (These are the 5 core Schwartz value clusters simplified for career context.)

---

### 3.7 Transition Screen 3 (after Phase 3)

- Panda mood: `cool`
- Headline: "Great taste!"
- Body: "Your values center on **[#1 Value]** and **[#2 Value]**"
- Value labels as gold-tinted chips: `background: rgba(202, 168, 66, 0.10)`, `color: #8b7520`
- Auto-advance 2s

---

### 3.8 Phase 4: Work DNA (10 questions)

**Header:** "Your Work Style"
**Format:** Scenario card with 4 response options
**Phase accent:** Teal (`var(--secondary)`)

This phase reuses the existing PathWise card-based design pattern from v1 but adapted to one-question-per-screen.

**Question screen layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1,2,3 done, 4 active]             |
|  [======-----]  6 / 10                           |
|                                                  |
|  YOUR WORK STYLE                                 |
|  (eyebrow, teal)                                 |
|                                                  |
|  Your team's project plan is                     |
|  suddenly scrapped. You:                         |
|  (question text, Manrope 700, 1.2rem)           |
|                                                  |
|  +--------------------------------------------+ |
|  |  Get excited -- blank slate means new       | |
|  |  possibilities                              | |
|  +--------------------------------------------+ |
|  +--------------------------------------------+ |
|  |  Feel uneasy, want to understand why first | |
|  +--------------------------------------------+ |
|  +--------------------------------------------+ |
|  |  Immediately start organizing a new plan   | |
|  +--------------------------------------------+ |
|  +--------------------------------------------+ |
|  |  Check in with teammates about how they    | |
|  |  feel                                      | |
|  +--------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
```

**Option card styling:**
- Vertical stack, full-width
- Each option: `padding: 1rem 1.25rem`, `border-radius: var(--radius-xl)`, `min-height: 56px`
- Default: `background: var(--surface-container-low)`, `color: var(--on-surface)`, `font-weight: 500`
- Hover: `background: var(--surface-container)`, `transform: translateY(-1px)`
- Selected: `background: var(--copper)`, `color: #fff`
- Auto-advance on selection (300ms)

**Work DNA questions (10 scenarios):**

These map directly to the v1 assessment questions (WORKSTYLE_QUESTIONS, ENVIRONMENT_QUESTIONS, CAREER_QUESTIONS), reformatted as one-per-screen. All existing `ws1-ws4`, `env1-env4`, `car1`, `car4` question IDs are preserved to maintain backend compatibility.

---

### 3.9 Transition Screen 4: PARTIAL RESULTS TEASER (KEY RETENTION HOOK)

**This is the most important transition screen.** Research shows users who see partial results are 2.7x more likely to complete the assessment. This screen must feel like a reward, not a checkpoint.

**Layout (wireframe):**
```
+--------------------------------------------------+
|                                                  |
|        [Panda mood: curious, size: 110]          |
|                                                  |
|       Your profile is emerging...                |
|  (Manrope 800, 1.5rem)                          |
|                                                  |
|  +--------------------------------------------+ |
|  |  ARCHETYPE                                 | |
|  |  The Strategic Builder                     | |
|  |  (large, colored, Manrope 700)             | |
|  |                                            | |
|  |  Your combination of Investigative          | |
|  |  interests, high Conscientiousness,         | |
|  |  and Mastery values suggests you            | |
|  |  thrive building complex systems.          | |
|  |  (body text, 0.88rem)                       | |
|  +--------------------------------------------+ |
|                                                  |
|  Two more sections to unlock your               |
|  career matches!                                 |
|  (--on-surface-variant, 0.88rem)                |
|                                                  |
|         [ Continue ]                             |
|  (btn, teal gradient)                            |
+--------------------------------------------------+
```

**Visual details:**
- Archetype card: `background: linear-gradient(135deg, rgba(0, 106, 98, 0.05), rgba(139, 79, 44, 0.04))`, `border: 1px solid rgba(0, 106, 98, 0.12)`, `border-radius: var(--radius-2xl)`, `padding: 1.5rem`
- Archetype name: `font-family: var(--font-display)`, `font-weight: 700`, `font-size: 1.25rem`, `color: var(--secondary)`
- "ARCHETYPE" label: eyebrow style, teal
- Description: dynamically generated from Phase 1-4 answers
- **No auto-advance** -- user must tap Continue (they need time to read and feel rewarded)
- Panda has a subtle "thinking bounce" animation

**Archetype computation (client-side):**
```typescript
// Simplified archetype from top RIASEC + top Big Five + top Value
const archetypes: Record<string, string> = {
  'I+Conscientiousness': 'The Strategic Builder',
  'I+Openness': 'The Curious Analyst',
  'A+Openness': 'The Creative Visionary',
  'A+Extraversion': 'The Expressive Leader',
  'S+Agreeableness': 'The People Champion',
  'S+Extraversion': 'The Community Builder',
  'E+Extraversion': 'The Dynamic Entrepreneur',
  'E+Conscientiousness': 'The Driven Achiever',
  'R+Conscientiousness': 'The Precision Craftsperson',
  'R+Emotional Stability': 'The Steady Operator',
  'C+Conscientiousness': 'The Detail Architect',
  'C+Agreeableness': 'The Reliable Coordinator',
};
```

---

### 3.10 Phase 5: Aptitudes (8 questions)

**Header:** "Your Natural Strengths"
**Format:** 5-point scale with behavioral anchors
**Phase accent:** Warm Copper (`var(--copper)`)

**Question screen layout (wireframe):**
```
+--------------------------------------------------+
|  [Phase dots: 1-4 done, 5 active]               |
|  [=====------]  3 / 8                            |
|                                                  |
|  YOUR NATURAL STRENGTHS                          |
|  (eyebrow, copper)                               |
|                                                  |
|  Compared to your peers, how strong              |
|  is your ability to:                             |
|  (sub-heading, 0.85rem)                          |
|                                                  |
|  "Spot patterns in messy data"                   |
|  (display text, centered, 1.2rem)               |
|                                                  |
|  Much      Below    About    Above     Much      |
|  below     avg      avg      avg       above     |
|  [ 1 ]    [ 2 ]    [ 3 ]    [ 4 ]    [ 5 ]     |
|  (5 pills, behavioral labels below each)        |
|                                                  |
+--------------------------------------------------+
```

**Scale styling:**
- Same 5-button grid as Big Five, but with **behavioral anchor labels** below each button
- Anchor labels: `font-size: 0.65rem`, `color: var(--on-surface-muted)`, `text-align: center`, `line-height: 1.2`
- On mobile (< 500px): anchor labels abbreviate to "Much below" / "Below" / "Average" / "Above" / "Much above"
- "Compared to your peers" framing shown above the question statement as persistent sub-heading
- Auto-advance on selection (300ms)

**Aptitude questions (8):**

| # | Ability | Maps to |
|---|---------|---------|
| 1 | Spot patterns in messy data | Analytical reasoning |
| 2 | Explain complex ideas in simple terms | Communication |
| 3 | Quickly learn new software or tools | Technical aptitude |
| 4 | Stay productive when working alone for long stretches | Self-direction |
| 5 | Navigate disagreements between colleagues | Interpersonal skill |
| 6 | Come up with creative solutions under pressure | Creative problem-solving |
| 7 | Keep multiple projects on track simultaneously | Organization |
| 8 | Adapt your approach when your first plan doesn't work | Adaptability |

---

### 3.11 Transition Screen 5 (after Phase 5)

- Panda mood: `celebrating`
- Headline: "Almost there!"
- Body: "One more section about your background, then we'll reveal your career matches."
- Lighter tone -- no computed data shown, just encouragement
- Auto-advance 2s

---

### 3.12 Phase 6: Life Context (8 questions)

**Header:** "Your Career Context"
**Format:** Mixed -- each question has its own optimal input type
**Phase accent:** Teal (`var(--secondary)`)

This is the only phase where questions may NOT auto-advance (some need multiple inputs). A persistent **Continue** button appears at the bottom.

**Questions and their formats:**

#### Q1: Experience Level (Single select, cards)
```
+--------------------------------------------------+
|  Where are you in your career journey?           |
|                                                  |
|  [  Student or self-taught beginner       ]      |
|  [  Junior (0-2 years)                    ]      |
|  [  Mid-level (2-6 years)                 ]      |
|  [  Senior (6+ years)                     ]      |
|  [  Expert/leadership (10+ years)         ]      |
+--------------------------------------------------+
```
Format: 5 full-width option buttons (same as Work DNA styling). Auto-advance.

#### Q2: Current Role (Text input)
```
+--------------------------------------------------+
|  What's your current role? (optional)            |
|                                                  |
|  [  e.g. Sales Associate, Student...      ]      |
|                                                  |
|  [ Skip ]  [ Continue ]                          |
+--------------------------------------------------+
```
Format: Text input with `var(--surface-container-low)` background, pill border-radius. Skip and Continue buttons.

#### Q3: Education Level (Single select, cards)
```
+--------------------------------------------------+
|  What's your highest level of education?         |
|                                                  |
|  [  High school diploma / GED             ]      |
|  [  Some college / vocational training    ]      |
|  [  Bachelor's degree                     ]      |
|  [  Master's degree                       ]      |
|  [  Doctorate / professional degree       ]      |
+--------------------------------------------------+
```
Auto-advance on selection.

#### Q4: Skills (Chip picker with search)
```
+--------------------------------------------------+
|  Select your current skills (2-8)                |
|                                                  |
|  [ Search skills...                       ]      |
|                                                  |
|  [Python] [JavaScript] [SQL] [Cloud/AWS]         |
|  [AI/ML] [Data Analysis] [UI/UX Design]         |
|  [Project Mgmt] [Strategic Planning]             |
|  [Communication] [Leadership] [Excel]            |
|  [Problem Solving] [Critical Thinking]           |
|  ... (scrollable)                                |
|                                                  |
|  3/8 selected                                    |
|         [ Continue ]                             |
+--------------------------------------------------+
```
Format: Search input at top filters chip list in real time. Chips use existing `.assessment__chip` styling. Counter shows X/8. Continue button (no auto-advance).

#### Q5: Other Skills (Text input)
```
+--------------------------------------------------+
|  Any other skills? (comma-separated, optional)   |
|                                                  |
|  [  e.g. Photoshop, Excel, R...           ]      |
|                                                  |
|  [ Skip ]  [ Continue ]                          |
+--------------------------------------------------+
```

#### Q6: Interest Domains (Chip picker)
```
+--------------------------------------------------+
|  What fields interest you? (1-6)                 |
|                                                  |
|  [Technology] [Data & Analytics] [Marketing]     |
|  [Finance] [Design & UX] [Product Mgmt]         |
|  [Healthcare] [Education] [E-commerce]           |
|  [Sustainability] [Media] [Consulting]           |
|  [Law & Policy] [Science & Research]             |
|  [Hospitality] [Trades] [Social Services]        |
|  ... more                                        |
|                                                  |
|  2/6 selected                                    |
|         [ Continue ]                             |
+--------------------------------------------------+
```

#### Q7: Salary Expectation (Single select)
```
+--------------------------------------------------+
|  What's your salary expectation?                 |
|                                                  |
|  [  I'm flexible / not sure yet           ]      |
|  [  $30k-$50k                             ]      |
|  [  $50k-$80k                             ]      |
|  [  $80k-$120k                            ]      |
|  [  $120k+                                ]      |
+--------------------------------------------------+
```
Auto-advance.

#### Q8: Timeline (Single select)
```
+--------------------------------------------------+
|  When do you want to be in your ideal role?      |
|                                                  |
|  [  As soon as possible                   ]      |
|  [  Within 6 months                       ]      |
|  [  Within 1-2 years                      ]      |
|  [  2-5 years, I'm planning ahead         ]      |
|  [  No rush, just exploring               ]      |
+--------------------------------------------------+
```
Auto-advance. This is the final question -- triggers the Analyzing screen.

---

### 3.13 Analyzing Screen

**Purpose:** Build anticipation, give the backend time to process, feel premium.

**Layout (wireframe):**
```
+--------------------------------------------------+
|                                                  |
|                                                  |
|                                                  |
|        [Panda mood sequence]                     |
|        thinking -> working -> celebrating        |
|        (transitions every 3s)                    |
|                                                  |
|        Mapping your career DNA...                |
|        (fades between messages)                  |
|                                                  |
|        [circular progress ring]                  |
|        (fills over 8 seconds)                    |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

**Full-screen (not card):**
- Background: `var(--surface)`, centered content
- Panda: centered, `size={140}`
- Mood sequence: `thinking` (0-3s) -> `working` (3-6s) -> `celebrating` (6-8s)
- Panda crossfade: `opacity` transition 400ms

**Progressive messages (crossfade, 2s each):**
1. "Mapping your career DNA..." (0-2s)
2. "Scoring 150+ career paths..." (2-4s)
3. "Finding your unique strengths..." (4-6s)
4. "Building your career fingerprint..." (6-8s)

- Message style: `font-family: var(--font-display)`, `font-weight: 700`, `font-size: 1.15rem`, `color: var(--on-surface)`
- Crossfade: `opacity: 0 -> 1` over 300ms, hold 1400ms, `opacity: 1 -> 0` over 300ms

**Circular progress ring:**
- SVG circle, `stroke-width: 3px`, `radius: 24px`, positioned below messages
- Track: `var(--surface-container)`
- Fill: `stroke-dasharray` animation, teal `var(--secondary)`, 8s linear
- On completion: fill color pulses once (scale 1 -> 1.1 -> 1, 300ms)

**Technical behavior:**
- The API call (`assessmentApi.submit()`) fires immediately when this screen mounts
- The 8s animation is a minimum duration -- if API responds faster, wait for animation to finish
- If API responds slower, the last message ("Building your career fingerprint...") loops with an ellipsis animation until response arrives
- On API error: fade to error state with `<Panda mood="confused" />` and retry button

---

### 3.14 Results Screen

The results screen is outside the scope of this assessment flow spec -- it is a separate page (`/app/career-match`) that receives the assessment data. The assessment flow navigates to it on completion.

**Handoff behavior:**
- On API success: 500ms pause on final animation state, then navigate to `/app/career-match` (or `/app/onboarding` if first assessment)
- Pass `assessmentResult` via React Router state or read from API on the destination page
- Clear localStorage `pw_assessment_v2` key on successful navigation

---

## 4. Component Library

### New Components Required

```
src/components/assessment/
  AssessmentShell.tsx        -- Layout wrapper (progress bar, card, navigation)
  PhaseProgressBar.tsx       -- 2-tier progress (dots + micro bar)
  QuestionCard.tsx           -- Container for one-question-per-screen
  LikeNeutralDislike.tsx     -- 3-button RIASEC response
  LikertScale.tsx            -- 5-point scale with anchors
  ForcedChoice.tsx           -- A vs B full-width buttons
  ValueRanking.tsx           -- Drag-to-reorder list
  ScenarioOptions.tsx        -- Vertical list of 4 option cards
  ChipPicker.tsx             -- Multi-select chips with search
  TransitionScreen.tsx       -- Panda + computed label + auto-advance
  AnalyzingScreen.tsx        -- Full-screen loader with message sequence
  ResumeModal.tsx            -- "Resume where you left off?" dialog
```

### Reused Existing Components

| Component | File | Usage |
|-----------|------|-------|
| `Panda` | `src/components/panda/Panda.tsx` | All transition screens, welcome, analyzing |
| `PandaSpot` | `src/components/panda/PandaSpot.tsx` | Error states |
| Chip styling | `.assessment__chip` in `Assessment.css` | Phase 6 chip pickers |
| Button styling | `.assessment__btn` in `Assessment.css` | Continue/Back buttons |

### Component API Examples

```typescript
// QuestionCard -- wraps each question with consistent padding and animation
interface QuestionCardProps {
  children: React.ReactNode;
  direction: 'forward' | 'backward'; // controls slide direction
  questionKey: string; // for animation key
}

// LikertScale -- 5-point scale with customizable anchors
interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  lowAnchor: string;   // "Strongly Disagree"
  highAnchor: string;  // "Strongly Agree"
  accentColor: string; // CSS variable name
}

// ForcedChoice -- A vs B with OR divider
interface ForcedChoiceProps {
  optionA: { label: string; value: string };
  optionB: { label: string; value: string };
  selected: string | null;
  onSelect: (value: string) => void;
}

// TransitionScreen -- computed feedback between phases
interface TransitionScreenProps {
  pandaMood: PandaMood;
  headline: string;
  labels: { text: string; color: string }[];
  description?: string;
  autoAdvanceMs?: number; // default 2000, set 0 to disable
  onAdvance: () => void;
}

// PhaseProgressBar
interface PhaseProgressBarProps {
  totalPhases: 6;
  currentPhase: number;        // 1-6
  currentQuestion: number;     // 1-based within phase
  totalQuestionsInPhase: number;
  phaseAccentColor: string;    // CSS variable name
  phaseName: string;
}
```

---

## 5. State Management & Persistence

### State Shape

```typescript
interface AssessmentState {
  // Navigation
  currentPhase: 1 | 2 | 3 | 4 | 5 | 6;
  currentQuestionIndex: number; // 0-based within current phase
  isOnTransition: boolean;
  isAnalyzing: boolean;

  // Answers (keyed by question ID for backend compatibility)
  answers: Record<string, string | number | string[]>;

  // Phase-specific data
  riasecAnswers: Record<string, 'like' | 'neutral' | 'dislike'>; // q1-q24
  bigFiveAnswers: Record<string, 1 | 2 | 3 | 4 | 5>;            // q25-q44
  valuesChoices: Record<string, string>;                           // q45-q55
  valuesRanking: string[];                                         // q56 (ordered array)
  workDnaAnswers: Record<string, string>;                          // q57-q66
  aptitudeAnswers: Record<string, 1 | 2 | 3 | 4 | 5>;            // q67-q74
  contextAnswers: Record<string, string | string[]>;               // q75-q82

  // Skills & context (Phase 6 specific)
  selectedSkills: string[];
  selectedDomains: string[];
  currentRole: string;
  experienceLevel: string;
  otherSkills: string;

  // Computed partial results (for transition screens)
  partialResults: {
    topRIASEC: [string, string];        // e.g. ['Investigative', 'Artistic']
    topTraits: [string, string];         // e.g. ['Conscientiousness', 'Openness']
    topValues: [string, string];         // e.g. ['Financial Security', 'Career Advancement']
    archetype: string;                   // e.g. 'The Strategic Builder'
  } | null;

  // Meta
  startedAt: string;       // ISO timestamp
  lastSavedAt: string;     // ISO timestamp
  version: 'v2';           // For migration detection
}
```

### localStorage Persistence

**Key:** `pw_assessment_v2`

**Save strategy:**
- Save on every answer selection (debounced 100ms for rapid tapping)
- Save includes full state snapshot
- `lastSavedAt` updated on each save

```typescript
const STORAGE_KEY = 'pw_assessment_v2';

function saveAssessmentState(state: AssessmentState): void {
  const toSave = {
    ...state,
    lastSavedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // localStorage full or unavailable -- continue without persistence
    console.warn('Assessment state save failed:', e);
  }
}

function loadAssessmentState(): AssessmentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 'v2') return null; // ignore v1 data
    return parsed as AssessmentState;
  } catch {
    return null;
  }
}

function clearAssessmentState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

### Resume Modal Logic

```typescript
// On component mount:
const saved = loadAssessmentState();
if (saved && saved.currentPhase > 0) {
  const phaseName = PHASE_NAMES[saved.currentPhase - 1];
  const qNum = saved.currentQuestionIndex + 1;
  const totalInPhase = PHASE_QUESTION_COUNTS[saved.currentPhase - 1];
  // Show modal: "You left off on Phase X (phaseName), Question qNum of totalInPhase"
  // [Resume] -> restore state
  // [Start Over] -> clearAssessmentState(), init fresh
}
```

### State Management Approach

Use a single `useReducer` hook within the assessment page component. No global store needed -- assessment state is ephemeral and page-scoped. The reducer handles:

```typescript
type AssessmentAction =
  | { type: 'ANSWER_RIASEC'; questionId: string; value: 'like' | 'neutral' | 'dislike' }
  | { type: 'ANSWER_LIKERT'; questionId: string; value: 1 | 2 | 3 | 4 | 5 }
  | { type: 'ANSWER_FORCED_CHOICE'; questionId: string; value: string }
  | { type: 'ANSWER_RANKING'; order: string[] }
  | { type: 'ANSWER_SCENARIO'; questionId: string; value: string }
  | { type: 'ANSWER_CONTEXT'; questionId: string; value: string | string[] }
  | { type: 'SET_SKILLS'; skills: string[] }
  | { type: 'SET_DOMAINS'; domains: string[] }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'ADVANCE_TO_TRANSITION' }
  | { type: 'ADVANCE_TO_PHASE'; phase: number }
  | { type: 'START_ANALYZING' }
  | { type: 'RESTORE_STATE'; state: AssessmentState }
  | { type: 'RESET' };
```

---

## 6. Animation & Motion Design

### Question Transitions

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Next question | Current slides left + fades, next slides in from right | 250ms | `cubic-bezier(0.33, 1, 0.68, 1)` |
| Previous question | Current slides right + fades, prev slides in from left | 250ms | `cubic-bezier(0.33, 1, 0.68, 1)` |
| Phase transition | Current card fades out (200ms), transition card fades in (300ms) | 500ms total | `ease-in-out` |
| Auto-advance (transition screens) | Fade out 200ms, next phase fades in 300ms | 500ms | `ease-in-out` |

**CSS for question slide:**
```css
.question-enter {
  transform: translateX(100%);
  opacity: 0;
}
.question-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 250ms cubic-bezier(0.33, 1, 0.68, 1),
              opacity 250ms cubic-bezier(0.33, 1, 0.68, 1);
}
.question-exit {
  transform: translateX(0);
  opacity: 1;
}
.question-exit-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 250ms cubic-bezier(0.33, 1, 0.68, 1),
              opacity 250ms cubic-bezier(0.33, 1, 0.68, 1);
}

/* Reverse direction for Back navigation */
.question-enter-back {
  transform: translateX(-100%);
  opacity: 0;
}
.question-enter-back-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 250ms cubic-bezier(0.33, 1, 0.68, 1),
              opacity 250ms cubic-bezier(0.33, 1, 0.68, 1);
}
.question-exit-back {
  transform: translateX(0);
  opacity: 1;
}
.question-exit-back-active {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 250ms cubic-bezier(0.33, 1, 0.68, 1),
              opacity 250ms cubic-bezier(0.33, 1, 0.68, 1);
}
```

### Selection Feedback

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Option button press | `scale: 0.97` | 100ms | `ease-out` |
| Option button release | `scale: 1.0` + border/bg color change | 150ms | `var(--transition-spring)` |
| Selected option | Background color crossfade + subtle shadow appear | 150ms | `ease-out` |
| Likert button selected | `scale: 1.05` + bg color | 200ms | `var(--transition-spring)` |
| Chip toggle | Scale 0.95 -> 1.0 + color change | 150ms | `ease-out` |

### Progress Bar

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Question advance | Width increases smoothly | 400ms ease |
| Phase complete | Phase dot fills with color + checkmark icon pops in | 300ms spring |
| Phase change | Micro-bar resets to 0 width, phase dot activates | 200ms ease |

### Transition Screens

| Element | Animation |
|---------|-----------|
| Panda entrance | Scale 0.8 -> 1.0 with opacity 0 -> 1, 400ms spring |
| Headline | Fade up (translateY 16px -> 0, opacity 0 -> 1), 300ms, 100ms delay |
| Computed labels | Fade up, 300ms, 200ms delay |
| Auto-advance ring | SVG stroke-dashoffset animates from full to 0 over 2000ms linear |

### Analyzing Screen

| Element | Animation |
|---------|-----------|
| Panda mood changes | Crossfade opacity 0/1, 400ms |
| Progress messages | Crossfade: out 300ms, pause 100ms, in 300ms (700ms cycle) |
| Circular progress | stroke-dashoffset from circumference to 0, 8s linear |
| Completion burst | Ring scales 1 -> 1.15 -> 1, 300ms spring, ring color pulses to gold then back |

### Swipe Gestures (Mobile)

```typescript
// Touch handling for swipe navigation
const SWIPE_THRESHOLD = 50; // px
const SWIPE_VELOCITY = 0.3; // px/ms

function useSwipeNavigation(onNext: () => void, onPrev: () => void) {
  // Track touchstart X, touchmove X, timestamps
  // If deltaX > SWIPE_THRESHOLD and velocity > SWIPE_VELOCITY:
  //   swipe left (negative deltaX) -> onNext()
  //   swipe right (positive deltaX) -> onPrev()
  // Provide visual feedback: card follows finger with transform during drag
  // Snap back if threshold not met (spring animation)
}
```

---

## 7. Responsive Breakpoints

### 375px (Mobile Small -- iPhone SE)

```
- Card: full-width, padding 1.25rem 1rem
- Card border-radius: var(--radius-xl) (1.5rem, less aggressive than desktop)
- Question text: font-size 1.1rem
- Phase dots: 24px, gap tighter
- Likert buttons: 44px squares, gap 6px
- Forced choice buttons: min-height 64px
- Chip picker: 2-column grid
- Option cards: full-width, min-height 52px, font-size 0.85rem
- Back button: icon-only (ArrowLeft, no text), positioned top-left
- Continue button: full-width, sticky bottom (with 16px padding from edge)
- Swipe gestures enabled
- Bottom safe area: 34px padding for home indicator
```

### 768px (Tablet)

```
- Card: max-width 580px, centered, padding 2rem 2rem
- Question text: font-size 1.25rem
- Phase dots: 28px
- Likert buttons: 52px, gap 10px
- Option cards: min-height 60px
- Chip picker: 3-column grid
- Back and Continue buttons: inline row, centered
- Swipe gestures disabled (pointer events only)
```

### 1024px (Desktop Small)

```
- Card: max-width 620px, centered, padding 2.5rem 2.5rem
- Card border-radius: var(--radius-2xl) (2rem)
- Question text: font-size 1.35rem
- Keyboard navigation fully active (1-5 for Likert, L/N/D for RIASEC, arrow keys + Enter)
- Hover states on all interactive elements
- Chip picker: 4-column grid
```

### 1440px (Desktop Large)

```
- Card: max-width 640px, centered
- Generous vertical whitespace around card
- Side panels possible for future "progress preview" feature (not in v2 scope)
```

### Keyboard Navigation Map

| Context | Key | Action |
|---------|-----|--------|
| Any question | `ArrowRight` or `ArrowDown` | Next question (if answered) |
| Any question | `ArrowLeft` or `ArrowUp` | Previous question |
| Likert scale | `1` through `5` | Select that value |
| RIASEC (Like/Neutral/Dislike) | `L` / `N` / `D` | Select response |
| Scenario options | `1` through `4` | Select that option |
| Forced choice | `1` (A) or `2` (B) | Select option |
| Transition screen | `Enter` or `Space` | Advance (skip auto-timer) |
| Any screen | `Escape` | Open "Save & Exit" dialog |
| Chip picker | `Tab` through chips, `Space` to toggle | Multi-select |
| Value ranking | `Space` to grab/drop, `ArrowUp/Down` to move | Reorder |

---

## 8. Accessibility Specification

### ARIA Landmarks & Roles

```html
<!-- Assessment shell -->
<main role="main" aria-label="Career Assessment">
  <!-- Progress -->
  <nav aria-label="Assessment progress">
    <ol role="list">
      <li role="listitem" aria-current="step">Phase 1: RIASEC Interests</li>
      ...
    </ol>
    <div role="progressbar"
         aria-valuenow="8"
         aria-valuemin="1"
         aria-valuemax="24"
         aria-label="Phase 1 progress: question 8 of 24">
    </div>
  </nav>

  <!-- Question -->
  <section aria-live="polite" aria-atomic="true">
    <h2 id="question-heading">I enjoy figuring out how machines and tools work.</h2>
    <div role="radiogroup" aria-labelledby="question-heading">
      <button role="radio" aria-checked="false" aria-label="Dislike">Dislike</button>
      <button role="radio" aria-checked="true" aria-label="Neutral">Neutral</button>
      <button role="radio" aria-checked="false" aria-label="Like">Like</button>
    </div>
  </section>
</main>
```

### Focus Management

- On question advance: focus moves to the first interactive element of the new question
- On phase transition: focus moves to the transition card heading
- On analyzing screen: focus moves to the status message (aria-live region)
- On error: focus moves to error message
- Resume modal: focus trapped within modal, Escape closes

### Screen Reader Announcements

```typescript
// Announce question changes
<div aria-live="polite" className="sr-only">
  {`Question ${currentQuestion} of ${totalInPhase}. ${questionText}`}
</div>

// Announce phase transitions
<div aria-live="assertive" className="sr-only">
  {`Phase ${phase} complete. ${transitionMessage}`}
</div>

// Announce analyzing progress
<div aria-live="polite" className="sr-only">
  {analyzingMessage}
</div>
```

### Color Contrast Verification

| Element | Foreground | Background | Ratio | Passes |
|---------|-----------|------------|-------|--------|
| Body text on surface | `#1a1c1f` | `#eefcfe` | 14.8:1 | AA + AAA |
| Body text on white card | `#1a1c1f` | `#ffffff` | 16.9:1 | AA + AAA |
| Variant text on white | `#49454f` | `#ffffff` | 8.2:1 | AA + AAA |
| Muted text on white | `#78747e` | `#ffffff` | 4.6:1 | AA |
| White text on copper | `#ffffff` | `#8b4f2c` | 5.0:1 | AA |
| White text on teal | `#ffffff` | `#006a62` | 5.4:1 | AA |
| White text on dark teal btn | `#ffffff` | `#334042` | 10.1:1 | AA + AAA |
| Copper on white (eyebrow) | `#8b4f2c` | `#ffffff` | 5.0:1 | AA |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .question-enter-active,
  .question-exit-active,
  .question-enter-back-active,
  .question-exit-back-active {
    transition-duration: 0.01ms !important;
  }

  .panda--animated {
    animation: none !important;
  }

  /* Replace slide transitions with simple fades */
  .question-enter { transform: none; }
  .question-exit-active { transform: none; }
}
```

### Skip Option

For returning users or screen reader users who want to bypass the full assessment:
- "Skip to results" link (visually hidden, first in tab order) if user has a previous assessment
- Accessible via keyboard only (appears on focus)

---

## 9. Backend Integration Contract

### Payload Mapping (v2 -> Existing API)

The v2 assessment must produce a `SubmitAssessmentParams` payload compatible with the existing `POST /assessment` endpoint. The new question structure maps to the existing fields:

```typescript
function buildSubmitPayload(state: AssessmentState, userId: string): SubmitAssessmentParams {
  // workStyle: derived from Work DNA answers (Phase 4)
  const workStyle = state.workDnaAnswers['ws3'] || 'mixed';

  // strengths: derived from RIASEC top types + Big Five top traits + aptitude highs
  const strengths = [
    ...deriveRIASECStrengths(state.riasecAnswers),
    ...deriveBigFiveStrengths(state.bigFiveAnswers),
    ...deriveAptitudeStrengths(state.aptitudeAnswers),
  ];

  // values: derived from forced-choice selections + ranking
  const values = [
    ...Object.values(state.valuesChoices),
    ...state.valuesRanking.slice(0, 2), // top 2 ranked values
  ];

  // interests: RIASEC types + selected domains
  const interests = [
    ...deriveRIASECTypes(state.riasecAnswers),
    ...state.selectedDomains,
  ];

  // personalityType: RIASEC code + Big Five profile
  const riasecCode = deriveRIASECCode(state.riasecAnswers);
  const bigFiveProfile = deriveBigFiveProfile(state.bigFiveAnswers);
  const personalityType = `${riasecCode}-${bigFiveProfile}`;

  // rawAnswers: full answer dump for career-brain processing
  const rawAnswers: Record<string, string | string[]> = {
    ...flattenRIASEC(state.riasecAnswers),
    ...flattenBigFive(state.bigFiveAnswers),
    ...state.valuesChoices,
    valuesRanking: state.valuesRanking,
    ...state.workDnaAnswers,
    ...flattenAptitudes(state.aptitudeAnswers),
    ...flattenContext(state.contextAnswers),
  };

  return {
    userId,
    workStyle,
    strengths,
    values,
    currentSkills: [...state.selectedSkills, ...parseOtherSkills(state.otherSkills)],
    experienceLevel: state.experienceLevel,
    interests,
    currentRole: state.currentRole || undefined,
    personalityType,
    rawAnswers,
  };
}
```

### Scoring Functions (Client-Side, for Transition Screens)

These run in the browser to produce partial results for transition screens. They do NOT replace backend scoring.

```typescript
// RIASEC scoring (after Phase 1)
function scoreRIASEC(answers: Record<string, 'like' | 'neutral' | 'dislike'>): Record<string, number> {
  const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const scoreMap = { like: 2, neutral: 1, dislike: 0 };

  for (const [qId, response] of Object.entries(answers)) {
    const question = RIASEC_QUESTIONS.find(q => q.id === qId);
    if (question) {
      scores[question.type] += scoreMap[response];
    }
  }
  return scores;
}

// Big Five scoring (after Phase 2)
function scoreBigFive(answers: Record<string, number>): Record<string, number> {
  const traits = ['Conscientiousness', 'Extraversion', 'Openness', 'Agreeableness', 'EmotionalStability'];
  const scores: Record<string, number> = {};

  for (const trait of traits) {
    const traitQs = BIG_FIVE_QUESTIONS.filter(q => q.trait === trait);
    let sum = 0;
    for (const q of traitQs) {
      const raw = answers[q.id] || 3;
      sum += q.direction === '+' ? raw : (6 - raw);
    }
    scores[trait] = sum / traitQs.length;
  }
  return scores;
}
```

### Error Handling

| Error | User-Facing Message | Recovery |
|-------|-------------------|----------|
| Network error (TypeError) | "Could not reach the server. It may be starting up -- please wait a moment and try again." | Retry button, state preserved in localStorage |
| 401 Unauthenticated | "Your session expired. Please sign in to continue." | Redirect to sign-in with return URL, state preserved |
| 429 Rate limited | "You've submitted too many assessments recently. Please wait a few minutes." | Show timer, disable submit button |
| 500 Server error | "Something went wrong on our end. Your answers are saved -- try again in a moment." | Retry button, state preserved |
| localStorage full | (silent) Continue without persistence, warn if user navigates away | `beforeunload` warning |

---

## 10. Migration from v1

### What Changes

| Aspect | v1 (Current) | v2 (New) |
|--------|-------------|----------|
| Questions per screen | 3-4 per step | 1 per screen |
| Total steps shown | 6 | 82 questions across 6 phases (phases shown, not question count) |
| Progress indicator | "Step X of 6" + bar | Phase dots + micro progress bar |
| Question types | All multi-select cards | RIASEC 3-button, Likert, forced-choice, ranking, scenarios, chips |
| Persistence | None | localStorage auto-save |
| Feedback between phases | None | Transition screens with computed partial results |
| Analyzing screen | Static spinner | Animated sequence with progressive messages |
| Mobile support | Basic responsive | Full mobile-first with swipe gestures |
| Keyboard support | Tab + Enter only | Full keyboard shortcuts per question type |
| Accessibility | Minimal | WCAG 2.1 AA compliant |

### Backward Compatibility

The v2 flow produces the same `SubmitAssessmentParams` shape that the existing `POST /assessment` endpoint expects. No backend changes are required for the initial launch. The `rawAnswers` field will contain more granular data that the career-brain can optionally use for improved matching in a future iteration.

### Rollout Strategy

1. Build v2 as a new component (`AssessmentV2`) alongside the existing `Assessment`
2. Feature flag: `VITE_ASSESSMENT_V2=true` enables the new flow
3. Route both to `/app/assessment`, selected by feature flag
4. Monitor completion rates for 2 weeks
5. If v2 completion rate exceeds v1 by >10%, deprecate v1
6. Remove v1 code and feature flag

### localStorage Key Separation

- v1 uses no localStorage (stateless)
- v2 uses `pw_assessment_v2` key
- No collision risk

---

## Appendix A: Question ID Registry

All question IDs must be stable across versions for analytics tracking.

```
Phase 1 (RIASEC):     riasec_01 through riasec_24
Phase 2 (Big Five):   big5_01 through big5_20
Phase 3 (Values):     values_01 through values_11 (forced-choice)
                      values_rank (ranking exercise)
Phase 4 (Work DNA):   wdna_01 through wdna_10
Phase 5 (Aptitudes):  apt_01 through apt_08
Phase 6 (Context):    ctx_exp_level, ctx_current_role, ctx_education,
                      ctx_skills, ctx_other_skills, ctx_domains,
                      ctx_salary, ctx_timeline
```

## Appendix B: Estimated File Sizes

| File | Est. Lines | Notes |
|------|-----------|-------|
| `AssessmentV2/index.tsx` | ~200 | Orchestrator with useReducer |
| `AssessmentV2/reducer.ts` | ~150 | State reducer + action types |
| `AssessmentV2/questions.ts` | ~350 | All question definitions |
| `AssessmentV2/scoring.ts` | ~120 | Client-side scoring for transitions |
| `AssessmentV2/assessment-v2.css` | ~400 | All styles including animations |
| Each component in `components/assessment/` | ~40-80 | Small, focused components |
| **Total new code** | **~1,800** | |

## Appendix C: Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial load (JS) | < 45 KB gzipped | Code-split assessment route, lazy-load question data |
| Question transition | < 16ms (60fps) | CSS transforms only (GPU-accelerated), no layout thrash |
| localStorage read | < 5ms | Single key read, no iteration |
| localStorage write | < 10ms | Debounced 100ms, single key write |
| Time to interactive | < 1.5s | No heavy computation on mount, questions loaded synchronously |
| Analyzing screen API call | < 5s p95 | Backend already handles this; 8s animation masks latency |
