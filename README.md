# PathWise

Career guidance platform that helps users assess strengths, discover career matches, generate personalized roadmaps, and track progress through actionable tasks.

[Live Demo](https://pathwise.fit) | Built with React + TypeScript + Encore.dev

## Key Features

- **Career assessment** - 83 questions across 6 dimensions, producing 30 archetypes mapped to 91 career profiles
- **Career match scoring** - transparent score breakdowns with cross-dimensional synergy detection and anti-pattern penalties
- **Personalized roadmap generation** - adaptive milestones scaled to 3/6/12-month timelines based on experience level
- **Skill gap analysis** - ROI-ranked learning recommendations with resources matched to preferred learning style
- **Task management** - kanban board with drag-and-drop, auto-generated tasks, and a slide-over detail panel
- **Focus Mode** - pomodoro timer with ambient sounds for deep work sessions
- **Streak tracking** - daily progress tracking with celebration animations and achievement badges
- **OAuth login** - Google and Apple social login with PKCE and nonce verification
- **Admin dashboard** - user management, analytics, support tickets, and CSV export
- **Server-side progress saving** - assessment state persisted across devices and sessions
- **GDPR-compliant** - full data export (JSON), account deletion with cascade, cookie policy

## Screenshots

*Screenshots coming soon*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Encore.dev (TypeScript), PostgreSQL (per-service DBs) |
| Career Brain | Custom scoring engine with cosine/Jaccard similarity, RIASEC, Big Five |
| Auth | JWT + OAuth (Google, Apple), bcrypt |
| Deployment | Vercel (frontend), Encore Cloud (backend) |
| Analytics | PostHog, Microsoft Clarity |

## Architecture

The backend is split into independent microservices, each with its own PostgreSQL database:

| Service | Responsibility |
|---------|---------------|
| **Auth** | JWT authentication, OAuth (Google/Apple), profile management, avatar system |
| **Assessment** | Career assessment engine, scoring with 4-layer expert system, skill gap analysis |
| **Roadmap** | Milestone generation, adaptive planning, timeline scaling |
| **Tasks** | CRUD operations, completion tracking, task generation |
| **Progress** | Career readiness score computation, dashboard analytics |
| **Streaks** | Daily tracking, achievements, XP system, notification triggers |

The expert system uses a 4-layer modifier architecture: experience tiers, gap pattern matching, career stage modifiers, and a combination rules engine that detects persona patterns (Career Changer, Ambitious Student, Technical Leader, etc.).

## Getting Started

### Prerequisites

- Node.js 18+
- [Encore CLI](https://encore.dev/docs/install)
- PostgreSQL (managed automatically by Encore locally)

### Setup

```bash
# Clone the repository
git clone https://github.com/venomez-viper/PathWise.git
cd PathWise

# Install frontend dependencies
npm install

# Start the Encore backend (runs migrations automatically)
cd backend
encore run

# In a separate terminal, start the frontend dev server
cd PathWise
npm run dev
```

### Environment Variables

Create a `.env.development` file in the project root:

```env
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
```

The frontend runs at `http://localhost:5173` by default.

## Why This Project

Career planning tools today fall into two camps: shallow quizzes that produce generic results, or expensive coaching that most people cannot access. PathWise sits in between. It combines structured psychometric assessment with a custom scoring engine to give users a concrete, actionable plan for reaching their target role. The platform is designed for students, career changers, and early-career professionals who need more than a job board but less than a career coach.

## Version History

PathWise is actively developed. See the [What's New](https://pathwise.fit/whats-new) page for the full changelog.

Current version: **v0.19.0**

## License

All rights reserved. This source code is provided for portfolio review and educational reference only. No permission is granted to use, copy, modify, or distribute this software for commercial purposes without explicit written consent.
