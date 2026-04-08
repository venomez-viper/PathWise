# PathWise Monetization Strategy
**Version 1.0 — April 2026**

---

## Strategic Foundation

PathWise sells career clarity. The business model must reflect that: users need to feel genuine value before being asked to pay. The free tier is not charity — it is the product's most important sales channel. Every free user who experiences their Aha! moment (seeing their top 3 career matches, completing their first milestone) is a conversion candidate. The gate must sit after the Aha! moment, not before it.

**Core monetization principle:** Give the result for free. Charge for depth, personalization, and ongoing guidance.

---

## 1. Free vs Pro Feature Gating

### Architectural Note
The `plan` field already exists on every user row in the `users` table (`"free" | "premium"`). The `adminUpdatePlan` endpoint already enforces this schema. No database migration is needed to begin gating — only enforcement logic.

---

### Free Tier — $0/month

The free tier must deliver a complete, satisfying first experience. Users who feel "tricked" by an empty free tier churn immediately and leave negative reviews. Users who feel genuinely helped by the free tier convert and refer others.

| Feature | Free Limit | Rationale |
|---|---|---|
| Career assessment | Full 80-question assessment | Completing the assessment IS the Aha! moment. Never gate input. |
| Career matches | Top 3 results, match score visible | 3 is enough to demonstrate the engine works. 4–10 become the upgrade pull. |
| Match descriptions | One-line summary only | Full "Why this fits you" breakdown is Pro. |
| Roadmap | Full milestone list visible, milestone titles and descriptions visible | User can see the path. Tasks within each milestone are limited. |
| AI task generation | 5 tasks/month (resets on 1st of each month) | Enough to experience the feature, not enough to sustain daily use. |
| Progress tracking | Basic % complete bar | Numbers visible. Trend charts and BI dashboard are Pro. |
| Skill gap analysis | Top 3 gaps listed, no learning resources | User sees the problem. Solution (resources) is Pro. |
| Public profile | Available, limited fields (name, headline, top career match) | Shareable but minimal. Full career identity card is Pro. |
| Certificate | Not available | A meaningful Pro incentive — awarded only on milestone completion. |
| Re-assessment | Once per 90 days | Cooldown creates urgency; Pro removes it. |
| Data export | Not available | Pro-only. |
| "What If" scenarios | Not available | Pro-only. |
| Radar charts | Not available | Pro-only. |

---

### Pro Tier — $12.99/month | $9.99/month billed annually

| Feature | Pro Detail |
|---|---|
| All career matches | Full list (typically 8–12 matches), ranked by fit score |
| "Why this fits you" | Detailed breakdown per match: strengths alignment, values alignment, personality fit score |
| "What If" skill scenarios | Simulate adding a skill and see how match scores shift |
| Radar chart / visual profile | Strengths, values, personality dimensions rendered visually |
| Unlimited AI task generation | No monthly cap |
| Advanced analytics dashboard | Completion trends, velocity, projected finish date, streak history |
| Certificate of completion | Issued per completed roadmap; shareable, verifiable link |
| Career identity card | Full shareable card: top match, readiness score, strengths, completion %, verified badge |
| Skill gap analysis with resources | Curated courses, certifications, and practice resources per gap |
| Re-assessment without cooldown | Reassess any time |
| Custom roadmap milestones | Add, edit, reorder milestones |
| Data export | PDF and JSON |
| Priority support | 24h response SLA vs best-effort for free |

---

### Peer Plan — $149.99/year (up to 6 users)

Positioned as a cohort plan for friend groups, bootcamp cohorts, or student teams. Each member gets full Pro access. Priced at $25/user/year — a significant discount from the $119.88 annual Pro price — with the social accountability mechanism as the value-add. Implementation is Phase 2 (requires group management, shared activity feed).

---

## 2. Conversion Triggers — The 5 Upgrade Moments

These are the highest-intent moments in the product. The prompt must be shown in-context, immediately after the user hits the limit, with a clear preview of what they are missing.

---

### Trigger 1: After Assessment Results — "Unlock All Your Matches"

**When it fires:** Immediately after the assessment result screen renders, below the top 3 matches.

