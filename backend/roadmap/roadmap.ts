import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData, checkAdmin } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";
import { getAssessment } from "../assessment/assessment";
import { createTask } from "../tasks/tasks";
import { getMilestonesForRole } from "../assessment/career-brain";
import { awardAchievement } from "../streaks/streaks";

const db = new SQLDatabase("roadmap", { migrations: "./migrations" });

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: "locked" | "in_progress" | "completed";
  dueDate?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  completionPercent: number;
  milestones: Milestone[];
}

export interface GetRoadmapResponse {
  roadmap: Roadmap | null;
}

// GET /roadmap/:userId
export const getRoadmap = api(
  { expose: true, method: "GET", path: "/roadmap/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetRoadmapResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== userId) {
      throw APIError.permissionDenied("you can only view your own roadmap");
    }

    const roadmapRow = await db.queryRow`
      SELECT id, user_id, target_role, completion_percent, estimated_weeks
      FROM roadmaps WHERE user_id = ${userId}
    `;
    if (!roadmapRow) return { roadmap: null };

    const milestones: Milestone[] = [];
    const rows = db.query`
      SELECT id, title, description, status, due_date
      FROM milestones WHERE roadmap_id = ${roadmapRow.id}
      ORDER BY position ASC
    `;
    for await (const row of rows) {
      milestones.push({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        dueDate: row.due_date ?? undefined,
      });
    }

    return {
      roadmap: {
        id: roadmapRow.id,
        userId: roadmapRow.user_id,
        targetRole: roadmapRow.target_role,
        completionPercent: roadmapRow.completion_percent,
        estimatedWeeks: roadmapRow.estimated_weeks ?? undefined,
        milestones,
      },
    };
  }
);

interface AIMilestone {
  title: string;
  description: string;
  durationWeeks: number;
  tasks: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    category: string;
  }[];
}

function generateFromBrain(params: {
  targetRole: string;
  timeline: string;
  currentSkills: string[];
  skillGaps: string[];
}): { milestones: AIMilestone[] } {
  const brainMilestones = getMilestonesForRole(params.targetRole);

  // Convert brain milestones to AIMilestone format with tasks
  const milestones: AIMilestone[] = brainMilestones.map((m, i) => {
    const categories = ["research", "learning", "portfolio", "networking", "interview_prep", "research"];
    return {
      title: m.title,
      description: m.description,
      durationWeeks: m.estimatedWeeks,
      tasks: m.tasks.map((t, j) => ({
        title: t,
        description: t,
        priority: (j === 0 ? "high" : j === 1 ? "medium" : "low") as "high" | "medium" | "low",
        category: categories[i] ?? "learning",
      })),
    };
  });

  // Adapt milestones based on user's assessment data
  const adapted = adaptMilestones(milestones, params.currentSkills, params.skillGaps);

  return { milestones: adapted };
}

// -- Adaptive milestone logic ------------------------------------------------

function skillMatches(skill: string, text: string): boolean {
  return text.toLowerCase().includes(skill.toLowerCase());
}

function calcSkillOverlap(milestone: AIMilestone, currentSkills: string[]): number {
  if (currentSkills.length === 0) return 0;
  const textsToCheck = [milestone.title, ...milestone.tasks.map(t => t.title)];
  let matched = 0;
  for (const text of textsToCheck) {
    if (currentSkills.some(skill => skillMatches(skill, text))) {
      matched++;
    }
  }
  return textsToCheck.length > 0 ? matched / textsToCheck.length : 0;
}

function milestoneRelatesTo(milestone: AIMilestone, skill: string): boolean {
  return skillMatches(skill, milestone.title) || skillMatches(skill, milestone.description);
}

