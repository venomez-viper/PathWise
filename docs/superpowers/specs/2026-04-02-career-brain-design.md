# Career Brain — Local AI-Free Matching Engine

**Date:** 2026-04-02
**Status:** Approved
**Problem:** No Anthropic API key available. All assessment AI calls silently fall back to generic placeholder data. Users get useless "General Professional" results every time.

## Solution

Replace all Claude API calls with a **local weighted scoring engine** backed by a pre-built career profiles database. No external API needed.

## Architecture

```
User Answers → Scoring Engine → Top 3 Career Matches + Skill Gaps + Certs + Recommendations
```

### Components

1. **Career Profiles Database** (`career-profiles.ts`)
   - ~50 career profiles across 10 domains
   - Each profile has: trait vectors, required skills, certifications, portfolio ideas, networking recs, job targets
   - Profiles are scored against user answers using weighted cosine-like matching

2. **Scoring Engine** (`career-brain.ts`)
   - Takes assessment answers as input
   - Scores every profile across 6 dimensions:
     - Interest alignment (RIASEC) — weight 25%
     - Work style fit — weight 15%
     - Values alignment — weight 20%
     - Environment fit — weight 10%
     - Career stage compatibility — weight 15%
     - Skills/domain overlap — weight 15%
   - Returns top 3 matches with computed matchScore (0-100)
   - Generates skill gaps by diffing user skills vs required skills
   - Returns pre-built certifications and recommendations per career

3. **Endpoint Integration** — All 5 endpoints rewired:
   - `POST /assessment` → scoring engine
   - `GET /assessment/:userId` → unchanged (reads DB)
   - `POST /assessment/certificates` → pre-built certs from profile
   - `POST /assessment/career-recommendations` → pre-built recs from profile
   - `POST /assessment/skill-gap-analysis` → computed from profile
   - `POST /roadmap` → pre-built milestones from profile (no Claude)

## Career Profile Schema

```typescript
interface CareerProfile {
  id: string;
  title: string;
  domain: string;
  description: string;
  
  // Matching vectors (which answer values score high)
  interests: string[];        // RIASEC values that align
  problemTypes: string[];     // int2 values
  archetypes: string[];       // int3 values
  workStyles: string[];       // ws1 values
  decisionStyle: string[];    // ws2 values
  collaboration: string[];    // ws3 values
  ambiguityStyle: string[];   // ws4 values
  coreValues: string[];       // val1 values
  tradeoffs: string[];        // val2 values
  frustrations: string[];     // val3 values (anti-patterns)
  rewards: string[];          // val4 values
  environments: string[];     // env1 values
  teamSizes: string[];        // env2 values
  paces: string[];            // env3 values
  managementStyles: string[]; // env4 values
  careerStages: string[];     // car1 values
  riskLevels: string[];       // car2 values
  trajectories: string[];     // car3 values
  groupRoles: string[];       // car4 values
  
  // Requirements
  requiredSkills: string[];
  experienceLevels: string[]; // compatible levels
  domains: string[];          // matching interest domains
  
  // Pre-built outputs
  pathwayTime: string;
  skillGaps: SkillGap[];
  certifications: CertificateRecommendation[];
  portfolioProjects: CareerRecommendation[];
  networkingRecs: CareerRecommendation[];
  jobTargets: CareerRecommendation[];
  
  // Roadmap data
  milestones: RoadmapMilestone[];
}
```

## Domains Covered (~50 profiles)

1. **Software Engineering** (6): Frontend Dev, Backend Dev, Full-Stack Dev, Mobile Dev, DevOps/SRE, QA/Test Engineer
2. **Data & AI** (5): Data Scientist, Data Analyst, ML Engineer, Data Engineer, BI Analyst
3. **Design** (4): UX Designer, UI Designer, UX Researcher, Product Designer
4. **Product & Management** (4): Product Manager, Project Manager, Scrum Master, Technical Program Manager
5. **Marketing & Growth** (5): Digital Marketer, Content Strategist, SEO Specialist, Growth Hacker, Social Media Manager
6. **Business & Finance** (5): Management Consultant, Financial Analyst, Business Analyst, Accountant, Investment Analyst
7. **Sales & BD** (3): Sales Manager, Account Executive, Business Development Rep
8. **People & Education** (4): HR Manager, Recruiter, Corporate Trainer, Career Coach
9. **Healthcare & Science** (4): Healthcare Admin, Clinical Research, Biotech PM, Health Informatics
10. **Creative & Media** (4): Graphic Designer, Video Producer, Copywriter, Brand Strategist
11. **Cybersecurity** (2): Security Analyst, Penetration Tester
12. **Entrepreneurship** (2): Startup Founder, Freelance Consultant
13. **Sustainability** (2): Sustainability Consultant, ESG Analyst

## Scoring Algorithm

```
For each profile:
  score = 0
  
  // Interest dimension (25%)
  score += matchCount(user.int1, profile.interests) * 8
  score += matchCount(user.int2, profile.problemTypes) * 8
  score += matchCount(user.int3, profile.archetypes) * 9
  
  // Work style (15%)
  score += matchCount(user.ws1, profile.workStyles) * 4
  score += matchCount(user.ws2, profile.decisionStyle) * 4
  score += matchCount(user.ws3, profile.collaboration) * 4
  score += matchCount(user.ws4, profile.ambiguityStyle) * 3
  
  // Values (20%)  
  score += matchCount(user.val1, profile.coreValues) * 6
  score += matchCount(user.val2, profile.tradeoffs) * 5
  score += matchCount(user.val3, profile.frustrations) * 4
  score += matchCount(user.val4, profile.rewards) * 5
  
  // Environment (10%)
  score += matchCount(user.env1, profile.environments) * 3
  score += matchCount(user.env2, profile.teamSizes) * 3
  score += matchCount(user.env3, profile.paces) * 2
  score += matchCount(user.env4, profile.managementStyles) * 2
  
  // Career stage (15%)
  score += matchCount(user.car1, profile.careerStages) * 5
  score += matchCount(user.car2, profile.riskLevels) * 3
  score += matchCount(user.car3, profile.trajectories) * 4
  score += matchCount(user.car4, profile.groupRoles) * 3
  
  // Skills/domain overlap (15%)
  score += overlapPercent(user.skills, profile.requiredSkills) * 8
  score += overlapPercent(user.domains, profile.domains) * 4
  score += matchCount(user.experienceLevel, profile.experienceLevels) * 3
  
  // Normalize to 0-100
  normalizedScore = min(100, max(45, score))
```

Top 3 profiles by score are returned. Minimum score floor of 45 ensures results never look absurdly low.

## Output Compatibility

All outputs match the existing interfaces exactly:
- `CareerMatch` — title, matchScore, description, requiredSkills, pathwayTime
- `SkillGap` — skill, importance, learningResource
- `CertificateRecommendation` — skill, certName, provider, url, duration, level, cost, whyRecommended
- `CareerRecommendation` — type, title, description, platform, url, why, actionStep
- `RoadmapMilestone` — title, description, tasks, estimatedWeeks

No frontend changes needed beyond what was already fixed.
