import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import Anthropic from "@anthropic-ai/sdk";
import { getAssessment } from "../assessment/assessment";
import { createTask } from "../tasks/tasks";

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
  { expose: true, method: "GET", path: "/roadmap/:userId" },
  async ({ userId }: { userId: string }): Promise<GetRoadmapResponse> => {
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
  const client = new Anthropic({ apiKey: anthropicKey() });

  const prompt = `You are an expert career coach. Create a personalized career roadmap for someone targeting "${params.targetRole}" with a ${params.timeline} timeline.

Current skills: ${params.currentSkills.join(", ") || "Not provided"}
Key skill gaps to address: ${params.skillGaps.join(", ") || "General upskilling needed"}

Respond with ONLY a valid JSON object (no markdown, no explanation):
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
- Tasks are concrete and role-specific (e.g., "Build a portfolio project using React" not "Learn coding")
- Task categories: learning, portfolio, networking, interview_prep, research
- Tasks should directly address the skill gaps and build toward "${params.targetRole}"
- Milestones should progress logically: foundations → skills → projects → networking → job search → landing the role`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected AI response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse AI roadmap response");

  return JSON.parse(jsonMatch[0]);
}

export interface GenerateRoadmapParams {
  userId: string;
  targetRole: string;
  timeline?: string;
}

// POST /roadmap — Generate AI-powered career roadmap
export const generateRoadmap = api(
  { expose: true, method: "POST", path: "/roadmap" },
  async (params: GenerateRoadmapParams): Promise<GetRoadmapResponse> => {
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

    await db.exec`
      INSERT INTO roadmaps (id, user_id, target_role, completion_percent)
      VALUES (${roadmapId}, ${params.userId}, ${params.targetRole}, 0)
      ON CONFLICT (user_id) DO UPDATE SET target_role = excluded.target_role, completion_percent = 0
    `;

    // Re-fetch after upsert to get stable id
    const roadmapRow = await db.queryRow`
      SELECT id FROM roadmaps WHERE user_id = ${params.userId}
    `;
    const finalRoadmapId = roadmapRow!.id;

    // Clear old milestones and tasks linked to this roadmap
    await db.exec`DELETE FROM milestones WHERE roadmap_id = ${finalRoadmapId}`;

    const milestones: Milestone[] = [];
    const now = new Date();

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
        INSERT INTO milestones (id, roadmap_id, title, description, status, due_date, position)
        VALUES (${milestoneId}, ${finalRoadmapId}, ${m.title}, ${m.description}, ${status}, ${dueDate}, ${i})
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
          dueDate,
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
