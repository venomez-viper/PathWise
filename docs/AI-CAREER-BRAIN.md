# PathWise AI Career Brain — Technical Documentation

**For:** PathWise Engineering & Product Team
**Last Updated:** April 5, 2026
**Author:** Zafuture Group 5

---

## 1. What Is the Career Brain?

The Career Brain is PathWise's core intelligence engine. It takes a user's assessment answers — their interests, work style, values, environment preferences, career stage, and skills — and matches them against **50 pre-built career profiles** using a **weighted multi-dimensional scoring algorithm**.

**Key fact: There are no external AI/LLM API calls.** The entire engine runs locally in TypeScript on the Encore.dev backend. This means:
- Zero latency from third-party APIs
- Zero cost per assessment
- Deterministic, reproducible results
- No data leaves the server

The brain lives at `backend/assessment/career-brain.ts` with profile data in `career-profiles.ts` and `career-profiles-2.ts`.

---

## 2. How It Works — The Big Picture

```
User fills out assessment (20 questions)
        |
        v
Frontend sends POST /assessment
        |
        v
Backend extracts answers into dimension keys (int1, ws2, val3, etc.)
        |
        v
Career Brain scores all 50 profiles against these answers
        |
        v
Each profile gets a raw score (0-100) across 6 dimensions
        |
        v
Scores normalized to 45-97 range
        |
        v
Top 3 matches returned with skill gaps
        |
        v
User picks a target role → roadmap generated with milestones & tasks
```

---

## 3. The 6 Scoring Dimensions

The algorithm evaluates users across **6 dimensions** totaling **100 points**:

### 3.1 Interest (25 points)

What energizes the user and what problems they enjoy.

| Sub-dimension | Answer Key | Profile Field | Points |
|---------------|-----------|---------------|--------|
| Broad interest type | `int1` | `interests` | 8 |
| Problem type preference | `int2` | `problemTypes` | 8 |
| Archetype identity | `int3` | `archetypes` | 9 |

### 3.2 Work Style (15 points)

How the user approaches work, decisions, and collaboration.

| Sub-dimension | Answer Key | Profile Field | Points |
|---------------|-----------|---------------|--------|
| Approach/openness | `ws1` | `workStyles` | 4 |
| Decision style | `ws2` | `decisionStyle` | 4 |
| Collaboration preference | `ws3` | `collaboration` | 4 |
| Ambiguity tolerance | `ws4` | `ambiguityStyle` | 3 |

### 3.3 Values (20 points)

What matters most and what frustrates the user.

| Sub-dimension | Answer Key | Profile Field | Points |
|---------------|-----------|---------------|--------|
| Core value | `val1` | `coreValues` | 6 |
| Tradeoff preference | `val2` | `tradeoffs` | 5 |
| Frustration trigger | `val3` | `frustrations` | 4 |
| Reward motivation | `val4` | `rewards` | 5 |

### 3.4 Environment (10 points)

Where and how the user wants to work.

| Sub-dimension | Answer Key | Profile Field | Points |
|---------------|-----------|---------------|--------|
| Work setting | `env1` | `environments` | 3 |
| Team size | `env2` | `teamSizes` | 3 |
| Pace preference | `env3` | `paces` | 2 |
| Management style | `env4` | `managementStyles` | 2 |

### 3.5 Career Stage (15 points)

Where the user is in their career and where they want to go.

| Sub-dimension | Answer Key | Profile Field | Points |
|---------------|-----------|---------------|--------|
| Career stage | `car1` | `careerStages` | 5 |
| Risk tolerance | `car2` | `riskLevels` | 3 |
| Trajectory preference | `car3` | `trajectories` | 4 |
| Group role | `car4` | `groupRoles` | 3 |

### 3.6 Skills & Domain Overlap (15 points)

How well the user's existing skills and interests match what the role requires.

| Sub-dimension | Comparison | Points |
|---------------|-----------|--------|
| Current skills vs required skills | `overlapScore()` | 8 |
| Interest areas vs role domains | `overlapScore()` | 4 |
| Experience level match | `traitMatch()` | 3 |

---

## 4. Scoring Functions

### `traitMatch(userValue, profileTraits) → 0 or 1`

