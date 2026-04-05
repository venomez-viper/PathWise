# PathWise iOS App — Design Specification

**Date:** 2026-04-05
**Status:** Approved
**Platform:** iOS 17+ (iPhone + iPad)
**Tech Stack:** Swift + SwiftUI
**Backend:** Existing Encore.dev REST API (no changes needed)

---

## 1. Overview

Build a native iOS app for PathWise that provides pixel-perfect UI matching the stitch design frames, connects to the same Encore.dev backend as the web app, and allows users to seamlessly continue their career journey across platforms. Always online — no offline mode.

### Goals
- Exact visual fidelity to the 53 stitch UI frames
- Full feature parity with the web app (all 35+ screens)
- Same JWT authentication — users sign in once, use on web or iOS
- Same AI career-brain — assessment, roadmap generation, task generation all via backend API
- Adaptive layout: Tab Bar on iPhone, Sidebar on iPad

### Non-Goals
- Offline mode / local data caching
- Push notifications (can be added later)
- Apple Sign In integration (social auth buttons present but backend support TBD)
- App Store submission (build first, ship later)

---

## 2. Design System

All values extracted from the stitch UI frames. Use SF Pro (iOS system font) as the closest match to the Manrope/Inter combination in the stitch files.

### 2.1 Colors

```swift
// Brand
static let primaryPurple    = Color(hex: "7C3AED")
static let darkPurple       = Color(hex: "5B21B6")
static let splashPurple     = Color(hex: "7E22CE")
static let tealAccent       = Color(hex: "14B8A6")
static let tealLight        = Color(hex: "2DD4BF")

// Backgrounds
static let offWhiteBg       = Color(hex: "F8F7FC")
static let lavenderBg       = Color(hex: "F5F3FF")
static let lightPurpleTint  = Color(hex: "EDE9FE")

// Text
static let darkText         = Color(hex: "1F2937")
static let grayText         = Color(hex: "6B7280")
static let lightGray        = Color(hex: "E5E7EB")

// Semantic
static let successGreen     = Color(hex: "059669")
static let errorRed         = Color(hex: "EF4444")
static let warningAmber     = Color(hex: "F59E0B")
static let amberGold        = Color(hex: "D4A017")
static let highPriorityRed  = Color(hex: "DC2626")
static let lowPriorityTeal  = Color(hex: "5EEAD4")

// Gradients
static let purpleGradient   = LinearGradient(colors: [darkPurple, primaryPurple], ...)
static let tealPurpleGradient = LinearGradient(colors: [tealAccent, primaryPurple], ...)
static let splashGradient   = LinearGradient(colors: [Color(hex: "7E22CE"), Color(hex: "6B21A8")], ...)
```

### 2.2 Typography

Using SF Pro (system font) with size mappings from stitch frames:

| Style | Weight | Size | Tracking | Usage |
|-------|--------|------|----------|-------|
| largeTitle | Bold | 32pt | -0.02em | Splash app name, main headings |
| title1 | Bold | 28pt | default | Page headings ("Welcome, Emily!") |
| title2 | Semibold | 24pt | default | Section headings |
| title3 | Semibold | 20pt | default | Card headings |
| headline | Semibold | 17pt | default | Card titles, bold labels |
| body | Regular | 16pt | default | Body text, descriptions |
| callout | Regular | 14pt | default | Secondary descriptions |
| caption1 | Semibold | 12pt | 0.08em | ALL-CAPS labels ("STEP 1 OF 2") |
| caption2 | Regular | 10pt | 0.06em | Footer text, timestamps |
| button | Semibold | 17pt | default | CTA button text |

### 2.3 Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| screenPadding | 20px | Horizontal screen margins |
| cardPadding | 16-20px | Internal card padding |
| sectionSpacing | 16-24px | Between major sections |
| inputHeight | 48-52px | Text input fields |
| ctaHeight | 52-56px | Primary CTA buttons |
| tabBarHeight | 60-64px | Bottom tab bar (+ safe area) |

### 2.4 Corner Radii

| Element | Radius |
|---------|--------|
| Cards | 16-20px |
| Primary buttons | Fully rounded (capsule) |
| Input fields | 12-16px |
| Chips/tags | Fully rounded (capsule) |
| Tab bar top | 20px |

