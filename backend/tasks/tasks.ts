import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

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
  { expose: true, method: "GET", path: "/tasks" },
  async ({ userId }: { userId: string }): Promise<ListTasksResponse> => {
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
  { expose: true, method: "POST", path: "/tasks" },
  async (params: CreateTaskParams): Promise<TaskResponse> => {
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
  { expose: true, method: "PATCH", path: "/tasks/:taskId" },
  async ({ taskId, ...updates }: UpdateTaskParams): Promise<TaskResponse> => {
    const row = await db.queryRow`
      SELECT id, user_id, milestone_id, title, description, status, priority,
             category, due_date, completed_at, created_at
      FROM tasks WHERE id = ${taskId}
    `;
    if (!row) throw new Error(`Task ${taskId} not found`);

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