function adaptMilestones(
  milestones: AIMilestone[],
  currentSkills: string[],
  skillGaps: string[],
): AIMilestone[] {
  if (currentSkills.length === 0 && skillGaps.length === 0) return milestones;

  const adapted = milestones.map(m => {
    const overlap = calcSkillOverlap(m, currentSkills);
    const isGapRelated = skillGaps.some(gap => milestoneRelatesTo(m, gap));

    // Accelerate milestones where user already has >60% of the skills
    if (overlap > 0.6 && !isGapRelated) {
      return {
        ...m,
        title: `Advanced: ${m.title}`,
        description: `Accelerated - you already have experience here. ${m.description}`,
        durationWeeks: Math.max(1, Math.round(m.durationWeeks / 2)),
      };
    }

    // Extend milestones that target known skill gaps
    if (isGapRelated) {
      return {
        ...m,
        description: `Key skill gap focus. ${m.description}`,
        durationWeeks: m.durationWeeks + 1,
      };
    }

    return { ...m };
  });

  // Add new milestones for skill gaps not covered by any existing milestone
  const uncoveredGaps = skillGaps.filter(
    gap => !milestones.some(m => milestoneRelatesTo(m, gap)),
  );

  if (uncoveredGaps.length > 0) {
    for (let i = 0; i < uncoveredGaps.length; i += 3) {
      const batch = uncoveredGaps.slice(i, i + 3);
      const newMilestone: AIMilestone = {
        title: `Skill Gap: ${batch.join(", ")}`,
        description: `Focused study on identified skill gaps: ${batch.join(", ")}.`,
        durationWeeks: 3,
        tasks: batch.map((gap, j) => ({
          title: `Learn ${gap} fundamentals`,
          description: `Study and practice ${gap} to close this skill gap.`,
          priority: (j === 0 ? "high" : j === 1 ? "medium" : "low") as "high" | "medium" | "low",
          category: "learning",
        })),
      };
      // Insert before the final milestone (usually Job Search)
      const insertPos = Math.max(0, adapted.length - 1);
      adapted.splice(insertPos, 0, newMilestone);
    }
  }

  return adapted;
}

// POST /roadmap/milestones/:milestoneId/complete — mark a milestone complete, unlock next
export const completeMilestone = api(
  { expose: true, method: "POST", path: "/roadmap/milestones/:milestoneId/complete", auth: true },
  async ({ milestoneId }: { milestoneId: string }): Promise<{ success: boolean; nextMilestoneId?: string }> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;

    // 1. Get the milestone and its roadmap
    const ms = await db.queryRow`
      SELECT id, roadmap_id, position FROM milestones WHERE id = ${milestoneId}
    `;
    if (!ms) throw new Error("Milestone not found");

    // Verify the milestone belongs to the authenticated user
    const roadmapOwner = await db.queryRow`
      SELECT user_id FROM roadmaps WHERE id = ${ms.roadmap_id}
    `;
    if (!roadmapOwner || roadmapOwner.user_id !== userID) {
      throw APIError.permissionDenied("you can only complete your own milestones");
    }

    // 2. Check all tasks for this milestone are complete
    try {
      const { checkMilestoneTasks } = await import("../tasks/tasks");
      const taskStatus = await checkMilestoneTasks({ milestoneId });
      if (taskStatus.total > 0 && !taskStatus.allComplete) {
        throw APIError.invalidArgument(
          `Complete all tasks first. ${taskStatus.done}/${taskStatus.total} tasks done.`
        );
      }
    } catch (err) {
      if (err instanceof APIError) throw err;
      // If tasks service is unavailable, allow completion
    }

    // 3. Mark this milestone as completed
    await db.exec`UPDATE milestones SET status = 'completed' WHERE id = ${milestoneId}`;

    // 3. Unlock the next milestone (position + 1)
    const next = await db.queryRow`
      SELECT id FROM milestones
      WHERE roadmap_id = ${ms.roadmap_id} AND position = ${ms.position + 1}
    `;
    let nextMilestoneId: string | undefined;
    if (next) {
      await db.exec`UPDATE milestones SET status = 'in_progress' WHERE id = ${next.id}`;
      nextMilestoneId = next.id;
    }

    // 4. Recalculate roadmap completion_percent
    const totalRow = await db.queryRow`SELECT COUNT(*) as cnt FROM milestones WHERE roadmap_id = ${ms.roadmap_id}`;
    const doneRow  = await db.queryRow`SELECT COUNT(*) as cnt FROM milestones WHERE roadmap_id = ${ms.roadmap_id} AND status = 'completed'`;
    const pct = totalRow && doneRow ? Math.round((Number(doneRow.cnt) / Number(totalRow.cnt)) * 100) : 0;
    await db.exec`UPDATE roadmaps SET completion_percent = ${pct} WHERE id = ${ms.roadmap_id}`;

    // Award milestone-based achievements
    const completedCount = Number(doneRow!.cnt);
    try {
      if (completedCount >= 3) {
        await awardAchievement({ userId: userID, badgeKey: "milestone_3" });
      }
      if (pct >= 100) {
        await awardAchievement({ userId: userID, badgeKey: "path_finisher" });
      }
    } catch {}

    // ── Notification: Milestone Complete ──
    try {
      const { createNotification } = await import("../streaks/streaks");
      const msTitle = await db.queryRow`SELECT title FROM milestones WHERE id = ${milestoneId}`;
      await createNotification({
        userId: userID,
        type: "progress",
        title: "Milestone Complete!",
        body: `You finished "${msTitle?.title ?? 'a milestone'}". On to the next one.`,
      });
    } catch {}

    // Generate unique certificate ID on 100% completion
    if (pct >= 100) {
      const existingCert = await db.queryRow`SELECT certificate_id FROM roadmaps WHERE id = ${ms.roadmap_id}`;
      if (!existingCert?.certificate_id) {
        const certId = `PW-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().substring(0, 4).toUpperCase()}`;
        await db.exec`UPDATE roadmaps SET certificate_id = ${certId}, certificate_issued_at = ${new Date().toISOString()} WHERE id = ${ms.roadmap_id}`;
      }
    }

    return { success: true, nextMilestoneId };
  }
);

