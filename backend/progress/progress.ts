import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { listTasks } from "../tasks/tasks";
import { getRoadmap } from "../roadmap/roadmap";

export interface ReadinessBreakdown {
  milestoneProgress: number;  // 0–100, weighted by position (30%)
  taskCompletion: number;     // 0–100 (20%)
  categoryBalance: number;    // 0–100 — penalizes all-learning / no-networking (15%)
  momentum: number;           // 0–100 — tasks completed in last 14 days (10%)
  overall: number;            // 0–100 weighted composite
}

export interface ProgressStats {
  roadmapCompletion: number;
  tasksFinished: number;
  tasksRemaining: number;
  jobReadinessScore: number;
  careerReadinessScore: number;
  breakdown: ReadinessBreakdown;
}

export interface GetProgressResponse {
  stats: ProgressStats;
}

// GET /progress/:userId
export const getProgress = api(
  { expose: true, method: "GET", path: "/progress/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetProgressResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) {
      throw APIError.permissionDenied("you can only view your own progress");
    }

    const [{ roadmap }, { tasks }] = await Promise.all([
      getRoadmap({ userId }),
      listTasks({ userId }),
    ]);

    const milestones = roadmap?.milestones ?? [];
    const roadmapCompletion = roadmap?.completionPercent ?? 0;
    const tasksFinished = tasks.filter(t => t.status === "done").length;
    const tasksRemaining = tasks.filter(t => t.status !== "done").length;
    const totalTasks = tasks.length;

    // ── 1. Milestone Progress (30%) — position-weighted ─────────────────────
    // Later milestones count more because they're harder and closer to the goal
    const totalMilestones = milestones.length;
    let weightedScore = 0;
    let maxWeight = 0;
    for (let i = 0; i < totalMilestones; i++) {
      const weight = (i + 1) / totalMilestones;
      maxWeight += weight;
      const m = milestones[i];
      if (m.status === "completed") weightedScore += weight;
      else if (m.status === "in_progress") weightedScore += weight * 0.3;
    }
    const milestoneProgress = maxWeight > 0
      ? Math.round((weightedScore / maxWeight) * 100)
      : 0;

    // ── 2. Task Completion (20%) ─────────────────────────────────────────────
    const taskCompletion = totalTasks > 0
      ? Math.round((tasksFinished / totalTasks) * 100)
      : 0;

    // ── 3. Category Balance (15%) ────────────────────────────────────────────
    // Penalizes users who only do "learning" and skip networking/portfolio
    const requiredCategories = ["learning", "networking", "portfolio", "interview_prep"];
    const completedCategories = new Set(
      tasks.filter(t => t.status === "done").map(t => t.category ?? "learning")
    );
    const categoryBalance = Math.round(
      (requiredCategories.filter(c => completedCategories.has(c)).length
        / requiredCategories.length) * 100
    );

    // ── 4. Momentum (10%) ────────────────────────────────────────────────────
    // Tasks completed in the last 14 days (3+ = full score)
    const twoWeeksAgo = Date.now() - 14 * 86400 * 1000;
    const recentCompletions = tasks.filter(t =>
      t.status === "done" &&
      t.completedAt &&
      new Date(t.completedAt).getTime() > twoWeeksAgo
    ).length;
    const momentum = Math.min(100, Math.round((recentCompletions / 3) * 100));

    // ── 5. Legacy task pct for backward compat ───────────────────────────────
    const taskCompletionRate = totalTasks > 0 ? (tasksFinished / totalTasks) * 100 : 0;

    // ── Composite scores ─────────────────────────────────────────────────────
    const overall = Math.round(
      milestoneProgress * 0.35 +
      taskCompletion    * 0.20 +
      categoryBalance   * 0.25 +
      momentum          * 0.10 +
      // bonus 10% from roadmap stored completion (reflects any manual updates)
      roadmapCompletion * 0.10
    );

    const breakdown: ReadinessBreakdown = {
      milestoneProgress,
      taskCompletion,
      categoryBalance,
      momentum,
      overall,
    };

    return {
      stats: {
        roadmapCompletion,
        tasksFinished,
        tasksRemaining,
        jobReadinessScore:    overall,
        careerReadinessScore: Math.round(milestoneProgress * 0.4 + taskCompletionRate * 0.3 + categoryBalance * 0.3),
        breakdown,
      },
    };
  }
);