### 2.5 Shadows

| Element | Shadow |
|---------|--------|
| Cards | `0 2px 8px rgba(0,0,0,0.06)` |
| CTA buttons | `0 4px 12px rgba(124,58,237,0.3)` |
| Bottom sheets | Stronger shadow with drag handle |

---

## 3. Architecture

### 3.1 App Structure

```
PathWise-iOS/
├── PathWise.xcodeproj
├── PathWise/
│   ├── App/
│   │   ├── PathWiseApp.swift              # @main entry point
│   │   └── ContentView.swift              # Auth gate + adaptive navigation
│   ├── Core/
│   │   ├── Network/
│   │   │   ├── APIClient.swift            # HTTP client with JWT headers
│   │   │   ├── APIError.swift             # Error types matching backend
│   │   │   └── Endpoints.swift            # All endpoint URL definitions
│   │   ├── Auth/
│   │   │   ├── AuthManager.swift          # @Observable auth state
│   │   │   └── KeychainHelper.swift       # Secure JWT token storage
│   │   └── Models/
│   │       ├── User.swift
│   │       ├── Assessment.swift
│   │       ├── CareerMatch.swift
│   │       ├── Roadmap.swift
│   │       ├── Milestone.swift
│   │       ├── TaskItem.swift
│   │       ├── ProgressStats.swift
│   │       ├── Streak.swift
│   │       ├── Achievement.swift
│   │       ├── Notification.swift
│   │       └── Certificate.swift
│   ├── Theme/
│   │   ├── AppColors.swift                # All color constants
│   │   ├── AppTypography.swift            # Font styles
│   │   └── AppTheme.swift                 # Spacing, radii, shadows
│   ├── Components/
│   │   ├── CircularProgressView.swift     # Donut/ring chart
│   │   ├── PillButton.swift               # Primary CTA pill button
│   │   ├── OutlinedButton.swift           # Secondary outlined button
│   │   ├── InputField.swift               # Styled text input with icon
│   │   ├── ChipView.swift                 # Selectable chip/tag
│   │   ├── CardView.swift                 # White rounded card container
│   │   ├── BadgeView.swift                # Status badges (VERIFIED, HIGH PRIORITY, etc.)
│   │   ├── ProgressBarView.swift          # Horizontal gradient progress bar
│   │   ├── MentorTipCard.swift            # Amber tip card
│   │   ├── SocialAuthButtons.swift        # Google/Apple sign-in row
│   │   ├── TabBarView.swift               # Custom bottom tab bar
│   │   ├── LoadingSpinner.swift           # Purple ring spinner
│   │   └── EmptyStateView.swift           # Empty state illustrations
│   └── Features/
│       ├── Splash/
│       │   └── SplashView.swift           # Animated splash sequence
│       ├── Onboarding/
│       │   └── OnboardingCarouselView.swift
│       ├── Auth/
│       │   ├── SignUpView.swift
│       │   ├── SignInView.swift
│       │   ├── ForgotPasswordView.swift
│       │   ├── ResetEmailSentView.swift
│       │   └── EmailVerificationView.swift
│       ├── ProfileSetup/
│       │   ├── AboutYouView.swift         # Step 1/2
│       │   ├── YourGoalsView.swift        # Step 2/2
│       │   └── PhotoUploadView.swift
│       ├── Assessment/
│       │   ├── AssessmentIntroView.swift
│       │   ├── AssessmentQuestionView.swift
│       │   ├── AssessmentProcessingView.swift
│       │   ├── AssessmentResultsView.swift
│       │   └── AssessmentViewModel.swift
│       ├── Dashboard/
│       │   ├── DashboardPreAssessmentView.swift
│       │   ├── DashboardView.swift        # Post-assessment home
│       │   └── DashboardViewModel.swift
│       ├── Roadmap/
│       │   ├── RoadmapView.swift
│       │   ├── AdjustTimelineSheet.swift
│       │   ├── CourseDetailView.swift
│       │   ├── ProjectDetailView.swift
│       │   ├── NetworkingDetailView.swift
│       │   └── RoadmapViewModel.swift
│       ├── Tasks/
│       │   ├── TasksView.swift            # Daily/Weekly toggle + list
│       │   ├── TaskCelebrationView.swift
│       │   ├── TasksEmptyStateView.swift
│       │   └── TasksViewModel.swift
│       ├── Progress/
│       │   ├── ProgressDashboardView.swift
│       │   └── ProgressViewModel.swift
│       ├── Streaks/
│       │   ├── StreakTrackerView.swift
│       │   └── StreaksViewModel.swift
│       ├── Achievements/
│       │   ├── AchievementsView.swift
│       │   └── AchievementsViewModel.swift
│       ├── CareerMatch/
│       │   └── CareerMatchDetailView.swift
│       ├── Notifications/
│       │   ├── NotificationsView.swift
│       │   └── NotificationsViewModel.swift
│       ├── Search/
│       │   ├── SearchView.swift
│       │   └── SearchViewModel.swift
│       ├── Certificates/
│       │   ├── CertificatesView.swift
│       │   └── CertificatesViewModel.swift
│       ├── Settings/
│       │   ├── SettingsView.swift
│       │   ├── EditProfileView.swift
│       │   ├── ChangeTargetRoleView.swift
│       │   └── SettingsViewModel.swift
│       └── Help/
│           └── HelpFAQView.swift
```

