# PathWise — Architecture & Product Flow

> Living document. Update this whenever a service, page, or flow changes.
> Last updated: 2026-03-27

---

## 1. What PathWise Is

An AI-powered career coaching SaaS. Not a job board. It uses:
- **Behavioral assessment** → understand who the user is
- **Claude AI** → analyse their profile, generate career matches, build a personalised roadmap
- **Task system** → break the roadmap into daily/weekly actions
- **Progress tracking** → career readiness score based on task balance, momentum, and milestones

**Plans:** Free (basic roadmap) / Pro at $12.99/mo (AI coaching, unlimited roadmaps, priority support)

---

## 2. Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | SaaS layout, Tailwind + custom CSS vars |
| Routing | React Router v6 | Marketing (`/`), Auth (`/signin`), App (`/app/*`) |
| Auth state | React Context (`AuthProvider`) | JWT stored in localStorage |
| Backend | Encore.dev (TypeScript) | Services auto-discover each other |
| Database | PostgreSQL (via Encore SQLDatabase) | One DB per service |
| AI | Anthropic Claude (`claude-opus-4-6`) | Assessment + roadmap generation |
| Hosting — Frontend | Vercel (`pathwise-mu.vercel.app`) | Auto-deploys on push to `main` |
| Hosting — Backend | Encore Staging (`staging-pathwise-4mxi.encr.app`) | Auto-deploys on push to `main` |
| Secrets | Encore secret store | `JWTSecret`, `AnthropicAPIKey` |

---

## 3. Repository Layout

```
PathWise/
├── backend/                   # Encore.dev monorepo
│   ├── auth/                  # User accounts, JWT, profile
│   ├── assessment/            # Career questionnaire + Claude analysis
│   ├── roadmap/               # Milestones + Claude roadmap generation
│   ├── tasks/                 # Task CRUD, completion tracking
│   ├── progress/              # Readiness score computation
│   └── encore.app             # App config + CORS
│
└── src/                       # React frontend
    ├── lib/
    │   ├── api.ts             # All API client calls (fetch wrapper)
    │   └── auth-context.tsx   # AuthProvider, useAuth(), login(), refresh()
    ├── components/
    │   ├── Sidebar.tsx        # Nav, user info, logout, mobile hamburger
    │   ├── Navbar.tsx         # Marketing site nav
    │   └── ui/                # Logo, shared atoms
    └── pages/
        ├── Home/              # Marketing landing page
        ├── SignIn/            # Auth
        ├── SignUp/            # Auth
        ├── Onboarding/        # Target role + timeline → generates roadmap
        ├── Assessment/        # 5-step career questionnaire
        ├── Dashboard/         # Stats overview, career matches, recent tasks
        ├── Roadmap/           # Milestones + skill gaps
        ├── Tasks/             # Task list, toggle done, filter
        ├── Progress/          # Readiness score breakdown
        └── Settings/          # Profile edit, password, notifications, plan
```

---

## 4. Backend Services

### 4.1 `auth` service

**DB:** `users` table

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/auth/signup` | POST | No | Create account, return JWT |
| `/auth/signin` | POST | No | Verify credentials, return JWT |
| `/auth/me` | GET | Yes | Return current user profile |
| `/auth/me` | PATCH | Yes | Update name, avatarUrl |
| `/auth/change-password` | POST | Yes | Verify old password, set new |

**Users table:** `id, name, email, password_hash, avatar_url, plan, created_at`

---

### 4.2 `assessment` service

**DB:** `assessments` table

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/assessment/:userId` | GET | No | Fetch existing assessment result |
| `/assessment` | POST | No | Submit questionnaire → Claude → career matches |

**Claude prompt:** receives work style, strengths, values, current skills, experience level, interests → returns 3 career matches (title, matchScore, description, requiredSkills, pathwayTime) + 5 skill gaps (skill, importance, learningResource)

**Assessments table:** `user_id, completed_at, strengths, values, personality_type, career_matches, raw_answers, skill_gaps, current_skills`

