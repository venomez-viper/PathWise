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

### Web App
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4 + custom "Ethereal Mentor" design system
- **Icons**: `lucide-react`
- **Backend**: Encore.dev (TypeScript) — REST API with JWT auth
- **AI**: Local career-brain matching engine (50 career profiles, multi-dimensional scoring)
- **Database**: SQLite with SQL migrations

### iOS App (`ios-app` branch)
- **Framework**: Swift + SwiftUI (iOS 17+)
- **Architecture**: @Observable ViewModels, native URLSession networking
- **Auth**: JWT stored in iOS Keychain — same backend, same accounts
- **Navigation**: Tab Bar (iPhone) + Sidebar (iPad)
- **Design**: Pixel-perfect match to stitch UI frames
- **Dependencies**: Zero third-party — pure SwiftUI + native APIs

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

## 📱 iOS App

The PathWise iOS app is a native Swift/SwiftUI app on the `ios-app` branch. It connects to the same Encore.dev backend — users can seamlessly switch between web and iOS.

### Building the iOS App

> Requires a Mac with Xcode 15+ and XcodeGen installed.

1. **Switch to the iOS branch**:
   ```bash
   git checkout ios-app
   ```

2. **Generate the Xcode project**:
   ```bash
   cd PathWise-iOS
   brew install xcodegen  # if not installed
   xcodegen generate
   ```

3. **Open and run**:
   ```bash
   open PathWise.xcodeproj
   ```
   Select an iPhone simulator and press Cmd+R.

4. **Start the backend** (in a separate terminal):
   ```bash
   cd backend && encore run
   ```

### iOS Screens (35+)
All screens match the stitch design frames:

| Flow | Screens |
|------|---------|
| Auth | Splash, Onboarding, Sign In/Up, Forgot Password, Email Verification |
| Setup | Profile Setup (About You, Goals, Photo), Assessment (Intro, Questions, Processing, Results) |
| Main | Dashboard, Roadmap, Tasks, Progress |
| Engagement | Streaks, Achievements, Certificates, Notifications |
| Other | Career Match Detail, Search, Settings, Edit Profile, Change Target Role, Help & FAQ |

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

### **v0.6.0** — Native iOS App
*Date: April 5, 2026*
- **Native iOS App**: Built a complete Swift/SwiftUI iOS app (82 files) on the `ios-app` branch with pixel-perfect fidelity to the stitch UI design frames.
- **Full Feature Parity**: All 35+ screens from the web app — auth, assessment, dashboard, roadmap, tasks, progress, streaks, achievements, certificates, notifications, search, settings, help.
- **Same Backend**: Connects to the same Encore.dev REST API with JWT authentication. Users share accounts across web and iOS.
- **Adaptive Navigation**: Tab Bar on iPhone, Sidebar on iPad via NavigationSplitView.
- **Zero Dependencies**: Pure SwiftUI with native URLSession, Keychain Services, and SF Symbols.
- **Design System**: Exact color tokens (#7C3AED purple, #14B8A6 teal, #F8F7FC background), typography, spacing, and component styles from the stitch frames.
- **AI Career Brain**: Same local career-matching engine — assessment, roadmap generation, and task generation all via the shared backend.