### 3.2 State Management

- **`@Observable` macro** (iOS 17) for all ViewModels
- **`AuthManager`** as an environment object — holds current user, token, auth state
- **No global store** — each feature's ViewModel fetches from APIClient independently
- **No local persistence** — all data is live from the backend

### 3.3 Navigation

**iPhone — Tab Bar (5 tabs):**
```
HOME | ROADMAP | TASKS | PROGRESS | SETTINGS
```
- Each tab has its own `NavigationStack`
- Detail screens pushed onto the stack (Course Detail, Career Match, etc.)
- Bottom sheets for Adjust Timeline, Add Certificate, etc.
- Active tab: filled purple icon + purple label
- Inactive: gray outlined icon + gray label

**iPad — Sidebar:**
```
NavigationSplitView {
    Sidebar:
        Home
        Roadmap
        Tasks
        Progress
        ──────
        Streaks
        Achievements
        Certificates
        Notifications
        Search
        ──────
        Settings
        Help & FAQ
    Detail:
        Selected feature view
}
```

**Auth Flow (before main app):**
```
Splash → Onboarding → SignIn/SignUp → ProfileSetup → Assessment → Dashboard
         (skip if      (or go to        (skip if       (skip if
          returning)    dashboard if      already done)  already done)
                        logged in)
```

### 3.4 Networking

**APIClient** — single class managing all HTTP communication:

```swift
@Observable
class APIClient {
    let baseURL: URL  // Encore.dev backend URL
    var authToken: String?

    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}
```

- All requests include `Authorization: Bearer <token>` header when authenticated
- JSON encoding/decoding with snake_case ↔ camelCase conversion
- Error responses mapped to `APIError` enum matching backend error types:
  - `.unauthenticated` → redirect to sign-in
  - `.notFound`, `.invalidArgument`, `.permissionDenied`, `.alreadyExists`
- No retry logic — surface errors to user immediately
- Base URL configurable (dev vs staging vs production)

### 3.5 Authentication

- **Sign up / Sign in** → backend returns JWT token + user object
- **Token stored in iOS Keychain** via `KeychainHelper` (not UserDefaults)
- **AuthManager** loads token from Keychain on app launch, calls `GET /auth/me` to validate
- **Token expiry** — 30-day JWT; if expired or invalid, clear Keychain and show sign-in
- **Sign out** — clear Keychain token, reset AuthManager state

---

## 4. Screen Specifications

Each screen maps to a stitch frame. The stitch screen analysis document at `docs/stitch-screens-analysis.md` contains the pixel-level breakdown for every screen. Below is the mapping and key implementation notes.

### 4.1 Splash (Frame 1.1)

- Full-screen purple gradient background (`#7E22CE → #6B21A8`)
- Centered: book icon with teal sparkle, "PathWise" text, tagline
- Bottom: "INITIALIZING INTELLIGENCE" label
- **Animation sequence:** icon scales in → sparkle animates → text fades in → loading label appears
- Duration: ~2 seconds, then check auth state and navigate accordingly
- Implementation: SwiftUI `.onAppear` with sequential `withAnimation` blocks

### 4.2 Onboarding Carousel (Frame 1.2)

