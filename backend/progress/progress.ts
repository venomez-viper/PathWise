import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Progress reads from both tasks and roadmap databases
const tasksDb  = new SQLDatabase("tasks",   { migrations: "../tasks/migrations" });
const roadmapDb = new SQLDatabase("roadmap", { migrations: "../roadmap/migrations" });

export interface ProgressStats {
  roadmapCompletion: number;    // 0–100
  tasksFinished: number;
  tasksRemaining: number;
  jobReadinessScore: number;    // 0–100 (derived metric)
  careerReadinessScore: number; // 0–100 (derived metric)
}

export interface GetProgressResponse {
  stats: ProgressStats;
}

// GET /progress/:userId
export const getProgress = api(
  { expose: true, method: "GET", path: "/progress/:userId" },
  async ({ userId }: { userId: string }): Promise<GetProgressResponse> => {
    // Roadmap completion %
    const roadmapRow = await roadmapDb.queryRow`
      SELECT completion_percent FROM roadmaps WHERE user_id = ${userId}
    `;
    const roadmapCompletion = roadmapRow?.completion_percent ?? 0;

    // Task counts
    const totalRow = await tasksDb.queryRow`
      SELECT
        COUNT(*) FILTER (WHERE status = 'done')                       AS finished,
        COUNT(*) FILTER (WHERE status IN ('todo', 'in_progress'))     AS remaining
      FROM tasks WHERE user_id = ${userId}
    `;
    const tasksFinished   = Number(totalRow?.finished  ?? 0);
    const tasksRemaining  = Number(totalRow?.remaining ?? 0);
    const totalTasks      = tasksFinished + tasksRemaining;

    // Job readiness: weighted blend of roadmap completion + task completion rate
    const taskCompletionRate = totalTasks > 0 ? (tasksFinished / totalTasks) * 100 : 0;
    const jobReadinessScore  = Math.round(roadmapCompletion * 0.6 + taskCompletionRate * 0.4);

    // Career readiness: broader score that also factors in milestones
    const milestoneRow = await roadmapDb.queryRow`
      SELECT
        COUNT(*) FILTER (WHERE m.status = 'completed') AS completed,
        COUNT(*)                                        AS total
      FROM milestones m
      JOIN roadmaps r ON r.id = m.roadmap_id
      WHERE r.user_id = ${userId}
    `;
    const completedMilestones = Number(milestoneRow?.completed ?? 0);
    const totalMilestones     = Number(milestoneRow?.total     ?? 0);
    const milestoneRate       = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const careerReadinessScore = Math.round(roadmapCompletion * 0.4 + milestoneRate * 0.4 + taskCompletionRate * 0.2);

    return {
      stats: {
        roadmapCompletion,
        tasksFinished,
        tasksRemaining,
        jobReadinessScore,
        careerReadinessScore,
      },
    };
  }
);