// PATCH /roadmap/timeline — Rescale milestone dates without losing progress
export const updateTimeline = api(
  { expose: true, method: "PATCH", path: "/roadmap/timeline", auth: true },
  async (params: { userId: string; timeline: string }): Promise<GetRoadmapResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");

    const timelineRaw = params.timeline ?? "6mo";
    const timelineWeeks = timelineRaw === "3mo" ? 13 : timelineRaw === "12mo" ? 52 : 26;

    const roadmapRow = await db.queryRow`SELECT id FROM roadmaps WHERE user_id = ${params.userId}`;
    if (!roadmapRow) throw APIError.notFound("no roadmap found — generate one first");

    // Get all milestones (preserving their status, tasks, everything)
    const milestones: { id: string; estimatedWeeks: number; status: string }[] = [];
    const rows = db.query`
      SELECT id, estimated_weeks, status FROM milestones
      WHERE roadmap_id = ${roadmapRow.id} ORDER BY position ASC
    `;
    for await (const row of rows) {
      milestones.push({
        id: row.id,
        estimatedWeeks: row.estimated_weeks ?? 4,
        status: row.status,
      });
    }

    if (milestones.length === 0) throw APIError.notFound("no milestones to rescale");

    // Rescale durations proportionally to new timeline
    const totalRawWeeks = milestones.reduce((s, m) => s + m.estimatedWeeks, 0);
    const scaleFactor = totalRawWeeks > 0 ? timelineWeeks / totalRawWeeks : 1;
    const now = new Date();
    let cumulativeWeeks = 0;

    for (const m of milestones) {
      const newDuration = Math.max(1, Math.round(m.estimatedWeeks * scaleFactor));
      cumulativeWeeks += newDuration;
      const newDueDate = new Date(now.getTime() + cumulativeWeeks * 7 * 86400000).toISOString().split("T")[0];

      await db.exec`
        UPDATE milestones SET estimated_weeks = ${newDuration}, due_date = ${newDueDate}
        WHERE id = ${m.id}
      `;

      // Also update task due dates for this milestone
      await db.exec`UPDATE tasks SET due_date = ${newDueDate} WHERE milestone_id = ${m.id}`;
    }

    // Update roadmap estimated_weeks
    await db.exec`UPDATE roadmaps SET estimated_weeks = ${timelineWeeks} WHERE id = ${roadmapRow.id}`;

    // Return updated roadmap
    return getRoadmap({ userId: params.userId });
  }
);

export interface GenerateRoadmapParams {
  userId: string;
  targetRole: string;
  timeline?: string;
}