- Horizontal `TabView` with page indicator dots
- Each page: hero illustration, heading (partial italic purple), body text
- "SKIP" button top-right
- "Get Started" purple pill CTA at bottom
- "Already have an account? Log In" secondary link
- Show only on first launch (track with `@AppStorage`)

### 4.3 Sign Up (Frame 1.3)

- White card on lavender background
- Social auth row: Google, Apple, third service buttons
- "OR CONTINUE WITH EMAIL" divider
- Form: Full Name (person icon), Email (envelope icon), Password (lock + eye toggle)
- "Sign Up" purple pill CTA
- Toggle to Log In
- Footer: Terms of Service + Privacy Policy links

**API:** `POST /auth/signup { name, email, password }` → `{ token, user }`

### 4.4 Sign In (Frame 1.4)

- White card, "Welcome back" heading (left-aligned)
- Email + Password fields (with "Forgot password?" link)
- "Log In" purple pill CTA with arrow icon
- "OR CONTINUE WITH" divider + Google/Apple buttons
- Toggle to Sign Up

**API:** `POST /auth/signin { email, password }` → `{ token, user }`

### 4.5 Forgot Password (Frame 1.5)

- Pastel gradient background (peach/pink/lavender)
- Back button, shield/lock icon
- Email input in white floating card
- "Send Reset Link" CTA
- "Back to Log In" link

**Note:** Backend doesn't have a reset endpoint yet — this screen can be built but will show a placeholder until backend support is added.

### 4.6 Reset Email Sent (Frame 1.6)

- Envelope + green check illustration
- "Check your inbox" heading
- "Open Email App" outlined button (uses `UIApplication.shared.open(mailURL)`)
- "Resend" link

### 4.7 Email Verification (Frame 1.7)

- Envelope + sparkle illustration
- "Verify your email" heading
- "Open Email App" + "Resend Verification" links

### 4.8 Profile Setup — About You (Frame 2.1)

- Progress bar: "STEP 1 OF 2", 50%, teal-to-purple gradient
- White card form: Current Role, Experience (dropdown), Education (dropdown), Industry (chip multi-select)
- "Continue" CTA with arrow
- "Skip for now" link
- Mentor Tip card (amber background)

**API:** `PATCH /auth/me { name, avatarUrl }` — profile fields may need backend extension for role/experience/education/industry. For now, store as part of assessment flow.

### 4.9 Profile Setup — Your Goals (Frame 2.2)

- Progress: "STEP 2 OF 2", 100%
- Section 01: Role chips (Product Manager, UX Designer, Data Scientist, etc.)
- Section 02: Timeline selector (3m, 6m, 1y, Not sure) — circular highlight
- Section 03: Values grid (SALARY, GROWTH, BALANCE, IMPACT) — 2x2 cards
- "Start My Assessment" CTA

### 4.10 Photo Upload (Frame 2.3)

- Large circular avatar placeholder with camera overlay
- "Take Photo" solid button → `UIImagePickerController` camera
- "Choose from Library" outlined button → photo library picker
- "Skip for now" link

**API:** `PATCH /auth/me { avatarUrl }` — for MVP, use a placeholder avatar URL or allow the user to paste an image URL. Native photo upload to a hosting service is deferred to a future iteration.

### 4.11 Assessment Intro (Frame 3.1)

- Brain/gear icon illustration
- "Let's find your career fit" heading
- Three info badges: "~5 minutes", "32 questions", "AI-analyzed"
- "Begin Assessment" CTA
- "I'll do this later" secondary option (from prototyped variant)

### 4.12 Assessment Question (Frame 3.2)

- Progress: "Skills — Question 4", "12 OF 32" counter
- Teal-to-purple gradient progress bar
- Question heading
- 4 answer cards: icon on light purple square + text. Selected = purple border + teal checkmark circle
- "Continue" CTA (disabled until answer selected, per prototyped variant)
- "BACK" and "SKIP" in top bar

**Implementation:** Step through questions from assessment flow. Map answers to the assessment submission format. The web app uses 8 steps with varying question counts — replicate the same flow.

### 4.13 Assessment Processing (Frame 3.4)

