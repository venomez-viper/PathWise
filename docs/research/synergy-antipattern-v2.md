# Synergy Patterns & Anti-Patterns v2 Specification

> PathWise Career Brain scoring engine expansion
> Status: Design specification -- pending implementation
> Author: Engineering / Claude Code
> Date: 2026-04-06

---

## Overview

The v1 scoring engine uses **10 synergy patterns** and **8 anti-patterns** to adjust career match scores. These operate on the 18-dimension answer space (`int1-3`, `ws1-4`, `val1-4`, `env1-4`, `car1-4`) matched against `CareerProfile` fields.

v2 expands to **30 synergy patterns** and **20 anti-patterns** to capture nuanced multi-dimensional career signals. This dramatically improves match precision for specialized career paths where a single dimension is insufficient.

### Design Principles

1. **Every pattern uses 3+ dimensions** -- single-dimension boosts belong in base scoring, not synergies.
2. **Patterns are falsifiable** -- each has a clear "this person would NOT match" counterexample.
3. **Boost/penalty values are calibrated** against the existing point budget: synergies cap at 15 points total (up from 10), anti-patterns cap at 12 points total (up from 8).
4. **Profile field references use actual CareerProfile keys** -- `domains`, `archetypes`, `problemTypes`, `trajectories`, `collaboration`, `paces`, `ambiguityStyle`, `managementStyles`, `riskLevels`, `coreValues`, `teamSizes`, `groupRoles`, `environments`, `workStyles`, `decisionStyle`, `frustrations`, `rewards`.

### Answer Dimension Reference

| Key | Question | Values |
|-----|----------|--------|
| `int1` | Appeals more | `realistic`, `investigative`, `artistic`, `social` |
| `int2` | Problem type | `technical`, `human`, `creative`, `strategic`, `scientific` |
| `int3` | Known for | `builder`, `thinker`, `operator`, `helper` |
| `ws1` | Plan scrapped | `open`, `cautious`, `organized`, `empathetic` |
| `ws2` | Decision style | `thinking`, `feeling`, `intuition`, `consensus` |
| `ws3` | Collaboration | `solo`, `collaborative`, `mixed`, `pair` |
| `ws4` | Handle ambiguity | `structure`, `experiment`, `consult`, `research` |
| `val1` | Job pick | `autonomy`, `prestige`, `purpose`, `mastery` |
| `val2` | Tradeoff | `purpose_over_wealth`, `wealth_over_stability`, `balance_over_creativity`, `growth_over_comfort` |
| `val3` | Frustration | `monotony`, `no_impact`, `micromanaged`, `isolation` |
| `val4` | Reward | `wealth`, `recognition`, `learning`, `impact` |
| `env1` | Setting | `remote`, `hybrid`, `onsite`, `flexible` |
| `env2` | Team size | `small`, `medium`, `large`, `solo` |
| `env3` | Pace | `fast`, `steady`, `burst`, `varied` |
| `env4` | Management | `handsoff`, `mentorship`, `targets`, `coaching` |
| `car1` | Career stage | `exploring`, `building`, `advancing`, `pivoting` |
| `car2` | Risk comfort | `high`, `moderate`, `low`, `calculated` |
| `car3` | 5yr trajectory | `specialist`, `generalist`, `manager`, `entrepreneur` |
| `car4` | Group role | `leader`, `ideator`, `doer`, `harmonizer` |

---

## Part 1: Synergy Patterns (30)

### Interface

```typescript
interface SynergyPatternV2 {
  id: string;
  name: string;
  description: string;
  requires: Record<string, string[]>;  // answer dimension -> any of these values
  boostWhen: { field: keyof CareerProfile; values: string[] }[];
  matchThreshold: number;  // 0-1, fraction of requires that must match (default 0.66)
  bonus: number;           // 1-5 points
  explanation: string;     // human-readable rationale for the user
}
```

---

### Category A: Technical Synergies (8)

#### S01 -- Software Engineering Core

**Signal:** The builder-investigator who wants mastery through technical problem-solving.

```typescript
{
  id: "s01-software-engineering-core",
  name: "Software Engineering Core",
  description: "Builder archetype + investigative interest + technical problem-solving + mastery value = strong engineering signal",
  requires: {
    int1: ["investigative", "realistic"],
    int2: ["technical"],
    int3: ["builder"],
    val1: ["mastery"],
  },
  boostWhen: [
    { field: "domains", values: ["Technology"] },
    { field: "archetypes", values: ["builder", "optimizer"] },
    { field: "problemTypes", values: ["technical"] },
  ],
  matchThreshold: 0.75,
  bonus: 3.5,
  boostedProfiles: [
    "frontend-dev", "backend-dev", "fullstack-dev", "mobile-dev"
  ],
  explanation: "You combine technical curiosity with a builder's drive and a hunger for mastery -- the core DNA of a software engineer.",
}
```

#### S02 -- Data Science Pipeline

**Signal:** Scientific investigator who loves analytical problems and seeks learning.

```typescript
{
  id: "s02-data-science-pipeline",
  name: "Data Science Pipeline",
  description: "Investigative + scientific/analytical problems + thinking decisions + learning reward",
  requires: {
    int1: ["investigative"],
    int2: ["scientific", "technical"],
    ws2: ["thinking"],
    val4: ["learning"],
  },
  boostWhen: [
    { field: "domains", values: ["Data & Analytics"] },
    { field: "problemTypes", values: ["analytical", "scientific"] },
    { field: "decisionStyle", values: ["thinking", "analytical"] },
  ],
  matchThreshold: 0.75,
  bonus: 3,
  boostedProfiles: [
    "data-scientist", "data-analyst", "data-engineer", "bi-analyst"
  ],
  explanation: "Your analytical mind and love of scientific discovery align perfectly with data careers where pattern-finding is the daily work.",
}
```

#### S03 -- DevOps / Infrastructure

**Signal:** Systematic builder who prefers structure, steady pace, and organized workflows.

```typescript
{
  id: "s03-devops-infrastructure",
  name: "DevOps / Infrastructure",
  description: "Builder/operator + organized approach + structure preference + steady pace",
  requires: {
    int3: ["builder", "operator"],
    ws1: ["organized"],
    ws4: ["structure"],
    env3: ["steady"],
  },
  boostWhen: [
    { field: "domains", values: ["Technology", "Cybersecurity"] },
    { field: "archetypes", values: ["builder", "optimizer"] },
    { field: "paces", values: ["steady"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "devops-sre", "backend-dev", "data-engineer"
  ],
  explanation: "You thrive on building reliable systems with structure and consistency -- the backbone of infrastructure and DevOps work.",
}
```

