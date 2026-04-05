# Changelog

All notable changes to PathWise are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.6.0] — 2026-04-05

### Added — Native iOS App

**82 Swift files** on the `ios-app` branch — a complete native iOS app built with Swift and SwiftUI (iOS 17+).

#### Core Infrastructure
- `APIClient` with typed `Endpoint` enum covering all 30 backend routes, snake_case JSON codec, Bearer token injection, and typed `APIError` mapping (401/403/404/400/409/5xx)
- `AuthManager` (@Observable) with JWT stored securely in iOS Keychain via `KeychainHelper`
- 9 Codable data models matching every backend API response: `User`, `AssessmentResult`, `CareerMatch`, `Roadmap`, `Milestone`, `TaskItem`, `ProgressStats`, `StreakData`, `AchievementData`, `AppNotification`, `Certificate`

#### Design System
- `AppColors` — 22 color constants + 4 gradients extracted from stitch UI frames (primary #7C3AED, teal #14B8A6, backgrounds, semantic colors)
- `AppTypography` — 10 font styles mapping SF Pro to the web app's Manrope/Inter system
- `AppTheme` — spacing, corner radii, shadow, and sizing tokens

#### 11 Reusable Components
- `CircularProgressView` — animated donut/ring chart with percentage label
- `PillButton` — primary CTA with loading state, gradient support, and disabled opacity
- `OutlinedButton` — secondary bordered pill button
- `InputField` — labeled text/password field with icon, error message, and visibility toggle
- `ChipView` — selectable chip/tag with checkmark state
- `CardView` — white rounded card container with shadow
- `BadgeView` — status badges (HIGH PRIORITY, VERIFIED, BEST MATCH, CURRENT, etc.)
- `ProgressBarView` — horizontal gradient progress bar
- `MentorTipCard` — amber tip callout card
- `SocialAuthButtons` — Google + Apple sign-in button row
- `LoadingView` — full-screen loading spinner

#### 35+ Screens (pixel-perfect stitch UI match)

**Auth Flow (7 screens):**
- Animated splash screen with sequential reveal (icon → sparkle → text → loading)
- 3-page onboarding carousel with swipe navigation
- Sign Up with social auth + email form + password validation
- Sign In with "Forgot password?" link and social auth
- Forgot Password with pastel gradient background
- Reset Email Sent confirmation with "Open Email App" deep link
- Email Verification with magic link flow

**Profile Setup (3 screens):**
- About You (Step 1/2) — role input, experience/education dropdowns, industry chip multi-select, FlowLayout, mentor tip card
- Your Goals (Step 2/2) — role chips, timeline selector (3m/6m/1y), values 2x2 grid
- Photo Upload — circular avatar with camera overlay, take/choose buttons

**Assessment (4 screens):**
- Intro — brain icon, "~5 minutes / 20 questions / AI-analyzed" badges
- Question — 20 career questions across 6 categories, 4 answer cards per question with icon + selection state
- Processing — spinning teal ring, 3-step sequential animation, progress bar, "TAP ANYWHERE TO VIEW RESULTS"
- Results — top match donut chart, BEST MATCH badge, teal-to-purple "View My Roadmap" CTA, other matches list

**Dashboard (2 modes):**
- Pre-assessment — compass illustration, locked content, methodology section, fast-track banner
- Post-assessment — purple gradient welcome banner, 3 metric cards, career match donut cards

**Roadmap (6 screens):**
- Roadmap path — target header, skill gap indicator, COURSES/PROJECTS/NETWORKING sections with priority badges
- Adjust Timeline bottom sheet — 4 duration options with RECOMMENDED badge
- Course Detail — dark gradient header, module curriculum (completed/current/locked states)
- Project Detail — objectives checklist, time/skills info cards, resources
- Networking Detail — contact tracker forms, conversation starter card, pro tips

**Tasks (3 screens):**
- Tasks list — Daily/Weekly segmented toggle, target info bar, task checklist with circle-tap-to-complete
- Task Completion Celebration — trophy, growth/consistency stats, weekly goal
- Empty State — "You're all caught up!" illustration

**Progress Dashboard:**
- Large donut chart (job readiness %), trend badge, tasks summary, roadmap completion, 4 skill progress bars

**Streaks & Achievements:**
- Streak Tracker — flame icon, weekly day circles (M-S), Power Hour card, consistency score
- Achievements — season progress card (dark purple gradient), 2-column badge grid (earned + locked)

**Career Match Detail:**
- Match donut chart, "Why this fits you" bullets, salary benchmarks (LOW/MEDIAN/HIGH), skills readiness (EXPERT/MODERATE/GAP)

**Notifications:**
- Today/Earlier grouped notifications with colored accent icons and unread dots

**Search:**
- Search bar with results grouped by Roles, Courses, Skills

**Certificates:**
- Certificate cards with provider logos, VERIFIED badges, add form sheet, promo card

**Settings (3 screens):**
- Settings — profile card, goal timeline, preferences toggles, navigation links, logout
- Edit Profile — avatar, form fields, experience slider, danger zone
- Change Target Role — warning card, role radio options, disclaimer

**Help & FAQ:**
- Search, accordion sections (Getting Started, Roadmap & Tasks, Billing), support card

#### Navigation
- iPhone: 5-tab TabView (Home, Roadmap, Tasks, Progress, Settings)
- iPad: NavigationSplitView sidebar with main + secondary sections
- Full auth flow: Splash → Onboarding (first launch) → SignIn → MainTabView

#### Project Configuration
- XcodeGen `project.yml` for generating .xcodeproj (iOS 17.0, Swift 5.9, iPhone + iPad)

### Added — Documentation
- `docs/AI-CAREER-BRAIN.md` — comprehensive technical document covering the scoring algorithm, all 50 career profiles, answer extraction, normalization, outputs, cross-service integration, prompt injection protection, and extension guide
- `ARCHITECTURE.md` — new Section 14 covering iOS app architecture, navigation, auth flow, and theme mapping
- `docs/stitch_screens_analysis.md` — pixel-level breakdown of all 53 stitch UI frames
- `docs/superpowers/specs/2026-04-05-pathwise-ios-app-design.md` — iOS app design specification
- `docs/superpowers/plans/2026-04-05-pathwise-ios-app.md` — 22-task implementation plan

### Fixed — iOS Compilation
- Added `import Observation` to all @Observable ViewModels
- Added `@MainActor` to all ViewModels for safe UI state mutations from async contexts
- Fixed `CardView` @ViewBuilder on stored property (changed to closure-based init)
- Replaced deprecated `.autocapitalization(.none)` with `.textInputAutocapitalization(.never)`
- Removed invalid `ShadowStyle.drop()` and `.leading(.tight)` calls
- Added `Hashable` conformance to `TaskItem` for navigation bindings
- Fixed `InputField` missing icon parameters in certificate form
- Fixed private struct accessibility in HelpFAQView

---

## [0.5.0] — 2026-03-27

### Added
- Custom domain launched on [pathwise.fit](https://pathwise.fit) via Porkbun + Vercel DNS
- Live Encore.dev backend connected to React frontend
- Skill Gap Assessment page with AI-driven assessment flow
- AI Task Generation with free-text prompts on the Tasks page
- Upgraded to Tailwind CSS v4

---

## [0.4.0] — 2026-03-26

### Added
- High-fidelity PathWise logo as scalable SVG component
- Branding integrated across Navbar, Footer, and Favicon
- Webapp framework with dual-layout architecture (Marketing Site + Authenticated App)
- Migrated to `@tailwindcss/postcss` for build performance

---

## [0.2.0] — 2026-03-26

### Added
- `CONCEPT.md` documenting the full business concept from the founding pitch deck
- Covers product framework, customer segments, pricing model, revenue streams, operating model, and competitive positioning

---

## [0.1.0] — 2026-03-26

### Added
- Initial project scaffold: Vite + React + TypeScript
- Environment configuration (`.env.development`, `.env.production`)
- "Ethereal Mentor" design system tokens in global CSS
- Home Dashboard with progress metrics, circular indicators, career matches
- `lucide-react` for SVG iconography
