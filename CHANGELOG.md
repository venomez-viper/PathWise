# Changelog

All notable changes to PathWise are documented here.

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