// POST /roadmap — Generate AI-powered career roadmap
export const generateRoadmap = api(
  { expose: true, method: "POST", path: "/roadmap", auth: true },
  async (params: GenerateRoadmapParams): Promise<GetRoadmapResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    RateLimits.roadmap("roadmap:" + userID);
    if (userID !== params.userId) throw APIError.permissionDenied("you can only generate your own roadmap");
    const timelineRaw = params.timeline ?? "6mo";
    // Parse timeline to total weeks
    const timelineWeeks = timelineRaw === "3mo" ? 13 : timelineRaw === "12mo" ? 52 : 26;

    // Pull assessment data if available for personalization
    let currentSkills: string[] = [];
    let skillGaps: string[] = [];
    try {
      const { result } = await getAssessment({ userId: params.userId });
      if (result) {
        currentSkills = result.currentSkills ?? [];
        skillGaps = (result.skillGaps ?? []).map((g: { skill: string }) => g.skill);
      }
    } catch {
      // Assessment not required — proceed without it
    }

    // Generate roadmap from career brain (local, no API)
    const aiResult = generateFromBrain({
      targetRole: params.targetRole,
      timeline: timelineRaw,
      currentSkills,
      skillGaps,
    });

    // Scale milestone durations to fit the user's chosen timeline
    const totalRawWeeks = aiResult.milestones.reduce((s, m) => s + (m.durationWeeks ?? 4), 0);
    const scaleFactor = totalRawWeeks > 0 ? timelineWeeks / totalRawWeeks : 1;
    for (const m of aiResult.milestones) {
      m.durationWeeks = Math.max(1, Math.round((m.durationWeeks ?? 4) * scaleFactor));
    }

    const roadmapId = crypto.randomUUID();
    const now = new Date();

    const skillGap = aiResult.milestones
      .flatMap(m => m.tasks ?? [])
      .map(t => t.category)
      .filter(Boolean);
    void skillGap; // will be stored below after we know finalRoadmapId

    await db.exec`
      INSERT INTO roadmaps (id, user_id, target_role, completion_percent,
                            skill_gap_current, skill_gap_required, skill_gap_gaps,
                            estimated_weeks, created_at)
      VALUES (
        ${roadmapId}, ${params.userId}, ${params.targetRole}, 0,
        ${JSON.stringify(currentSkills)},
        ${JSON.stringify([...currentSkills, ...skillGaps])},
        ${JSON.stringify(skillGaps)},
        ${aiResult.milestones.reduce((s, m) => s + (m.durationWeeks ?? 4), 0)},
        ${now.toISOString()}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        target_role      = excluded.target_role,
        completion_percent = 0,
        skill_gap_current  = excluded.skill_gap_current,
        skill_gap_required = excluded.skill_gap_required,
        skill_gap_gaps     = excluded.skill_gap_gaps,
        estimated_weeks    = excluded.estimated_weeks,
        created_at         = excluded.created_at
    `;

    // Re-fetch after upsert to get stable id
    const roadmapRow = await db.queryRow`
      SELECT id FROM roadmaps WHERE user_id = ${params.userId}
    `;
    const finalRoadmapId = roadmapRow!.id;

    // Clear old milestones and their tasks before regenerating
    try {
      // Delete tasks linked to old milestones
      const oldMilestoneRows = db.query`SELECT id FROM milestones WHERE roadmap_id = ${finalRoadmapId}`;
      for await (const mRow of oldMilestoneRows) {
        await db.exec`DELETE FROM tasks WHERE milestone_id = ${mRow.id}`;
      }
    } catch {}
    await db.exec`DELETE FROM milestones WHERE roadmap_id = ${finalRoadmapId}`;

    const milestones: Milestone[] = [];

    for (let i = 0; i < aiResult.milestones.length; i++) {
      const m = aiResult.milestones[i];
      const milestoneId = crypto.randomUUID();
      const status = i === 0 ? "in_progress" : "locked";

      // Compute due date based on cumulative weeks
      const weeksOffset = aiResult.milestones
        .slice(0, i + 1)
        .reduce((acc, ms) => acc + (ms.durationWeeks ?? 4), 0);
      const dueDate = new Date(now.getTime() + weeksOffset * 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await db.exec`
        INSERT INTO milestones (id, roadmap_id, title, description, status, due_date, position,
                                estimated_weeks)
        VALUES (${milestoneId}, ${finalRoadmapId}, ${m.title}, ${m.description}, ${status}, ${dueDate}, ${i},
                ${m.durationWeeks ?? 4})
      `;

      milestones.push({ id: milestoneId, title: m.title, description: m.description, status, dueDate });

      // Auto-generate tasks for each milestone via tasks service
      for (const t of m.tasks ?? []) {
        await createTask({
          userId: params.userId,
          milestoneId,
          title: t.title,
          description: t.description,
          priority: t.priority ?? "medium",
          category: t.category ?? "learning",
          dueDate,
          aiGenerated: true,
        });
      }
    }

    // Award "Roadmap Starter" achievement for generating a roadmap
    try { await awardAchievement({ userId: params.userId, badgeKey: "roadmap_starter" }); } catch {}

    // Notify user that their roadmap is ready
    try {
      const { createNotification } = await import("../streaks/streaks");
      await createNotification({
        userId: params.userId,
        type: "roadmap",
        title: "Roadmap Generated!",
        body: "Your personalised career roadmap is ready. Start your first milestone.",
      });
    } catch {}

    return {
      roadmap: {
        id: finalRoadmapId,
        userId: params.userId,
        targetRole: params.targetRole,
        completionPercent: 0,
        milestones,
      },
    };
  }
);

