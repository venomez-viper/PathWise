import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { secret } from "encore.dev/config";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeForPrompt } from "../shared/sanitize";

const db = new SQLDatabase("tasks", { migrations: "./migrations" });
const anthropicKey = secret("AnthropicAPIKey");

export interface Task {
  id: string;
  userId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ListTasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}

// GET /tasks?userId=
export const listTasks = api(
  { expose: true, method: "GET", path: "/tasks", auth: true },
  async ({ userId }: { userId: string }): Promise<ListTasksResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) {
      throw APIError.permissionDenied("you can only view your own tasks");
    }

    const tasks: Task[] = [];
    const rows = db.query`
      SELECT id, user_id, milestone_id, title, description, status, priority,
             category, due_date, completed_at, created_at
      FROM tasks WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    for await (const row of rows) {
      tasks.push({
        id: row.id,
        userId: row.user_id,
        milestoneId: row.milestone_id ?? undefined,
        title: row.title,
        description: row.description ?? undefined,
        status: row.status,
        priority: row.priority,
        category: row.category ?? "learning",
        dueDate: row.due_date ?? undefined,
        completedAt: row.completed_at ?? undefined,
        createdAt: row.created_at,
      });
    }
    return { tasks };
  }
);

export interface CreateTaskParams {
  userId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  category?: string;
  dueDate?: string;
  aiGenerated?: boolean;
}

// POST /tasks
export const createTask = api(
  { expose: true, method: "POST", path: "/tasks", auth: true },
  async (params: CreateTaskParams): Promise<TaskResponse> => {
    // Auth check — getAuthData may be null for internal service-to-service calls
    const auth = getAuthData<AuthData>();
    if (auth && auth.userID !== params.userId) throw APIError.permissionDenied("not your data");
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const priority = params.priority ?? "medium";
    const category = params.category ?? "learning";

    await db.exec`
      INSERT INTO tasks (id, user_id, milestone_id, title, description, status, priority,
                         category, due_date, ai_generated, created_at)
      VALUES (
        ${id}, ${params.userId}, ${params.milestoneId ?? null},
        ${params.title}, ${params.description ?? null},
        'todo', ${priority}, ${category},
        ${params.dueDate ?? null}, ${params.aiGenerated ?? false}, ${now}
      )
    `;

    return {
      task: {
        id,
        userId: params.userId,
        milestoneId: params.milestoneId,
        title: params.title,
        description: params.description,
        status: "todo",
        priority,
        category,
        dueDate: params.dueDate,
        createdAt: now,
      },
    };
  }
);

export interface UpdateTaskParams {
  taskId: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  title?: string;
  description?: string;
  dueDate?: string;
}

// PATCH /tasks/:taskId
export const updateTask = api(
  { expose: true, method: "PATCH", path: "/tasks/:taskId", auth: true },
  async ({ taskId, ...updates }: UpdateTaskParams): Promise<TaskResponse> => {
    const { userID } = getAuthData<AuthData>()!;

    const row = await db.queryRow`
      SELECT id, user_id, milestone_id, title, description, status, priority,
             category, due_date, completed_at, created_at
      FROM tasks WHERE id = ${taskId}
    `;
    if (!row) throw new Error(`Task ${taskId} not found`);

    if (row.user_id !== userID) {
      throw APIError.permissionDenied("you can only update your own tasks");
    }

    const newStatus   = updates.status      ?? row.status;
    const newPriority = updates.priority    ?? row.priority;
    const newTitle    = updates.title       ?? row.title;
    const newDesc     = updates.description ?? row.description;
    const newDueDate  = updates.dueDate     ?? row.due_date;

    // Set completed_at when transitioning to done; clear it when un-done
    const newCompletedAt =
      newStatus === "done" && row.status !== "done"
        ? new Date().toISOString()
        : newStatus !== "done"
          ? null
          : (row.completed_at ?? null);

    await db.exec`
      UPDATE tasks
      SET status = ${newStatus}, priority = ${newPriority},
          title = ${newTitle}, description = ${newDesc},
          due_date = ${newDueDate}, completed_at = ${newCompletedAt}
      WHERE id = ${taskId}
    `;

    return {
      task: {
        id: row.id,
        userId: row.user_id,
        milestoneId: row.milestone_id ?? undefined,
        title: newTitle,
        description: newDesc ?? undefined,
        status: newStatus,
        priority: newPriority,
        category: row.category ?? "learning",
        dueDate: newDueDate ?? undefined,
        completedAt: newCompletedAt ?? undefined,
        createdAt: row.created_at,
      },
    };
  }
);

export interface GenerateTasksParams {
  userId: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneDescription: string;
  targetRole: string;
}

// POST /tasks/generate/milestone — AI task generation for a specific roadmap milestone
export const aiGenerateTasks = api(
  { expose: true, method: "POST", path: "/tasks/generate/milestone", auth: true },
  async (params: GenerateTasksParams): Promise<{ tasks: Task[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    const client = new Anthropic({ apiKey: anthropicKey() });
    const safeTargetRole = sanitizeForPrompt(params.targetRole, 200);
    const safeMilestoneTitle = sanitizeForPrompt(params.milestoneTitle, 300);
    const safeMilestoneDescription = sanitizeForPrompt(params.milestoneDescription, 500);

    const prompt = `You are an expert career coach. Generate exactly 4 specific, actionable tasks for someone working toward "${safeTargetRole}" on this career milestone:

Milestone: "${safeMilestoneTitle}"
Description: "${safeMilestoneDescription}"

Respond with ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "title": "Specific actionable task title",
    "description": "Exactly what to do and expected outcome",
    "priority": "high",
    "category": "learning"
  }
]

Requirements:
- Exactly 4 tasks, each concrete and measurable
- Categories: learning, portfolio, networking, interview_prep, research
- Priorities: high, medium, low
- Tasks must directly advance the milestone goal and target role
- No vague tasks like "study X" — be specific (e.g. "Complete Coursera Machine Learning course Module 3 and take notes")`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected AI response");

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI tasks response");

    const aiTasks: { title: string; description: string; priority: string; category: string }[] =
      JSON.parse(jsonMatch[0]);

    const now = new Date().toISOString();
    const createdTasks: Task[] = [];

    for (const t of aiTasks.slice(0, 4)) {
      const id = crypto.randomUUID();
      const priority = (["low", "medium", "high"].includes(t.priority) ? t.priority : "medium") as Task["priority"];
      const category = t.category ?? "learning";

      await db.exec`
        INSERT INTO tasks (id, user_id, milestone_id, title, description, status, priority,
                           category, due_date, ai_generated, created_at)
        VALUES (
          ${id}, ${params.userId}, ${params.milestoneId},
          ${t.title}, ${t.description ?? null},
          'todo', ${priority}, ${category},
          null, true, ${now}
        )
      `;

      createdTasks.push({
        id,
        userId: params.userId,
        milestoneId: params.milestoneId,
        title: t.title,
        description: t.description,
        status: "todo",
        priority,
        category,
        createdAt: now,
      });
    }

    return { tasks: createdTasks };
  }
);

export interface CustomGenerateTasksParams {
  userId: string;
  prompt: string;           // user's free-text description
  targetRole?: string;
  milestoneId?: string;
  count?: number;           // how many tasks to generate (default 4)
}

// POST /tasks/generate/custom
export const customGenerateTasks = api(
  { expose: true, method: "POST", path: "/tasks/generate/custom", auth: true },
  async (params: CustomGenerateTasksParams): Promise<{ tasks: Task[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    const client = new Anthropic({ apiKey: anthropicKey() });
    const count = params.count ?? 4;
    const safePrompt = sanitizeForPrompt(params.prompt, 500);
    const safeTargetRole = params.targetRole ? sanitizeForPrompt(params.targetRole, 200) : undefined;

    const prompt = `You are an expert career coach. The user wants help with: "${safePrompt}"
${safeTargetRole ? `Their target role is: ${safeTargetRole}` : ''}

Generate exactly ${count} specific, actionable tasks based on what they asked for.

Respond with ONLY a valid JSON array:
[
  {
    "title": "Specific task title (max 80 chars)",
    "description": "Exactly what to do and the expected outcome (1-2 sentences)",
    "priority": "high",
    "category": "learning"
  }
]

Categories: learning, portfolio, networking, interview_prep, research
Priorities: high, medium, low
Make each task concrete and completable within 1-3 days. No vague tasks.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected AI response");

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI tasks");

    const aiTasks: { title: string; description: string; priority: string; category: string }[] =
      JSON.parse(jsonMatch[0]);

    const now = new Date().toISOString();
    const createdTasks: Task[] = [];

    for (const t of aiTasks.slice(0, count)) {
      const id = crypto.randomUUID();
      const priority = (["low", "medium", "high"].includes(t.priority) ? t.priority : "medium") as Task["priority"];
      const category = t.category ?? "learning";

      await db.exec`
        INSERT INTO tasks (id, user_id, milestone_id, title, description, status, priority,
                           category, due_date, ai_generated, created_at)
        VALUES (
          ${id}, ${params.userId}, ${params.milestoneId ?? null},
          ${t.title}, ${t.description ?? null},
          'todo', ${priority}, ${category},
          null, true, ${now}
        )
      `;

      createdTasks.push({
        id,
        userId: params.userId,
        milestoneId: params.milestoneId,
        title: t.title,
        description: t.description,
        status: "todo",
        priority,
        category,
        createdAt: now,
      });
    }

    return { tasks: createdTasks };
  }
);