#### S04 -- Cybersecurity Mindset

**Signal:** Cautious investigator who thinks analytically, prefers solo deep work, and values structure.

```typescript
{
  id: "s04-cybersecurity-mindset",
  name: "Cybersecurity Mindset",
  description: "Investigative + cautious response + thinking/research + solo work preference",
  requires: {
    int1: ["investigative"],
    ws1: ["cautious"],
    ws2: ["thinking"],
    ws4: ["research", "structure"],
  },
  boostWhen: [
    { field: "domains", values: ["Technology", "Cybersecurity"] },
    { field: "archetypes", values: ["optimizer", "analyst"] },
    { field: "workStyles", values: ["cautious", "methodical"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "security-analyst", "penetration-tester"
  ],
  explanation: "Your cautious, analytical approach and love of deep research make you naturally suited to spotting vulnerabilities others miss.",
}
```

#### S05 -- AI/ML Specialist

**Signal:** Scientific investigator seeking mastery, comfortable with experimentation and open to novelty.

```typescript
{
  id: "s05-ai-ml-specialist",
  name: "AI/ML Specialist",
  description: "Investigative + scientific problem type + mastery value + experiment ambiguity style + open to change",
  requires: {
    int1: ["investigative"],
    int2: ["scientific", "technical"],
    val1: ["mastery"],
    ws1: ["open"],
    ws4: ["experiment", "research"],
  },
  boostWhen: [
    { field: "domains", values: ["Data & Analytics", "Technology"] },
    { field: "problemTypes", values: ["scientific", "analytical"] },
    { field: "archetypes", values: ["thinker", "builder"] },
  ],
  matchThreshold: 0.66,
  bonus: 3.5,
  boostedProfiles: [
    "ml-engineer", "data-scientist"
  ],
  explanation: "Your combination of scientific curiosity, mastery drive, and comfort with experimentation is exactly what cutting-edge AI work demands.",
}
```

#### S06 -- Full-Stack Versatility

**Signal:** Open-minded builder who embraces variety, mixed collaboration, and generalist trajectory.

```typescript
{
  id: "s06-fullstack-versatility",
  name: "Full-Stack Versatility",
  description: "Builder + open to change + mixed collaboration + generalist trajectory + fast/burst pace",
  requires: {
    int3: ["builder"],
    ws1: ["open"],
    ws3: ["mixed"],
    car3: ["generalist"],
  },
  boostWhen: [
    { field: "domains", values: ["Technology"] },
    { field: "archetypes", values: ["builder", "generalist"] },
    { field: "trajectories", values: ["generalist"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "fullstack-dev", "mobile-dev", "startup-founder"
  ],
  explanation: "You're the adaptable generalist who can work across the entire stack -- rare and highly valued in startups and small teams.",
}
```

#### S07 -- Technical Leadership

**Signal:** Leader archetype with investigative interest, strategic thinking, and manager trajectory.

```typescript
{
  id: "s07-technical-leadership",
  name: "Technical Leadership",
  description: "Leader role + investigative/realistic interest + strategic problems + manager trajectory + advancing stage",
  requires: {
    car4: ["leader"],
    int2: ["strategic", "technical"],
    car3: ["manager"],
    car1: ["advancing"],
  },
  boostWhen: [
    { field: "trajectories", values: ["manager", "executive"] },
    { field: "groupRoles", values: ["leader"] },
    { field: "domains", values: ["Technology", "Product Management"] },
  ],
  matchThreshold: 0.75,
  bonus: 3,
  boostedProfiles: [
    "technical-program-manager", "project-manager", "scrum-master"
  ],
  explanation: "You combine technical understanding with natural leadership and strategic thinking -- the path to engineering management or CTO.",
}
```

#### S08 -- QA / Testing Precision

**Signal:** Detail-oriented operator who values structure, thinking-based decisions, and steady pace.

```typescript
{
  id: "s08-qa-testing-precision",
  name: "QA / Testing Precision",
  description: "Operator archetype + organized style + structure preference + thinking decisions + steady pace",
  requires: {
    int3: ["operator"],
    ws1: ["organized"],
    ws2: ["thinking"],
    ws4: ["structure"],
    env3: ["steady"],
  },
  boostWhen: [
    { field: "domains", values: ["Technology"] },
    { field: "archetypes", values: ["optimizer", "analyst"] },
    { field: "paces", values: ["steady"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "qa-engineer", "compliance-officer"
  ],
  explanation: "Your methodical, structure-loving approach is exactly what quality assurance demands -- you find the bugs others walk past.",
}
```

---

### Category B: Creative Synergies (6)

#### S09 -- UX / Design Thinking

**Signal:** Artistic interest combined with empathy, human problem focus, and consensus-seeking.

```typescript
{
  id: "s09-ux-design-thinking",
  name: "UX / Design Thinking",
  description: "Artistic interest + human problems + empathetic response + consensus decisions + collaborative",
  requires: {
    int1: ["artistic"],
    int2: ["human", "creative"],
    ws1: ["empathetic"],
    ws2: ["consensus", "feeling"],
  },
  boostWhen: [
    { field: "domains", values: ["Design & UX"] },
    { field: "problemTypes", values: ["human", "creative"] },
    { field: "archetypes", values: ["creator", "helper"] },
  ],
  matchThreshold: 0.75,
  bonus: 3,
  boostedProfiles: [
    "ux-designer", "ux-researcher", "product-designer"
  ],
  explanation: "You blend creative sensibility with genuine empathy for users -- the dual lens that defines great UX design.",
}
```

#### S10 -- Content Creation

**Signal:** Creative + strategic problems + autonomy + solo/pair work + ideator role.

```typescript
{
  id: "s10-content-creation",
  name: "Content Creation",
  description: "Creative problems + artistic interest + autonomy value + solo/pair collaboration + ideator role",
  requires: {
    int2: ["creative"],
    int1: ["artistic"],
    val1: ["autonomy"],
    ws3: ["solo", "pair"],
    car4: ["ideator"],
  },
  boostWhen: [
    { field: "domains", values: ["Media & Entertainment", "Marketing", "Media & Journalism"] },
    { field: "archetypes", values: ["creator", "visionary"] },
    { field: "coreValues", values: ["autonomy"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "content-strategist", "copywriter", "journalist", "video-producer"
  ],
  explanation: "Your creative instinct, love of autonomy, and idea-generating nature make content creation a natural fit.",
}
```