---

### 4.3 `roadmap` service

**DB:** `roadmaps` + `milestones` tables

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/roadmap/:userId` | GET | No | Fetch roadmap + milestones |
| `/roadmap` | POST | No | Generate AI roadmap → auto-create tasks |

**Claude prompt:** receives targetRole, timeline, currentSkills, skillGaps → returns 6 milestones each with 3–5 tasks (title, description, priority, category, durationWeeks)

**On generate:**
1. Fetches assessment data for the user (for personalization)
2. Calls Claude → AI milestones + tasks
3. Inserts roadmap row
4. Inserts milestone rows with due dates
5. Calls `tasks.createTask()` for each AI-generated task

**Roadmaps table:** `id, user_id, target_role, completion_percent, skill_gap_current, skill_gap_required, skill_gap_gaps, estimated_weeks, created_at`

**Milestones table:** `id, roadmap_id, title, description, status, due_date, position, estimated_weeks`

---

### 4.4 `tasks` service

**DB:** `tasks` table

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/tasks?userId=` | GET | No | List all tasks for user |
| `/tasks` | POST | No | Create a task |
| `/tasks/:taskId` | PATCH | No | Update status/priority/title — writes `completed_at` when → done |

**Tasks table:** `id, user_id, milestone_id, title, description, status, priority, category, due_date, completed_at, ai_generated, created_at`

**Task categories:** `learning`, `networking`, `portfolio`, `interview_prep`, `certification`, `reflection`

---

### 4.5 `progress` service

**No DB** — computes live from roadmap + tasks

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/progress/:userId` | GET | No | Return readiness stats + breakdown |

**Readiness score formula:**
```
overall = milestoneProgress × 35%
        + taskCompletion     × 20%
        + categoryBalance    × 25%   ← penalises all-learning / no-networking
        + momentum           × 10%   ← tasks completed in last 14 days
        + roadmapCompletion  × 10%
```

---

## 5. Frontend Routes

```
/                          → Home (marketing)
/how-it-works              → How It Works page
/solution                  → Solution page
/pricing                   → Pricing page
/blog                      → Blog

/signin                    → Sign In (AuthLayout — no sidebar)
/signup                    → Sign Up (AuthLayout — no sidebar)

/app                       → Dashboard        ← requires auth
/app/assessment            → Career Questionnaire (5-step wizard)
/app/onboarding            → Target Role + Timeline → generate roadmap
/app/roadmap               → Roadmap + milestones + skill gaps
/app/tasks                 → Task list with filter + toggle
/app/progress              → Readiness score + breakdown
/app/settings              → Profile, password, notifications, plan
```

**Route guards:** `AppLayout` redirects to `/signin` if `ready && !user`.

---

## 6. Auth Flow

```
User visits /signup or /signin
        │
        ▼
Fill form → POST /auth/signup or /auth/signin
        │
        ▼
API returns { token, user }
        │
        ├─ tokenStore.set(token)       ← saved to localStorage
        ├─ login(user)                 ← sets user in AuthContext immediately
        └─ navigate('/app/onboarding') or navigate('/app')
                │
                ▼
        AppLayout checks useAuth()
        ready=true, user=populated → render app
```

**On page refresh:**
```
AuthProvider mounts → tokenStore.get()
  has token → GET /auth/me → setUser()
  no token  → ready=true, user=null → redirect to /signin
```

**On logout:**
```
tokenStore.clear() → window.location.href = '/'
```

---

## 7. New User Journey

```
Sign Up
  └── /app/onboarding         (set target role + timeline)
        └── POST /roadmap      (Claude generates 6 milestones + tasks)
              └── /app          (Dashboard — sees roadmap%, tasks, career matches)
