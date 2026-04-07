import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData, checkAdmin } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { sanitizeForPrompt } from "../shared/sanitize";
import { getMilestonesForRole } from "../assessment/career-brain";
import { awardAchievement } from "../streaks/streaks";

const db = new SQLDatabase("tasks", { migrations: "./migrations" });

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
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
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
  category?: string;
  dueDate?: string;
}

// PATCH /tasks/:taskId
export const updateTask = api(
  { expose: true, method: "PATCH", path: "/tasks/:taskId", auth: true },
  async ({ taskId, ...updates }: UpdateTaskParams): Promise<TaskResponse> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;

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
    const newCategory = updates.category    ?? row.category;
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
          category = ${newCategory}, due_date = ${newDueDate},
          completed_at = ${newCompletedAt}
      WHERE id = ${taskId}
    `;

    // Award task-based achievements when transitioning to done
    if (newStatus === "done" && row.status !== "done") {
      try {
        const doneCountRow = await db.queryRow`SELECT COUNT(*) as cnt FROM tasks WHERE user_id = ${row.user_id} AND status = 'done'`;
        const doneCount = Number(doneCountRow?.cnt ?? 0);

        if (doneCount >= 5) await awardAchievement({ userId: row.user_id, badgeKey: "skill_master" });
        if (doneCount >= 10) await awardAchievement({ userId: row.user_id, badgeKey: "task_10" });
        if (doneCount >= 25) await awardAchievement({ userId: row.user_id, badgeKey: "task_25" });

        // Early bird: completed before 9 AM local server time
        const hour = new Date().getHours();
        if (hour < 9) await awardAchievement({ userId: row.user_id, badgeKey: "early_bird" });
      } catch {}
    }

    return {
      task: {
        id: row.id,
        userId: row.user_id,
        milestoneId: row.milestone_id ?? undefined,
        title: newTitle,
        description: newDesc ?? undefined,
        status: newStatus,
        priority: newPriority,
        category: newCategory ?? "learning",
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

// POST /tasks/generate/milestone — Generate tasks from career brain for a milestone
export const aiGenerateTasks = api(
  { expose: true, method: "POST", path: "/tasks/generate/milestone", auth: true },
  async (params: GenerateTasksParams): Promise<{ tasks: Task[] }> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");

    // Find matching milestone from brain and extract its tasks
    const milestones = getMilestonesForRole(params.targetRole);
    const match = milestones.find(m =>
      m.title.toLowerCase().includes(params.milestoneTitle.toLowerCase()) ||
      params.milestoneTitle.toLowerCase().includes(m.title.toLowerCase())
    );

    const categories = ["learning", "portfolio", "networking", "interview_prep", "research"];
    const taskArray = match
      ? match.tasks.map((t, i) => ({
          title: t,
          description: t,
          priority: i === 0 ? "high" : i === 1 ? "high" : "medium",
          category: categories[i % categories.length],
        }))
      : [
          { title: `Research ${params.targetRole} requirements`, description: "Study job descriptions and core competencies.", priority: "high", category: "research" },
          { title: "Complete a relevant online course module", description: "Pick a course addressing your primary skill gap.", priority: "high", category: "learning" },
          { title: "Build a mini portfolio piece", description: "Create a small project demonstrating a key skill.", priority: "medium", category: "portfolio" },
          { title: "Connect with a professional in the field", description: "Send a personalized LinkedIn message.", priority: "medium", category: "networking" },
        ];

    const now = new Date().toISOString();
    const createdTasks: Task[] = [];

    for (const t of taskArray.slice(0, 4)) {
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

// DELETE /tasks/:taskId
export const deleteTask = api(
  { expose: true, method: "DELETE", path: "/tasks/:taskId", auth: true },
  async (params: { taskId: string }): Promise<{ success: boolean }> => {
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    // Verify the task belongs to this user
    const task = await db.queryRow`
      SELECT id FROM tasks WHERE id = ${params.taskId} AND user_id = ${userID}
    `;
    if (!task) throw APIError.notFound("task not found");
    await db.exec`DELETE FROM tasks WHERE id = ${params.taskId}`;
    return { success: true };
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
    const authData = getAuthData<AuthData>();
    if (!authData) throw APIError.unauthenticated("session invalid");
    const { userID } = authData;
    if (userID !== params.userId) throw APIError.permissionDenied("not your data");
    const count = params.count ?? 4;
    const safePrompt = sanitizeForPrompt(params.prompt, 500);

    // Generate tasks from brain milestones if target role available, else generic
    const milestones = params.targetRole ? getMilestonesForRole(params.targetRole) : [];
    const brainTasks = milestones.flatMap(m => m.tasks);

    const aiTasks: { title: string; description: string; priority: string; category: string }[] =
      brainTasks.length > 0
        ? brainTasks.slice(0, count).map((t, i) => ({
            title: t,
            description: t,
            priority: i < 2 ? "high" : "medium",
            category: ["learning", "portfolio", "networking", "research"][i % 4],
          }))
        : [
            { title: `Research: ${safePrompt.slice(0, 60)}`, description: "Study requirements and identify key skills needed.", priority: "high", category: "research" },
            { title: "Find an online course for your top skill gap", description: "Search Coursera, LinkedIn Learning, or Udemy.", priority: "high", category: "learning" },
            { title: "Build a small demo project", description: "Create something that demonstrates your learning.", priority: "medium", category: "portfolio" },
            { title: "Connect with someone in this field", description: "Send a personalized LinkedIn message to a professional.", priority: "medium", category: "networking" },
          ].slice(0, count);

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

// ── Admin Endpoints ──────────────────────────────────────────────────────────

export interface AdminTaskStats {
  userId: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface AdminTaskStatsResponse {
  stats: AdminTaskStats[];
  totalTasks: number;
  completedTasks: number;
}

export const adminTaskStats = api(
  { expose: true, method: "GET", path: "/admin/task-stats", auth: true },
  async (): Promise<AdminTaskStatsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const stats: AdminTaskStats[] = [];
    let totalTasks = 0;
    let completedTasks = 0;

    try {
      const rows = db.query`
        SELECT user_id,
               COUNT(*) as task_count,
               COUNT(*) FILTER (WHERE status = 'done') as completed_count
        FROM tasks GROUP BY user_id
      `;
      for await (const row of rows) {
        const taskCount = Number(row.task_count);
        const completedTaskCount = Number(row.completed_count);
        stats.push({
          userId: row.user_id,
          taskCount,
          completedTaskCount,
        });
        totalTasks += taskCount;
        completedTasks += completedTaskCount;
      }
    } catch {}

    return { stats, totalTasks, completedTasks };
  }
);

export const adminDeleteUserTasks = api(
  { expose: true, method: "DELETE", path: "/admin/user-tasks/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    await db.exec`DELETE FROM tasks WHERE user_id = ${userId}`;
    return { success: true };
  }
);