**What the user sees:**
- Top 3 career matches: full card, match score, one-line description
- Matches 4–10: blurred cards, match score visible but description hidden, lock icon overlay

**Modal copy:**

> **You matched with 10 careers — you're only seeing 3.**
>
> Your full results include roles like [dynamically insert 4th match title] and [5th match title] — careers that might surprise you.
>
> Unlock every match, plus a detailed breakdown of why each one fits your strengths, values, and personality.

**CTA button:** "See All 10 Matches — Upgrade to Pro"

**Secondary action (dismiss):** "Stay with my top 3 for now"

**Tracking event:** `upgrade_prompt_shown` { trigger: "assessment_results", matches_total: N }
**Conversion event:** `upgrade_clicked` { trigger: "assessment_results" }

---

### Trigger 2: First Milestone Completion — "Earn Your Certificate"

**When it fires:** When a user marks their first roadmap milestone as complete.

**What the user sees:** A celebration animation (TaskCelebration component already exists), then immediately below: a blurred/greyed-out certificate preview with their name and the milestone title pre-filled.

**Modal copy:**

> **You completed your first milestone. That's real progress.**
>
> Pro members earn a verified Certificate of Completion when they finish their roadmap — shareable on LinkedIn and with employers.
>
> You're N% of the way there. Don't let this momentum stop.

**CTA button:** "Unlock My Certificate — Go Pro"

**Secondary action:** "Keep going, I'll upgrade later"

**Tracking event:** `upgrade_prompt_shown` { trigger: "milestone_completion", milestone_number: N }

---

### Trigger 3: AI Task Limit Reached — "You've Used Your 5 Free Tasks"

**When it fires:** When a free user attempts to generate their 6th AI task in a given month.

**What the user sees:** The task generation button becomes disabled. An inline banner (not a full modal — less disruptive) appears above the task list.

**Inline banner copy:**

> You've used all 5 of your free AI tasks this month. Your tasks reset on [date].
>
> Pro members generate unlimited tasks every day.

**CTA button:** "Upgrade to Pro"

**Secondary action:** "I'll wait until [reset date]"

**Implementation note:** The reset date must be surfaced in the UI — users who know their reset date are less likely to upgrade. This is intentional. Users who cannot wait are the highest-intent upgraders. Do not hide the reset date.

**Tracking event:** `upgrade_prompt_shown` { trigger: "task_limit", tasks_used: 5, reset_date: "YYYY-MM-DD" }

---

### Trigger 4: Skill Gap Detail Locked — "Get the Full Learning Plan"

**When it fires:** When a free user clicks on a skill gap item to see resources.

**What the user sees:** Skill gap title and importance level (high/medium/low) are visible. The learning resource field shows a lock icon and placeholder: "3 curated resources available."

**Modal copy:**

> **You know the gap. Now close it.**
>
> Pro members see curated courses, certifications, and hands-on projects for every skill gap — so you know exactly what to learn and in what order.
>
> Your [skill name] gap has 3 resources waiting.

**CTA button:** "Unlock My Learning Plan"

**Secondary action:** "Not right now"

**Tracking event:** `upgrade_prompt_shown` { trigger: "skill_gap_resources", skill: "skill_name", importance: "high|medium|low" }

---

### Trigger 5: Profile Sharing — "Unlock Your Full Career Identity Card"

**When it fires:** When a free user clicks the share button on their profile.

**What the user sees:** A preview of the basic public profile (name, headline, top match). Below it, a blurred preview of the full career identity card showing: readiness score, strengths radar, completion badge, Pro verified badge.

**Modal copy:**

> **Your profile is live — but you're only showing part of your story.**
>
> Pro members share a full Career Identity Card: your readiness score, top strengths, completion progress, and a verified Pro badge — designed to impress recruiters and collaborators.

**CTA button:** "Unlock My Full Identity Card"

**Secondary action:** "Share my basic profile"

**Tracking event:** `upgrade_prompt_shown` { trigger: "profile_share" }

---

## 3. Pricing Page Redesign

### Page Structure

#### Header
```
Tag:         "Transparent Pricing"
Headline:    "Invest in your career"
Subheadline: "Start free. Upgrade when you're ready. Cancel any time."
Toggle:      Monthly | Yearly (Yearly pre-selected with "Most popular" label)
```

