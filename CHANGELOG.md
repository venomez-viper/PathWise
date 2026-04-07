# Changelog

All notable changes to PathWise are documented here.

## [0.10.1] — 2026-04-07

### Changed
- **Settings page revamp** — complete rewrite with real, functional controls:
  - Avatar picker: 12 DiceBear preset avatars (adventurer, avataaars, bottts, lorelei), click to select, saves instantly
  - Career settings: Retake Assessment, Change Target Role, Reset Roadmap (with confirmation)
  - Data & Privacy: Export My Data (JSON download), Delete Account (double confirmation, cascade delete)
  - Clean password change form in Account & Security section
- Removed all fake toggles (Haptic Feedback, Zen Mode, Blue Light Reduction, Notifications) that did nothing

### Added
- `DELETE /auth/account` endpoint for user self-deletion (with admin protection)
- `GET /auth/export` endpoint for GDPR-compliant data export

## [0.10.0] — 2026-04-07

### Added
- **Admin Dashboard** — User management, analytics, system info, user impersonation, bulk actions, CSV export
- **Admin Tickets System** — Support desk with status management (open / in_progress / closed)
- **Contact Us Page** — Form at `/contact`; submissions saved to tickets DB
- **Logout Page** — Friendly goodbye screen with sad Panda mascot
- **Microsoft Clarity** — Session recordings and heatmaps integrated (tracker ID `w8529y3h0y`)

### Changed
- **Hero Section Redesign** — Premium SaaS-style layout with interactive particle canvas background
- **Problem Section** — Replaced all emojis with `lucide-react` icons
- **Solution Page** — Replaced emojis with Lucide icons; colored card layout
- **Navbar** — Added Login and Sign Up buttons (were previously missing)
- **Footer** — Removed dead social links; added Contact link
- **SignIn Page** — Fixed label consistency, autofill yellow highlight fix, support mailto link, button alignment
- **Legal Pages** — Replaced placeholder content with professional GDPR-compliant Privacy Policy, Terms of Service, and Cookie Policy
- **Blog Newsletter** — Now functional with input validation and success state
- **Logout Button** — Panda centered on logout screen; button label changed to "Logout"

### Fixed
- **Em Dashes** — Removed em dashes from all assessment questions and CTA button labels

### Security
- **Rate Limiting** — Sliding window rate limiting on all backend endpoints, enforced per-user and per-email
- **IDOR Fix** — `awardAchievement` endpoint now validates user ownership before awarding badges
- **OAuth Hardening** — Nonce verification enforced; no auto-link to password-only accounts; `ON CONFLICT` race condition handling added

## [0.9.0] — 2026-04-07

### Added
- **Google & Apple OAuth Social Login** — `POST /auth/oauth` endpoint supporting Google and Apple sign-in for both web and iOS clients
  - Web: authorization code flow with server-side token exchange (PKCE, nonce verification)
  - iOS: direct ID token verification via JWKS (`jose` library)
  - Auto-links OAuth accounts to existing OAuth-only accounts by verified email
  - Branded social buttons (Google "G" logo, black Apple button) on SignIn/SignUp pages
  - Settings page: "Set Password" option for OAuth-only users
  - New DB migration: `user_oauth_providers` table, `password_hash` nullable
- **Mandatory Assessment Onboarding** — New users see welcome hero card with Panda mascot on Dashboard, gating them into the assessment flow
- **Task Detail/Edit Slide-Over Panel** — Click any task to view/edit all fields in a slide-over; delete with confirmation dialog
- **Task Sort Dropdown** — Sort by Priority / Due Date / Newest / Title A-Z (default: priority, high first)
- **40 New Career Profiles** (90 total) — Law, trades, architecture, arts, science, hospitality, aviation, social services, government
- **Career Brain: Cross-Dimensional Synergy Scoring** — 10 patterns detecting multi-answer career signals
- **Career Brain: Anti-Pattern Penalties** — 8 conflict detectors reducing scores for contradictory answer combinations
- **Career Brain: Domain Affinity Boost** — Tiered primary/secondary domain scoring
- **Career Brain: Experience-Career Fit Scoring** — Matches experience level to career profile requirements
- **Career Brain: Personality Coherence Multiplier** — Cosine-similarity across 18 trait dimensions
- **Branch Protection** — Enabled on `main` (no force push, PR reviews required)

### Changed
- **Assessment Multi-Select** — Steps 0-4 now allow picking up to 3 options per question (was single-select)
- **Assessment Questions** — All questions now have 4 choices each; removed em dashes from labels
- **Career Brain Weights Rebalanced** — Interest 20, Work Style 12, Values 18, Environment 8, Career Stage 12, Skills 10, Synergy 10, Anti-pattern -8, Domain 5, Experience Fit 5
- **Honest Normalization Curve** — Score floor lowered from 45 to 15 for better spread
- **Case-Insensitive Trait Matching** — With perfect alignment bonus

### Fixed
- **Due Date Scaling** — Milestone durations now scale to user's chosen timeline (3mo/6mo/12mo)
- **Avatar Placeholder** — Replaced external `pravatar.cc` fallback with local initials-based avatar

## [0.8.0] — 2026-04-06

### Added
- **Interactive Widget System** — 8 reusable widgets (Daily Focus, Quick Start, Skill Progress, Streak, Milestone Map, Motivational Quotes, Resource of the Day, Weekly Overview) extracted into `src/components/widgets/`
- **App-Level Widget Panel** — Flex-based right sidebar that self-fetches data, shows on Roadmap/Tasks/Progress/Streaks/Achievements/Certificates/Search/Help, hidden on Dashboard/Assessment/Settings/Onboarding
- **Panda Mascot System** — 12 cute panda characters (Gemini-generated art) as CSS sprite sheet, placed contextually across empty states, loading screens, success moments, and help sections
- **Custom Task Modal** — Milestone picker dropdown, in-modal error display, works regardless of milestone status

### Changed
- **Career Brain upgraded to Expert System** — 4-layer modifier architecture replacing static profile responses:
  - Experience modifiers (5 tiers: student→expert)
  - Gap pattern database (30 keyword-matched patterns for free-text biggestGap)
  - Career stage modifiers (12 stage×risk combinations)
  - Combination rules engine (25 persona rules)
  - Learning style router (24 skills × 3-5 resources per learning format)
- **Assessment biggestGap field** now feeds into career brain analysis
- **Surface colors** restored to Zen Stone teal-tinted palette matching Stitch desktop designs

### Fixed
- Vercel build failure — missing `JSX` namespace import in Achievements page
- Widget panel positioning — now uses flex layout instead of fixed positioning to avoid content overlap

## [0.7.0] — 2026-04-06

### Added
- Expert system career brain with modifier layers (see v0.8.0 Changed section for details — these were part of the same session)

## [0.6.0] — 2026-04-02 to 2026-04-05

### Changed
- Rethemed Onboarding, Streaks, Certificates pages from dark purple to Zen Stone light theme
- Achievements page rewritten with premium Apple Fitness-inspired badge design
- Auto-award achievements on assessment completion, roadmap generation, and task milestones

### Added
- iOS app design spec and implementation plan (22 tasks, 86 files)

## [0.5.0] — 2026-03-27

### Added
- Custom domain: pathwise.fit
- Live backend connection via Encore.dev
- Skill Gap Assessment page
- AI task generation from free-text prompts
- Tailwind v4 upgrade
