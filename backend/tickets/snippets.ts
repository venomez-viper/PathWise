import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { AuthData, checkSupportAccess } from "../auth/auth";

const db = SQLDatabase.named("tickets");

interface Snippet {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

const MAX_TITLE = 80;
const MAX_BODY = 4000;
const MAX_SNIPPETS_PER_USER = 50;

async function requireSupport(userID: string): Promise<void> {
  const { canAccessTickets } = await checkSupportAccess({ userID });
  if (!canAccessTickets) throw APIError.permissionDenied("support access required");
}

function validateTitle(title: string): string {
  const trimmed = (title ?? "").trim();
  if (!trimmed) throw APIError.invalidArgument("title is required");
  if (trimmed.length > MAX_TITLE) throw APIError.invalidArgument(`title too long (max ${MAX_TITLE} characters)`);
  return trimmed;
}

function validateBody(body: string): string {
  const trimmed = (body ?? "").trim();
  if (!trimmed) throw APIError.invalidArgument("body is required");
  if (trimmed.length > MAX_BODY) throw APIError.invalidArgument(`body too long (max ${MAX_BODY} characters)`);
  return trimmed;
}

export const listMySnippets = api(
  { expose: true, method: "GET", path: "/admin/snippets", auth: true },
  async (): Promise<{ snippets: Snippet[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireSupport(userID);

    const snippets: Snippet[] = [];
    const rows = db.query`
      SELECT id, title, body, created_at, updated_at
      FROM support_snippets
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
    `;
    for await (const row of rows) {
      snippets.push({
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    return { snippets };
  }
);

export const createSnippet = api(
  { expose: true, method: "POST", path: "/admin/snippets", auth: true },
  async (params: { title: string; body: string }): Promise<Snippet> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireSupport(userID);

    const title = validateTitle(params.title);
    const body = validateBody(params.body);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Atomic insert-with-cap. The previous SELECT-COUNT-then-INSERT pattern
    // was a TOCTOU race: two concurrent requests could each read N < limit
    // and both insert, blowing past MAX_SNIPPETS_PER_USER. The conditional
    // INSERT below evaluates the count and the insert in the same statement
    // — at most one of two concurrent requests at the boundary can return
    // a row. RETURNING-empty is the rejection signal.
    const inserted = await db.queryRow<{ id: string }>`
      INSERT INTO support_snippets (id, user_id, title, body, created_at, updated_at)
      SELECT ${id}, ${userID}, ${title}, ${body}, ${now}, ${now}
      WHERE (SELECT COUNT(*) FROM support_snippets WHERE user_id = ${userID}) < ${MAX_SNIPPETS_PER_USER}
      RETURNING id
    `;
    if (!inserted) {
      throw APIError.resourceExhausted(`snippet limit reached (max ${MAX_SNIPPETS_PER_USER})`);
    }

    return { id, title, body, createdAt: now, updatedAt: now };
  }
);

export const updateSnippet = api(
  { expose: true, method: "PATCH", path: "/admin/snippets/:id", auth: true },
  async (params: { id: string; title: string; body: string }): Promise<Snippet> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireSupport(userID);

    const title = validateTitle(params.title);
    const body = validateBody(params.body);

    const existing = await db.queryRow<{ user_id: string; created_at: string }>`
      SELECT user_id, created_at FROM support_snippets WHERE id = ${params.id}
    `;
    if (!existing) throw APIError.notFound("snippet not found");
    if (existing.user_id !== userID) throw APIError.permissionDenied("not your snippet");

    const now = new Date().toISOString();
    await db.exec`
      UPDATE support_snippets
      SET title = ${title}, body = ${body}, updated_at = ${now}
      WHERE id = ${params.id}
    `;

    return { id: params.id, title, body, createdAt: existing.created_at, updatedAt: now };
  }
);

export const deleteSnippet = api(
  { expose: true, method: "DELETE", path: "/admin/snippets/:id", auth: true },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    await requireSupport(userID);

    const existing = await db.queryRow<{ user_id: string }>`
      SELECT user_id FROM support_snippets WHERE id = ${id}
    `;
    if (!existing) throw APIError.notFound("snippet not found");
    if (existing.user_id !== userID) throw APIError.permissionDenied("not your snippet");

    await db.exec`DELETE FROM support_snippets WHERE id = ${id}`;
    return { success: true };
  }
);