#### Feature Comparison Table

| Feature | Free | Pro |
|---|:---:|:---:|
| Full 80-question career assessment | Yes | Yes |
| Top 3 career matches | Yes | Yes |
| All career matches (up to 12) | — | Yes |
| "Why this fits you" breakdowns | — | Yes |
| "What If" skill scenarios | — | Yes |
| Strengths radar chart | — | Yes |
| Basic roadmap (milestones visible) | Yes | Yes |
| AI task generation | 5/month | Unlimited |
| Advanced analytics dashboard | — | Yes |
| Skill gap analysis | 3 gaps listed | Full list + resources |
| Certificate of completion | — | Yes |
| Career identity card (shareable) | Basic | Full + verified badge |
| Re-assessment | Every 90 days | Anytime |
| Custom roadmap milestones | — | Yes |
| Data export (PDF / JSON) | — | Yes |
| Support | Community | Priority (24h) |

#### Social Proof Block
```
"Join [X] professionals building their career with PathWise"

[Three user testimonials — short, specific, outcome-focused]

"I had no idea what to do after graduation. PathWise showed me a path to product management
 and told me exactly what to learn first. I got my first PM role 8 months later."
— [Name], Associate PM at [Company]
```
*(Collect real testimonials from early users before populating. Placeholder data erodes trust.)*

#### Annual vs Monthly Savings Callout
```
Pay annually and save $36/year.
$9.99/month vs $12.99/month — that's 3 months free.
```

#### Money-Back Guarantee
```
Try Pro risk-free.

If you upgrade and don't find value in the first 14 days, we'll refund you in full.
No questions asked. No forms to fill out. Just email us.
```

#### FAQ Section

**Q: Can I cancel any time?**
Yes. Cancel from your account settings in 10 seconds. Your Pro access continues until the end of the billing period.

**Q: What happens to my data if I downgrade?**
Everything you've built — your roadmap, progress, tasks — stays intact. You just lose access to Pro features. Upgrade again any time to pick up where you left off.

**Q: Is the free tier actually useful, or is it a demo?**
The free tier includes the full assessment and a working roadmap. You will get real career guidance from day one. Pro exists for users who want to go deeper.

**Q: Do you offer student discounts?**
We partner with universities to offer PathWise to students at no cost through institutional licensing. Ask your career center if your school has a PathWise partnership. Individual student discounts are on our roadmap.

**Q: What is the Peer Plan?**
Six users sharing one annual subscription at $149.99/year — $25/user. Each member gets full Pro access. Great for friend groups, bootcamp cohorts, or career study groups.

---

## 4. University / B2B Institutional Licensing

### Rationale
University career centers are chronically under-resourced and cannot provide personalized guidance to every student. PathWise replaces or supplements career counselor capacity at scale. The sales motion is top-down (career center director or provost office) with bottom-up user adoption.

### Pricing Tiers

| Tier | Students | Annual Price | Per Student | Included |
|---|---|---|---|---|
| Starter | Up to 100 | $2,400/year | $24/student | Full Pro for all students, admin dashboard (basic), CSV reporting |
| Growth | Up to 500 | $8,500/year | $17/student | Everything in Starter + SSO (SAML/OAuth), LMS embed (Canvas/Blackboard iFrame), cohort analytics |
| Campus | Up to 1,000 | $14,000/year | $14/student | Everything in Growth + dedicated success manager, custom branding, API access, SLA 99.9% |
| Enterprise | 1,000+ | Custom | ~$12/student | Everything in Campus + data residency options, security review, custom integrations |

### Admin Dashboard (included from Growth tier)
- Cohort-level completion rates (not individual — privacy by default)
- Aggregate career match distribution (what careers is this cohort targeting?)
- Engagement metrics (weekly active users, assessment completion rate)
- Bulk student onboarding (CSV upload or SSO auto-provision)
- Admin can award Pro status to individual students (override)