Binary match. Returns `1` if the user's answer exists in the profile's trait array, `0` otherwise. Used for categorical questions (single answer → array of acceptable values).

### `overlapScore(userItems, profileItems) → 0.0 to 1.0`

Percentage overlap. Counts how many of the profile's required items appear in the user's list (case-insensitive). Used for skills and domain matching where the user has multiple values.

```
Example:
  User skills: ["python", "sql", "excel"]
  Profile requires: ["python", "sql", "tableau", "statistics"]
  overlapScore = 2/4 = 0.5
  Points awarded = 0.5 * 8 = 4 points
```

### `scoreProfile(profile, input) → 45-97`

The core function. Extracts answers, runs all dimension calculations, sums the raw score, and normalizes:

```typescript
const normalized = Math.round(Math.min(97, Math.max(45, rawScore)));
```

**Why 45-97?**
- **Floor of 45**: Prevents discouraging scores. Even a poor match shows 45%, which feels like "possible but not ideal" rather than "hopeless."
- **Ceiling of 97**: No perfect matches. Keeps results aspirational.

---

## 5. Answer Extraction

The brain accepts answers in two formats:

### Format A: Raw Answers Dict (preferred)

When the frontend sends `rawAnswers: { "int1": "analytical", "ws2": "data-driven", ... }`, the brain uses these directly. This is the path used by the iOS and web apps.

### Format B: Legacy Extraction (fallback)

When `rawAnswers` is not provided, the brain reconstructs answers from the older `personalityType`, `strengths`, and `values` fields:

| Source | Extracted Key | Logic |
|--------|--------------|-------|
| `personalityType` string | `int1`, `ws2`, `car1` | Split on `-`, take parts[0], [1], [2] |
| `strengths[]` keywords | `int2`, `ws1`, `car4`, `ws4` | Keyword matching ("technical" → `int2`) |
| `values[]` exact match | `val1`, `val2`, `val3`, `val4` | Direct mapping |
| `workStyle` param | `ws3` | Direct assignment |

This fallback exists for backwards compatibility with older assessment submissions.

---

## 6. The 50 Career Profiles

Each profile is a comprehensive data object containing:

| Field | Purpose |
|-------|---------|
| `id`, `title`, `domain`, `description` | Identity |
| `interests[]`, `problemTypes[]`, `archetypes[]` | Interest matching traits |
| `workStyles[]`, `decisionStyle[]`, `collaboration[]`, `ambiguityStyle[]` | Work style traits |
| `coreValues[]`, `tradeoffs[]`, `frustrations[]`, `rewards[]` | Values traits |
| `environments[]`, `teamSizes[]`, `paces[]`, `managementStyles[]` | Environment traits |
| `careerStages[]`, `riskLevels[]`, `trajectories[]`, `groupRoles[]` | Career stage traits |
| `requiredSkills[]`, `experienceLevels[]`, `domains[]` | Skills matching |
| `pathwayTime` | Time estimate (e.g., "6-12 months") |
| `skillGaps[]` | Pre-authored skill gaps with importance + learning resource |
| `certifications[]` | Recommended certs with provider, URL, cost, duration |
| `portfolioProjects[]` | Portfolio project recommendations |
| `networkingRecs[]` | Networking action items |
| `jobTargets[]` | Job application targets |
| `milestones[]` | 6 milestones with tasks + week estimates |

### Full Profile List

**Technology (10):** Frontend Developer, Backend Developer, Full-Stack Developer, Mobile Developer, DevOps/SRE Engineer, QA/Test Engineer, Security Analyst, Penetration Tester, Health Informatics Specialist, ML Engineer

**Data (5):** Data Scientist, Data Analyst, Data Engineer, BI Analyst, ESG Analyst

**Design (4):** UX Designer, UI Designer, UX Researcher, Product Designer

**Product & Project (4):** Product Manager, Project Manager, Scrum Master, Technical Program Manager

**Marketing (5):** Digital Marketer, Content Strategist, SEO Specialist, Growth Hacker, Social Media Manager

**Business & Finance (6):** Management Consultant, Financial Analyst, Business Analyst, Accountant, Investment Analyst, Brand Strategist

**Sales & BD (3):** Sales Manager, Account Executive, Business Development Rep

