# Career Profiles V2 Schema & Expansion Plan

**Status:** Design Document  
**Author:** PathWise Engineering  
**Date:** 2026-04-06  
**Target:** Expand from 90 to 150+ career profiles with enriched schema

---

## Table of Contents

1. [Current State](#current-state)
2. [V2 Interface Design](#v2-interface-design)
3. [Career Family Taxonomy](#career-family-taxonomy)
4. [Priority Missing Profiles](#priority-missing-profiles)
5. [Migration Strategy](#migration-strategy)
6. [Scoring Engine Integration](#scoring-engine-integration)
7. [Implementation Phases](#implementation-phases)

---

## 1. Current State

### Existing Profile Distribution (90 profiles across 3 files)

| File | Count | Domains |
|------|-------|---------|
| `career-profiles.ts` | 25 | Technology, Data & Analytics, Design & UX, Product Management, Marketing, Consulting |
| `career-profiles-2.ts` | 25 | Finance, E-commerce, Education, Healthcare, Design & UX, Media, Technology, Sustainability |
| `career-profiles-3.ts` | 40 | Law & Policy, Architecture & Construction, Media & Journalism, Real Estate, Trades, Arts & Entertainment, Agriculture & Environment, Logistics, Aviation, Hospitality, Science & Research, Social Services, Education, Technology, HR, Finance, Healthcare |

### Current CareerProfile Interface (V1)

```typescript
export interface SkillGapEntry {
  skill: string;
  importance: "high" | "medium" | "low";
  learningResource: string;
}

export interface CertEntry {
  skill: string;
  certName: string;
  provider: string;
  url: string;
  duration: string;
  level: string;
  cost: string;
  whyRecommended: string;
}

export interface RecEntry {
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

export interface MilestoneEntry {
  title: string;
  description: string;
  tasks: string[];
  estimatedWeeks: number;
}

export interface CareerProfile {
  id: string;
  title: string;
  domain: string;
  description: string;
  interests: string[];
  problemTypes: string[];
  archetypes: string[];
  workStyles: string[];
  decisionStyle: string[];
  collaboration: string[];
  ambiguityStyle: string[];
  coreValues: string[];
  tradeoffs: string[];
  frustrations: string[];
  rewards: string[];
  environments: string[];
  teamSizes: string[];
  paces: string[];
  managementStyles: string[];
  careerStages: string[];
  riskLevels: string[];
  trajectories: string[];
  groupRoles: string[];
  requiredSkills: string[];
  experienceLevels: string[];
  domains: string[];
  pathwayTime: string;
  skillGaps: SkillGapEntry[];
  certifications: CertEntry[];
  portfolioProjects: RecEntry[];
  networkingRecs: RecEntry[];
  jobTargets: RecEntry[];
  milestones: MilestoneEntry[];
}
```

### V1 Limitations

- **No scoring weights:** All matching dimensions treated equally, preventing career-specific tuning.
- **No non-compensatory thresholds:** A high score in one area can mask a critical mismatch in another.
- **No career clustering:** Profiles lack family/cluster grouping, limiting "similar careers" recommendations.
- **No market data:** Users cannot evaluate careers on salary, growth, automation risk, or remote work.
- **No progression data:** No visibility into career trajectories, titles, or years-to-senior.
- **No pivot data:** No way to recommend lateral moves or highlight transferable skills.
- **No aptitude or personality profiles:** Matching relies on loosely-typed string arrays instead of numeric scales.
- **No narrative content:** Missing "day in the life" and "surprising fact" fields that drive engagement.

---

## 2. V2 Interface Design

### Core Type Definitions

```typescript
// ─── Scoring & Matching ─────────────────────────────────────────────

/** Per-career dimension weights. Must sum to 1.0 (+/- 0.01 tolerance). */
export interface ScoringWeights {
  interest: number;           // 0-1, weight for RIASEC/interest match
  personality: number;        // 0-1, weight for Big Five personality fit
  values: number;             // 0-1, weight for core values alignment
  aptitude: number;           // 0-1, weight for aptitude profile match
  environment: number;        // 0-1, weight for work environment preference match
  stage: number;              // 0-1, weight for career stage relevance
}

/** Non-compensatory gates. If ANY threshold is not met, career is penalized. */
export interface MatchThresholds {
  requiredInterests?: string[];                    // RIASEC codes that MUST be present
  minTraits?: { trait: BigFiveTrait; min: number }[];  // Minimum trait levels (1-5 scale)
  requiredValues?: string[];                       // Values that MUST align
  minAptitudes?: { aptitude: AptitudeDimension; min: number }[];  // Minimum aptitude levels
}

// ─── Market & Outlook ────────────────────────────────────────────────

export type GrowthRate = 'declining' | 'stable' | 'growing' | 'rapid_growth';
export type AutomationRisk = 'low' | 'moderate' | 'high';
export type RemoteWorkLevel = 'none' | 'limited' | 'hybrid' | 'fully_remote';
export type EducationLevel =
  | 'None required'
  | 'High school'
  | "Associate's"
  | "Bachelor's"
  | "Master's"
  | 'Doctoral'
  | 'Professional degree';

export interface CareerOutlook {
  growthRate: GrowthRate;
  automationRisk: AutomationRisk;
  remoteWork: RemoteWorkLevel;
  medianSalary: string;       // e.g., "$85,000"
  entrySalary: string;        // e.g., "$55,000"
  seniorSalary: string;       // e.g., "$140,000"
}

export interface CareerEducation {
  minimum: EducationLevel;
  preferred: EducationLevel;
  typicalMajors: string[];
  alternativePaths: string[];  // "bootcamp", "self-taught", "apprenticeship", "certification-only"
}

// ─── Career Progression & Pivots ─────────────────────────────────────

export interface CareerProgression {
  entryTitle: string;
  midTitle: string;
  seniorTitle: string;
  leadershipTitle: string;
  typicalYearsToSenior: number;
  dualTrack: boolean;          // IC + management tracks available
  icCeiling?: string;          // e.g., "Distinguished Engineer", "Staff Scientist"
  managementCeiling?: string;  // e.g., "VP Engineering", "Chief Medical Officer"
}

export interface CareerPivots {
  commonPivotsFrom: string[];    // Career IDs people commonly transition FROM into this career
  commonPivotsTo: string[];      // Career IDs people commonly transition TO from this career
  transferableSkills: string[];  // Skills that transfer well during pivots
}

// ─── Psychometric Profiles ───────────────────────────────────────────

export type AptitudeDimension =
  | 'verbal'
  | 'numerical'
  | 'abstract'
  | 'spatial'
  | 'creative'
  | 'interpersonal'
  | 'technical'
  | 'physical';

export interface AptitudeProfile {
  verbal: number;           // 1-5 importance for this career
  numerical: number;
  abstract: number;
  spatial: number;
  creative: number;
  interpersonal: number;
  technical: number;
  physical: number;
}

export type BigFiveTrait =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'emotionalStability';

export interface PersonalityProfile {
  openness: number;             // 1-5 ideal level for this career
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}

// ─── BLS Career Cluster ──────────────────────────────────────────────

export type BLSCareerCluster =
  | 'Agriculture, Food & Natural Resources'
  | 'Architecture & Construction'
  | 'Arts, A/V Technology & Communications'
  | 'Business Management & Administration'
  | 'Education & Training'
  | 'Finance'
  | 'Government & Public Administration'
  | 'Health Science'
  | 'Hospitality & Tourism'
  | 'Human Services'
  | 'Information Technology'
  | 'Law, Public Safety, Corrections & Security'
  | 'Manufacturing'
  | 'Marketing'
  | 'Science, Technology, Engineering & Mathematics'
  | 'Transportation, Distribution & Logistics';

// ─── CareerProfileV2 (extends V1) ───────────────────────────────────

export interface CareerProfileV2 extends CareerProfile {
  // ── Scoring & Matching ──
  scoringWeights: ScoringWeights;
  thresholds?: MatchThresholds;

  // ── Taxonomy ──
  careerFamily: string;             // PathWise family (20 families, see Section 3)
  careerCluster: BLSCareerCluster;  // BLS 16 career clusters

  // ── Market Data ──
  outlook: CareerOutlook;
  education: CareerEducation;

  // ── Progression ──
  progression: CareerProgression;
  pivots: CareerPivots;

  // ── Psychometric Profiles ──
  aptitudeProfile: AptitudeProfile;
  personalityProfile: PersonalityProfile;

  // ── Skills (categorized) ──
  technicalSkills: string[];
  powerSkills: string[];         // "soft skills" / human skills
  domainKnowledge: string[];

  // ── Engagement Content ──
  dayInTheLife: string;          // 2-3 sentence narrative
  surprisingFact: string;       // Hook for user engagement
}
```

### Validation Schema (Zod)

```typescript
import { z } from 'zod';

const scoringWeightsSchema = z.object({
  interest: z.number().min(0).max(1),
  personality: z.number().min(0).max(1),
  values: z.number().min(0).max(1),
  aptitude: z.number().min(0).max(1),
  environment: z.number().min(0).max(1),
  stage: z.number().min(0).max(1),
}).refine(
  (w) => Math.abs(w.interest + w.personality + w.values + w.aptitude + w.environment + w.stage - 1.0) < 0.02,
  { message: 'Scoring weights must sum to 1.0 (+/- 0.01)' }
);

const aptitudeProfileSchema = z.object({
  verbal: z.number().int().min(1).max(5),
  numerical: z.number().int().min(1).max(5),
  abstract: z.number().int().min(1).max(5),
  spatial: z.number().int().min(1).max(5),
  creative: z.number().int().min(1).max(5),
  interpersonal: z.number().int().min(1).max(5),
  technical: z.number().int().min(1).max(5),
  physical: z.number().int().min(1).max(5),
});

const personalityProfileSchema = z.object({
  openness: z.number().int().min(1).max(5),
  conscientiousness: z.number().int().min(1).max(5),
  extraversion: z.number().int().min(1).max(5),
  agreeableness: z.number().int().min(1).max(5),
  emotionalStability: z.number().int().min(1).max(5),
});

const outlookSchema = z.object({
  growthRate: z.enum(['declining', 'stable', 'growing', 'rapid_growth']),
  automationRisk: z.enum(['low', 'moderate', 'high']),
  remoteWork: z.enum(['none', 'limited', 'hybrid', 'fully_remote']),
  medianSalary: z.string().regex(/^\$[\d,]+$/),
  entrySalary: z.string().regex(/^\$[\d,]+$/),
  seniorSalary: z.string().regex(/^\$[\d,]+$/),
});

const educationSchema = z.object({
  minimum: z.enum(['None required', 'High school', "Associate's", "Bachelor's", "Master's", 'Doctoral', 'Professional degree']),
  preferred: z.enum(['None required', 'High school', "Associate's", "Bachelor's", "Master's", 'Doctoral', 'Professional degree']),
  typicalMajors: z.array(z.string()).min(1),
  alternativePaths: z.array(z.string()),
});

const progressionSchema = z.object({
  entryTitle: z.string().min(1),
  midTitle: z.string().min(1),
  seniorTitle: z.string().min(1),
  leadershipTitle: z.string().min(1),
  typicalYearsToSenior: z.number().int().min(1).max(30),
  dualTrack: z.boolean(),
  icCeiling: z.string().optional(),
  managementCeiling: z.string().optional(),
});

const pivotsSchema = z.object({
  commonPivotsFrom: z.array(z.string()).min(1),
  commonPivotsTo: z.array(z.string()).min(1),
  transferableSkills: z.array(z.string()).min(1),
});

// Full V2 profile schema (new fields only; V1 fields validated separately)
export const careerProfileV2ExtensionSchema = z.object({
  scoringWeights: scoringWeightsSchema,
  thresholds: z.object({
    requiredInterests: z.array(z.string()).optional(),
    minTraits: z.array(z.object({ trait: z.string(), min: z.number().min(1).max(5) })).optional(),
    requiredValues: z.array(z.string()).optional(),
    minAptitudes: z.array(z.object({ aptitude: z.string(), min: z.number().min(1).max(5) })).optional(),
  }).optional(),
  careerFamily: z.string().min(1),
  careerCluster: z.string().min(1),
  outlook: outlookSchema,
  education: educationSchema,
  progression: progressionSchema,
  pivots: pivotsSchema,
  aptitudeProfile: aptitudeProfileSchema,
  personalityProfile: personalityProfileSchema,
  technicalSkills: z.array(z.string()).min(1),
  powerSkills: z.array(z.string()).min(1),
  domainKnowledge: z.array(z.string()).min(1),
  dayInTheLife: z.string().min(20),
  surprisingFact: z.string().min(10),
});
```

---

## 3. Career Family Taxonomy (20 Families)

Each career family groups related roles for "similar careers" recommendations and cluster-based navigation.

### Family 1: Software Engineering
**BLS Cluster:** Information Technology  
**Profiles (6):** Frontend Developer, Backend Developer, Full-Stack Developer, Mobile Developer, DevOps/SRE Engineer, QA/Test Engineer  
**Scoring Emphasis:** aptitude (0.30), interest (0.25), environment (0.20), personality (0.10), values (0.10), stage (0.05)

### Family 2: Data & AI
**BLS Cluster:** Science, Technology, Engineering & Mathematics  
**Profiles (7):** Data Scientist, Data Analyst, ML Engineer, Data Engineer, BI Analyst, AI Engineer (NEW), Research Scientist  
**Scoring Emphasis:** aptitude (0.30), interest (0.25), personality (0.15), environment (0.15), values (0.10), stage (0.05)

### Family 3: Design & Creative
**BLS Cluster:** Arts, A/V Technology & Communications  
**Profiles (7):** UX Designer, UI Designer, UX Researcher, Product Designer, Graphic Designer, Animator, Game Designer  
**Scoring Emphasis:** interest (0.30), aptitude (0.25), personality (0.15), values (0.15), environment (0.10), stage (0.05)

### Family 4: Product & Project Management
**BLS Cluster:** Business Management & Administration  
**Profiles (4):** Product Manager, Project Manager, Scrum Master, Technical Program Manager  
**Scoring Emphasis:** personality (0.25), values (0.20), interest (0.20), aptitude (0.15), environment (0.15), stage (0.05)

### Family 5: Marketing & Growth
**BLS Cluster:** Marketing  
**Profiles (7):** Digital Marketer, Content Strategist, SEO Specialist, Growth Hacker, Social Media Manager, Brand Strategist, Copywriter  
**Scoring Emphasis:** interest (0.25), personality (0.25), aptitude (0.15), values (0.15), environment (0.10), stage (0.10)

### Family 6: Finance & Accounting
**BLS Cluster:** Finance  
**Profiles (7):** Financial Analyst, Accountant, Investment Analyst, Investment Banker, ESG Analyst, Business Analyst, Actuary (NEW)  
**Scoring Emphasis:** aptitude (0.30), values (0.20), personality (0.20), interest (0.15), environment (0.10), stage (0.05)

### Family 7: Sales & Business Development
**BLS Cluster:** Marketing  
**Profiles (5):** Sales Manager, Account Executive, Business Development Rep, Real Estate Agent, E-commerce Manager (NEW)  
**Scoring Emphasis:** personality (0.30), interest (0.20), values (0.20), environment (0.15), aptitude (0.10), stage (0.05)

### Family 8: Healthcare Clinical
**BLS Cluster:** Health Science  
**Profiles (8):** Registered Nurse (NEW), Nurse Practitioner (NEW), Doctor/Physician (NEW), Dentist (NEW), Dental Hygienist (NEW), Pharmacist, Veterinarian, Physical Therapist  
**Scoring Emphasis:** values (0.25), aptitude (0.25), interest (0.20), personality (0.15), environment (0.10), stage (0.05)  
**Thresholds:** Requires investigative OR social interest; min conscientiousness 3; min emotionalStability 3

### Family 9: Healthcare Administration
**BLS Cluster:** Health Science  
**Profiles (4):** Healthcare Administrator, Health Informatics Specialist, Biotech Project Manager, Clinical Researcher  
**Scoring Emphasis:** values (0.25), personality (0.20), aptitude (0.20), interest (0.15), environment (0.15), stage (0.05)

### Family 10: Education & Training
**BLS Cluster:** Education & Training  
**Profiles (6):** K-12 Teacher (NEW), College Professor (NEW), Instructional Designer, School Administrator (NEW), Corporate Trainer, Career Coach  
**Scoring Emphasis:** values (0.30), personality (0.25), interest (0.20), aptitude (0.10), environment (0.10), stage (0.05)  
**Thresholds:** Requires social interest; min agreeableness 3

### Family 11: Law & Compliance
**BLS Cluster:** Law, Public Safety, Corrections & Security  
**Profiles (3):** Lawyer, Paralegal, Compliance Officer  
**Scoring Emphasis:** aptitude (0.25), personality (0.20), values (0.20), interest (0.20), environment (0.10), stage (0.05)

### Family 12: Government & Policy
**BLS Cluster:** Government & Public Administration  
**Profiles (3):** Policy Analyst, Urban Planner, Diplomat  
**Scoring Emphasis:** values (0.30), interest (0.20), personality (0.20), aptitude (0.15), environment (0.10), stage (0.05)

### Family 13: Trades & Skilled Labor
**BLS Cluster:** Architecture & Construction / Manufacturing  
**Profiles (8):** Electrician, Plumber, HVAC Technician, Carpenter (NEW), Welder (existing? NO - need to add), Auto Mechanic (NEW), CNC Machinist (NEW), Solar/Wind Technician (NEW)  
**Scoring Emphasis:** aptitude (0.30), interest (0.25), environment (0.20), values (0.10), personality (0.10), stage (0.05)  
**Thresholds:** Min physical aptitude 3; min technical aptitude 3

### Family 14: Science & Research
**BLS Cluster:** Science, Technology, Engineering & Mathematics  
**Profiles (6):** Research Scientist, Environmental Engineer, Conservation Biologist, Biomedical Engineer (NEW), Aerospace Engineer (NEW), Psychologist (NEW)  
**Scoring Emphasis:** aptitude (0.30), interest (0.25), personality (0.15), values (0.15), environment (0.10), stage (0.05)  
**Thresholds:** Requires investigative interest; min abstract aptitude 3

### Family 15: Arts & Entertainment
**BLS Cluster:** Arts, A/V Technology & Communications  
**Profiles (6):** Musician, Film Director, Content Creator (NEW), Journalist, PR Specialist, Video Producer  
**Scoring Emphasis:** interest (0.35), personality (0.20), aptitude (0.15), values (0.15), environment (0.10), stage (0.05)

### Family 16: Social Services
**BLS Cluster:** Human Services  
**Profiles (3):** Social Worker, Counselor, Nonprofit Manager  
**Scoring Emphasis:** values (0.35), personality (0.25), interest (0.20), aptitude (0.10), environment (0.05), stage (0.05)  
**Thresholds:** Requires social interest; min agreeableness 4; min emotionalStability 3

### Family 17: Consulting & Strategy
**BLS Cluster:** Business Management & Administration  
**Profiles (4):** Management Consultant, Career Coach, Freelance Consultant, Sustainability Consultant  
**Scoring Emphasis:** personality (0.25), aptitude (0.25), interest (0.20), values (0.15), environment (0.10), stage (0.05)

### Family 18: Operations & Logistics
**BLS Cluster:** Transportation, Distribution & Logistics  
**Profiles (5):** Supply Chain Manager, Operations Manager, Construction Manager, Truck Driver/CDL Professional (NEW), Retail Manager (NEW)  
**Scoring Emphasis:** personality (0.25), aptitude (0.20), environment (0.20), values (0.15), interest (0.15), stage (0.05)

### Family 19: Security & Safety
**BLS Cluster:** Law, Public Safety, Corrections & Security  
**Profiles (6):** Cybersecurity Analyst, Security Analyst, Penetration Tester, Police Officer (NEW), Firefighter (NEW), Military Officer (NEW)  
**Scoring Emphasis:** values (0.25), aptitude (0.25), personality (0.20), interest (0.15), environment (0.10), stage (0.05)  
**Thresholds:** Min emotionalStability 3; min conscientiousness 3

### Family 20: Hospitality & Culinary
**BLS Cluster:** Hospitality & Tourism  
**Profiles (4):** Hotel Manager, Event Planner, Chef, Travel Agent (existing? NO - counted under Hospitality already)  
**Scoring Emphasis:** personality (0.25), interest (0.25), values (0.20), environment (0.15), aptitude (0.10), stage (0.05)

### Career Family Summary

| # | Family | Existing | New | Total |
|---|--------|----------|-----|-------|
| 1 | Software Engineering | 6 | 0 | 6 |
| 2 | Data & AI | 5 | 1 | 6 |
| 3 | Design & Creative | 7 | 0 | 7 |
| 4 | Product & Project Management | 4 | 0 | 4 |
| 5 | Marketing & Growth | 7 | 0 | 7 |
| 6 | Finance & Accounting | 6 | 1 | 7 |
| 7 | Sales & Business Development | 4 | 1 | 5 |
| 8 | Healthcare Clinical | 3 | 5 | 8 |
| 9 | Healthcare Administration | 4 | 0 | 4 |
| 10 | Education & Training | 3 | 3 | 6 |
| 11 | Law & Compliance | 3 | 0 | 3 |
| 12 | Government & Policy | 3 | 0 | 3 |
| 13 | Trades & Skilled Labor | 3 | 5 | 8 |
| 14 | Science & Research | 3 | 3 | 6 |
| 15 | Arts & Entertainment | 5 | 1 | 6 |
| 16 | Social Services | 3 | 0 | 3 |
| 17 | Consulting & Strategy | 4 | 0 | 4 |
| 18 | Operations & Logistics | 3 | 2 | 5 |
| 19 | Security & Safety | 3 | 3 | 6 |
| 20 | Hospitality & Culinary | 3 | 0 | 3 |
| | **TOTALS** | **83** | **25** | **108** |

> **Note:** 7 of the 90 existing profiles (Startup Founder, Architect, Civil Engineer, Commercial Pilot, Air Traffic Controller, Property Manager, HR-related) span families or map to secondary clusters. The 83 count reflects deduplicated family assignments. Additional profiles beyond the 25 priority additions will bring the total past 150 in Phase 3.

---

## 4. Priority Missing Profiles (25 New Additions)

### Batch 1: High-Demand / High-Traffic (Profiles 1-10)

| # | ID | Title | Family | Description |
|---|-----|-------|--------|-------------|
| 1 | `k12-teacher` | K-12 Teacher | Education & Training | Educates students from kindergarten through high school, developing lesson plans and fostering intellectual growth across core subjects. |
| 2 | `registered-nurse` | Registered Nurse | Healthcare Clinical | Provides direct patient care in hospitals, clinics, and community settings, coordinating treatment plans and patient education. |
| 3 | `nurse-practitioner` | Nurse Practitioner | Healthcare Clinical | Advanced practice nurse who diagnoses conditions, prescribes medications, and manages patient care independently or collaboratively. |
| 4 | `physician` | Doctor/Physician | Healthcare Clinical | Diagnoses and treats illness and injury, ordering tests and prescribing treatments across a chosen medical specialty. |
| 5 | `police-officer` | Police Officer | Security & Safety | Protects communities by enforcing laws, responding to emergencies, conducting investigations, and building public trust through community engagement. |
| 6 | `firefighter` | Firefighter | Security & Safety | Responds to fires, medical emergencies, and hazardous situations, conducting rescues and educating the public on fire prevention. |
| 7 | `ai-engineer` | AI Engineer | Data & AI | Designs, builds, and deploys production AI/ML systems including LLM-based applications, RAG pipelines, and inference infrastructure. |
| 8 | `truck-driver` | Truck Driver / CDL Professional | Operations & Logistics | Operates commercial vehicles for long-haul or regional freight transport, managing routes, cargo safety, and DOT compliance. |
| 9 | `cnc-machinist` | CNC Machinist | Trades & Skilled Labor | Programs and operates computer-controlled machines to manufacture precision parts for aerospace, automotive, and medical industries. |
| 10 | `dentist` | Dentist | Healthcare Clinical | Diagnoses and treats oral health conditions, performs procedures from fillings to oral surgery, and educates patients on preventive care. |

### Batch 2: Growing Fields / Underserved Audiences (Profiles 11-20)

| # | ID | Title | Family | Description |
|---|-----|-------|--------|-------------|
| 11 | `psychologist` | Psychologist | Science & Research | Studies human behavior and mental processes, providing therapy, conducting research, and developing evidence-based interventions. |
| 12 | `college-professor` | College Professor | Education & Training | Teaches undergraduate/graduate courses, conducts original research, publishes in academic journals, and mentors the next generation of scholars. |
| 13 | `retail-manager` | Retail Manager | Operations & Logistics | Oversees daily store operations, manages sales teams, optimizes inventory, and drives revenue targets in brick-and-mortar or hybrid retail. |
| 14 | `content-creator` | Content Creator | Arts & Entertainment | Produces engaging digital content across platforms (YouTube, TikTok, podcasts, blogs), building audiences and monetizing through multiple revenue streams. |
| 15 | `aerospace-engineer` | Aerospace Engineer | Science & Research | Designs, tests, and manufactures aircraft, spacecraft, satellites, and propulsion systems, solving complex physics and materials challenges. |
| 16 | `solar-wind-technician` | Solar/Wind Technician | Trades & Skilled Labor | Installs, maintains, and repairs solar panels and wind turbines, performing electrical work and system diagnostics for renewable energy infrastructure. |
| 17 | `actuary` | Actuary | Finance & Accounting | Applies mathematical and statistical methods to assess financial risk for insurance, pensions, and investment portfolios. |
| 18 | `personal-trainer` | Personal Trainer | Hospitality & Culinary | Designs customized fitness programs, coaches clients on exercise form and nutrition, and motivates individuals to achieve health goals. |
| 19 | `carpenter` | Carpenter | Trades & Skilled Labor | Constructs, installs, and repairs structures and fixtures made of wood and other materials, reading blueprints and using both hand and power tools. |
| 20 | `biomedical-engineer` | Biomedical Engineer | Science & Research | Applies engineering principles to healthcare, designing medical devices, prosthetics, imaging systems, and pharmaceutical manufacturing processes. |

### Batch 3: Rounding Out Coverage (Profiles 21-25)

| # | ID | Title | Family | Description |
|---|-----|-------|--------|-------------|
| 21 | `military-officer` | Military Officer | Security & Safety | Leads military personnel in operations, training, and strategic planning, making high-stakes decisions under pressure with accountability for team welfare. |
| 22 | `auto-mechanic` | Auto Mechanic | Trades & Skilled Labor | Diagnoses, repairs, and maintains vehicles using computerized diagnostics and hands-on mechanical skills, increasingly working with EVs and hybrids. |
| 23 | `school-administrator` | School Administrator | Education & Training | Manages school operations, budgets, staff, and curriculum standards, ensuring educational quality and regulatory compliance as a principal or district leader. |
| 24 | `dental-hygienist` | Dental Hygienist | Healthcare Clinical | Provides preventive dental care including cleanings, X-rays, and patient education, working alongside dentists to maintain oral health. |
| 25 | `ecommerce-manager` | E-commerce Manager | Sales & Business Development | Manages online sales channels, optimizes conversion funnels, oversees digital merchandising, and drives revenue growth for direct-to-consumer brands. |

---

## 5. Migration Strategy

### Approach: Additive Extension (No Breaking Changes)

V2 fields are **added alongside** V1 fields. The existing scoring engine continues to work with V1 data while the new weighted scoring engine reads V2 fields when present.

```
Phase 1: Add V2 interface and types          (no runtime changes)
Phase 2: Add V2 fields to new profiles       (25 new profiles ship as V2)
Phase 3: Backfill V2 fields on 90 existing   (batch enrichment)
Phase 4: Activate weighted scoring engine     (feature-flagged)
Phase 5: Deprecate V1-only scoring path       (after validation)
```

### File Structure

```
backend/assessment/
  types/
    career-profile-v2.ts        # V2 interfaces + Zod schemas
    career-families.ts          # Family definitions + BLS cluster mapping
    scoring-weights.ts          # Default weights per family
  career-profiles.ts            # Existing 25 (V1, later backfilled to V2)
  career-profiles-2.ts          # Existing 25 (V1, later backfilled to V2)
  career-profiles-3.ts          # Existing 40 (V1, later backfilled to V2)
  career-profiles-4.ts          # NEW: 25 priority profiles (V2 from day 1)
  career-profiles-5.ts          # FUTURE: Expansion batch (profiles 116-150+)
  career-profile-registry.ts    # Unified registry: loads all files, validates, indexes by family
```

### Registry Pattern

```typescript
// career-profile-registry.ts
import { CareerProfileV2, careerProfileV2ExtensionSchema } from './types/career-profile-v2';

type ProfileIndex = {
  byId: Map<string, CareerProfileV2>;
  byFamily: Map<string, CareerProfileV2[]>;
  byCluster: Map<string, CareerProfileV2[]>;
};

export function buildProfileRegistry(profiles: CareerProfileV2[]): ProfileIndex {
  // Validate all profiles at startup
  for (const p of profiles) {
    const result = careerProfileV2ExtensionSchema.safeParse(p);
    if (!result.success) {
      console.error(`Invalid profile ${p.id}:`, result.error.flatten());
      throw new Error(`Career profile validation failed: ${p.id}`);
    }
  }

  const byId = new Map(profiles.map(p => [p.id, p]));
  const byFamily = new Map<string, CareerProfileV2[]>();
  const byCluster = new Map<string, CareerProfileV2[]>();

  for (const p of profiles) {
    // Index by family
    if (!byFamily.has(p.careerFamily)) byFamily.set(p.careerFamily, []);
    byFamily.get(p.careerFamily)!.push(p);

    // Index by BLS cluster
    if (!byCluster.has(p.careerCluster)) byCluster.set(p.careerCluster, []);
    byCluster.get(p.careerCluster)!.push(p);
  }

  return { byId, byFamily, byCluster };
}
```

### Backward Compatibility Layer

For the 90 existing V1 profiles that have not yet been enriched, provide default V2 values:

```typescript
const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  interest: 0.20,
  personality: 0.15,
  values: 0.20,
  aptitude: 0.15,
  environment: 0.15,
  stage: 0.15,
};

const DEFAULT_APTITUDE_PROFILE: AptitudeProfile = {
  verbal: 3, numerical: 3, abstract: 3, spatial: 2,
  creative: 2, interpersonal: 3, technical: 3, physical: 1,
};

const DEFAULT_PERSONALITY_PROFILE: PersonalityProfile = {
  openness: 3, conscientiousness: 3, extraversion: 3,
  agreeableness: 3, emotionalStability: 3,
};

export function applyV2Defaults(v1: CareerProfile): CareerProfileV2 {
  return {
    ...v1,
    scoringWeights: DEFAULT_SCORING_WEIGHTS,
    careerFamily: inferFamilyFromDomain(v1.domain),
    careerCluster: inferClusterFromDomain(v1.domain),
    outlook: {
      growthRate: 'stable',
      automationRisk: 'moderate',
      remoteWork: 'limited',
      medianSalary: 'N/A',
      entrySalary: 'N/A',
      seniorSalary: 'N/A',
    },
    education: {
      minimum: "Bachelor's",
      preferred: "Bachelor's",
      typicalMajors: [],
      alternativePaths: [],
    },
    progression: {
      entryTitle: `Junior ${v1.title}`,
      midTitle: v1.title,
      seniorTitle: `Senior ${v1.title}`,
      leadershipTitle: `Director of ${v1.domain}`,
      typicalYearsToSenior: 8,
      dualTrack: false,
    },
    pivots: {
      commonPivotsFrom: [],
      commonPivotsTo: [],
      transferableSkills: v1.requiredSkills.slice(0, 5),
    },
    aptitudeProfile: DEFAULT_APTITUDE_PROFILE,
    personalityProfile: DEFAULT_PERSONALITY_PROFILE,
    technicalSkills: v1.requiredSkills,
    powerSkills: [],
    domainKnowledge: [],
    dayInTheLife: '',
    surprisingFact: '',
  };
}
```

---

## 6. Scoring Engine Integration

### Weighted Matching Algorithm

The V2 scoring engine replaces the current equal-weight approach with per-career weighted dimensions.

```
Score(user, career) =
    w_interest    * interestMatch(user.riasec, career.interests)
  + w_personality * personalityMatch(user.bigFive, career.personalityProfile)
  + w_values      * valuesMatch(user.coreValues, career.coreValues)
  + w_aptitude    * aptitudeMatch(user.aptitudes, career.aptitudeProfile)
  + w_environment * environmentMatch(user.envPrefs, career.environments)
  + w_stage       * stageMatch(user.careerStage, career.careerStages)
```

### Non-Compensatory Threshold Check

Before scoring, check thresholds. If any threshold is violated, apply a penalty multiplier:

```typescript
function applyThresholdPenalty(
  baseScore: number,
  user: UserAssessment,
  career: CareerProfileV2
): number {
  if (!career.thresholds) return baseScore;

  let penalty = 1.0;

  // Check required interests
  if (career.thresholds.requiredInterests) {
    const hasRequired = career.thresholds.requiredInterests.some(
      ri => user.interests.includes(ri)
    );
    if (!hasRequired) penalty *= 0.4; // Heavy penalty, not full disqualification
  }

  // Check minimum traits
  if (career.thresholds.minTraits) {
    for (const { trait, min } of career.thresholds.minTraits) {
      if ((user.bigFive[trait] ?? 0) < min) {
        penalty *= 0.6;
      }
    }
  }

  // Check required values
  if (career.thresholds.requiredValues) {
    const hasValue = career.thresholds.requiredValues.some(
      rv => user.coreValues.includes(rv)
    );
    if (!hasValue) penalty *= 0.5;
  }

  // Check minimum aptitudes
  if (career.thresholds.minAptitudes) {
    for (const { aptitude, min } of career.thresholds.minAptitudes) {
      if ((user.aptitudes[aptitude] ?? 0) < min) {
        penalty *= 0.5;
      }
    }
  }

  return baseScore * penalty;
}
```

### Career Similarity Engine

With career families and typed profiles, implement "similar careers" and "pivot suggestions":

```typescript
function getSimilarCareers(
  careerId: string,
  registry: ProfileIndex,
  limit: number = 5
): CareerProfileV2[] {
  const career = registry.byId.get(careerId);
  if (!career) return [];

  // 1. Same family careers (excluding self)
  const familyCareers = (registry.byFamily.get(career.careerFamily) ?? [])
    .filter(c => c.id !== careerId);

  // 2. Pivot-to careers
  const pivotCareers = career.pivots.commonPivotsTo
    .map(id => registry.byId.get(id))
    .filter((c): c is CareerProfileV2 => c !== undefined);

  // 3. Score by aptitude/personality profile similarity
  const candidates = [...new Set([...familyCareers, ...pivotCareers])];
  const scored = candidates.map(c => ({
    career: c,
    similarity: computeProfileSimilarity(career, c),
  }));

  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(s => s.career);
}
```

---

## 7. Implementation Phases

### Phase 1: Types & Validation (Week 1)
- [ ] Create `backend/assessment/types/career-profile-v2.ts` with all interfaces
- [ ] Create `backend/assessment/types/career-families.ts` with family definitions
- [ ] Create Zod validation schemas with unit tests
- [ ] Add `careerFamily` and `careerCluster` constants

### Phase 2: Priority Profiles (Weeks 2-3)
- [ ] Create `career-profiles-4.ts` with 25 new V2 profiles
- [ ] Each profile includes all V2 fields from day 1
- [ ] Write validation test: every profile passes Zod schema
- [ ] Implement `career-profile-registry.ts` with indexing

### Phase 3: Backfill Existing Profiles (Weeks 4-5)
- [ ] Research and add market data (BLS/O*NET sources) to all 90 existing profiles
- [ ] Add scoring weights per family defaults
- [ ] Add aptitude and personality profiles
- [ ] Add progression, education, and pivot data
- [ ] Add dayInTheLife and surprisingFact narratives
- [ ] Validate all 115 profiles pass V2 schema

### Phase 4: Scoring Engine V2 (Week 6)
- [ ] Implement weighted scoring algorithm
- [ ] Implement non-compensatory threshold checks
- [ ] Implement career similarity engine
- [ ] Feature-flag: `SCORING_V2_ENABLED`
- [ ] A/B test V1 vs V2 scoring with user cohorts

### Phase 5: Expansion to 150+ (Weeks 7-8)
- [ ] Identify remaining gaps in coverage (target 40+ additional profiles)
- [ ] Priority additions: Welder, Travel Agent, Occupational Therapist, Speech Pathologist, Radiologist, Data Privacy Officer, Technical Writer, Game Developer, Blockchain Developer, Cloud Architect, etc.
- [ ] Create `career-profiles-5.ts`
- [ ] Validate and release

### Phase 6: Deprecation & Cleanup (Week 9)
- [ ] Remove V1-only scoring path after A/B test confirms V2 is superior
- [ ] Remove `applyV2Defaults` backward compat layer
- [ ] Ensure all profiles are fully V2-native

---

## Example V2 Profile: AI Engineer

```typescript
{
  // ── V1 Fields ──
  id: "ai-engineer",
  title: "AI Engineer",
  domain: "Data & Analytics",
  description: "Designs, builds, and deploys production AI/ML systems including LLM-based applications, RAG pipelines, and inference infrastructure.",
  interests: ["investigative", "realistic"],
  problemTypes: ["technical", "analytical", "creative"],
  archetypes: ["builder", "optimizer"],
  workStyles: ["organized", "experimental"],
  decisionStyle: ["thinking", "analytical"],
  collaboration: ["mixed", "solo"],
  ambiguityStyle: ["experiment", "structure"],
  coreValues: ["mastery", "impact", "autonomy"],
  tradeoffs: ["wealth_over_stability"],
  frustrations: ["unclear_requirements", "tech_debt"],
  rewards: ["learning", "problem_solving", "recognition"],
  environments: ["remote", "hybrid"],
  teamSizes: ["small", "medium"],
  paces: ["fast", "burst"],
  managementStyles: ["handsoff", "mentorship"],
  careerStages: ["building", "advancing"],
  riskLevels: ["high", "moderate"],
  trajectories: ["specialist", "generalist"],
  groupRoles: ["doer", "ideator"],
  requiredSkills: ["Python", "PyTorch/TensorFlow", "LLM APIs", "Vector Databases", "MLOps", "Cloud (AWS/GCP)"],
  experienceLevels: ["mid", "senior"],
  domains: ["Data & Analytics", "Technology"],
  pathwayTime: "6-12 months",
  skillGaps: [
    { skill: "LLM Engineering", importance: "high", learningResource: "Anthropic Prompt Engineering Guide" },
    { skill: "RAG Pipelines", importance: "high", learningResource: "LangChain/LlamaIndex documentation" },
    { skill: "MLOps", importance: "medium", learningResource: "Made With ML MLOps course" },
  ],
  certifications: [
    { skill: "AI/ML", certName: "AWS Machine Learning Specialty", provider: "AWS", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", duration: "3-4 months", level: "Advanced", cost: "$300", whyRecommended: "Industry-recognized ML infrastructure credential" },
    { skill: "Deep Learning", certName: "Deep Learning Specialization", provider: "Coursera/deeplearning.ai", url: "https://www.coursera.org/specializations/deep-learning", duration: "4 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Foundational deep learning knowledge from Andrew Ng" },
  ],
  portfolioProjects: [
    { type: "portfolio", title: "RAG-Powered Knowledge Base", description: "Build a retrieval-augmented generation system over custom documents using embeddings and vector search.", why: "Demonstrates the hottest skill in AI engineering.", actionStep: "Set up a LlamaIndex project with a PDF corpus this week." },
    { type: "portfolio", title: "Fine-Tuned Domain Model", description: "Fine-tune an open-source LLM on domain-specific data and deploy it with an API.", why: "Shows end-to-end ML pipeline ownership.", actionStep: "Pick a dataset and start with LoRA fine-tuning on a 7B model." },
  ],
  networkingRecs: [
    { type: "networking", title: "AI Engineer Foundation", description: "Community for AI engineers building production AI systems.", platform: "Web", url: "https://www.ai.engineer/", why: "Fastest-growing AI engineering community.", actionStep: "Attend the next AI Engineer Summit or watch past talks." },
  ],
  jobTargets: [
    { type: "job_application", title: "AI Engineer roles on LinkedIn", description: "Search for AI Engineer, ML Engineer, or LLM Engineer positions.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Largest job board with strong AI hiring demand.", actionStep: "Set alerts for 'AI Engineer' and apply to 3 roles this week." },
  ],
  milestones: [
    { title: "ML Foundations", description: "Solidify core ML knowledge", tasks: ["Complete fast.ai course", "Implement 3 classical ML models from scratch", "Study transformer architecture paper"], estimatedWeeks: 4 },
    { title: "LLM Engineering", description: "Master LLM application development", tasks: ["Build a RAG pipeline", "Implement prompt engineering patterns", "Learn embedding models and vector stores"], estimatedWeeks: 4 },
    { title: "MLOps & Deployment", description: "Production ML systems", tasks: ["Deploy model with FastAPI + Docker", "Set up CI/CD for ML", "Implement model monitoring"], estimatedWeeks: 4 },
    { title: "Portfolio & Job Search", description: "Ship projects and apply", tasks: ["Publish 2 AI projects on GitHub", "Write technical blog posts", "Apply to 15+ AI Engineer roles"], estimatedWeeks: 4 },
  ],

  // ── V2 Fields ──
  scoringWeights: {
    interest: 0.25,
    personality: 0.10,
    values: 0.10,
    aptitude: 0.30,
    environment: 0.15,
    stage: 0.10,
  },
  thresholds: {
    requiredInterests: ["investigative"],
    minAptitudes: [
      { aptitude: "numerical", min: 3 },
      { aptitude: "abstract", min: 4 },
      { aptitude: "technical", min: 4 },
    ],
  },
  careerFamily: "Data & AI",
  careerCluster: "Science, Technology, Engineering & Mathematics",
  outlook: {
    growthRate: "rapid_growth",
    automationRisk: "low",
    remoteWork: "fully_remote",
    medianSalary: "$160,000",
    entrySalary: "$110,000",
    seniorSalary: "$250,000",
  },
  education: {
    minimum: "Bachelor's",
    preferred: "Master's",
    typicalMajors: ["Computer Science", "Mathematics", "Statistics", "Physics", "Electrical Engineering"],
    alternativePaths: ["bootcamp", "self-taught", "ML research internship"],
  },
  progression: {
    entryTitle: "ML Engineer I",
    midTitle: "AI Engineer",
    seniorTitle: "Senior AI Engineer",
    leadershipTitle: "Head of AI / VP AI",
    typicalYearsToSenior: 6,
    dualTrack: true,
    icCeiling: "Distinguished AI Engineer / AI Research Scientist",
    managementCeiling: "Chief AI Officer",
  },
  pivots: {
    commonPivotsFrom: ["ml-engineer", "data-scientist", "backend-dev", "data-engineer"],
    commonPivotsTo: ["research-scientist", "startup-founder", "management-consultant"],
    transferableSkills: ["Python", "System design", "Statistical thinking", "API development", "Cloud infrastructure"],
  },
  aptitudeProfile: {
    verbal: 3,
    numerical: 5,
    abstract: 5,
    spatial: 2,
    creative: 4,
    interpersonal: 2,
    technical: 5,
    physical: 1,
  },
  personalityProfile: {
    openness: 5,
    conscientiousness: 4,
    extraversion: 2,
    agreeableness: 3,
    emotionalStability: 4,
  },
  technicalSkills: ["Python", "PyTorch", "TensorFlow", "LangChain", "Vector Databases", "MLOps", "Docker", "Kubernetes", "SQL", "Cloud (AWS/GCP/Azure)"],
  powerSkills: ["Systems thinking", "Technical communication", "Research synthesis", "Ambiguity tolerance", "Rapid prototyping"],
  domainKnowledge: ["Machine learning theory", "Natural language processing", "Computer vision", "Distributed systems", "AI safety and alignment"],
  dayInTheLife: "You start with a standup reviewing model performance metrics, then spend the morning debugging a RAG pipeline that is hallucinating on edge cases. After lunch, you prototype a new embedding strategy, run A/B tests on prompt variations, and end the day reviewing a teammate's PR for a model serving optimization.",
  surprisingFact: "AI Engineers spend more time on data quality and pipeline reliability than on model architecture -- the 'boring' infrastructure work is what separates production AI from demo notebooks.",
}
```

---

## Open Questions

1. **Salary data source:** Should we use BLS OES data (free, updated annually) or integrate a paid API like Levels.fyi/Glassdoor for more granular data?
2. **Aptitude assessment:** Do we need to build a lightweight aptitude test, or can we infer aptitude proxies from existing assessment questions?
3. **Profile versioning:** Should we track a `schemaVersion` field on each profile to handle future schema changes gracefully?
4. **Localization:** Salary and education data are US-centric. Should V2 support `locale`-specific outlook data for international users?
5. **AI-assisted backfill:** Can we use an LLM to draft V2 fields for the 90 existing profiles, then have a human review pass? This would cut backfill time from weeks to days.
