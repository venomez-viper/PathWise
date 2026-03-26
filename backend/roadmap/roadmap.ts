import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

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

export interface GenerateRoadmapParams {
  userId: string;
  targetRole: string;
}

// POST /roadmap — Generate and store a new career roadmap for a user
export const generateRoadmap = api(
  { expose: true, method: "POST", path: "/roadmap" },
  async (params: GenerateRoadmapParams): Promise<GetRoadmapResponse> => {
    const roadmapId = crypto.randomUUID();

    // Default milestone templates per role (TODO: replace with AI-generated milestones)
    const defaultMilestones = [
      { title: "Self Assessment & Goal Setting",   description: "Clarify your strengths, values, and target role requirements.", status: "in_progress" as const },
      { title: "Skill Gap Analysis",               description: "Identify the skills you need to develop to reach your target role.", status: "locked" as const },
      { title: "Learning & Certification Plan",    description: "Complete key courses and earn relevant certifications.", status: "locked" as const },
      { title: "Portfolio & Projects",             description: "Build 2–3 projects that demonstrate your capabilities.", status: "locked" as const },
      { title: "Networking & Outreach",            description: "Connect with professionals in your target field.", status: "locked" as const },
      { title: "Job Applications & Interviews",    description: "Apply to roles and prepare for technical and behavioural interviews.", status: "locked" as const },
    ];

    await db.exec`
      INSERT INTO roadmaps (id, user_id, target_role, completion_percent)
      VALUES (${roadmapId}, ${params.userId}, ${params.targetRole}, 0)
      ON CONFLICT (user_id) DO UPDATE SET target_role = excluded.target_role
    `;

    // Re-fetch id after upsert in case it already existed
    const roadmapRow = await db.queryRow`
      SELECT id FROM roadmaps WHERE user_id = ${params.userId}
    `;
    const finalRoadmapId = roadmapRow!.id;

    // Clear old milestones and insert fresh ones
    await db.exec`DELETE FROM milestones WHERE roadmap_id = ${finalRoadmapId}`;

    const milestones: Milestone[] = [];
    for (let i = 0; i < defaultMilestones.length; i++) {
      const m = defaultMilestones[i];
      const milestoneId = crypto.randomUUID();
      await db.exec`
        INSERT INTO milestones (id, roadmap_id, title, description, status, position)
        VALUES (${milestoneId}, ${finalRoadmapId}, ${m.title}, ${m.description}, ${m.status}, ${i})
      `;
      milestones.push({ id: milestoneId, ...m });
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
