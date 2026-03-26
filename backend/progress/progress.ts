import { api } from "encore.dev/api";
import { listTasks } from "../tasks/tasks";
import { getRoadmap } from "../roadmap/roadmap";

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
    // Fetch roadmap data
    const { roadmap } = await getRoadmap({ userId });
    const roadmapCompletion = roadmap?.completionPercent ?? 0;

    const completedMilestones = roadmap?.milestones.filter(m => m.status === "completed").length ?? 0;
    const totalMilestones     = roadmap?.milestones.length ?? 0;
    const milestoneRate       = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Fetch task data
    const { tasks } = await listTasks({ userId });
    const tasksFinished  = tasks.filter(t => t.status === "done").length;
    const tasksRemaining = tasks.filter(t => t.status !== "done").length;
    const totalTasks     = tasks.length;

    const taskCompletionRate  = totalTasks > 0 ? (tasksFinished / totalTasks) * 100 : 0;
    const jobReadinessScore   = Math.round(roadmapCompletion * 0.6 + taskCompletionRate * 0.4);
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
