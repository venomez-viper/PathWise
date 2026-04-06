# 🚀 PathWise: The Guided Path

Welcome to the **PathWise** repository! 

**[🔗 Live Demo](https://pathwise.fit)**

PathWise is a modern SaaS platform designed to be a "Digital Atelier" for one's career. It transcends the traditional "utility app" aesthetic by acting as an Ethereal Mentor—providing aspirational career guidance, tracking roadmap progress, and recommending top career matches based on skills and personality assessments.

## 📋 Business Concept

PathWise is built on a validated business concept from our founding pitch deck. The full foundation — problem statement, product framework, pricing model, competitive positioning, and operating model — is documented in **[CONCEPT.md](./CONCEPT.md)**.

> *"Your career is too important to leave to chance."*
> PathWise is an AI-powered career orientation platform that maps your identity, predicts high-fit career paths, builds a step-by-step roadmap, and tracks your progress toward your target role.

---

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (CSS Variables based on a custom Design System)
- **Icons**: `lucide-react`

## 🎨 Design System: "The Ethereal Mentor"

Our UI is built around fluid, illuminated layers, rejecting standard flat design for **Organic Asymmetry** and **Tonal Depth**.
- **The "No-Line" Rule**: We avoid harsh 1px solid borders. Structure is built with spacing, tonal layering of backgrounds (`surface-container-low`, `surface-container-highest`), and soft gradients.
- **Glassmorphism**: Modals and overlays use a frosted glass effect with deep blur.
- **Typography**: `Manrope` for display and headlines, `Inter` for highly readable body text.

## 🏗 Getting Started

To get the project running locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/venomez-viper/PathWise.git
   cd PathWise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environments**:
   The app uses `.env.development` and `.env.production` files. Ensure you have the required variables configured.
   ```env
   VITE_APP_ENV=development
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173`.

---

## 🚨 MANDATORY PUSH RULE: Version History 🚨

**CRITICAL:** It is a **strict mandatory rule** for all developers that **every push MUST be accompanied by an update to the Version History** below. If you are adding a new feature, fixing a bug, or making architectural changes, you must log it in the Version History section with the version number, date, and a description of the changes before pushing your branch or merging a Pull Request.

---

## 📅 Version History

### **v0.1.0** — Initial Project Scaffold & UI Framework
*Date: March 26, 2026*
- **Framework Initialization**: Initialized the repository as a Vite + React + TypeScript project.
- **Environment Setup**: Added `.env.development` and `.env.production` definitions.
- **Design Tokens**: Configured global CSS variables in `index.css` to match the "Ethereal Mentor" design specification (Color palette, Topography, Spacing, and Glassmorphism).
- **Home Dashboard Implementation**: Built the primary dashboard screen (`App.tsx`) with the user hero section, progress metrics (Roadmap Completion, Tasks Finished, Job Readiness), circular progress indicators for Top Career Matches, and integrated the custom PathWise logo.
- **Dependencies**: Added `lucide-react` for SVG iconography.

### **v0.2.0** — Business Concept Documentation
*Date: March 26, 2026*
- **CONCEPT.md Added**: Extracted and structured the full business concept from the founding pitch deck (Zafuture Group 5) into `CONCEPT.md`. Covers the core problem statement, Zafuture Product Experience Framework (Discovery → Planning → Execution → Intelligence layers), customer segments, pricing model ($0 free tier / $12.99 premium / $9.99 annual), revenue streams (subscriptions, university licensing, coaching add-ons), operating model (in-house vs. partner capabilities), and competitive positioning.
- **README Updated**: Added a `Business Concept` section linking to `CONCEPT.md` with the product's founding tagline and mission summary.

### **v0.4.0** — Brand Identity & Webapp Integration
*Date: March 26, 2026*
- **High-Fidelity Branding**: Recreated the official PathWise logo as a scalable SVG component. Integrated the new branding (zigzag arrow icon + lowercase wordmark) across the Navbar, Footer, and Favicon.
- **Webapp Framework**: Integrated the core webapp dashboard logic into the main repository. Established a dual-layout architecture in `App.tsx` separating the Marketing Site (`/`) from the Authenticated App (`/app`).
- **Improved Build Pipeline**: Migrated to `@tailwindcss/postcss` for better build performance and compatibility.
- **Updated Live Url**: [https://pathwise-mu.vercel.app/](https://pathwise-mu.vercel.app/)

### **v0.5.0** — Custom Domain & Live Backend
*Date: March 27, 2026*
- **Custom Domain**: Launched on **[pathwise.fit](https://pathwise.fit)** via Porkbun + Vercel DNS configuration.
- **Live Backend**: Connected Encore backend API to the React frontend via `encore.client.ts`.
- **Skill Gap Assessment**: New dedicated page with full AI-driven assessment flow.
- **AI Task Generation**: Custom task creation using free-text prompts on the Tasks page.
- **Tailwind v4**: Upgraded to the latest Tailwind CSS import syntax for better build performance.

### **v0.6.0** — UI Retheme & Achievements System
*Date: April 2-5, 2026*
- **Theme Overhaul**: Rethemed Onboarding, Streaks, Certificates pages from dark purple to the Zen Stone light theme with copper/teal accents.
- **Achievements Page**: Premium Apple Fitness-inspired badge design with SVG ring progress, earned/locked states, XP system, and season progress.
- **Auto-Award System**: Backend automatically awards achievements on assessment completion, roadmap generation, and task milestones.
- **iOS App Spec**: Complete design spec and implementation plan for native Swift/SwiftUI iOS app (22 tasks, 86 files).

### **v0.7.0** — Expert System Career Brain
*Date: April 6, 2026*
- **4-Layer Modifier System**: Replaced static one-size-fits-all career profile responses with a pre-computed expert system:
  1. **Experience Modifiers** — 5 tiers (student→expert) with tier-specific advice, timeline scaling, and focus areas
  2. **Gap Pattern Database** — 30 keyword-matched patterns detecting common career challenges from free-text `biggestGap` input
  3. **Career Stage Modifiers** — 12 stage×risk combinations with framing, summary templates, and priority shifts
  4. **Combination Rules Engine** — 25 persona rules (Career Changer, Ambitious Student, Technical Leader, etc.) detecting high-signal answer combinations
  5. **Learning Style Router** — 24 skills × 3-5 resources each across video/book/project/bootcamp/mentorship formats
- **biggestGap Integration**: Assessment free-text field now feeds into the career brain analysis, reordering skill gaps and personalizing summaries.
- **Custom Task Modal Fix**: Milestone picker dropdown, in-modal error display, works regardless of milestone status.

### **v0.8.0** — Interactive Widget System & Panda Mascots
*Date: April 6, 2026*
- **8 Interactive Widgets**: Daily Focus, Quick Start, Skill Progress, Streak, Milestone Mini-Map, Motivational Quotes, Resource of the Day, Weekly Overview bar chart.
- **Reusable Widget Components**: Extracted into `src/components/widgets/` with configurable `WidgetSidebar` — each page picks which widgets to display.
- **App-Level Widget Panel**: Fixed-position right gutter sidebar that self-fetches data. Shows on Roadmap, Tasks, Progress, Streaks, Achievements, Certificates, Search, Help. Hidden on Dashboard, Assessment, Settings, Onboarding.
- **Panda Mascot System**: 12 cute panda characters (Gemini-generated art) placed contextually across the app — empty states, loading screens, success moments, help sections. CSS sprite sheet technique with mood-based selection (happy, thinking, sleepy, curious, celebrating, confused, waving, reading, working).
- **Zen Stone Colors Restored**: Surface hierarchy matches Stitch desktop mockups (`#eefcfe` teal-tinted background).