**People & HR (4):** HR Manager, Recruiter, Corporate Trainer, Career Coach

**Healthcare & Biotech (3):** Healthcare Administrator, Clinical Researcher, Biotech Project Manager

**Creative (3):** Graphic Designer, Video Producer, Copywriter

**Entrepreneurial (3):** Startup Founder, Freelance Consultant, Sustainability Consultant

---

## 7. What the Brain Outputs

### 7.1 Career Matches (from assessment)

```typescript
getTopCareerMatches(input, count = 3)
→ {
    careerMatches: [
      { title: "Data Analyst", matchScore: 88, description: "...", requiredSkills: [...], pathwayTime: "6-12 months" },
      { title: "Product Manager", matchScore: 84, description: "...", ... },
      { title: "Marketing Analyst", matchScore: 72, description: "...", ... }
    ],
    skillGaps: [
      { skill: "SQL", importance: "high", learningResource: "..." },
      { skill: "Tableau", importance: "medium", learningResource: "..." }
    ]
  }
```

### 7.2 Certificate Recommendations (per role)

```typescript
getCertificatesForRole("Data Analyst", ["SQL", "Tableau"])
→ [
    { skill: "SQL", certName: "Google Data Analytics Professional Certificate", provider: "Coursera", url: "...", duration: "6 months", level: "beginner", cost: "$49/month", whyRecommended: "..." },
    ...
  ]
```

### 7.3 Career Recommendations (per role)

```typescript
getCareerRecsForRole("Data Analyst")
→ {
    portfolio: [{ title: "E-commerce Analysis Dashboard", description: "...", ... }],
    networking: [{ title: "Join Data Science Meetup", description: "...", ... }],
    jobApplications: [{ title: "Apply to Analytics Teams", description: "...", ... }]
  }
```

### 7.4 Skill Gap Analysis (per role + user skills)

```typescript
analyzeSkillGapsForRole("Data Analyst", currentSkills, technicalSkills, softSkills)
→ {
    skillGaps: [
      { skill: "Tableau", importance: "high", currentLevel: "beginner", targetLevel: "advanced", learningResource: "..." }
    ],
    summary: "Focus on building Tableau proficiency...",
    topPriority: "Tableau"
  }
```

### 7.5 Milestones (per role)

```typescript
getMilestonesForRole("Data Analyst")
→ [
    { title: "Foundation", description: "...", tasks: ["Learn SQL basics", ...], estimatedWeeks: 3 },
    { title: "Core Skills", description: "...", tasks: [...], estimatedWeeks: 4 },
    { title: "Applied Learning", ... },
    { title: "Professional Portfolio", ... },
    { title: "Networking & Outreach", ... },
    { title: "Job Search", ... }
  ]
```

---

## 8. How the Brain Connects to the Rest of the System

```
                    ┌─────────────────────┐
                    │   Assessment API     │
                    │  POST /assessment    │───── stores result in DB
                    │  GET /assessment/:id │───── reads from DB
                    └────────┬────────────┘
                             │ calls
                    ┌────────v────────────┐
                    │    Career Brain      │
                    │  career-brain.ts     │
                    │  (scoring engine)    │
                    └────────┬────────────┘
                             │ reads
                    ┌────────v────────────┐
                    │   Career Profiles    │
                    │  50 profiles across  │
                    │  2 TypeScript files  │
                    └─────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │   Roadmap API     │────────>│    Career Brain    │
    │  POST /roadmap    │ calls   │ getMilestonesFor   │
    └──────────────────┘ Role()  └──────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │    Tasks API      │────────>│    Career Brain    │
    │ POST /tasks/gen   │ calls   │ getMilestonesFor   │
    └──────────────────┘ Role()  └──────────────────┘
```

**Cross-service calls:**
- **Roadmap service** calls `getMilestonesForRole()` to generate a user's career roadmap
- **Tasks service** calls `getMilestonesForRole()` to generate tasks from milestones
- **Assessment service** calls `getTopCareerMatches()`, `getCertificatesForRole()`, `getCareerRecsForRole()`, `analyzeSkillGapsForRole()`

---

## 9. Security: Prompt Sanitization

Although the career brain itself doesn't use LLM prompts, the task generation feature accepts free-text user input. The `sanitizeForPrompt()` function at `backend/shared/sanitize.ts` protects against prompt injection:

**5-step pipeline:**

1. **Newline collapse** — `\r\n` → single space (prevents multi-line injection)
2. **Backtick stripping** — removes all `` ` `` characters (prevents fence-breaking)
3. **Injection phrase removal** — strips 11 known attack patterns:
   - "ignore previous instructions"
   - "ignore above instructions"
   - "disregard previous/above instructions"
   - "you are now a/an ..."
   - "system:", "user:", "assistant:" role markers
   - `<system>`, `<user>`, `<assistant>` XML tags
4. **Whitespace collapse** — multiple spaces → one, then trim
5. **Truncation** — max 500 characters (configurable)

---

## 10. How to Add a New Career Profile

To add a 51st career profile:

1. Open `backend/assessment/career-profiles-2.ts`
2. Add a new object to the `CAREER_PROFILES_2` array following the `CareerProfile` type
3. Fill in all 31 fields:
   - **Identity**: id, title, domain, description
   - **Matching traits** (19 arrays): interests, problemTypes, archetypes, workStyles, decisionStyle, collaboration, ambiguityStyle, coreValues, tradeoffs, frustrations, rewards, environments, teamSizes, paces, managementStyles, careerStages, riskLevels, trajectories, groupRoles
   - **Requirements**: requiredSkills, experienceLevels, domains, pathwayTime
   - **Content**: skillGaps (3), certifications (2), portfolioProjects (2), networkingRecs (2), jobTargets (2), milestones (6)

The profile is automatically included in scoring — no other code changes needed.

---

## 11. How to Tune the Scoring

To adjust which dimensions matter more:

1. Open `backend/assessment/career-brain.ts`
2. Find the `scoreProfile()` function
3. Adjust the multipliers (e.g., change `traitMatch(answers.int1, profile.interests) * 8` to `* 10`)
4. Keep the total at or near 100 for the normalization to work correctly
5. Adjust the floor/ceiling in `Math.min(97, Math.max(45, score))` if needed

**Current weight distribution:**
- Interest: 25% (broad career direction)
- Values: 20% (motivation and satisfaction)
- Work Style: 15% (day-to-day fit)
- Career Stage: 15% (readiness and trajectory)
- Skills/Domain: 15% (practical capability)
- Environment: 10% (workplace preferences)

---

## 12. Known Limitations & Future Improvements

| Current State | Future Improvement |
|---------------|-------------------|
| 50 static profiles | Dynamic profile generation via LLM |
| Binary trait matching (match or no match) | Weighted similarity (partial matches) |
| No learning from user behavior | Feedback loop: adjust scores based on user engagement |
| Same weights for all users | Adaptive weighting based on career stage |
| Milestones are pre-authored | LLM-generated personalized milestones |
| No salary data per region | Integrate salary APIs (Glassdoor, Levels.fyi) |
| English only | Multi-language profile content |

---

## 13. API Reference

| Endpoint | Method | Auth | Input | Output |
|----------|--------|------|-------|--------|
| `/assessment/:userId` | GET | Yes | userId (path) | `{ result: AssessmentResult \| null }` |
| `/assessment` | POST | Yes | SubmitAssessmentParams | `{ result: AssessmentResult }` |
| `/assessment/certificates` | POST | Yes | `{ userId, skills, targetRole }` | `{ recommendations: CertEntry[] }` |
| `/assessment/career-recommendations` | POST | Yes | `{ userId, skills, targetRole, currentSkills }` | `{ portfolio, networking, jobApplications }` |
| `/assessment/skill-gap-analysis` | POST | Yes | SkillGapAssessmentParams | `{ result: { skillGaps, summary, topPriority } }` |

---

## 14. File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `backend/assessment/career-brain.ts` | ~350 | Scoring engine + all exported functions |
| `backend/assessment/career-profiles.ts` | ~1,145 | Profiles 1-25 + type definitions |
| `backend/assessment/career-profiles-2.ts` | ~1,079 | Profiles 26-50 |
| `backend/assessment/assessment.ts` | ~250 | API endpoints + database operations |
| `backend/shared/sanitize.ts` | ~40 | Prompt injection protection |

**Total career brain codebase: ~2,864 lines of TypeScript.**