#### S11 -- Brand Strategy

**Signal:** Creative + strategic problem orientation + collaborative + prestige/recognition reward.

```typescript
{
  id: "s11-brand-strategy",
  name: "Brand Strategy",
  description: "Creative + strategic problems + collaborative style + prestige or recognition motivation",
  requires: {
    int2: ["creative", "strategic"],
    int1: ["artistic"],
    ws3: ["collaborative", "mixed"],
    val4: ["recognition"],
  },
  boostWhen: [
    { field: "domains", values: ["Marketing", "Media & Entertainment"] },
    { field: "problemTypes", values: ["creative", "strategic"] },
    { field: "archetypes", values: ["visionary", "creator"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "brand-strategist", "digital-marketer", "social-media-manager"
  ],
  explanation: "You think in stories and strategy simultaneously -- the exact mindset that builds brands people remember.",
}
```

#### S12 -- Game / Interactive Design

**Signal:** Artistic + realistic + experimental + fast/burst pace + builder.

```typescript
{
  id: "s12-game-interactive-design",
  name: "Game / Interactive Design",
  description: "Artistic + realistic interests + experiment ambiguity style + fast/burst pace + builder known-for",
  requires: {
    int1: ["artistic", "realistic"],
    int3: ["builder"],
    ws4: ["experiment"],
    env3: ["fast", "burst"],
  },
  boostWhen: [
    { field: "domains", values: ["Media & Entertainment", "Technology", "Design & UX"] },
    { field: "archetypes", values: ["builder", "creator"] },
    { field: "ambiguityStyle", values: ["experiment"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "frontend-dev", "product-designer", "graphic-designer"
  ],
  explanation: "You combine hands-on building with artistic vision and a love of experimentation -- the creative-technical blend that drives interactive design.",
}
```

#### S13 -- Film / Media Production

**Signal:** Artistic interest + strategic/creative problems + leader role + fast/burst pace + collaborative.

```typescript
{
  id: "s13-film-media-production",
  name: "Film / Media Production",
  description: "Artistic interest + leader role + creative/strategic problems + collaborative + burst/fast pace",
  requires: {
    int1: ["artistic"],
    int2: ["creative", "strategic"],
    car4: ["leader"],
    ws3: ["collaborative", "mixed"],
    env3: ["burst", "fast"],
  },
  boostWhen: [
    { field: "domains", values: ["Media & Entertainment", "Media & Journalism"] },
    { field: "groupRoles", values: ["leader", "ideator"] },
    { field: "archetypes", values: ["creator", "visionary"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "video-producer", "graphic-designer", "brand-strategist"
  ],
  explanation: "Your blend of creative vision, leadership instinct, and comfort with intense production sprints is the heart of media production.",
}
```

#### S14 -- Architecture / Spatial Design

**Signal:** Artistic + realistic interests + organized style + structure preference + conscientiousness.

```typescript
{
  id: "s14-architecture-spatial-design",
  name: "Architecture / Spatial Design",
  description: "Artistic + realistic interests + organized response + structure ambiguity + steady/varied pace",
  requires: {
    int1: ["artistic", "realistic"],
    ws1: ["organized"],
    ws4: ["structure"],
    env3: ["steady", "varied"],
  },
  boostWhen: [
    { field: "domains", values: ["Architecture & Construction", "Design & UX"] },
    { field: "archetypes", values: ["builder", "creator"] },
    { field: "workStyles", values: ["organized", "methodical"] },
  ],
  matchThreshold: 0.75,
  bonus: 3,
  boostedProfiles: [
    "architect", "civil-engineer", "construction-manager"
  ],
  explanation: "You bring artistic vision and organized precision together -- the dual discipline that architecture demands.",
}
```

---

### Category C: People Synergies (6)

#### S15 -- Clinical Healthcare

**Signal:** Social + investigative + empathetic + cautious approach + purpose value.

```typescript
{
  id: "s15-clinical-healthcare",
  name: "Clinical Healthcare",
  description: "Social interest + investigative interest + empathetic response + cautious approach + purpose value",
  requires: {
    int1: ["social"],
    int2: ["human", "scientific"],
    ws1: ["empathetic", "cautious"],
    val1: ["purpose"],
    val4: ["impact"],
  },
  boostWhen: [
    { field: "domains", values: ["Healthcare"] },
    { field: "archetypes", values: ["helper", "analyst"] },
    { field: "coreValues", values: ["purpose", "impact"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "healthcare-administrator", "clinical-researcher", "health-informatics-specialist"
  ],
  explanation: "Your blend of empathy, scientific rigor, and purpose-driven motivation is the foundation of clinical healthcare careers.",
}
```

#### S16 -- Teaching / Education

**Signal:** Social + helper/thinker archetype + human problems + purpose over wealth + impact reward.

```typescript
{
  id: "s16-teaching-education",
  name: "Teaching / Education",
  description: "Social interest + helper archetype + human problems + purpose over wealth tradeoff + impact reward",
  requires: {
    int1: ["social"],
    int3: ["helper", "thinker"],
    int2: ["human"],
    val2: ["purpose_over_wealth"],
    val4: ["impact"],
  },
  boostWhen: [
    { field: "domains", values: ["Education & Training", "Education"] },
    { field: "archetypes", values: ["helper", "mentor"] },
    { field: "coreValues", values: ["purpose", "benevolence"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "corporate-trainer", "career-coach", "hr-manager"
  ],
  explanation: "You genuinely care about others' growth and will trade wealth for meaning -- the traits that sustain a long teaching career.",
}
```

#### S17 -- Counseling / Therapy

**Signal:** Social + empathetic + feeling/consensus decisions + purpose + solo/pair work.

```typescript
{
  id: "s17-counseling-therapy",
  name: "Counseling / Therapy",
  description: "Social interest + empathetic response + feeling/consensus decisions + purpose value + solo/pair work",
  requires: {
    int1: ["social"],
    ws1: ["empathetic"],
    ws2: ["feeling", "consensus"],
    val1: ["purpose"],
    ws3: ["solo", "pair"],
  },
  boostWhen: [
    { field: "domains", values: ["Healthcare", "Education", "Social Impact"] },
    { field: "archetypes", values: ["helper"] },
    { field: "coreValues", values: ["purpose", "empathy"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "career-coach", "hr-manager", "healthcare-administrator"
  ],
  explanation: "Your deep empathy, values-driven decisions, and comfort in one-on-one settings are the core of counseling work.",
}
```