- Spinning teal ring with PathWise icon in center
- "ETHEREAL MENTOR AI" label
- Three processing steps (sequential activation with green dots)
- Multi-color progress bar advancing from 0% → 100%
- "SYNTHESIZING DATA" / percentage labels
- Bottom icons: COGNITIVE, EXPERIENCE, TRAJECTORY
- When complete: "TAP ANYWHERE TO VIEW RESULTS"

**API:** `POST /assessment { userId, workStyle, strengths, values, currentSkills, experienceLevel, interests, ... }` → `{ result }`

**Animation:** Use `Timer` or `Task.sleep` to simulate processing steps over ~3-5 seconds while API call completes.

### 4.14 Assessment Results (Frame 3.5)

- Top match: donut chart (teal, showing match %), "BEST MATCH" green badge, role name, description, tags
- "View My Roadmap" teal-to-purple gradient CTA
- "Retake Assessment" link
- "Other Strong Paths" section: 2 additional matches with percentage

**Data:** Directly from `AssessmentResult.careerMatches` (top 3)

### 4.15 Dashboard — Pre-Assessment (Frame 4.2)

- "Welcome, Emily!" heading, "Let's get started." purple subheading
- "Start Assessment" dark pill button
- Compass illustration card
- Locked content with lock icon + "Complete assessment to unlock"
- "The PathWise Methodology" section
- "Fast-Track Your Growth" dark purple banner

**Logic:** Show this when `GET /assessment/:userId` returns null/empty.

### 4.16 Dashboard — Post-Assessment (Frame refined_home)

- Purple gradient welcome banner: "Welcome back, Emily!", assessment status, "VIEW MY ROADMAP" button
- 3 metric cards stacked: Roadmap Completion (%), Tasks Finished (count), Job Readiness (%)
- Top Career Matches: 3 cards with donut charts and "View Details" buttons

**APIs:**
- `GET /auth/me` → user info
- `GET /progress/:userId` → roadmapCompletion, tasksFinished, tasksRemaining, jobReadinessScore
- `GET /assessment/:userId` → careerMatches
- `GET /roadmap/:userId` → roadmap data

### 4.17 Roadmap Path (Frame updated_roadmap_path)

- Target header card: "CURRENT TARGET", role name, circular progress, timeline/track chips
- "Adjust Timeline" + "Add Custom Task" action chips
- Skill Gap Indicator card: missing certifications with provider logos
- My Learning Path: COURSES, PROJECTS, NETWORKING sections
- Each item: colored left border, priority badge, description, three-dot menu

**APIs:**
- `GET /roadmap/:userId` → milestones, target role
- `GET /tasks?userId=` → tasks grouped by milestone and category
- `GET /assessment/:userId` → skill gaps, certificates

### 4.18 Adjust Timeline (Frame 5.2)

- Bottom sheet (`.sheet` modifier)
- Drag handle at top
- 4 timeline option cards: 3m Accelerated, 6m Standard (RECOMMENDED), 9m Relaxed, 12m Extended
- Selected = purple border
- Info line with estimated weekly time
- "Update Timeline" CTA + "Keep Current Settings" link

### 4.19 Course Detail (Frame 5.4)

- Dark/purple gradient header: provider logo, course title, progress bar
- Module curriculum list: completed (green check, strikethrough), current (CURRENT badge, Continue button), locked (lock icon)
- "Continue Learning" bottom CTA

### 4.20 Project Detail (Frame 5.5)

- Gradient header with priority badge
- Project Objectives checklist (checkbox items)
- Info cards: Estimated Time, Skills Gained
- Resources section with links
- "Mark as Complete" CTA

### 4.21 Networking Detail (Frame 5.6)

- Contact Tracker: 3 entry forms (name, company, status dropdown, date picker)
- Conversation Starter card (teal bg)
- Pro Tips card (amber bg)
- Progress section with bar

### 4.22 Tasks — Daily/Weekly Toggle (Frame tasks_with_daily_weekly_toggle)

- "Stay on track with today's priorities" heading
- Target info bar: role + progress %
- Progress bar
- Segmented control toggle: Daily (selected) | Weekly
- Task checklist: circle checkbox + title + duration/category + chevron
- "COMPLETE TASKS" purple pill CTA with sparkle
- "ESTIMATED TIME: 45 MINUTES" footer

