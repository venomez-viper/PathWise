# PathWise Product Roadmap & Growth Strategy — 2026–2027

**Document version:** 1.0  
**Date:** April 6, 2026  
**Product version at time of writing:** v0.10.1  
**Author:** PM / Growth Lead

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Q2 2026 Roadmap — "Foundation"](#2-q2-2026-roadmap--foundation-aprilejune)
3. [Q3 2026 Roadmap — "Growth"](#3-q3-2026-roadmap--growth-julyseptember)
4. [Q4 2026 Roadmap — "Scale"](#4-q4-2026-roadmap--scale-octoberDecember)
5. [2027 Vision](#5-2027-vision)
6. [Growth Strategy](#6-growth-strategy)
7. [Feature Prioritization Matrix](#7-feature-prioritization-matrix)
8. [Risk Analysis](#8-risk-analysis)

---

## 1. Product Vision

### Where Is PathWise Today (April 2026)?

PathWise v0.10.1 is a functional, well-instrumented career guidance platform with a compelling core loop: take a 10-step assessment, receive AI-matched career results, generate a milestone roadmap, complete daily tasks, and earn achievements. The expert system career brain (4-layer modifier architecture, 10-dimensional scoring, 90 career profiles) represents genuine technical differentiation. The design system is distinctive and polished. GDPR compliance, OAuth, rate limiting, and admin tooling are already in place.

What it is not yet: a revenue-generating product. The Pro plan exists in the pricing model but is not enforced. There is no paywall, no Stripe integration, no password reset, and no email verification. The product cannot convert to paid users.

### 12-Month Vision (April 2027)

PathWise is a revenue-generating, mobile-first career guidance platform used by 50,000+ active users — including a growing university licensing segment. The Pro paywall is live and driving a 6% free-to-paid conversion rate. The iOS app is in the App Store. The AI coaching chat (powered by Claude API) is the defining Pro differentiator, delivering a 40%+ week-over-week return rate among paid users. Users share viral archetype cards on social media, driving organic top-of-funnel.

**MRR target at 12 months:** $75,000 (~5,500 paying users)

### 24-Month Vision (April 2028)

PathWise is the default career guidance platform for university career centers across 3–5 institutions, with a $250K+ ARR institutional licensing stream. An Android app has closed the mobile gap. A career coaching marketplace connects users with certified human coaches for 1:1 sessions. The product serves three distinct cohorts — early professionals, career switchers, and students — with tailored onboarding flows per segment. The AI coaching layer has matured into a voice-capable career advisor.

**MRR target at 24 months:** $300,000 (~20,000 paying users + institutional revenue)

### North Star Metric

> **Weekly Active Users Who Complete at Least One Roadmap Task (WAU-Task)**

This metric sits at the intersection of acquisition, activation, and retention. A user who takes the assessment but never returns does not count. A user who logs in but never acts does not count. Only users who are actively moving toward their career goal count. This is the metric that predicts long-term retention and word-of-mouth growth.

**PostHog event:** `task_completed` with `source: roadmap` filter  
**Target by EOY 2026:** 10,000 WAU-Task  
**Target by EOY 2027:** 40,000 WAU-Task

### The Moat

PathWise's defensibility comes from three sources that compound over time:

1. **Proprietary career brain data.** Every user interaction (answer combinations, gap patterns, career selections, task completions, drop-off points) feeds a flywheel that no competitor can replicate without the same user base. The 4-layer expert system becomes a training dataset for a future fine-tuned model.

2. **Behavioral switching costs.** A user with 45 days of streak history, 8 earned achievements, a partially completed certificate, and a 6-month roadmap in progress has a high cost of switching to a generic job board. The achievement/streak system is not decoration — it is lock-in.

3. **Institutional data network effects.** University partnerships create cohort-level career outcome data (what careers do students from X university end up in? What skill gaps are most common?). This data makes the product demonstrably more accurate for institutional customers over time, creating a premium B2B data asset unavailable to consumer-only competitors.

---

## 2. Q2 2026 Roadmap — "Foundation" (April–June)

**Theme:** Build the engine that can grow. Fix the conversion blockers. Expand the assessment and career library to the point where results feel undeniably personalized.

**Success condition for Q2:** A new user who signs up today experiences a polished, personalized assessment-to-results flow in under 15 minutes, receives a results page they want to share, and can access a roadmap that feels tailored to their exact situation. Password reset works. The product is ready for paid traffic.

---

### Sprint 1 (April 7–20): Auth Completeness + Assessment v2 Architecture

**Why first:** Password reset and email verification are not "nice to have" — they are table stakes for any product that asks users to create accounts. Without them, users who forget passwords churn permanently. Without email verification, deliverability for the weekly digest and transactional emails is compromised. These must ship before we spend any money on acquisition.

**Deliverables:**

- **Forgot Password flow** — `POST /auth/forgot-password` sends a time-limited reset token via Resend. Reset page at `/reset-password?token=`. Token expires in 1 hour. Invalidated after use.
  - Microcopy: "Forgot your password? No problem — enter your email and we'll send you a reset link." CTA: "Send Reset Link" (not "Submit")
  - Error state: "We couldn't find an account with that email. Double-check the address or sign up for free." (not "User not found")
- **Email verification** — On signup, send verification email. Unverified users can use the product but see a persistent, dismissible banner: "Verify your email to make sure you never lose access to your roadmap." CTA: "Resend verification email"
- **Assessment v2 schema design** — Define the expanded 80-question bank schema, scoring engine v2 specification, and archetype taxonomy (minimum 8 archetypes). No frontend work this sprint — spec and data model only. (Reference: `/docs/research/scoring-engine-v2-spec.md` and `/docs/research/assessment-question-bank.md`)
- **PostHog instrumentation audit** — Verify all existing events are firing correctly. Define the missing events for the assessment funnel (see tracking plan below).

**Tracking events to instrument this sprint:**
- `password_reset_requested`
- `password_reset_completed`
- `email_verification_sent`
- `email_verification_completed`
- `assessment_started` (with `question_count`, `version: "v1"`)
- `assessment_step_completed` (with `step_number`, `time_on_step_seconds`)
- `assessment_abandoned` (with `step_number`, `session_duration_seconds`)

**Success metrics:**
- Password reset flow: 95% of reset emails delivered within 60 seconds (Resend logs)
- Assessment funnel: baseline measurement established (no improvement target — this is a baseline sprint)

---

### Sprint 2 (April 21–May 4): Assessment v2 Questions + Scoring Engine

**Why second:** The current assessment (5 multi-select steps, ~4 questions each) is functional but thin. 80 questions across 10 dimensions enables the kind of nuanced scoring that produces genuinely differentiated results. More importantly, richer answers mean the career brain's synergy patterns and anti-pattern penalties have more signal to work with.

**Deliverables:**

- **80-question bank implementation** — Expand assessment from ~20 to 80 questions across 10 dimensions. Questions are presented in a paginated, progressive flow — not all 80 at once. Group into themed sections with section headers and progress indicators. Estimated completion time displayed upfront: "This takes about 8–12 minutes."
- **Scoring engine v2** — Implement the revised scoring algorithm with improved normalization. Maintain backward compatibility: existing users' stored answers are re-scored against the new engine on next roadmap view. Surface a "Your results have been updated with our improved AI" notification.
- **Archetype system** — Minimum 8 career archetypes (e.g., The Builder, The Analyst, The Connector, The Creator, The Guardian, The Explorer, The Leader, The Specialist). Each archetype: name, description, 3 defining traits, famous example, typical career clusters, shareable card design spec.
- **A/B test setup** — Route 50% of new users to assessment v1 (current), 50% to assessment v2. Measure: completion rate, time-to-complete, assessment-to-roadmap conversion. PostHog feature flag: `assessment_version`.

**Tracking events:**
- `assessment_completed` (with `version`, `archetype_assigned`, `top_career_match`, `top_career_score`, `total_questions_answered`, `duration_seconds`)
- `archetype_assigned` (with `archetype_id`, `archetype_name`)

**Success metrics:**
- Assessment v2 completion rate >= 65% (v1 baseline will be set in Sprint 1)
- Time-to-complete assessment: median under 12 minutes
- Archetype assignment: distribution across all 8 archetypes (no archetype > 35% of users — indicates scoring is genuinely discriminating)

---

### Sprint 3 (May 5–18): Career Profiles Expansion to 150+

**Why third:** 90 profiles is good. 150+ profiles with salary data, job market outlook, and regional demand signals is a product that a user can share and trust. The "Career Profiles" page becomes a discovery surface and an SEO asset.

**Deliverables:**

- **60 new career profiles** — Bringing total to 150+. Priority categories: tech (AI/ML, cybersecurity, cloud, data), healthcare (nursing, pharmacy, physical therapy), creative (UX writing, game design, motion graphics), emerging (climate tech, biotech, prompt engineering, VR/AR development), business (operations, consulting, supply chain, financial planning).
- **Market data layer** — Each profile gains: median salary range (US), 5-year job growth % (Bureau of Labor Statistics sourced), top hiring industries, average time-to-entry for career switchers, required vs. preferred credentials. Display on profile detail pages.
- **Profile search and browse** — Public `/careers` page with search, filter by category/salary/growth rate. This is an SEO-ready page. Each profile gets a canonical URL (`/careers/ux-designer`, `/careers/data-scientist`). Meta tags, structured data (schema.org `Occupation`).
- **"Careers like yours" widget** — On the results page, show 3 related profiles adjacent to the user's top match. Drives exploration and increases time-on-site.

**Tracking events:**
- `career_profile_viewed` (with `career_id`, `career_name`, `source: [results|browse|search|related]`)
- `career_profile_shared` (with `career_id`, `share_method`)
- `careers_page_search` (with `query`, `result_count`)
- `careers_page_filter_applied` (with `filter_type`, `filter_value`)

**Success metrics:**
- `/careers` page indexed by Google within 4 weeks of launch
- Career profile pages average session duration > 2 minutes (organic traffic)
- "Careers like yours" widget click-through rate > 15%

---

### Sprint 4 (May 19–June 1): Results Experience Redesign

**Why fourth:** The results page is the product's most shareable moment. It is where users feel the "Aha!" — where the assessment pays off. Right now it returns a list of career matches with scores. That is functional but not compelling. It needs to feel like a personality reveal — something users want to screenshot and share.

**Deliverables:**

- **Archetype reveal screen** — Animated reveal of the user's career archetype. Full-screen moment, similar to Spotify Wrapped or 16Personalities reveal. Shows: archetype name, one-sentence description, 3 core traits, "You share this with: [famous example]". Shareable as an image card.
- **Radar chart visualization** — 10-dimensional score visualization showing the user's profile across Interest, Work Style, Values, Environment, Skills, etc. Uses the existing 10-dimensional scoring data. Built with a lightweight SVG radar chart (no heavy chart library required).
- **Career match cards** — Redesigned career match display. Each card: career name, match score (shown as percentage, not raw number), salary range, growth outlook indicator, "Start This Path" CTA (Pro-gated beyond the #1 match).
- **Shareable archetype card** — One-tap image export of the archetype reveal. Pre-sized for Instagram story (1080×1920) and Twitter/X card (1200×628). Include PathWise URL and tagline. This is the viral loop entry point.
- **"What this means for you" section** — Plain-language interpretation of the top match: "Based on your answers, you prioritize creative autonomy and collaborative environments. UX Design ranks #1 because it combines both — here's why..."

**Tracking events:**
- `results_page_viewed` (with `top_match`, `archetype`, `match_count`)
- `results_shared` (with `share_format: [instagram|twitter|link]`, `archetype`)
- `results_career_clicked` (with `career_rank`, `career_id`, `from_archetype_card`)
- `archetype_card_generated` (with `archetype_id`)
- `roadmap_started_from_results` (with `career_id`, `time_since_assessment_completed_seconds`)

**Success metrics:**
- Results page share rate > 8% of users who reach results
- Assessment-to-roadmap conversion (results → roadmap start) > 60%
- Archetype card generated by > 20% of users who reach results

---

### Sprint 5 (June 2–15): Pro Paywall + Stripe Integration

**Note on sequencing:** The paywall goes live at the end of Q2, not the beginning, because the product needs to be genuinely valuable before it charges money. By the time this sprint ships, users have an 80-question assessment, 150+ career profiles, a shareable archetype reveal, and radar charts. That is a product worth paying for.

**Deliverables:**

- **Stripe integration** — `POST /payments/checkout` creates a Stripe Checkout session. `POST /payments/webhook` handles `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_failed`. User `plan` field in DB updated on webhook events.
- **Pro paywall enforcement** — Define free vs. Pro feature gates. Free: assessment (full), top 1 career match, basic roadmap view (no task editing), no AI coaching. Pro: all career matches, full roadmap with task editing, AI coaching chat (Q3), certificates, advanced analytics.
- **Upgrade prompts** — Placed at natural friction points: when a user tries to view match #2+, when they try to edit a roadmap task, when they try to generate a certificate. Prompt is contextual, not a generic "upgrade to Pro" popup.
  - Microcopy example: "You matched 7 careers — but you're only seeing 1. Unlock all your matches to find the path that truly fits." CTA: "See All My Matches — $12.99/mo"
- **Pricing page** — Dedicated `/pricing` page. Three tiers displayed: Free, Pro ($12.99/mo), Annual ($9.99/mo, billed $119.88). Peer Plan ($149.99/yr) prominently featured. University licensing: "Contact us" CTA.
- **Post-payment onboarding** — After successful payment, show a "Welcome to Pro" moment. Surface the first Pro-exclusive action immediately (e.g., "You now have access to all 7 of your career matches — here they are").

**Tracking events:**
- `upgrade_prompt_shown` (with `trigger_point`, `user_plan`)
- `upgrade_prompt_clicked` (with `trigger_point`)
- `checkout_started` (with `plan_type: [monthly|annual|peer]`)
- `checkout_completed` (with `plan_type`, `revenue`)
- `checkout_abandoned` (with `step_abandoned`)
- `subscription_cancelled` (with `reason`, `days_active`)

**Success metrics:**
- Free-to-paid conversion within first 30 days of paywall launch: > 3% (conservative; target 5–8% at steady state)
- Checkout abandonment rate < 40%
- Failed payment recovery rate > 50% (Stripe dunning emails)

---

### Sprint 6 (June 16–30): Q2 Wrap + Performance / Bug Bash

**Deliverables:**

- Mobile responsive audit — identify and fix the top 10 breakage points on 375px (iPhone SE) and 390px (iPhone 15) viewport widths. Focus on: assessment flow, results page, roadmap, task list.
- Core Web Vitals — LCP < 2.5s, CLS < 0.1, INP < 200ms on the marketing homepage and assessment flow. Vercel Analytics dashboard review.
- A/B test analysis — read assessment v1 vs. v2 data and make a ship/iterate/kill decision.
- Q2 retrospective — review all Q2 success metrics, document what was learned, update Q3 scope based on actual user behavior data from PostHog.
- **PostHog funnel review** — Full funnel from `homepage_visited` → `signup_completed` → `assessment_completed` → `results_viewed` → `roadmap_started` → `task_completed`. Identify the highest drop-off step. That step becomes Q3 Sprint 1.

**Success metrics for Q2 overall:**
- Password reset: functional and < 3% user-reported issues
- Assessment v2 completion rate: >= assessment v1 baseline
- Career profiles: 150+ live, all with market data, indexed by Google
- Results sharing rate: > 8%
- Stripe integration: live, processing real payments
- Free-to-paid conversion: first data point established

---

## 3. Q3 2026 Roadmap — "Growth" (July–September)

**Theme:** Grow the user base, monetize, and introduce the AI coaching differentiator that separates PathWise from every career quiz on the internet.

**Success condition for Q3:** PathWise is generating $15,000+ MRR. The AI coaching chat is live and driving measurable retention lift among Pro users. Referral program is active. The product is discoverable via organic search for high-intent career queries.

---

### July: AI Coaching Chat + Retention Mechanics

**Week 1–2: AI Coaching Chat (Claude API)**

The single highest-leverage feature on the entire roadmap. Every other career guidance tool offers static content. PathWise will offer a conversational AI coach that knows your assessment results, your roadmap, your skill gaps, and your progress — and can answer "what should I do next?" in context.

**Deliverables:**
- `POST /ai/chat` endpoint. Context injected per-message: user's top career matches, current roadmap milestone, completed tasks, biggest gap field, experience level, archetype.
- System prompt engineered to act as a career coach, not a generic chatbot. Does not answer off-topic questions. Redirects to career guidance if user goes off-script.
- Chat UI in a slide-over panel (consistent with the task detail slide-over pattern already built). Accessible from any page in the authenticated app.
- Rate limiting: Free users — 3 messages/day (teaser). Pro users — unlimited.
- Pro upgrade gate at message 4 for free users: "You've used your 3 free coaching messages today. Upgrade to Pro for unlimited coaching." 
- Message history persisted per-user (last 50 messages). Scroll-back available.

**PostHog events:** `coaching_chat_opened`, `coaching_message_sent` (with `plan`, `message_index`), `coaching_upgrade_prompt_shown`, `coaching_session_duration_seconds`

**Success metric:** Pro users who use AI coaching chat have 2x higher D30 retention than Pro users who do not.

**Week 3–4: Weekly Email Digest**

- Automated weekly email (Resend) sent every Monday at 9am user-local time (fallback: 9am UTC)
- Content: current streak, tasks completed last week, next milestone, one coaching tip (AI-generated, personalized to their career path)
- Subject line A/B test: "[Name], your career moved forward this week" vs. "Your PathWise week in review"
- Unsubscribe link in every email (GDPR required, already in Privacy Policy)

**PostHog events:** `digest_email_sent`, `digest_email_opened` (via Resend webhook), `digest_email_cta_clicked`

**Success metric:** Weekly email open rate > 35%. Click-through rate > 12%.

---

### August: Referral System + SEO Foundation

**Week 1–2: Referral System**

Referral is the highest-ROI acquisition channel for a product with genuine user satisfaction. The mechanic must give the referrer something they value, not just the new user.

**Deliverables:**
- Unique referral link per user (`pathwise.fit/r/[code]`). Tracked via PostHog + DB.
- Incentive structure: referrer gets 1 month free Pro when referral completes assessment AND stays active for 7 days. Referred user gets 14-day Pro trial (vs. standard 7-day).
- Referral dashboard in Settings: shows link, copy button, share to Twitter/LinkedIn, count of successful referrals, earned months.
- Referral banner on the results page ("Your friends would want to know their archetype too") — highest-intent sharing moment.
- Admin dashboard shows referral attribution per user.

**PostHog events:** `referral_link_copied`, `referral_link_shared` (with `channel`), `referral_signup_completed`, `referral_reward_earned`

**Success metric:** 15%+ of new signups in August attributed to referral within 60 days of launch.

**Week 3–4: SEO Foundation**

Target keywords with clear commercial intent and low-to-medium competition:
- "career assessment" (33K/mo, medium competition)
- "what career is right for me quiz" (18K/mo, low competition)
- "career aptitude test" (22K/mo, medium competition)
- "career change quiz" (12K/mo, low competition)
- "career archetype" (8K/mo, very low competition — PathWise can own this)

**Deliverables:**
- Blog infrastructure (`/blog`) with MDX or CMS-backed posts. Target: 2 posts/week from launch.
- First 8 blog posts written: "What Career Is Right for Me? A 2026 Guide", "The 8 Career Archetypes and What They Mean", "How to Change Careers Without Starting Over", "[X] Careers You Can Get Into Without a Degree", career guides for top 5 most-matched careers in PathWise data.
- Technical SEO: sitemap.xml, robots.txt, canonical tags, Open Graph tags on all pages, structured data on career profile pages (schema.org `Occupation`, `Course`).
- `<title>` and `<meta description>` on every page — audit and fill all missing tags.

**Success metric:** 500+ organic sessions/month from blog by end of Q3. At least 3 career profile pages ranking in top 10 for "[career name] career guide" queries.

---

### September: Dark Mode + Mobile Polish

**Week 1–2: Dark Mode**

Dark mode is a retention and preference feature, not a growth driver. It is sequenced here (not earlier) because it has no revenue impact and high implementation cost. By September, the design system is stable enough that a dark mode token layer can be added without regressions.

**Deliverables:**
- CSS variable dark mode token set. Follows system preference by default (`prefers-color-scheme: dark`). User can override via Settings toggle (this replaces the previously removed fake dark mode toggle — now real).
- All pages audited for dark mode compatibility. Priority: Dashboard, Assessment, Results, Roadmap, AI Chat.
- Zen Stone palette dark equivalents: `--surface-container-low` dark token, `--color-primary` dark token. Consult Stitch design files before finalizing values.

**PostHog event:** `dark_mode_enabled`, `dark_mode_disabled`

**Week 3–4: Mobile Responsive Audit + PWA**

- Full responsive audit across iOS Safari 17+ and Android Chrome. Priority pages: assessment flow, results, roadmap, AI chat, settings.
- Progressive Web App (PWA) — `manifest.json`, service worker for offline access to last-viewed roadmap. "Add to Home Screen" prompt after 3rd session. This bridges the gap until the native iOS app ships in Q4.
- App icon, splash screen, and PWA meta tags.

**PostHog event:** `pwa_install_prompted`, `pwa_installed`

**Q3 Success Metrics:**
- MRR at end of September: $15,000+
- AI coaching chat: Pro user D30 retention lift confirmed > 1.5x vs. non-users
- Referral: 15%+ of new signups from referral channel
- Weekly email open rate: > 35%
- Organic search: 500+ sessions/month from SEO content
- Dark mode adoption: > 30% of users (measures preference satisfaction)

---

## 4. Q4 2026 Roadmap — "Scale" (October–December)

**Theme:** Go mobile. Open new revenue streams. Build institutional infrastructure. The product has proven product-market fit — now it scales.

**Success condition for Q4:** iOS app is live in the App Store. The first university pilot is signed. MRR exceeds $50,000.

---

### October: iOS App Launch

The iOS app spec and implementation plan (22 tasks, 86 files) already exists as of v0.6.0. Q4 is execution, not design.

**Deliverables:**
- Native Swift/SwiftUI iOS app. Pixel-perfect implementation of Stitch design system.
- Features at launch (v1.0): onboarding, assessment (adapted for mobile), results, roadmap, tasks, streaks, achievements, AI coaching chat (same backend endpoint).
- Apple App Store submission. Target: approved by October 31.
- Deep linking — `pathwise.fit/app/[route]` opens native app if installed, falls back to web.
- Push notifications — daily task reminders, streak protection alerts ("Your 14-day streak is at risk"), milestone completion celebrations.
- In-app purchase — Stripe subscription management for iOS via StoreKit 2. Note: Apple takes 30% on in-app purchases (15% for small business). Pricing should reflect this: iOS in-app price set at $14.99/mo to maintain margin parity.

**PostHog events:** `app_installed` (with `platform: ios`), `push_notification_sent`, `push_notification_opened` (with `notification_type`), `iap_started`, `iap_completed`

**Success metric:** 1,000 iOS app downloads in first 30 days. iOS user D7 retention > web D7 retention (push notifications advantage).

---

### November: University Licensing + Android (Parallel tracks)

**University Licensing Program**

**Target:** Sign 2–3 pilot universities by December 31, 2026. Revenue model: $25/student/year for career center access (bulk activation codes), minimum commitment 500 students = $12,500/university/year.

**Deliverables:**
- University admin portal — bulk user creation via CSV upload, cohort analytics dashboard (aggregate, anonymized: most common archetypes, top career matches, assessment completion rate, average roadmap progress).
- White-label light option — university logo in the app header for institutional deployments. PathWise branding retained.
- University landing page (`/universities`) with case study section (placeholder), ROI calculator ("How much does your career center currently spend per student on career guidance?"), and meeting booking widget (Calendly embed).
- Student activation flow — student receives email invite with pre-filled institution code, bypasses payment (covered by institution license).
- Partnership deck (PDF) — for sales outreach. Covers: product overview, student outcomes framework, pricing, implementation timeline, references.

**PostHog events:** `institution_invite_redeemed`, `cohort_dashboard_viewed` (admin event)

**Success metric:** 2 signed university pilots by December 31. Combined ARR from university segment: $25,000+.

**Android App**

Android represents 45% of global mobile market share. Not shipping Android in Q4 is leaving acquisition on the table, particularly for the university segment (students skew more Android than the general population).

**Deliverables:**
- React Native (or Flutter) Android app reusing as much logic as possible from the web frontend. Not a native Kotlin/Java rebuild — that is a Phase 2 consideration if Android-specific UX needs emerge.
- Parity with iOS app v1.0 feature set.
- Google Play Store submission. Target: approved by November 30.
- Google Play Billing integration.

**Success metric:** Android app live on Play Store by November 30.

---

### December: Career Coaching Marketplace + API v1

**Career Coaching Marketplace**

Connect PathWise users with certified human career coaches for 1:1 paid sessions. PathWise takes 20% platform commission.

**Deliverables:**
- Coach profile pages — photo, credentials, specializations (indexed to PathWise career categories), rates ($80–$200/hour), availability calendar.
- Booking flow — select coach, select time slot, pay via Stripe. PathWise escrow: coach paid 24 hours after session completion.
- Session prep packet — auto-generated from user's PathWise profile: assessment results, current roadmap, biggest gap, recent task completion. Sent to coach before session.
- Coach application flow — coaches apply, PathWise team reviews credentials. Manual approval for pilot. Target: 20 coaches at launch.
- In-app session notes — coach can add notes post-session, visible to user.

**PostHog events:** `coach_profile_viewed`, `coaching_session_booked`, `coaching_session_completed`, `coaching_marketplace_nps_submitted`

**Success metric:** 50 sessions booked in December. Average NPS from coaching sessions > 70.

**API v1 (Developer/Partner Access)**

Enables third-party integrations: university LMS systems, HR platforms, career counseling tools.

**Deliverables:**
- REST API with API key authentication. Endpoints: `GET /api/v1/assessment/results`, `GET /api/v1/roadmap`, `GET /api/v1/careers`.
- Developer documentation at `developers.pathwise.fit`.
- Rate limiting: 1,000 requests/day for standard API tier.
- API dashboard in Settings: generate/revoke API keys, view usage.

**Q4 Success Metrics:**
- iOS app: 1,000 downloads in first 30 days
- Android app: live on Play Store by November 30
- University licensing: 2 signed pilots, $25,000+ ARR
- Career coaching marketplace: 50 sessions booked in December
- MRR at end of December: $50,000+

---

## 5. 2027 Vision

By 2027, PathWise is no longer just a career assessment tool — it is an AI-powered career operating system. These initiatives represent the next frontier, each building on the proven foundation.

### AI Voice Coaching

The Claude-powered coaching chat evolves to support voice input and output. Users describe their career challenges verbally during their commute. The voice coach responds in a warm, professional voice. This is technically feasible in 2027 with mature voice AI infrastructure. It dramatically increases accessibility and differentiates from any text-only competitor.

**Target:** Voice coaching sessions represent 30% of all AI coaching interactions by end of 2027.

### Job Board Integration + Smart Apply

PathWise knows a user's target career, their current skill level, their location, and their timeline. It can surface highly relevant job opportunities — not the full job board firehose, but the 5–10 roles the user is most ready for right now. With one-tap smart apply, PathWise pre-fills application forms using the user's profile.

**Revenue model:** Employer-pays (job posting fees, cost-per-apply). This opens a B2B revenue stream that does not depend on user subscription growth.

**Target:** $100,000+ in employer revenue by end of 2027.

### Employer Partnerships + Hiring Pipeline

University licensing already puts PathWise in front of students. Employer partnerships create a demand-side network: companies pay PathWise to access a curated pipeline of candidates who have completed verified career roadmaps and earned certifications. Unlike LinkedIn, where anyone can apply, a PathWise-sourced candidate has demonstrated 90+ days of career-directed work.

**Revenue model:** Employer subscription for pipeline access ($500–$2,000/month per employer). Placement fee option (15% of first-year salary).

### Career Community Features

Users who share the same archetype or target the same career form a natural community. Features: archetype-matched cohort groups, peer accountability pairs, shared progress feeds (opt-in), community challenges ("Complete 5 tasks this week as a group"). Community features reduce churn by adding social switching costs on top of behavioral ones.

**Target:** 25% of active users participate in at least one community feature within 30 days of launch.

### Expanded Certification Programs

The current certificate system awards completion certificates. 2027 certificates are industry-recognized credentials issued in partnership with professional associations. A user who completes the "UX Design Readiness" pathway earns a credential that hiring managers actually recognize. Partnerships with bodies like UXPA, PMI, SHRM create a new premium credential tier.

**Revenue model:** Credential fees ($49–$199 per credential, separate from subscription). Institutional licensing for credential programs.

### Internationalization (i18n)

Spanish, French, Portuguese (Brazil), Arabic, Hindi. The career guidance problem is global. The assessment questions, career profiles, and coaching prompts need professional translation + cultural adaptation (not just string translation — some career archetypes map differently across labor markets).

**Target:** Non-English users represent 30%+ of new signups by end of 2027.

---

## 6. Growth Strategy

### User Acquisition

**SEO (Primary long-term channel)**

Target keyword clusters by funnel stage:

| Intent | Keywords | Monthly Search Volume | Target Ranking |
|---|---|---|---|
| High intent (assessment) | "career assessment", "career aptitude test", "career quiz free" | 70K+ combined | Top 5 |
| High intent (decision) | "what career is right for me", "career change quiz", "career test for adults" | 45K+ combined | Top 5 |
| Brand-building | "career archetype", "career brain", "PathWise career" | 10K+ combined | #1 |
| Long-tail | "[career name] career guide", "[career name] how to get started" | 5K–15K per career | Top 10 |

Content strategy: publish 2 SEO-optimized blog posts per week from August 2026. Each post targets one keyword cluster. Each post ends with a CTA to take the free assessment. 150 career profile pages are individually optimized landing pages.

**Social/Viral (Primary short-term channel)**

The archetype card (Sprint 4, Q2) is the viral loop. When users share "I'm The Analyst — Career Archetype" on Instagram and Twitter, they drive curiosity clicks. Each share includes the PathWise URL. Comparable mechanic to 16Personalities, which drives millions of visits per month organically.

Amplification plan:
- Identify top 10 career influencers on TikTok and LinkedIn (target: 100K–500K followers, career/self-improvement niche).
- Offer 6-month Pro access for an honest review post.
- Seed with 3–5 creators before public launch of archetype cards.
- "Your Career Archetype" challenge hashtag campaign targeting college students.

**University Partnerships (Primary B2B channel)**

Target: 10 university career centers by end of 2026 (2 signed in Q4, 8 more in pipeline). Entry strategy: reach career center directors directly via LinkedIn outreach. Value proposition: "Replace your $50/student career counseling software with PathWise at $25/student — and give every student AI coaching, not just the ones who book appointments."

Warm introduction strategy: find alumni at target universities who currently work in career services.

**Paid Acquisition (Deferred until Q3)**

Do not spend on paid acquisition until the free-to-paid conversion rate is validated at 5%+. Spending on ads before the paywall converts is pouring money into a leaking bucket. Q3 is the earliest for paid spend.

When paid acquisition starts:
- Google Ads: bid on "career quiz", "career assessment free", "career change help". Target $8–12 CPA for free signup, assume 6% free-to-paid = $130–$200 CAC for paid user.
- Meta Ads: archetype card creative (social proof format). Retarget assessment starters who did not complete.
- Budget: $3,000/month initial test. Scale if CAC < $150.

---

### Activation

**North Star Activation Metric:** User completes assessment AND views results AND starts roadmap — all within the first session.

**Current estimated time to Aha moment:** ~12–15 minutes (assessment) + 2 minutes (results) + 2 minutes (roadmap generation) = ~17 minutes total. Target: under 15 minutes.

**Activation improvements by sprint:**

- Sprint 1: Baseline funnel measurement established.
- Sprint 2: Assessment v2 with clearer progress indicators reduces drop-off.
- Sprint 4: Results page redesign increases assessment-to-roadmap conversion.
- Q3 July: Welcome email sequence (3 emails over 7 days) re-activates users who complete assessment but do not start roadmap.

**Welcome email sequence (post-signup):**
- Email 1 (immediate): "Welcome to PathWise — your assessment is waiting." CTA: "Start Your Career Assessment"
- Email 2 (24h if assessment not completed): "Most people finish in 12 minutes — want to see your career archetype?" CTA: "See My Archetype"
- Email 3 (72h if assessment completed, roadmap not started): "Your [Archetype] career path is mapped — here are your first 3 tasks." CTA: "Start My Roadmap"

**Onboarding principle:** The mandatory assessment onboarding (already built) is correct — do not let users into the dashboard without completing the assessment. The Aha moment is in the results, not the dashboard. Every friction point before the results page is a conversion risk.

---

### Retention

**D1 retention driver:** The results page. Users who see a compelling archetype reveal with a shareable card return to share it.

**D7 retention driver:** Streaks. A user with a 7-day streak has a reason to come back on day 8. The achievement system reinforces this.

**D30 retention driver:** Roadmap milestone completion. Hitting a milestone (a multi-week goal) is a meaningful moment that drives return visits and social sharing.

**D90 retention driver:** AI coaching chat (Pro). Users who have had a coaching conversation where the AI gave them specific, actionable advice about their career become behaviorally dependent on the product.

**Re-engagement triggers:**
- Streak at risk: push notification / email at 11pm local time if no task completed that day. "Your [N]-day streak ends at midnight."
- Milestone approaching: "You're 3 tasks away from completing [Milestone Name]."
- Re-assessment prompt: at 90-day mark, "A lot can change in 3 months — retake your assessment to see if your career matches have shifted."
- Lapsed user (no login in 14 days): email with "Here's what you're missing" — show their current roadmap progress, remaining tasks, streak they had built.

---

### Revenue

**Pricing architecture:**

| Plan | Price | Key Limits / Features |
|---|---|---|
| Free | $0 | Full assessment, archetype, top 1 career match, basic roadmap view, 3 AI chat messages/day |
| Pro Monthly | $12.99/mo | All matches, full roadmap + task editing, unlimited AI coaching, certificates, advanced analytics |
| Pro Annual | $9.99/mo ($119.88/yr) | Same as Pro Monthly, 23% savings |
| Peer Plan | $149.99/yr | Up to 6 users, 1 plan manager, shared leaderboard |
| University | $25/student/yr | Cohort analytics, bulk activation, white-label header |

**Revenue model targets:**

| Month | MRR | Paying Users | Notes |
|---|---|---|---|
| June 2026 | $2,500 | ~190 | First month of paywall |
| September 2026 | $15,000 | ~1,150 | AI chat driving Pro conversion |
| December 2026 | $50,000 | ~3,500 + university ARR | iOS app + university pilots |
| June 2027 | $150,000 | ~10,000 + employer revenue | Android, job board, community |
| December 2027 | $300,000 | ~20,000 | Full platform maturity |

**Conversion rate assumptions:** Free-to-paid at 6% (conservative), monthly churn at 4% (typical SaaS for this price point), annual plan uptake at 35% of paying users (reduces effective churn).

---

## 7. Feature Prioritization Matrix

Scoring: **Impact** (user value, 1–5) | **Effort** (dev cost, 1=low, 5=high) | **Urgency** (time-sensitivity, 1–5) | **Revenue Impact** (direct $ effect, 1–5)

**Priority Score = (Impact × Urgency × Revenue) / Effort**

| Feature | Impact | Effort | Urgency | Revenue | Score | Classification |
|---|---|---|---|---|---|---|
| Stripe / Pro Paywall | 5 | 3 | 5 | 5 | 41.7 | MVP Core |
| Forgot Password | 4 | 1 | 5 | 3 | 60.0 | MVP Core |
| Email Verification | 3 | 1 | 4 | 2 | 24.0 | MVP Core |
| AI Coaching Chat | 5 | 3 | 4 | 5 | 33.3 | MVP Core |
| Assessment v2 (80Q) | 5 | 4 | 4 | 4 | 20.0 | MVP Core |
| Archetype Reveal + Sharing | 5 | 2 | 4 | 4 | 40.0 | MVP Core |
| Career Profiles 150+ | 4 | 3 | 3 | 3 | 12.0 | MVP Core |
| Referral System | 4 | 2 | 3 | 4 | 24.0 | MVP Nice-to-Have |
| Weekly Email Digest | 4 | 2 | 3 | 3 | 18.0 | MVP Nice-to-Have |
| SEO / Blog Infrastructure | 4 | 2 | 3 | 3 | 18.0 | MVP Nice-to-Have |
| Mobile Responsive Audit | 4 | 2 | 4 | 3 | 24.0 | MVP Nice-to-Have |
| PWA / Add to Home Screen | 3 | 2 | 2 | 2 | 6.0 | MVP Nice-to-Have |
| Dark Mode | 3 | 3 | 2 | 1 | 2.0 | Phase 2 |
| iOS App | 5 | 5 | 3 | 5 | 15.0 | Phase 2 (Q4) |
| Android App | 4 | 4 | 2 | 4 | 8.0 | Phase 2 (Q4) |
| University Licensing Portal | 4 | 3 | 3 | 5 | 20.0 | Phase 2 (Q4) |
| Career Coaching Marketplace | 4 | 4 | 2 | 4 | 8.0 | Phase 2 (Q4) |
| API v1 | 3 | 3 | 2 | 3 | 6.0 | Phase 2 (Q4) |
| Radar Chart on Results | 4 | 2 | 3 | 2 | 12.0 | MVP Nice-to-Have |
| Re-assessment Flow | 3 | 2 | 2 | 2 | 6.0 | Phase 2 |
| Peer Plan (group billing) | 3 | 3 | 2 | 3 | 6.0 | Phase 2 |
| Job Board Integration | 5 | 5 | 1 | 5 | 5.0 | 2027 |
| Voice AI Coaching | 5 | 5 | 1 | 4 | 4.0 | 2027 |
| Employer Partnerships | 4 | 5 | 1 | 5 | 4.0 | 2027 |
| i18n / Localization | 3 | 5 | 1 | 3 | 1.8 | 2027 |
| Certification Programs | 4 | 4 | 1 | 4 | 4.0 | 2027 |
| Career Community Features | 4 | 4 | 1 | 3 | 3.0 | 2027 |
| Custom Career Profiles (user-created) | 2 | 3 | 1 | 1 | 0.7 | Parking Lot |
| LinkedIn Import | 3 | 4 | 1 | 2 | 1.5 | Parking Lot |
| Resume Builder | 2 | 4 | 1 | 2 | 1.0 | Parking Lot |
| Career Salary Negotiation Coach | 3 | 3 | 1 | 2 | 2.0 | Parking Lot |

**Top 3 highest-priority items right now (in order):**
1. Forgot Password (Score: 60.0) — blocking. Users who lose access never return.
2. Stripe / Pro Paywall (Score: 41.7) — the product cannot generate revenue without it.
3. Archetype Reveal + Sharing (Score: 40.0) — the viral loop that makes paid acquisition worthwhile.

**Highest scope creep risk:** LinkedIn Import. Sounds compelling, is technically ambiguous (LinkedIn API is heavily restricted), delivers uncertain user value, and competes with core PathWise data collection. Build this when > 20% of users specifically request it via in-app feedback and LinkedIn's API terms permit it.

---

## 8. Risk Analysis

### Technical Risks

**Encore.dev scaling**  
Risk level: Medium  
PathWise runs on Encore.dev, which handles microservice orchestration, routing, and deployment. At low user volumes (< 10,000 concurrent users), this is not a concern. At 50,000+ active users, the questions become: can Encore's cloud infrastructure autoscale during peak assessment events (e.g., a viral TikTok sends 10,000 users simultaneously)? What are the cold start times on the backend services?  
Mitigation: Load test the assessment and roadmap generation endpoints before any paid acquisition spend. Target: sustain 500 concurrent users without latency degradation. Plan: Encore's cloud platform (encore.cloud) should handle this — but validate before scaling marketing.

**Claude API costs (AI Coaching Chat)**  
Risk level: High  
AI coaching chat is the Pro differentiator. At $12.99/month Pro, the product can sustain approximately $1.50–$2.00 in API costs per user per month before margin compression becomes a problem (assuming ~40% gross margin target after infrastructure). A Pro user who has 30 long coaching conversations per month could cost $3–$5 in Claude API tokens.  
Mitigation: Rate limiting (already planned), context window management (inject only the most relevant 3–5 pieces of user context per message, not the full history), message caching for repeated common questions. Monitor cost-per-Pro-user in the admin dashboard. If average cost exceeds $2.50/user/month, implement a "coaching credits" soft limit system before adjusting pricing.

**Database schema migrations at scale**  
Risk level: Low-Medium  
Multiple services (auth, assessment, roadmap) each have their own PostgreSQL database (Encore pattern). As the schema evolves, coordinating migrations across services without downtime requires discipline.  
Mitigation: Continue the existing migration file pattern. Never alter production schema directly. All schema changes go through migration files. Before any migration on a table with > 100K rows, test the migration on a production-scale copy of the database.

**Sentry error budget**  
Risk level: Low  
Sentry is already integrated. Establish error budget targets now before user scale makes them painful to set: < 0.1% error rate on assessment submissions, < 0.5% error rate across all API endpoints.

---

### Market Risks

**Competitor AI career tools**  
Risk level: High  
LinkedIn has the distribution, the data, and the budget to build what PathWise is building. They have not done so because their business model incentivizes job matching, not career guidance. However, an acquisition (of PathWise or a competitor) or a product pivot could change this. CareerFoundry, Springboard, and 80,000 Hours all serve adjacent segments.  
The key insight from CONCEPT.md is correct: LinkedIn profits from job clicks, not career clarity. PathWise's moat is behavioral (streaks, achievements, roadmap history) + data (proprietary career brain trained on PathWise user signals). Build the behavioral lock-in aggressively in Q2–Q3. By the time a well-funded competitor catches up, PathWise users will have 90+ days of history that would be expensive to abandon.

**AI commoditization**  
Risk level: Medium  
As foundation models improve, the "AI-powered" tag becomes table stakes. Any competitor can wrap GPT-4o in a career chat interface. PathWise's defense is not the AI — it is the structured career brain (10-dimensional scoring, 150+ profiles, archetype system) that makes the AI responses personalized and verifiable. Focus on making the AI coaching chat demonstrably better than a generic ChatGPT prompt because of the PathWise context layer — and communicate that difference explicitly to users.

**Economic sensitivity**  
Risk level: Medium  
Career guidance demand is counter-cyclical — recessions drive more people to seek career advice. However, $12.99/month is a discretionary spend that gets cut when money is tight. The Peer Plan ($149.99/year / 6 users = $25/user/year) is recession-resistant pricing. Push the Peer Plan more aggressively in marketing if economic conditions tighten.

---

### Regulatory Risks

**GDPR and data privacy (EU)**  
Risk level: Medium  
PathWise collects psychometric data (career assessments, personality traits, work style preferences). This is sensitive data under GDPR Article 9 considerations (though career preferences are not formally "special category" data, they are privacy-sensitive). The Privacy Policy, Cookie Policy, and Terms of Service are already live and GDPR-compliant (as of v0.10.0). The data export (`GET /auth/export`) and account deletion (`DELETE /auth/account`) endpoints are already implemented.  
Ongoing requirements: Data Processing Agreements (DPAs) with Resend, PostHog, Clarity, Sentry, Stripe. Verify each vendor's DPA is signed before scaling EU marketing. Cookie consent banner must be implemented before any EU advertising. Appoint a Data Protection Contact (email in Privacy Policy — ensure it is monitored).

**COPPA (US children's data)**  
Risk level: Low but non-negotiable  
PathWise must not collect data from users under 13 (COPPA) and ideally not under 16 (GDPR child provisions). The Terms of Service must state minimum age requirement. Implement a date-of-birth gate on the signup form. If the user is under 16 in EU jurisdictions, do not process their data without parental consent. This is a launch-blocking legal requirement.  
Mitigation: Add date-of-birth field to signup. If under 16: "PathWise is for users 16 and older. Check back when you're a bit older — your career adventure awaits."

**Career guidance licensing**  
Risk level: Low (monitor)  
Some jurisdictions regulate who can provide "career counseling" as a professional service (e.g., National Board for Certified Counselors in the US). PathWise provides AI-driven guidance, not licensed counseling. Ensure all product copy is clear: PathWise provides "career guidance", "career insights", and "career coaching tools" — not "career counseling", "therapy", or "psychological assessment". The distinction matters legally.  
Add a disclaimer to the AI coaching chat: "PathWise is an AI-powered career guidance tool and is not a substitute for professional career counseling."

**University data compliance (FERPA)**  
Risk level: Medium (relevant when university licensing ships)  
US universities are subject to FERPA (Family Educational Rights and Privacy Act). Student career data processed by PathWise on behalf of a university may constitute "education records" under FERPA if the university uses it for academic purposes.  
Mitigation: Before signing any US university, have legal review the data processing agreement. PathWise's institutional data model (aggregate/anonymized analytics only visible to the university admin) reduces FERPA risk significantly. Do not allow universities to access individual student data without student consent.

---

### Team Risks

**Bus factor**  
Risk level: High  
PathWise's entire codebase, career brain architecture, design system, and business strategy appears to be in the hands of a very small team (potentially a single developer). The 4-layer modifier expert system, the Stitch design spec, the Encore microservice architecture, and the iOS implementation plan all represent concentrated knowledge that is not easily transferable.  
Mitigation: The CHANGELOG.md and documentation in `/docs/research/` are a good start. Expand this: every major architectural decision should have an ADR (Architecture Decision Record) in `/docs/decisions/`. The career brain scoring logic should have a dedicated specification document that any developer could implement from scratch. Before hiring the first developer, write the system documentation as if training a replacement.

**Hiring plan**  
As PathWise scales from solo/small team to $50K MRR+, the following roles become blocking:
- Q3: Part-time content writer (SEO blog posts, 2/week). Can be freelance.
- Q4: Full-stack developer (Encore/React) to support iOS parity features and university portal.
- 2027: Customer success manager (handles university onboarding, coach marketplace support).
- 2027: Growth/marketing hire (paid acquisition, partnerships, referral optimization).

**Founder-product coupling**  
The Stitch design system, the Panda mascot system, and the Zen Stone color palette are deeply embedded decisions that new team members need to internalize before touching the UI. The `/docs/stitch_screens_analysis.md` file is good. Expand with a written "New Contributor Design Guide" that explains the no-line rule, the teal-tinted surface system, and the mascot placement philosophy before the first external contributor joins.

---

## Appendix A: PostHog Event Tracking Plan

All events follow the naming convention: `noun_verb` (e.g., `assessment_started`, not `startAssessment`).

**Full event registry as of roadmap v1.0:**

| Event | Properties | Trigger |
|---|---|---|
| `page_viewed` | `page_name`, `referrer` | Every route change |
| `signup_started` | `method: [email\|google\|apple]` | User clicks Sign Up |
| `signup_completed` | `method`, `referral_code` | Account created |
| `login_completed` | `method` | Successful auth |
| `password_reset_requested` | — | Forgot password submitted |
| `password_reset_completed` | — | New password saved |
| `email_verification_completed` | — | Link clicked |
| `assessment_started` | `version`, `user_plan` | First question shown |
| `assessment_step_completed` | `step_number`, `time_on_step_seconds`, `answers_selected` | Step submitted |
| `assessment_abandoned` | `step_number`, `session_duration_seconds` | User leaves mid-flow |
| `assessment_completed` | `version`, `archetype_assigned`, `top_career_match`, `top_career_score`, `duration_seconds` | Results generated |
| `archetype_assigned` | `archetype_id`, `archetype_name` | With assessment_completed |
| `results_page_viewed` | `top_match`, `archetype`, `match_count` | Results page loads |
| `archetype_card_generated` | `archetype_id` | User clicks share/download |
| `results_shared` | `share_format`, `archetype` | Share action completed |
| `results_career_clicked` | `career_rank`, `career_id` | Career card clicked |
| `roadmap_started` | `career_id`, `timeline_months` | Roadmap generated |
| `task_completed` | `task_id`, `milestone_id`, `streak_day` | Task marked done |
| `task_created` | `source: [ai\|manual]` | Task added |
| `milestone_completed` | `milestone_id`, `days_to_complete` | All milestone tasks done |
| `achievement_earned` | `achievement_id`, `achievement_name` | Achievement awarded |
| `streak_extended` | `streak_length` | Day N+1 task completed |
| `streak_lost` | `streak_length_lost` | Streak broken |
| `certificate_generated` | `career_id`, `milestone_count` | Certificate created |
| `career_profile_viewed` | `career_id`, `source` | Career detail page viewed |
| `upgrade_prompt_shown` | `trigger_point`, `user_plan` | Paywall hit |
| `upgrade_prompt_clicked` | `trigger_point` | User clicks upgrade |
| `checkout_started` | `plan_type` | Stripe session created |
| `checkout_completed` | `plan_type`, `revenue` | Payment confirmed |
| `checkout_abandoned` | `step_abandoned` | Session expired unpaid |
| `subscription_cancelled` | `reason`, `days_active` | Subscription cancelled |
| `coaching_chat_opened` | `user_plan` | Chat panel opened |
| `coaching_message_sent` | `plan`, `message_index`, `session_id` | Message submitted |
| `coaching_upgrade_prompt_shown` | — | Free limit hit |
| `referral_link_copied` | — | Copy button clicked |
| `referral_link_shared` | `channel` | Share action completed |
| `referral_signup_completed` | `referral_code` | Referred user signs up |
| `referral_reward_earned` | `reward_months` | Referral reward credited |
| `digest_email_opened` | `week_number` | Via Resend webhook |
| `digest_email_cta_clicked` | `cta_type` | Via Resend webhook |
| `app_installed` | `platform: [ios\|android\|pwa]` | App first opened |
| `push_notification_opened` | `notification_type` | Push notification tapped |
| `dark_mode_enabled` | — | Dark mode toggled on |

---

## Appendix B: Approved Microcopy Patterns

These patterns are approved for use throughout the product. Maintain voice: clear, warm, competent, never condescending.

**Error messages:**
- Network failure: "We're having trouble connecting. Check your internet connection and try again."
- Server error: "Something went wrong on our end. We've been notified — please try again in a moment."
- Auth failure (wrong password): "That password doesn't match. Try again or reset your password below."
- Not found: "We couldn't find what you were looking for. It may have moved or been removed."
- Unauthorized: "You don't have permission to view this. Contact support if you think this is a mistake."

**CTA patterns:**
- Primary action (assessment): "Start My Career Assessment" (not "Begin" or "Take Quiz")
- Primary action (results): "See My Career Matches" (not "View Results")
- Primary action (roadmap): "Build My Roadmap" (not "Generate" or "Create")
- Upgrade prompt: "Unlock [specific thing]" (not "Upgrade to Pro")
- Share: "Share My Archetype" (not "Share")

**Empty state patterns:**
- No tasks: "You don't have any tasks yet. Your roadmap is waiting — [View My Roadmap]."
- No achievements: "You haven't earned any achievements yet. Complete your assessment to earn your first badge."
- No coaching history: "Your coaching history will appear here. [Start a Conversation] with your AI career coach."

---

*Document maintained by PM / Growth Lead. Review and update at the start of each quarter.*  
*Next review: July 1, 2026*