#### S18 -- HR / People Operations

**Signal:** Social + operator archetype + organized + collaborative + harmonizer role.

```typescript
{
  id: "s18-hr-people-operations",
  name: "HR / People Operations",
  description: "Social interest + operator archetype + organized response + collaborative style + harmonizer role",
  requires: {
    int1: ["social"],
    int3: ["operator"],
    ws1: ["organized"],
    ws3: ["collaborative", "mixed"],
    car4: ["harmonizer"],
  },
  boostWhen: [
    { field: "domains", values: ["Education", "Consulting"] },
    { field: "archetypes", values: ["helper", "operator"] },
    { field: "collaboration", values: ["team", "mixed"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "hr-manager", "recruiter", "corporate-trainer"
  ],
  explanation: "You naturally organize people and harmonize teams -- the operational empathy that HR departments need.",
}
```

#### S19 -- Sales Excellence

**Signal:** Strategic problems + leader/doer role + wealth/recognition reward + high risk + collaborative.

```typescript
{
  id: "s19-sales-excellence",
  name: "Sales Excellence",
  description: "Strategic problems + leader/doer role + wealth or recognition reward + high/moderate risk + fast pace",
  requires: {
    int2: ["strategic"],
    car4: ["leader", "doer"],
    val4: ["wealth", "recognition"],
    car2: ["high", "moderate"],
    env3: ["fast"],
  },
  boostWhen: [
    { field: "domains", values: ["E-commerce", "E-commerce/Consulting", "Consulting"] },
    { field: "rewards", values: ["wealth", "recognition"] },
    { field: "riskLevels", values: ["high", "moderate"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "sales-manager", "account-executive", "business-development-rep"
  ],
  explanation: "Your competitive drive, comfort with risk, and strategic instinct are the exact fuel high-performing salespeople run on.",
}
```

#### S20 -- Community Leadership

**Signal:** Social + helper + collaborative + purpose value + impact reward + leader/harmonizer.

```typescript
{
  id: "s20-community-leadership",
  name: "Community Leadership",
  description: "Social interest + helper archetype + collaborative + purpose value + impact reward + leader/harmonizer",
  requires: {
    int1: ["social"],
    int3: ["helper"],
    ws3: ["collaborative"],
    val1: ["purpose"],
    car4: ["leader", "harmonizer"],
  },
  boostWhen: [
    { field: "domains", values: ["Social Impact", "Education", "Sustainability"] },
    { field: "archetypes", values: ["helper", "connector"] },
    { field: "groupRoles", values: ["leader", "harmonizer"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "sustainability-consultant", "career-coach", "hr-manager"
  ],
  explanation: "You lead through service, not authority -- the kind of leadership that builds lasting communities and movements.",
}
```

---

### Category D: Business Synergies (6)

#### S21 -- Strategic Consulting

**Signal:** Strategic + investigative + thinking decisions + growth over comfort + collaborative.

```typescript
{
  id: "s21-strategic-consulting",
  name: "Strategic Consulting",
  description: "Strategic problems + investigative interest + thinking decisions + growth over comfort + collaborative",
  requires: {
    int2: ["strategic"],
    int1: ["investigative"],
    ws2: ["thinking"],
    val2: ["growth_over_comfort"],
    ws3: ["collaborative", "mixed"],
  },
  boostWhen: [
    { field: "domains", values: ["Consulting", "Finance/Consulting"] },
    { field: "problemTypes", values: ["strategic", "analytical"] },
    { field: "trajectories", values: ["generalist", "manager"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "management-consultant", "business-analyst", "freelance-consultant"
  ],
  explanation: "You combine analytical depth with strategic breadth and thrive on growth pressure -- the consulting trifecta.",
}
```

#### S22 -- Entrepreneurship

**Signal:** High risk + autonomy + ideator + open to change + wealth over stability.

```typescript
{
  id: "s22-entrepreneurship",
  name: "Entrepreneurship",
  description: "High risk tolerance + autonomy value + ideator role + open to change + wealth over stability tradeoff",
  requires: {
    car2: ["high"],
    val1: ["autonomy"],
    car4: ["ideator", "leader"],
    ws1: ["open"],
    val2: ["wealth_over_stability"],
  },
  boostWhen: [
    { field: "trajectories", values: ["entrepreneur", "founder"] },
    { field: "riskLevels", values: ["high"] },
    { field: "coreValues", values: ["autonomy"] },
  ],
  matchThreshold: 0.66,
  bonus: 3.5,
  boostedProfiles: [
    "startup-founder", "freelance-consultant", "growth-hacker"
  ],
  explanation: "You have the rare combination of risk appetite, autonomy drive, and creative vision that entrepreneurship demands.",
}
```

#### S23 -- Financial Analysis

**Signal:** Investigative + technical/scientific problems + organized + thinking decisions + structure.

```typescript
{
  id: "s23-financial-analysis",
  name: "Financial Analysis",
  description: "Investigative interest + technical/scientific problems + organized + thinking decisions + structure",
  requires: {
    int1: ["investigative"],
    int2: ["technical", "scientific"],
    ws1: ["organized"],
    ws2: ["thinking"],
    ws4: ["structure", "research"],
  },
  boostWhen: [
    { field: "domains", values: ["Finance", "Finance/Consulting", "Sustainability/Finance"] },
    { field: "problemTypes", values: ["analytical", "technical"] },
    { field: "decisionStyle", values: ["thinking", "analytical"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "financial-analyst", "investment-analyst", "esg-analyst", "accountant"
  ],
  explanation: "Your structured, analytical mind and comfort with data-driven decisions are exactly what financial analysis requires.",
}
```

#### S24 -- Project Management

**Signal:** Operator + organized + collaborative + targets management + doer/leader role.