### Integration Capabilities
- **SSO:** SAML 2.0, OAuth 2.0 / OIDC (supports Azure AD, Okta, Google Workspace)
- **LMS embed:** iFrame embed for Canvas, Blackboard, Moodle — deep link directly to assessment or roadmap
- **API access (Campus+):** Pull anonymized cohort data into institutional BI tools
- **Email domain matching:** Students who sign up with a verified university email auto-provision to the institution's license

### Pilot Program Structure
**Duration:** 12 weeks (one semester)
**Size:** Up to 50 students, no charge
**What's included:** Full Pro access, bi-weekly check-in with PathWise success team, end-of-pilot cohort report
**Conversion path:** Pilot institutions that see >40% student engagement convert to paid at a 20% first-year discount
**Success metric we track:** Assessment completion rate, 4-week retention, student-reported career clarity (NPS survey at week 6 and week 12)

---

## 5. Revenue Projections

### Individual Subscriptions

| Scenario | Total Users | Conversion Rate | Paying Users | Monthly Revenue | Annual Revenue |
|---|---|---|---|---|---|
| Early traction | 1,000 | 5% | 50 | $649 | $7,788 |
| Growth stage | 5,000 | 5% | 250 | $3,247 | $38,964 |
| Scale | 10,000 | 8% | 800 | $10,392 | $124,704 |

**Assumptions:**
- Average revenue per paying user blended between monthly ($12.99) and annual ($9.99/mo) — assumed 60% annual, 40% monthly → blended ARPU ~$10.79/month
- 5% conversion is conservative for a PLG product with a strong free tier and well-timed upgrade prompts. Industry benchmarks for PLG B2C products: 3–8%
- 8% at 10,000 users reflects improved conversion from user-generated data informing better upgrade prompts

### University Licensing

| Deal Type | Students | Annual Price | Notes |
|---|---|---|---|
| Starter pilot → conversion | 100 | $2,400 | First-year typical entry point |
| Growth deal | 500 | $8,500 | Mid-size university career center |
| Campus deal | 1,000 | $14,000 | Large state university |

**Two Growth deals + one Starter = $19,400/year** from 3 university partnerships alone — comparable to 500 individual Pro subscribers.

### Blended Projection (realistic 18-month target)

| Stream | Annual |
|---|---|
| Individual Pro (5,000 users, 5% conversion) | $38,964 |
| 3 university deals (1x Campus, 2x Growth) | $31,000 |
| **Total** | **~$70,000 ARR** |

This is a realistic, non-heroic 18-month target for a two-sided distribution strategy.

---

## 6. Implementation Plan

### Phase 1: Frontend Gating (Weeks 1–2)
**No backend changes required for initial implementation.** The `plan` field is already returned from `/auth/me` and stored in the auth context.

**Steps:**
1. Create a `usePlan()` hook that reads `user.plan` from auth context and returns `isPro: boolean`
2. Create a `<ProGate>` component that wraps Pro-only UI sections:
   ```tsx
   // Usage: wrap any Pro-only element
   <ProGate trigger="skill_gap_resources" skill={gap.skill}>
     <LearningResources resources={gap.resources} />
   </ProGate>
   ```
   The `<ProGate>` component renders a blur overlay + lock icon when `!isPro`, and fires `upgrade_prompt_shown` to PostHog on mount.
3. Apply `<ProGate>` to:
   - Career matches 4+ on the results page
   - Skill gap resource links
   - Certificate component (already exists at `/src/pages/Certificate/`)
   - Radar chart / advanced analytics
   - Career identity card share view
4. Add the AI task count to user state — decrement on each generation, reset monthly

### Phase 2: Backend Enforcement (Weeks 2–3)
Frontend gating is a UX experience, not a security boundary. Backend enforcement is required before launch.

**Assessment service (`assessment.ts`):**
- When returning `careerMatches`, check the user's plan. If `free`, slice the array to 3 results before returning.
  ```typescript
  const matches = JSON.parse(row.career_matches);
  const visibleMatches = userPlan === 'free' ? matches.slice(0, 3) : matches;
  ```
- When returning `skillGaps`, check plan. If `free`, return gaps without the `learningResource` field.

**Tasks service:**
- Add a `monthly_task_count` column to the users table (or a separate task_usage table with user_id + month + count).
- On each AI task generation request, check count against limit (5 for free). Reject with a clear error if exceeded.
- Error response must NOT say "403 Forbidden" — it must return a structured error the frontend can detect and display the upgrade prompt.