**APIs:**
- `GET /tasks?userId=` → filter by status for daily view
- `PATCH /tasks/:taskId { status }` → mark complete

### 4.23 Task Celebration (Frame 6.3)

- Trophy icon, "Great work, Emily!" heading
- 2 stat cards: Growth (+5% readiness), Consistency (streak count)
- Weekly Goal card with progress bar
- "View Tomorrow's Tasks" CTA + "Back to Home" link

**Trigger:** Show after all daily tasks marked complete.

### 4.24 Tasks Empty State (Frame 6.4)

- Completed checklist illustration with sparkles
- "You're all caught up!" heading
- "Explore Roadmap" CTA + "Add a Custom Task" link

### 4.25 Progress Dashboard (Frame simplified_progress_dashboard)

- Large donut chart: overall job readiness % (teal stroke)
- "READY" label, trend badge (+X% from last week)
- Tasks Summary card: X/Y completed + progress bar
- Roadmap Completion card: % + level label
- Skill Roadmap Progress: 4 skill bars with percentages

**API:** `GET /progress/:userId` → all stats + breakdown

### 4.26 Streak Tracker (Frame 11.1)

- "Momentum" heading
- Streak card: flame icon, X-day streak, best streak reference
- Weekly progress: day circles (M-S), completed=teal+check, today=larger+lightning, missed=gray
- Power Hour card (purple gradient): most active time
- Consistency card: score % + progress bar
- "Complete Today's Tasks" teal CTA

**API:** `GET /streaks/:userId` → streak data, `POST /streaks/record` on task completion

### 4.27 Achievements (Frame 11.2)

- Season Progress card (dark purple gradient): tier, XP bar
- Badge count (large number)
- 2-column grid: earned badges (colored, with date) + locked badges (grayed, with progress)

**API:** `GET /streaks/achievements/:userId` → badges, XP, season info

### 4.28 Settings/Profile (Frame updated_settings_profile)

- Profile card: "PREMIUM MEMBER" label, name, target role, "Edit Profile" button
- Goal Timeline: progress bar with start/target dates
- Assessment card with "Retake Assessment" link
- Premium Plan card (purple gradient) with "Upgrade Plan"
- Preferences: 3 toggles (Push Notifications, Daily Reminders, Weekly Reports)
- Navigation links: Change Target Role, Security & Privacy
- "Log Out" in red

### 4.29 Edit Profile (Frame 8.2)

- Circular photo with camera overlay
- Form: Full Name, Email, Current Role, Industry (dropdown), Years of Experience (slider), Professional Bio (textarea)
- "Save Changes" CTA
- Danger Zone: "Delete Account" red option with warning text

**API:** `PATCH /auth/me { name, avatarUrl }`

### 4.30 Change Target Role (Frame 8.3)

- Warning card (amber): "Changing role will reset roadmap"
- Current role card with "CURRENT" badge and progress
- Radio-button role options from assessment matches
- "Change Target Role" outlined CTA
- Disclaimer text

**API:** `POST /roadmap { userId, targetRole }` — generates new roadmap

### 4.31 Career Match Detail (Frame 9.1)

- Large donut chart: match %, "BEST MATCH" badge
- Role description
- "Why this fits you": 3 bullet points with green checkmarks
- Salary Benchmarks: LOW / MEDIAN / HIGH
- Skills Readiness: 3 skills with EXPERT (green) / MODERATE (amber) / GAP (red) badges
- "Set as My Target Role" CTA

**APIs:**
- `GET /assessment/:userId` → career matches data
- `POST /assessment/skill-gap-analysis` → skill readiness
- `POST /assessment/career-recommendations` → portfolio, networking, job apps

### 4.32 Notifications (Frame 10.1)

- "MARK ALL AS READ" top-right action
- "Today" section (with "3 NEW" badge): notification cards with colored left accent + type icon + title + body + timestamp + unread dot
- "Earlier" section: same cards without unread dot
- "END OF FEED" footer

**APIs:**
- `GET /streaks/notifications/:userId`
- `POST /streaks/notifications/read`

### 4.33 Search (Frame 12.1)

- Search bar with magnifying glass + clear button
- Results grouped: Roles (with match score), Courses (module count), Skills (chip tags)
- Local filtering of assessment results + tasks + roadmap data

### 4.34 My Certificates (Frame 13.1)