```typescript
{
  id: "s24-project-management",
  name: "Project Management",
  description: "Operator archetype + organized style + collaborative + targets management preference + leader/doer role",
  requires: {
    int3: ["operator"],
    ws1: ["organized"],
    ws3: ["collaborative", "mixed"],
    env4: ["targets", "coaching"],
    car4: ["doer", "leader"],
  },
  boostWhen: [
    { field: "domains", values: ["Product Management", "Technology", "Consulting"] },
    { field: "archetypes", values: ["operator", "organizer"] },
    { field: "collaboration", values: ["team", "mixed"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "project-manager", "scrum-master", "technical-program-manager", "biotech-project-manager"
  ],
  explanation: "You bring organization, accountability, and people skills together -- the three pillars of effective project management.",
}
```

#### S25 -- Operations Excellence

**Signal:** Operator + realistic + organized + structure + steady pace + targets management.

```typescript
{
  id: "s25-operations-excellence",
  name: "Operations Excellence",
  description: "Operator archetype + realistic interest + organized + structure ambiguity + steady pace",
  requires: {
    int3: ["operator"],
    int1: ["realistic"],
    ws1: ["organized"],
    ws4: ["structure"],
    env3: ["steady"],
  },
  boostWhen: [
    { field: "domains", values: ["Architecture & Construction", "Real Estate", "Healthcare"] },
    { field: "archetypes", values: ["operator", "optimizer"] },
    { field: "paces", values: ["steady"] },
  ],
  matchThreshold: 0.75,
  bonus: 2.5,
  boostedProfiles: [
    "construction-manager", "property-manager", "healthcare-administrator"
  ],
  explanation: "You optimize systems for reliability, not flash -- the operational mindset that keeps organizations running smoothly.",
}
```

#### S26 -- Executive Leadership

**Signal:** Leader + strategic + manager trajectory + advancing stage + prestige value.

```typescript
{
  id: "s26-executive-leadership",
  name: "Executive Leadership",
  description: "Leader role + strategic problems + manager trajectory + advancing stage + prestige value",
  requires: {
    car4: ["leader"],
    int2: ["strategic"],
    car3: ["manager"],
    car1: ["advancing"],
    val1: ["prestige"],
  },
  boostWhen: [
    { field: "trajectories", values: ["manager", "executive"] },
    { field: "groupRoles", values: ["leader"] },
    { field: "rewards", values: ["recognition", "wealth"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "management-consultant", "sales-manager", "project-manager"
  ],
  explanation: "You're wired for the top -- strategic vision, leadership instinct, and ambition combine to define the executive path.",
}
```

---

### Category E: Specialist Synergies (4)

#### S27 -- Research Scientist

**Signal:** Investigative + scientific problems + mastery + research ambiguity + steady/varied pace + solo/pair.

```typescript
{
  id: "s27-research-scientist",
  name: "Research Scientist",
  description: "Investigative + scientific problems + mastery value + research ambiguity style + steady pace + solo/pair work",
  requires: {
    int1: ["investigative"],
    int2: ["scientific"],
    val1: ["mastery"],
    ws4: ["research"],
    env3: ["steady", "varied"],
    ws3: ["solo", "pair"],
  },
  boostWhen: [
    { field: "domains", values: ["Healthcare", "Data & Analytics"] },
    { field: "problemTypes", values: ["scientific", "analytical"] },
    { field: "coreValues", values: ["mastery"] },
  ],
  matchThreshold: 0.66,
  bonus: 3.5,
  boostedProfiles: [
    "clinical-researcher", "data-scientist", "ml-engineer"
  ],
  explanation: "You have the patience, depth-seeking curiosity, and mastery drive that sustains years of research toward breakthrough discoveries.",
}
```

#### S28 -- Legal Mind

**Signal:** Investigative + strategic problems + thinking decisions + organized + structure + growth over comfort.

```typescript
{
  id: "s28-legal-mind",
  name: "Legal Mind",
  description: "Investigative interest + strategic problems + thinking decisions + organized + structure + growth over comfort",
  requires: {
    int1: ["investigative"],
    int2: ["strategic"],
    ws2: ["thinking"],
    ws1: ["organized", "cautious"],
    ws4: ["structure", "research"],
    val2: ["growth_over_comfort"],
  },
  boostWhen: [
    { field: "domains", values: ["Law & Policy"] },
    { field: "problemTypes", values: ["analytical", "strategic"] },
    { field: "workStyles", values: ["organized", "methodical"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "lawyer", "paralegal", "compliance-officer"
  ],
  explanation: "Your analytical precision, structured thinking, and willingness to grind through complexity are the hallmarks of legal professionals.",
}
```

#### S29 -- Trades Mastery

**Signal:** Realistic + builder + organized + structure + mastery + hands-on doer.

```typescript
{
  id: "s29-trades-mastery",
  name: "Trades Mastery",
  description: "Realistic interest + builder archetype + mastery value + doer role + structure preference + onsite environment",
  requires: {
    int1: ["realistic"],
    int3: ["builder"],
    val1: ["mastery"],
    car4: ["doer"],
    ws4: ["structure"],
    env1: ["onsite"],
  },
  boostWhen: [
    { field: "domains", values: ["Architecture & Construction", "Real Estate"] },
    { field: "archetypes", values: ["builder", "craftsperson"] },
    { field: "environments", values: ["onsite", "field"] },
  ],
  matchThreshold: 0.66,
  bonus: 3,
  boostedProfiles: [
    "architect", "civil-engineer", "construction-manager"
  ],
  explanation: "You build tangible things with your hands, take pride in craft mastery, and prefer the real world to screens.",
}
```

#### S30 -- Public Service

**Signal:** Social + helper + purpose + purpose over wealth + steady/varied pace + low/calculated risk.

```typescript
{
  id: "s30-public-service",
  name: "Public Service",
  description: "Social interest + helper archetype + purpose value + purpose over wealth + steady pace + low/calculated risk",
  requires: {
    int1: ["social"],
    int3: ["helper"],
    val1: ["purpose"],
    val2: ["purpose_over_wealth"],
    env3: ["steady", "varied"],
    car2: ["low", "calculated"],
  },
  boostWhen: [
    { field: "domains", values: ["Social Impact", "Education", "Healthcare", "Sustainability"] },
    { field: "coreValues", values: ["purpose", "benevolence"] },
    { field: "riskLevels", values: ["low", "moderate"] },
  ],
  matchThreshold: 0.66,
  bonus: 2.5,
  boostedProfiles: [
    "sustainability-consultant", "esg-analyst", "healthcare-administrator", "career-coach"
  ],
  explanation: "You choose meaning over money and stability over thrill -- the values that sustain a lifelong commitment to public service.",
}
```