**Recommended error shape:**
```typescript
throw APIError.resourceExhausted("monthly_task_limit_reached");
// Frontend catches this specific code and shows the upgrade modal
```

### Phase 3: Stripe Integration (Weeks 3–5)

**Architecture:**
- Add `stripe_customer_id` and `stripe_subscription_id` columns to the `users` table
- Create a new `billing` Encore service with endpoints:
  - `POST /billing/checkout` — creates a Stripe Checkout session, returns URL
  - `POST /billing/portal` — creates a Stripe Customer Portal session for self-service cancellation/upgrade/downgrade
  - `POST /billing/webhook` — receives Stripe webhook events
- On `checkout.session.completed` webhook: update `users.plan = 'premium'`, store `stripe_customer_id` and `stripe_subscription_id`
- On `customer.subscription.deleted` or `customer.subscription.updated` (to free): update `users.plan = 'free'`
- On `invoice.payment_failed`: send a dunning email (first failure: grace period 3 days; second failure: downgrade to free, send "Your Pro access has paused" email)

**Stripe products to create:**
- Product: "PathWise Pro Monthly" — $12.99/month recurring
- Product: "PathWise Pro Annual" — $119.88/year recurring (= $9.99/month)
- Product: "PathWise Peer Plan" — $149.99/year recurring, quantity: 6 (or use Stripe's multi-seat billing)

**Trial period:** 14 days.
- On upgrade click, create a Stripe Checkout session with `trial_period_days: 14`
- No credit card required during trial — use Stripe's card-optional trial configuration
- At day 11, send "Your free trial ends in 3 days" email
- At day 14, if no card added, silently expire the trial and revert to free

**Rationale for 14 days (not 7):** 7 days is not enough to complete a roadmap milestone and experience the full Pro value cycle. 14 days gives users two full work weeks. Industry data shows 14-day trials convert at roughly the same rate as 7-day trials but with higher post-trial retention because users have built habits.

### Tracking Events (PostHog)

All events must be instrumented before the gating ships. No feature launches without measurement.

| Event | Properties | Fired When |
|---|---|---|
| `upgrade_prompt_shown` | `trigger`, `plan`, `user_id` | Every time a Pro gate renders for a free user |
| `upgrade_clicked` | `trigger`, `plan`, `user_id` | User clicks any upgrade CTA |
| `upgrade_dismissed` | `trigger`, `plan`, `user_id` | User dismisses upgrade modal |
| `checkout_started` | `plan_type` (monthly/annual), `trial` (bool) | Stripe Checkout session created |
| `checkout_completed` | `plan_type`, `revenue` | Stripe webhook fires on successful payment |
| `trial_started` | `user_id` | Trial begins |
| `trial_converted` | `user_id`, `days_into_trial` | Trial converts to paid |
| `trial_expired` | `user_id` | Trial ends without conversion |
| `subscription_cancelled` | `user_id`, `reason` (from cancellation survey) | Stripe subscription deleted |
| `task_limit_reached` | `user_id`, `tasks_used`, `reset_date` | 5th task generated in a month |
| `feature_gated` | `feature`, `user_id` | User attempts to access any Pro feature |

**Funnel to instrument:**
`upgrade_prompt_shown` → `upgrade_clicked` → `checkout_started` → `checkout_completed`

Target: >30% of `upgrade_clicked` events result in `checkout_completed` within 30 minutes.

---

## 7. Churn Prevention

### Why Users Cancel (and how to preempt each)

**Reason 1: "I finished my roadmap and don't need it anymore."**
Most common for goal-oriented users who complete a roadmap and see no next step.
Prevention: At 80% roadmap completion, surface a "What's your next career goal?" prompt. Offer to generate a new roadmap for a complementary role. Frame it as a new chapter, not a repeat.
Metric: Track `roadmap_completion_rate` and measure upgrade + re-engagement rate at 80% vs 100% completion.

**Reason 2: "I'm not using it enough to justify $12.99."**
User is engaged but infrequent. They don't feel they're getting ROI.
Prevention: Weekly email digest — "Here's what you accomplished this week on your career path." Must include at least one concrete number (tasks completed, % progress, streak). If user has zero activity that week, send a re-engagement prompt instead ("Your roadmap is waiting. Pick up where you left off.").

**Reason 3: "I forgot I was paying for it."**
Passive churn — credit card charged, user hasn't logged in.
Prevention: If a user has not logged in for 14 days, trigger an in-app notification + email. If 30 days of inactivity on a paying account, send a personal-feeling email from the founder: "We noticed you haven't been back — is there anything we can do better?"

**Reason 4: "It got too expensive."**
Most common at renewal.
Prevention: At annual renewal, send a "renewal coming up" email 14 days before with a summary of the year: tasks completed, milestones hit, career readiness score improvement. Make the value visible before the charge hits.

**Reason 5: "I found something else."**
Competitive switch. Hardest to prevent.
Prevention: Cancellation survey (required — do not let users cancel without a 1-question reason selector). Route "found something else" responses to the founder for a personal reply within 24 hours offering a 1-month free extension in exchange for a 15-minute call.

### Win-Back Campaigns

**Trigger:** User downgrades or cancels.
**Day 0:** Confirmation email — "Your Pro access ends on [date]. Your data is safe and will be here when you're ready to continue."
**Day 14:** "A lot has changed on PathWise" email — highlight any new features released since they cancelled. CTA: "Come back and see what's new."
**Day 45:** 30% discount offer — "We want you back. Get Pro for $9.09/month (30% off) for your first 3 months." Time-limited: 7 days to claim.
**Day 90:** Final touch — "Is there anything we could have done better?" Survey link. No upgrade pitch. Pure learning.

### Annual Plan Incentives

The annual plan is the single most effective churn prevention mechanism — users who pay annually have 4x lower churn than monthly subscribers (industry benchmark).

**Incentives to drive annual adoption:**
1. Price savings (23% discount — $9.99 vs $12.99/month)
2. At checkout, show the monthly vs annual comparison prominently: "Save $36 this year"
3. After 30 days on monthly plan, show an in-app prompt: "You've been Pro for 30 days. Switch to annual and get 2 months free."
4. Annual plan users get a "PathWise Committed" badge on their public profile — social proof for the commitment signal
5. Annual users are prioritized in any future beta programs ("Early access to new features")

---

## 8. Competitive Positioning of the Paywall

The paywall philosophy here is: **earn the upgrade, don't force it.**

Do not put the assessment behind a paywall. Do not show a paywall before the user has experienced value. Do not use dark patterns (fake countdown timers, hidden cancel buttons). PathWise is in the career guidance business — the brand depends on being trustworthy at a moment when users are emotionally vulnerable about their career decisions.

The paywall sits at the point of **depth and ongoing guidance** — not at the door.

**What this looks like in practice:**
- First session: entirely free, ends with the user seeing their top 3 career matches and their roadmap. No upgrade prompt during the first session.
- Upgrade prompt appears organically as the user tries to go deeper (more matches, more tasks, resources).
- The upgrade experience never feels punitive — it feels like unlocking something the user already wants.

---

## 9. Open Questions Before Implementation

1. **Stripe account setup:** Does the team have a Stripe account configured? Needs to be in live mode (not test) before any real billing.
2. **Trial card-optional policy:** Stripe supports card-optional trials. Confirm this is the desired UX — card-optional increases trial starts but may reduce conversion quality. Recommendation: card-optional for first 90 days at launch to maximize trial data, then evaluate.
3. **University sales motion:** Who owns the B2B outreach? This requires a separate sales process from the self-serve PLG funnel. Recommend designating one founder as the university sales lead before building the admin dashboard.
4. **Peer Plan implementation complexity:** Requires group management (invites, seats, billing owner). This is non-trivial to build correctly. Keep it Phase 2 and validate demand with a waitlist first.
5. **Cancellation survey tool:** Use Typeform embedded in the cancellation flow, or build native? Recommendation: Typeform for speed, native when you have >500 cancellations to analyze.

---

*Document owner: Product / Growth*
*Next review: After first 50 Pro conversions — validate trigger performance and adjust gating as needed*
