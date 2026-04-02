import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import Anthropic from "@anthropic-ai/sdk";
import { getAssessment } from "../assessment/assessment";
import { createTask } from "../tasks/tasks";
import { callClaudeWithRetry } from "../shared/ai-utils";

const db = new SQLDatabase("roadmap", { migrations: "./migrations" });
const anthropicKey = secret("AnthropicAPIKey");

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
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) {
      throw APIError.permissionDenied("you can only view your own roadmap");
    }

    const roadmapRow = await db.queryRow`
      SELECT id, user_id, target_role, completion_percent
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

async function generateWithClaude(params: {
  targetRole: string;
  timeline: string;
  currentSkills: string[];
  skillGaps: string[];
}): Promise<{ milestones: AIMilestone[] }> {
  const prompt = `You are an expert career coach. Create a personalized career roadmap for someone targeting "${params.targetRole}" with a ${params.timeline} timeline.

Current skills: ${params.currentSkills.join(", ") || "Not provided"}
Key skill gaps to address: ${params.skillGaps.join(", ") || "General upskilling needed"}

Respond with ONLY a valid JSON object (no markdown, no dashes, no code fences):
{
  "milestones": [
    {
      "title": "Milestone title (action-oriented)",
      "description": "What you'll accomplish and why it matters for ${params.targetRole}",
      "durationWeeks": 4,
      "tasks": [
        {
          "title": "Specific actionable task",
          "description": "Exactly what to do and the expected outcome",
          "priority": "high",
          "category": "learning"
        }
      ]
    }
  ]
}

Requirements:
- Exactly 6 milestones, covering the full ${params.timeline} timeline
- Each milestone has 3-5 specific, measurable tasks
- Tasks are concrete and role-specific
- Task categories: learning, portfolio, networking, interview_prep, research
- Milestones progress: foundations → skills → projects → networking → job search → landing the role`;

  const fallback = {
    milestones: [
      { title: "Foundations & Research", description: `Build foundational knowledge for ${params.targetRole}.`, durationWeeks: 4, tasks: [{ title: `Research ${params.targetRole} role requirements`, description: "Study job descriptions and identify core competencies.", priority: "high", category: "research" }] },
      { title: "Core Skill Building", description: "Develop the most critical technical skills.", durationWeeks: 4, tasks: [{ title: "Start an online course in your top skill gap", description: "Enroll on Coursera, Udemy, or LinkedIn Learning.", priority: "high", category: "learning" }] },
      { title: "Portfolio Development", description: "Build projects that demonstrate your abilities.", durationWeeks: 4, tasks: [{ title: "Create a portfolio project", description: "Build something relevant to your target role.", priority: "high", category: "portfolio" }] },
      { title: "Networking & Community", description: "Build professional connections.", durationWeeks: 4, tasks: [{ title: "Connect with 5 professionals in your field", description: "Reach out on LinkedIn with personalized messages.", priority: "medium", category: "networking" }] },
      { title: "Interview Preparation", description: "Prepare for the job search process.", durationWeeks: 4, tasks: [{ title: "Practice interview questions", description: "Use AI mock interviews and practice common questions.", priority: "high", category: "interview_prep" }] },
      { title: "Job Search & Applications", description: "Apply strategically to your target roles.", durationWeeks: 4, tasks: [{ title: "Apply to 10 relevant positions", description: "Tailor your resume for each application.", priority: "high", category: "research" }] },
    ],
  };

  return callClaudeWithRetry({
    apiKey: anthropicKey(),
    model: "claude-opus-4-6",
    maxTokens: 3000,
    prompt,
    retries: 2,
    fallback,
  });
}

// POST /roadmap/milestones/:milestoneId/complete — mark a milestone complete, unlock next
export const completeMilestone = api(
  { expose: true, method: "POST", path: "/roadmap/milestones/:milestoneId/complete", auth: true },
  async ({ milestoneId }: { milestoneId: string }): Promise<{ success: boolean; nextMilestoneId?: string }> => {
    const { userID } = getAuthData<AuthData>()!;

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

    // 2. Mark this milestone as completed
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

    return { success: true, nextMilestoneId };
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
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("you can only generate your own roadmap");
    const timeline = params.timeline ?? "6 months";

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

    // Generate AI roadmap
    const aiResult = await generateWithClaude({
      targetRole: params.targetRole,
      timeline,
      currentSkills,
      skillGaps,
    });

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

    // Clear old milestones and tasks linked to this roadmap
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