---

## Part 2: Anti-Patterns (20)

### Interface

```typescript
interface AntiPatternV2 {
  id: string;
  name: string;
  description: string;
  userCondition: Record<string, string[]>;  // answer dimension -> trigger values
  profileCondition: { field: keyof CareerProfile; values: string[] }[];
  penalty: number;  // 1-4 points subtracted
  explanation: string;
}
```

---

### AP01 -- Risk-Averse Entrepreneur

**Conflict:** Low risk tolerance clashes with entrepreneur/founder trajectory.

```typescript
{
  id: "ap01-risk-averse-entrepreneur",
  name: "Risk-Averse Entrepreneur",
  description: "Low risk tolerance + entrepreneur/founder trajectory = fundamental conflict",
  userCondition: { car2: ["low"] },
  profileCondition: [
    { field: "trajectories", values: ["entrepreneur", "founder"] },
    { field: "riskLevels", values: ["high"] },
  ],
  penalty: 3,
  explanation: "Entrepreneurship demands comfort with financial uncertainty and failure. Your strong preference for stability would create constant stress in a founder role.",
}
```

### AP02 -- Isolation-Hating Solo Worker

**Conflict:** Frustration with isolation combined with solo-dominant career profiles.

```typescript
{
  id: "ap02-isolation-hating-solo",
  name: "Isolation-Hating Solo Worker",
  description: "Isolation frustration + solo/independent work profiles",
  userCondition: { val3: ["isolation"] },
  profileCondition: [
    { field: "collaboration", values: ["solo"] },
    { field: "teamSizes", values: ["solo"] },
  ],
  penalty: 2.5,
  explanation: "You explicitly dislike working alone, but this career path involves significant independent work with limited team interaction.",
}
```

### AP03 -- Micromanaged Autonomy-Seeker

**Conflict:** Autonomy value combined with directive/structured management profiles.

```typescript
{
  id: "ap03-micromanaged-autonomy-seeker",
  name: "Micromanaged Autonomy-Seeker",
  description: "Autonomy value + directive/targets management style profiles",
  userCondition: { val1: ["autonomy"], val3: ["micromanaged"] },
  profileCondition: [
    { field: "managementStyles", values: ["targets", "directive", "structured"] },
  ],
  penalty: 2.5,
  explanation: "You value freedom and are deeply frustrated by micromanagement. Careers with close oversight and rigid targets would drain you.",
}
```

### AP04 -- Routine-Hating Conventional

**Conflict:** Monotony frustration with careers requiring steady, structured, repetitive work.

```typescript
{
  id: "ap04-routine-hating-conventional",
  name: "Routine-Hating Conventional",
  description: "Monotony frustration + steady/structured career profiles",
  userCondition: { val3: ["monotony"], ws1: ["open"] },
  profileCondition: [
    { field: "paces", values: ["steady"] },
    { field: "ambiguityStyle", values: ["structure"] },
  ],
  penalty: 2,
  explanation: "You're frustrated by repetition and crave novelty, but this career involves significant routine and standardized processes.",
}
```

### AP05 -- Introvert in High-Social Role

**Conflict:** Strong solo preference with careers demanding constant collaboration and large teams.

```typescript
{
  id: "ap05-introvert-high-social",
  name: "Introvert in High-Social Role",
  description: "Solo work preference + solo team size + large-team collaborative career profiles",
  userCondition: { ws3: ["solo"], env2: ["solo"] },
  profileCondition: [
    { field: "collaboration", values: ["team"] },
    { field: "teamSizes", values: ["large", "medium"] },
  ],
  penalty: 2.5,
  explanation: "You strongly prefer working independently, but this career requires constant interaction with large teams and stakeholders.",
}
```

### AP06 -- Perfectionist in Fast-Pace

**Conflict:** Organized/cautious personality with careers demanding breakneck speed and iteration.

```typescript
{
  id: "ap06-perfectionist-fast-pace",
  name: "Perfectionist in Fast-Pace",
  description: "Cautious + organized + structure preference vs fast/burst pace profiles",
  userCondition: { ws1: ["cautious"], ws4: ["structure"], env3: ["steady"] },
  profileCondition: [
    { field: "paces", values: ["fast", "burst"] },
    { field: "ambiguityStyle", values: ["experiment"] },
  ],
  penalty: 2,
  explanation: "Your need for structure and careful planning conflicts with careers that demand 'ship fast, iterate later' mentality.",
}
```

### AP07 -- Non-Analytical in Data Career

**Conflict:** Non-technical/non-scientific problem preference combined with data-heavy career profiles.

```typescript
{
  id: "ap07-non-analytical-data-career",
  name: "Non-Analytical in Data Career",
  description: "Human/creative problem preference + feeling decisions vs data/analytics-heavy profiles",
  userCondition: { int2: ["human", "creative"], ws2: ["feeling"] },
  profileCondition: [
    { field: "domains", values: ["Data & Analytics", "Finance"] },
    { field: "problemTypes", values: ["analytical", "technical"] },
  ],
  penalty: 2.5,
  explanation: "You're drawn to human and creative challenges, not data analysis. A data-heavy career would feel like working against your grain.",
}
```

### AP08 -- Low-Empathy in Care Role

**Conflict:** Thinking-only decisions, non-social interest, combined with care/people-focused careers.

```typescript
{
  id: "ap08-low-empathy-care-role",
  name: "Low-Empathy in Care Role",
  description: "Non-social interest + thinking-only decisions + non-helper archetype vs care-focused profiles",
  userCondition: { int1: ["investigative", "realistic"], ws2: ["thinking"], int3: ["builder", "operator"] },
  profileCondition: [
    { field: "domains", values: ["Healthcare", "Education", "Social Impact"] },
    { field: "archetypes", values: ["helper", "mentor", "counselor"] },
  ],
  penalty: 2,
  explanation: "Care-focused careers require deep empathy and people orientation. Your analytical, task-focused style would create a persistent mismatch.",
}
```

### AP09 -- Structure-Needer in Startup

**Conflict:** Low risk + security value + structure preference versus high-ambiguity startup profiles.

