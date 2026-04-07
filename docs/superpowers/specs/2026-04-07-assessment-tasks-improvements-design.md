# Assessment, Onboarding, Career DB & Task Panel — Design Spec

**Date:** 2026-04-07
**Scope:** 4 independent improvements to PathWise core features

---

## 1. Assessment Multi-Select

### Problem
Steps 0-4 (19 questions) are single-select only. Users want to express multiple interests/preferences, leading to inaccurate career matches.

### Solution
- Change steps 0-4 from single-select to **multi-select (up to 3 per question)**
- Frontend: toggle chip UI — tap to select/deselect, visual indicator for selected state, "Pick up to 3" hint
- State change: `answers: Record<string, string>` → `answers: Record<string, string[]>`
- Step 5 already supports multi-select (skills/domains) — keep as-is
- Backend scoring: when user picks N options, each gets `1/N` weight in the scoring dimension (e.g., pick 2 interests → each contributes 50% to interest score)

### Files affected
- `src/pages/Assessment/index.tsx` — UI changes, state type, submission logic
- `backend/assessment/career-brain.ts` — scoring engine to handle array answers
- `backend/assessment/assessment.ts` — submission handler to accept array answers

---

## 2. Mandatory Assessment Onboarding

### Problem
New users land on dashboard after signup but don't realize they need to take the assessment first. The assessment is the core value — without it, nothing else works.

### Solution
- On Dashboard load: check if user has completed an assessment (call `assessment.getResult(userId)`)
- If NO assessment: show a **full-width welcome hero card** replacing the dashboard content
  - Headline: "Welcome to PathWise!"
  - Subtext: "Take a 5-minute career assessment to unlock your personalized roadmap, tasks, and skill insights."
  - Big CTA button: "Start Your Assessment →" links to `/app/assessment`
  - Show a preview of what they'll unlock (roadmap, tasks, progress tracking)
- If assessment EXISTS: show normal dashboard
- Simple boolean gate — no new backend endpoint needed, just use existing `assessment.getResult()`

### Files affected
- `src/pages/Dashboard/index.tsx` — add assessment check and welcome hero

---

## 3. Expand Career Database

### Problem
50 professions is too few. Missing major career domains.

### Solution
Add 40+ new professions in a new file `career-profiles-3.ts`:

**New domains to cover:**
- **Law:** Lawyer, Paralegal, Legal Analyst, Compliance Officer
- **Architecture/Construction:** Architect, Civil Engineer, Construction Manager, Interior Designer
- **Media/Journalism:** Journalist, Editor, Public Relations Specialist, Communications Manager
- **Real Estate:** Real Estate Agent, Property Manager, Real Estate Analyst
- **Trades:** Electrician, Plumber, HVAC Technician, Welder
- **Government/Policy:** Policy Analyst, Government Affairs Specialist, Urban Planner, Diplomat
- **Arts/Entertainment:** Musician, Actor, Film Director, Animator, Game Designer
- **Agriculture/Environment:** Agricultural Scientist, Environmental Engineer, Conservation Biologist, Park Ranger
- **Logistics/Operations:** Supply Chain Manager, Logistics Coordinator, Operations Manager, Warehouse Manager
- **Aviation/Transport:** Pilot, Air Traffic Controller, Maritime Officer
- **Hospitality/Tourism:** Hotel Manager, Event Planner, Travel Agent, Chef
- **Science/Research:** Research Scientist, Lab Technician, Pharmacist, Veterinarian
- **Social Services:** Social Worker, Counselor, Nonprofit Manager, Community Organizer

Each profile follows the existing `CareerProfile` interface with full RIASEC mapping, work styles, values, environment prefs, skills, certifications, and milestones.

### Files affected
- Create: `backend/assessment/career-profiles-3.ts`
- Modify: `backend/assessment/career-brain.ts` — import and register new profiles
- Modify: `src/pages/Assessment/index.tsx` — add new interest domains to Step 5 if needed

---

## 4. Task Detail/Edit Panel

### Problem
Tasks are view-only cards. No way to click into a task to see full details, edit fields, or delete.

### Solution
- **Slide-over panel** from the right side (480px wide, overlay with backdrop)
- Opens when clicking any task card (Board view) or task row (List view)
- Panel contents:
  - **Title:** editable text input
  - **Description:** editable textarea (auto-expand)
  - **Status:** dropdown (To Do / In Progress / Done)
  - **Priority:** dropdown (Low / Medium / High)
  - **Category:** dropdown (Learning / Portfolio / Networking / Interview Prep / Certification / Reflection)
  - **Due Date:** date input
  - **Created:** read-only timestamp
  - **Milestone:** read-only label (if assigned)
- **Actions:**
  - "Save Changes" button — calls `PATCH /tasks/:taskId` with changed fields
  - "Delete Task" button (red, with confirmation dialog) — needs new `DELETE /tasks/:taskId` endpoint
- Close via X button, Escape key, or clicking backdrop
- Optimistic UI: update local state immediately, revert on error

### Files affected
- Create: `src/components/TaskDetailPanel.tsx` — the slide-over component
- Modify: `src/pages/Tasks/index.tsx` — add click handlers, state for selected task, render panel
- Modify: `backend/tasks/tasks.ts` — add DELETE endpoint
- Modify: `src/lib/api.ts` — add `tasks.delete()` method
- Modify: `src/App.css` — slide-over panel styles