// GET /roadmap/certificate — retrieve the stored certificate for the authenticated user
export const getCertificate = api(
  { expose: true, method: "GET", path: "/roadmap/certificate", auth: true },
  async (): Promise<{ certificate: { id: string; targetRole: string; issuedAt: string; userName: string } | null }> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;

    const row = await db.queryRow`
      SELECT r.certificate_id, r.certificate_issued_at, r.target_role
      FROM roadmaps r WHERE r.user_id = ${userID} AND r.certificate_id IS NOT NULL
    `;

    if (!row) return { certificate: null };

    return {
      certificate: {
        id: row.certificate_id,
        targetRole: row.target_role,
        issuedAt: row.certificate_issued_at,
        userName: '', // Will be filled by frontend from auth context
      },
    };
  }
);

// ── Internal: get milestone title by ID ──
export const getMilestoneTitle = api(
  { expose: false },
  async ({ milestoneId }: { milestoneId: string }): Promise<{ title: string | null }> => {
    const row = await db.queryRow`SELECT title FROM milestones WHERE id = ${milestoneId}`;
    return { title: row?.title ?? null };
  }
);

// ── Admin Endpoints ──────────────────────────────────────────────────────────

export interface AdminRoadmapStatsResponse {
  userIdsWithRoadmap: string[];
  totalRoadmaps: number;
}

export const adminRoadmapStats = api(
  { expose: true, method: "GET", path: "/admin/roadmap-stats", auth: true },
  async (): Promise<AdminRoadmapStatsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const userIds: string[] = [];
    try {
      const rows = db.query`SELECT user_id FROM roadmaps`;
      for await (const row of rows) {
        userIds.push(row.user_id);
      }
    } catch {}

    return { userIdsWithRoadmap: userIds, totalRoadmaps: userIds.length };
  }
);

export interface AdminUserRoadmapStatus {
  userId: string;
  hasRoadmap: boolean;
  milestonesTotal: number;
  milestonesCompleted: number;
}

export interface AdminUserRoadmapStatusResponse {
  statuses: AdminUserRoadmapStatus[];
}

export const adminUserRoadmapStatus = api(
  { expose: true, method: "GET", path: "/admin/roadmap-user-status", auth: true },
  async (): Promise<AdminUserRoadmapStatusResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const statuses: AdminUserRoadmapStatus[] = [];
    try {
      const rows = db.query`
        SELECT r.user_id,
               (SELECT COUNT(*) FROM milestones WHERE roadmap_id = r.id) AS total,
               (SELECT COUNT(*) FROM milestones WHERE roadmap_id = r.id AND status = 'completed') AS completed
        FROM roadmaps r
      `;
      for await (const row of rows) {
        statuses.push({
          userId: row.user_id,
          hasRoadmap: true,
          milestonesTotal: Number(row.total),
          milestonesCompleted: Number(row.completed),
        });
      }
    } catch {}

    return { statuses };
  }
);

export const adminDeleteUserRoadmap = api(
  { expose: true, method: "DELETE", path: "/admin/user-roadmap/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    // Delete milestones first (FK to roadmaps)
    try {
      const roadmapRow = await db.queryRow`SELECT id FROM roadmaps WHERE user_id = ${userId}`;
      if (roadmapRow) {
        await db.exec`DELETE FROM milestones WHERE roadmap_id = ${roadmapRow.id}`;
      }
    } catch {}
    await db.exec`DELETE FROM roadmaps WHERE user_id = ${userId}`;
    return { success: true };
  }
);