```typescript
{
  id: "ap09-structure-needer-startup",
  name: "Structure-Needer in Startup",
  description: "Low risk + structure preference + targets management vs high-ambiguity startup profiles",
  userCondition: { car2: ["low"], ws4: ["structure"], env4: ["targets"] },
  profileCondition: [
    { field: "riskLevels", values: ["high"] },
    { field: "ambiguityStyle", values: ["experiment", "pivot"] },
  ],
  penalty: 2.5,
  explanation: "You need clear structure and low risk, but startups are defined by ambiguity, pivots, and financial uncertainty.",
}
```

### AP10 -- Non-Verbal in Writing Career

**Conflict:** Technical/scientific problem preference with non-consensus decisions versus writing-heavy careers.

```typescript
{
  id: "ap10-non-verbal-writing-career",
  name: "Non-Verbal in Writing Career",
  description: "Technical/realistic interest + builder/operator archetype vs writing/communication-heavy profiles",
  userCondition: { int1: ["realistic"], int2: ["technical"], int3: ["builder"] },
  profileCondition: [
    { field: "domains", values: ["Media & Journalism", "Marketing", "Media & Entertainment"] },
    { field: "archetypes", values: ["creator", "communicator", "storyteller"] },
  ],
  penalty: 2,
  explanation: "Writing-heavy careers need verbal fluency and creative communication. Your hands-on, technical orientation would be underutilized.",
}
```

### AP11 -- Solo Leader Paradox

**Conflict:** Leader role preference but strong solo work style and small/solo team size.

```typescript
{
  id: "ap11-solo-leader-paradox",
  name: "Solo Leader Paradox",
  description: "Leader group role + solo collaboration + solo team size vs management-track profiles",
  userCondition: { car4: ["leader"], ws3: ["solo"], env2: ["solo"] },
  profileCondition: [
    { field: "trajectories", values: ["manager", "executive"] },
    { field: "teamSizes", values: ["large", "medium"] },
  ],
  penalty: 2,
  explanation: "You want to lead, but prefer working alone. Management requires daily people interaction that conflicts with your solo preference.",
}
```

### AP12 -- Creative in Compliance

**Conflict:** Artistic interest + open/experimental style versus highly regulated, compliance-driven careers.

```typescript
{
  id: "ap12-creative-in-compliance",
  name: "Creative in Compliance",
  description: "Artistic interest + open response + experiment style vs compliance/regulation-heavy profiles",
  userCondition: { int1: ["artistic"], ws1: ["open"], ws4: ["experiment"] },
  profileCondition: [
    { field: "domains", values: ["Law & Policy", "Finance"] },
    { field: "archetypes", values: ["analyst", "enforcer"] },
    { field: "ambiguityStyle", values: ["structure"] },
  ],
  penalty: 2,
  explanation: "Your creative, experimental nature would chafe against careers defined by rigid compliance frameworks and regulatory constraints.",
}
```

### AP13 -- Prestige-Seeker in Purpose Role

**Conflict:** Prestige value + wealth reward versus low-profile, purpose-driven career profiles.

```typescript
{
  id: "ap13-prestige-seeker-purpose-role",
  name: "Prestige-Seeker in Purpose Role",
  description: "Prestige value + wealth reward vs purpose-driven low-profile career profiles",
  userCondition: { val1: ["prestige"], val4: ["wealth"] },
  profileCondition: [
    { field: "coreValues", values: ["purpose", "benevolence"] },
    { field: "rewards", values: ["impact"] },
    { field: "tradeoffs", values: ["purpose_over_wealth"] },
  ],
  penalty: 1.5,
  explanation: "Purpose-driven careers rarely offer prestige or high pay. Your primary motivators would go unsatisfied.",
}
```

### AP14 -- Team-Player in Solo Craft

**Conflict:** Strong collaborative preference + large team size versus independent, craft-focused careers.

```typescript
{
  id: "ap14-team-player-solo-craft",
  name: "Team-Player in Solo Craft",
  description: "Collaborative work + team preference + large team size vs solo/independent craft profiles",
  userCondition: { ws3: ["collaborative"], env2: ["large", "medium"] },
  profileCondition: [
    { field: "collaboration", values: ["solo"] },
    { field: "teamSizes", values: ["solo", "small"] },
  ],
  penalty: 2,
  explanation: "You thrive on team energy and collaboration, but this career involves long stretches of independent work.",
}
```

### AP15 -- Hands-Off Hates Mentorship

**Conflict:** Hands-off management preference versus careers requiring constant mentorship or coaching relationships.

```typescript
{
  id: "ap15-handsoff-hates-mentorship",
  name: "Hands-Off Hates Mentorship-Dependent",
  description: "Hands-off management preference vs mentorship/coaching-heavy career profiles",
  userCondition: { env4: ["handsoff"], car1: ["exploring"] },
  profileCondition: [
    { field: "managementStyles", values: ["mentorship", "coaching"] },
    { field: "careerStages", values: ["building", "advancing"] },
  ],
  penalty: 1.5,
  explanation: "You prefer minimal supervision, but this career path benefits enormously from mentorship during the early years. The mismatch may slow your growth.",
}
```

### AP16 -- Generalist in Specialist Trench

**Conflict:** Generalist trajectory + varied interests versus deep-specialization career profiles.

```typescript
{
  id: "ap16-generalist-specialist-trench",
  name: "Generalist in Specialist Trench",
  description: "Generalist trajectory + open/experiment style vs deep specialist profiles",
  userCondition: { car3: ["generalist"], ws1: ["open"], val3: ["monotony"] },
  profileCondition: [
    { field: "trajectories", values: ["specialist"] },
    { field: "archetypes", values: ["specialist", "expert"] },
  ],
  penalty: 2,
  explanation: "You want breadth and variety, but this career rewards years of narrow focus. You'd likely feel trapped by the depth requirement.",
}
```

### AP17 -- Stability in Sales Volatility

**Conflict:** Low risk + steady pace + balance tradeoff versus volatile, commission-driven sales careers.

```typescript
{
  id: "ap17-stability-sales-volatility",
  name: "Stability in Sales Volatility",
  description: "Low risk + steady pace + balance over creativity vs volatile sales profiles",
  userCondition: { car2: ["low"], env3: ["steady"], val2: ["balance_over_creativity"] },
  profileCondition: [
    { field: "domains", values: ["E-commerce", "E-commerce/Consulting"] },
    { field: "paces", values: ["fast", "burst"] },
    { field: "riskLevels", values: ["high", "moderate"] },
  ],
  penalty: 2.5,
  explanation: "Sales careers are defined by quotas, rejection, and income volatility. Your need for stability and balance would create ongoing anxiety.",
}
```