```

**Recommended full flow:**
```
Sign Up → Onboarding (role) → Assessment (questionnaire) → Roadmap → Tasks → Progress
```

Assessment is optional but improves roadmap personalisation (skill gaps, current skills fed into Claude prompt).

---

## 8. AI Integration Points

| Feature | Trigger | Claude Input | Claude Output |
|---|---|---|---|
| Career matches | POST /assessment | workStyle, strengths, values, currentSkills, experienceLevel, interests | 3 career matches + 5 skill gaps |
| Roadmap generation | POST /roadmap | targetRole, timeline, currentSkills, skillGaps (from assessment) | 6 milestones × 3–5 tasks each |

**Model:** `claude-opus-4-6`
**Secret:** `AnthropicAPIKey` (set in Encore staging via `encore secret set`)

**Error handling:** Both endpoints have try/catch. If Claude fails, the user sees an error message and can retry.

---

## 9. Data Flow Diagram

```
[Browser]
    │  JWT in localStorage
    │
    ▼
[api.ts fetch wrapper]
    │  Authorization: Bearer <token>
    │
    ▼
[Encore staging backend]
    │
    ├── /auth/*          → auth service    → users DB
    ├── /assessment/*    → assessment svc  → assessments DB + Claude API
    ├── /roadmap/*       → roadmap svc     → roadmaps DB + Claude API
    │                                         + calls tasks svc (auto-create tasks)
    ├── /tasks/*         → tasks service   → tasks DB
    └── /progress/*      → progress svc    → (reads roadmap svc + tasks svc)
```

---

## 10. Known Gaps / TODO

### Must-have (core product)
- [ ] Milestone completion — no UI or API to mark a milestone as done
- [ ] Roadmap `completion_percent` never updates (always 0) — needs recalculation when milestones complete
- [ ] Task detail view — no way to expand a task and see its full description
- [ ] Re-take assessment — currently overwrites silently, should confirm first

### Important
- [ ] Labor market data — salary ranges, job demand per role (feed into Claude prompts)
- [ ] Networking task detail — tasks link to no resources; Claude generates `resourceUrl` but it's not stored or displayed
- [ ] Rate limiting on AI endpoints — prevent cost runaway (3 assessments/day, 5 roadmaps/day per user)
- [ ] Email verification on signup
- [ ] Forgot password flow

### Nice to have
- [ ] Upgrade to Pro — payment integration (Stripe)
- [ ] Weekly email digest (task summary)
- [ ] Shareable roadmap (public URL)
- [ ] Multiple roadmaps per user (different roles)
- [ ] Notification persistence (currently local state only)
- [ ] Task due date reminders

---

## 11. Environment Variables

**Frontend (Vercel):**
```
VITE_API_BASE_URL=https://staging-pathwise-4mxi.encr.app
```

**Backend (Encore secrets):**
```
JWTSecret=<random 32-byte base64>
AnthropicAPIKey=sk-ant-...
```

Set secrets:
```bash
cd backend
echo "<value>" | ~/.encore/bin/encore secret set --env=staging JWTSecret
echo "<value>" | ~/.encore/bin/encore secret set --env=staging AnthropicAPIKey
```

---

## 12. Deployment

**Push to `main`** triggers both:
1. **Encore** auto-deploys backend to staging (`staging-pathwise-4mxi.encr.app`)
2. **Vercel** auto-deploys frontend (`pathwise-mu.vercel.app`)

No manual steps required after a `git push`.

---

## 13. CSS / Design Tokens

Design tokens live in `src/index.css` (`:root`). Key ones:

| Token | Value | Used for |
|---|---|---|
| `--primary` | `#5d2a80` | Buttons, active states |
| `--primary-light` | `#a78bfa` | Accents, highlights |
| `--secondary` | `#008080` | Teal accents |
| `--font-display` | Manrope 800–900 | Headings |
| `--font-body` | Inter 400–600 | Body text |
| `--surface` | `#faf9fe` | Page background |
| `--on-surface` | `#1a1c1f` | Body text |

Sidebar/dark areas use hardcoded `#0f0b1e` (not a token — intentional).

---

## 14. iOS App

### 14.1 Overview

The iOS app is a native Swift/SwiftUI client that connects to the **same Encore backend** as the web frontend. It lives in `PathWise-iOS/` alongside the rest of the monorepo.

| Attribute | Detail |
|---|---|
| Language | Swift 5.9+ |
| UI framework | SwiftUI |
| State management | Swift `@Observable` (iOS 17+, no Combine/ObservableObject) |
| Pattern | MVVM — Views own no business logic; ViewModels drive state |
| Min target | iOS 17 |
| Backend | Same Encore staging API (`staging-pathwise-4mxi.encr.app`) |
| Auth storage | JWT in iOS Keychain (`kSecClassGenericPassword`) |

---

### 14.2 Project Structure

```
PathWise-iOS/
├── PathWise/
│   ├── PathWiseApp.swift          # @main — creates AuthManager, injects into environment
│   ├── ContentView.swift          # Root router: Splash → Onboarding → Auth/App
│   │
│   ├── Core/
│   │   ├── Auth/
│   │   │   ├── AuthManager.swift  # @Observable — sign in/up/out, session check
│   │   │   └── KeychainHelper.swift # JWT read/write/delete via Security framework
│   │   ├── Models/                # Codable structs: User, TaskItem, Roadmap, etc.
│   │   └── Network/
│   │       ├── APIClient.swift    # Generic async/await HTTP client (@Observable)
│   │       ├── Endpoints.swift    # Typed enum of all API paths + HTTP methods
│   │       └── APIError.swift     # Typed error cases (unauthenticated, notFound, …)
│   │
│   ├── Features/
│   │   ├── MainTabView.swift      # Tab bar (iPhone) + sidebar (iPad) root
│   │   ├── Auth/                  # SignInView, SignUpView, ForgotPasswordView, …
│   │   ├── Onboarding/            # OnboardingCarouselView (first-launch only)
│   │   ├── ProfileSetup/          # AboutYouView, YourGoalsView, PhotoUploadView
│   │   ├── Dashboard/             # DashboardView + DashboardViewModel
│   │   ├── Assessment/            # Intro → Questions → Processing → Results
│   │   ├── Roadmap/               # RoadmapView + detail sheets (course/project/networking)
│   │   ├── Tasks/                 # TasksView + celebration overlay
│   │   ├── Progress/              # ProgressDashboardView + ProgressViewModel
│   │   ├── Streaks/               # StreakTrackerView + StreaksViewModel
│   │   ├── Achievements/          # AchievementsView + AchievementsViewModel
│   │   ├── Certificates/          # CertificatesView + CertificatesViewModel
│   │   ├── Notifications/         # NotificationsView + NotificationsViewModel
│   │   ├── Search/                # SearchView + SearchViewModel
│   │   ├── Settings/              # SettingsView, EditProfileView, ChangeTargetRoleView
│   │   ├── CareerMatch/           # CareerMatchDetailView
│   │   ├── Help/                  # HelpFAQView
│   │   └── Splash/                # SplashView (shown on cold launch)
│   │
│   ├── Components/                # Reusable SwiftUI atoms
│   │   ├── CardView, BadgeView, ChipView
│   │   ├── CircularProgressView, ProgressBarView
│   │   ├── InputField, OutlinedButton, PillButton
│   │   ├── LoadingView, MentorTipCard, SocialAuthButtons
│   │
│   └── Theme/
│       ├── AppColors.swift        # Color palette + gradients (mirrors web CSS tokens)
│       ├── AppTypography.swift    # Font styles
│       └── AppTheme.swift         # Shared modifiers / theme helpers
│
└── PathWiseTests/
    ├── Core/
    │   ├── APIClientTests.swift
    │   └── KeychainHelperTests.swift
    └── Features/
        ├── AssessmentViewModelTests.swift
        ├── DashboardViewModelTests.swift
        ├── RoadmapViewModelTests.swift
        └── TasksViewModelTests.swift
```

---

### 14.3 How It Connects to the Backend

`APIClient` is a generic `async/await` HTTP client marked `@Observable`. It targets:

- **Debug:** `http://localhost:4000` (local `encore run`)
- **Release:** `https://staging-pathwise-4mxi.encr.app`

Every request is typed via the `Endpoint` enum which encodes the path and HTTP method. The client automatically:
- Attaches `Authorization: Bearer <token>` when `authToken` is set
- Snake-cases request bodies and camel-cases response keys via `JSONEncoder`/`JSONDecoder` strategies
- Maps HTTP status codes to typed `APIError` cases (`unauthenticated`, `notFound`, `invalidArgument`, etc.)

The iOS app calls the **same backend endpoints** as the web frontend — no iOS-specific backend changes were required.

---

### 14.4 Navigation Pattern

`MainTabView` adapts layout based on device idiom:

**iPhone — Tab Bar**
```
TabView (5 tabs)
  ├── Home        → DashboardView
  ├── Roadmap     → RoadmapView
  ├── Tasks       → TasksView
  ├── Progress    → ProgressDashboardView
  └── Settings    → SettingsView
```
Each tab is wrapped in its own `NavigationStack` so each tab has independent navigation state.

**iPad — Sidebar (`NavigationSplitView`)**
```
Sidebar (List, two sections)
  ├── Main
  │   ├── Home / Roadmap / Tasks / Progress / Settings
  └── More
      ├── Streaks / Achievements / Certificates
      ├── Notifications / Search / Help & FAQ
Detail pane → NavigationStack wrapping the selected view
```

The secondary destinations (Streaks, Achievements, etc.) are only reachable as sidebar items on iPad; on iPhone they are accessed via navigation pushes from within the main tabs.

---

### 14.5 Auth Flow

```
App cold-launch
    │
    ▼
PathWiseApp injects AuthManager into SwiftUI environment
    │
    ▼
ContentView shows SplashView
    │
    ├─ authManager.checkSession()
    │       │
    │       ├─ KeychainHelper.getToken() → found
    │       │       └─ GET /auth/me → sets currentUser
    │       │
    │       └─ no token → no-op (user = nil)
    │
    ▼
After splash delay:
    ├─ first launch?  → OnboardingCarouselView (carousel, stored in @AppStorage)
    ├─ isAuthenticated (currentUser != nil) → MainTabView
    └─ not authenticated → SignInView
```

**Sign in / sign up:**
```
User submits credentials
    │
    ▼
AuthManager.signIn / signUp
    │  POST /auth/signin or /auth/signup
    ▼
API returns { token, user }
    │
    ├─ KeychainHelper.saveToken(token)   ← persisted in Keychain
    ├─ api.authToken = token             ← injected into APIClient
    └─ currentUser = user                ← triggers isAuthenticated → MainTabView
```

**Sign out:**
```
AuthManager.signOut()
    ├─ KeychainHelper.deleteToken()
    ├─ api.authToken = nil
    └─ currentUser = nil  →  ContentView routes back to SignInView
```

Token is stored using `kSecClassGenericPassword` under service `com.pathwise.ios`, key `auth_token`. It survives app restarts and device reboots (but not device restore without iCloud Keychain).

---

### 14.6 Theme & Design Tokens

iOS design tokens mirror the web CSS variables:

| Web token | iOS equivalent | Value |
|---|---|---|
| `--primary` (`#5d2a80`) | `AppColors.darkPurple` | `#5B21B6` |
| `--primary-light` | `AppColors.primaryPurple` | `#7C3AED` |
| `--secondary` (teal) | `AppColors.tealAccent` | `#14B8A6` |
| `--surface` | `AppColors.offWhiteBg` | `#F8F7FC` |
| `--on-surface` | `AppColors.darkText` | `#1F2937` |

Gradients (`purpleGradient`, `tealPurpleGradient`, `progressGradient`) are defined in `AppColors` as `LinearGradient` constants and reused across views.