- "Add Certificate" teal/purple pill button
- Certificate cards: provider logo, name, issue date, "VERIFIED" badge, "View Certificate" + "Share" links
- Promo card (purple gradient): "Boost your career credibility"

**APIs:**
- `GET /streaks/certificates/:userId`
- `POST /streaks/certificates { userId, name, issuer, issuedDate, url }`

### 4.35 Help & FAQ (Frame 15.1)

- "How can we help?" heading
- Search bar
- Accordion sections: Getting Started, Roadmap & Tasks, Billing
- Expandable Q&A items with chevron toggle
- Support card: "Still have questions?" + "Contact Support" button

**Implementation:** Static content, expandable via `DisclosureGroup`.

---

## 5. API Integration Summary

All endpoints use the existing Encore.dev backend. Base URL configurable per environment.

| Feature | Endpoints Used |
|---------|---------------|
| Auth | `POST /auth/signup`, `POST /auth/signin`, `GET /auth/me`, `PATCH /auth/me`, `POST /auth/change-password` |
| Assessment | `GET /assessment/:userId`, `POST /assessment`, `POST /assessment/certificates`, `POST /assessment/career-recommendations`, `POST /assessment/skill-gap-analysis` |
| Roadmap | `GET /roadmap/:userId`, `POST /roadmap`, `POST /roadmap/milestones/:id/complete` |
| Tasks | `GET /tasks?userId=`, `POST /tasks`, `PATCH /tasks/:taskId`, `POST /tasks/generate/milestone`, `POST /tasks/generate/custom` |
| Progress | `GET /progress/:userId` |
| Streaks | `GET /streaks/:userId`, `POST /streaks/record` |
| Achievements | `GET /streaks/achievements/:userId`, `POST /streaks/achievements/award` |
| Notifications | `GET /streaks/notifications/:userId`, `POST /streaks/notifications/read` |
| Certificates | `GET /streaks/certificates/:userId`, `POST /streaks/certificates` |

---

## 6. Animations

Key animations matching stitch prototyped variants:

| Screen | Animation |
|--------|-----------|
| Splash | Sequential reveal: icon scale-in → sparkle → text fade-in → loading label |
| Onboarding | Horizontal page swipe with crossfade |
| Sign Up/In | Form fields slide-up or fade-in on appear |
| Assessment Q | Answer card selection: border color + checkmark with spring animation |
| Assessment Processing | Ring spin (continuous rotation), step dots activate sequentially, progress bar fills |
| Dashboard metrics | Number count-up animation on appear |
| Donut charts | Stroke animation from 0 to target percentage |
| Task completion | Celebration card with scale-up + confetti-style effect |
| Navigation | Standard iOS push/pop transitions |
| Bottom sheets | iOS native sheet presentation |

---

## 7. Error Handling

| Scenario | Behavior |
|----------|----------|
| Network error | Show inline error message with "Retry" button |
| 401 Unauthenticated | Clear token, redirect to Sign In |
| 404 Not Found | Show appropriate empty state |
| 400 Invalid Argument | Show field-level validation error |
| 409 Already Exists | Show "Email already registered" on sign-up |
| Server error (500) | Show generic "Something went wrong" with retry |

---

## 8. Testing Strategy

- **Unit tests:** ViewModels (mock APIClient, verify state transitions)
- **UI tests:** Critical flows (sign up → assessment → dashboard → roadmap)
- **Preview providers:** Every view has a SwiftUI preview with mock data

---

## 9. Dependencies

Minimal external dependencies — prefer native SwiftUI:

| Need | Solution |
|------|----------|
| HTTP networking | Native `URLSession` |
| JSON decoding | Native `Codable` |
| Keychain | Small `KeychainHelper` wrapper (no library) |
| Image loading | Native `AsyncImage` |
| Animations | Native SwiftUI animations |
| Charts/donut | Custom `Shape` + `trim` modifier |
| Icons | SF Symbols (closest match to Lucide icons in web app) |

No third-party dependencies required.

---

## 10. Environment Configuration

```swift
enum AppEnvironment {
    case development   // http://localhost:4000
    case staging       // Encore staging URL
    case production    // Encore production URL

    var baseURL: URL { ... }
}
```

Configured via Xcode scheme environment variables or build configuration.