### AP18 -- Builder Frustrated by Strategy

**Conflict:** Builder/doer archetype + technical problems versus strategy-only, non-building roles.

```typescript
{
  id: "ap18-builder-frustrated-strategy",
  name: "Builder Frustrated by Strategy",
  description: "Builder archetype + doer role + technical problems vs strategy-only non-building profiles",
  userCondition: { int3: ["builder"], car4: ["doer"], int2: ["technical"] },
  profileCondition: [
    { field: "archetypes", values: ["strategist", "advisor"] },
    { field: "problemTypes", values: ["strategic"] },
  ],
  penalty: 1.5,
  explanation: "You want to build things, not just plan them. Pure strategy roles would leave you itching to get your hands dirty.",
}
```

### AP19 -- Consensus-Seeker in Solo Research

**Conflict:** Consensus decisions + collaborative + isolation frustration versus solo-deep-research profiles.

```typescript
{
  id: "ap19-consensus-seeker-solo-research",
  name: "Consensus-Seeker in Solo Research",
  description: "Consensus decisions + collaborative style + isolation frustration vs solo research profiles",
  userCondition: { ws2: ["consensus"], ws3: ["collaborative"], val3: ["isolation"] },
  profileCondition: [
    { field: "collaboration", values: ["solo"] },
    { field: "decisionStyle", values: ["thinking", "analytical"] },
  ],
  penalty: 2,
  explanation: "You make decisions by gathering perspectives and thrive on collaboration. Isolated research work would cut you off from the social input you need.",
}
```

### AP20 -- Feeling-Driven in Quantitative Role

**Conflict:** Feeling/intuition decisions + no-impact frustration versus quantitative, metrics-driven careers.

```typescript
{
  id: "ap20-feeling-driven-quantitative",
  name: "Feeling-Driven in Quantitative Role",
  description: "Feeling/intuition decisions + impact reward + no-impact frustration vs quantitative metrics-driven profiles",
  userCondition: { ws2: ["feeling", "intuition"], val3: ["no_impact"], val4: ["impact"] },
  profileCondition: [
    { field: "decisionStyle", values: ["thinking", "analytical"] },
    { field: "problemTypes", values: ["analytical", "technical"] },
    { field: "domains", values: ["Finance", "Data & Analytics"] },
  ],
  penalty: 2,
  explanation: "You lead with values and gut instinct and need to see human impact. Purely quantitative roles that optimize metrics without visible human outcomes would leave you unfulfilled.",
}
```

---

## Part 3: Implementation Notes

### Scoring Budget Changes

| Component | v1 | v2 | Notes |
|-----------|----|----|-------|
| Synergy bonus cap | 10 pts | 15 pts | More patterns but same calibration discipline |
| Anti-pattern penalty cap | 8 pts | 12 pts | More patterns, prevents over-penalization |
| Total possible swing | 18 pts | 27 pts | Keeps proportional to base scoring (~60 pts) |

### Matching Algorithm Adjustment

The existing `scoreSynergies` function supports the v2 format without structural changes. The `matchThreshold` field maps directly to the existing `requirementRatio >= 0.66` check. Recommended change:

```typescript
// v1: hardcoded 0.66 threshold
if (requirementRatio >= 0.66) {

// v2: per-pattern threshold
if (requirementRatio >= (pattern.matchThreshold ?? 0.66)) {
```

### Explanation Surfacing

Each pattern now includes an `explanation` field. This should be surfaced in the UI when a synergy or anti-pattern fires:

- **Synergies**: Show as "Why this is a strong match" in the career detail view.
- **Anti-patterns**: Show as "Potential concern" with a softer tone to avoid discouraging users.

### Testing Strategy

1. **Unit tests per pattern**: For each of the 50 patterns, create a test case with a synthetic answer set that should trigger it and one that should not.
2. **Coverage matrix**: Run all 50 career profiles against 8-10 representative persona answer sets, verify no profile accumulates > 20 pts of synergy (would indicate pattern overlap/stacking issue).
3. **Regression test**: The existing 10 synergies and 8 anti-patterns must produce identical scores when tested with v1 inputs (backward compatibility).

### Migration Path

1. Add v2 patterns alongside v1 (feature-flagged).
2. Run shadow scoring: compute both v1 and v2 scores for 2 weeks, log divergence.
3. If divergence is within acceptable bounds (top-5 career matches change by <= 1 position on average), promote v2 to production.
4. Remove v1 patterns.

### Profile Field Coverage Analysis

Which `CareerProfile` fields each pattern category touches:

| Field | Tech (8) | Creative (6) | People (6) | Business (6) | Specialist (4) | Anti (20) |
|-------|----------|--------------|------------|--------------|----------------|-----------|
| `domains` | 8 | 6 | 6 | 6 | 4 | 8 |
| `archetypes` | 6 | 5 | 3 | 2 | 2 | 4 |
| `problemTypes` | 2 | 1 | 0 | 2 | 2 | 2 |
| `trajectories` | 2 | 0 | 0 | 2 | 0 | 2 |
| `paces` | 2 | 1 | 0 | 1 | 0 | 4 |
| `collaboration` | 0 | 0 | 2 | 2 | 0 | 4 |
| `riskLevels` | 0 | 0 | 1 | 1 | 1 | 3 |
| `groupRoles` | 1 | 1 | 1 | 0 | 0 | 1 |
| `coreValues` | 0 | 1 | 2 | 1 | 1 | 1 |
| `rewards` | 0 | 0 | 0 | 1 | 0 | 0 |
| `managementStyles` | 0 | 0 | 0 | 0 | 0 | 2 |
| `workStyles` | 1 | 1 | 0 | 0 | 1 | 0 |
| `decisionStyle` | 1 | 0 | 0 | 0 | 0 | 2 |
| `ambiguityStyle` | 1 | 1 | 0 | 0 | 0 | 2 |
| `environments` | 0 | 0 | 0 | 0 | 1 | 0 |
| `teamSizes` | 0 | 0 | 0 | 0 | 0 | 3 |
| `tradeoffs` | 0 | 0 | 0 | 0 | 0 | 1 |
| `careerStages` | 0 | 0 | 0 | 0 | 0 | 1 |

This confirms good coverage without over-indexing on any single profile field.
