import { api, APIError } from "encore.dev/api";
import { getAuthData } from "encore.dev/internal/codegen/auth";
import { AuthData, checkAdmin } from "../auth/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { RateLimits } from "../shared/rate-limiter";

const db = new SQLDatabase("streaks", { migrations: "./migrations" });

// ── BADGE DEFINITIONS ─────────────────────────────────────────────────────────
const BADGES = [
  { key: "first_steps", title: "First Steps", description: "Complete your career assessment and discover your strengths.", xp: 50 },
  { key: "roadmap_starter", title: "Roadmap Starter", description: "Generate your first personalized career roadmap.", xp: 100 },
  { key: "streak_7", title: "7-Day Streak", description: "Show up for 7 days in a row — consistency beats intensity.", xp: 150 },
  { key: "skill_master", title: "Skill Master", description: "Finish 5 tasks and prove you can execute.", xp: 200 },
  { key: "networker", title: "Networker", description: "Connect with 3 industry mentors.", xp: 150 },
  { key: "interview_ready", title: "Interview Ready", description: "Complete the AI interview simulation.", xp: 200 },
  { key: "path_finisher", title: "Path Finisher", description: "Complete every milestone in your career roadmap.", xp: 500 },
  { key: "top_contributor", title: "Top Contributor", description: "Share 10 helpful resources in forums.", xp: 100 },
  { key: "task_10", title: "Task Crusher", description: "Complete 10 tasks — you're building real momentum.", xp: 100 },
  { key: "task_25", title: "Productivity Machine", description: "Complete 25 tasks — unstoppable.", xp: 250 },
  { key: "early_bird", title: "Early Bird", description: "Complete a task before 9 AM — the early career-changer gets the job.", xp: 75 },
  { key: "milestone_3", title: "Halfway There", description: "Complete 3 milestones on your roadmap.", xp: 200 },
];

// ── STREAKS ───────────────────────────────────────────────────────────────────

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  consistencyScore: number;
  totalXp: number;
  weeklyProgress: boolean[];
  activeDays: string[];
}

export interface GetStreakResponse { streak: StreakData; }

export const getStreak = api(
  { expose: true, method: "GET", path: "/streaks/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetStreakResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    let row = await db.queryRow`SELECT current_streak, best_streak, last_active_date, consistency_score, total_xp FROM streaks WHERE user_id = ${userId}`;
    if (!row) {
      await db.exec`INSERT INTO streaks (user_id) VALUES (${userId})`;
      row = { current_streak: 0, best_streak: 0, last_active_date: null, consistency_score: 0, total_xp: 0 };
    }

    // Fetch activity log for this user (last 365 days)
    const activeDays: string[] = [];
    try {
      const cutoff = new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0];
      const rows = db.query`SELECT active_date FROM activity_log WHERE user_id = ${userId} AND active_date >= ${cutoff} ORDER BY active_date`;
      for await (const r of rows) {
        activeDays.push((r as any).active_date);
      }
    } catch {}

    // Build weekly progress (Mon-Sun) from actual activity_log data
    const activeDaysSet = new Set(activeDays);
    const today = new Date();
    const todayDow = today.getDay(); // 0=Sun
    const mondayOffset = todayDow === 0 ? 6 : todayDow - 1; // days since Monday
    const weeklyProgress: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - mondayOffset + i);
      const dateStr = d.toISOString().split("T")[0];
      weeklyProgress.push(activeDaysSet.has(dateStr));
    }

    return {
      streak: {
        currentStreak: (row as any).current_streak,
        bestStreak: (row as any).best_streak,
        lastActiveDate: (row as any).last_active_date,
        consistencyScore: (row as any).consistency_score,
        totalXp: (row as any).total_xp,
        weeklyProgress,
        activeDays,
      },
    };
  }
);

// Record daily activity (called when user completes a task)
export const recordActivity = api(
  { expose: true, method: "POST", path: "/streaks/record", auth: true },
  async ({ userId }: { userId: string }): Promise<GetStreakResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");
    // No-op for repeat calls within the same day (the function short-circuits
    // anyway), but the rate limit prevents a bot from hammering the endpoint
    // and writing notifications/XP rows in a tight loop.
    RateLimits.tasks("streak:" + userID);

    const today = new Date().toISOString().split("T")[0];
    let row = await db.queryRow`SELECT current_streak, best_streak, last_active_date, consistency_score, total_xp FROM streaks WHERE user_id = ${userId}`;

    if (!row) {
      await db.exec`INSERT INTO streaks (user_id, current_streak, best_streak, last_active_date, total_xp) VALUES (${userId}, 1, 1, ${today}, 10)`;
      try { await db.exec`INSERT INTO activity_log (user_id, active_date) VALUES (${userId}, ${today}) ON CONFLICT DO NOTHING`; } catch {}
      return getStreak({ userId });
    }

    // Log this day in activity_log
    try { await db.exec`INSERT INTO activity_log (user_id, active_date) VALUES (${userId}, ${today}) ON CONFLICT DO NOTHING`; } catch {}

    const r = row as any;
    const lastDate = r.last_active_date;
    if (lastDate === today) return getStreak({ userId }); // already recorded today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newStreak = lastDate === yesterday ? r.current_streak + 1 : 1;
    const newBest = Math.max(r.best_streak, newStreak);
    const newXp = r.total_xp + 10;
    const newConsistency = Math.min(100, Math.round((newStreak / 14) * 100));

    await db.exec`UPDATE streaks SET current_streak = ${newStreak}, best_streak = ${newBest}, last_active_date = ${today}, consistency_score = ${newConsistency}, total_xp = ${newXp}, updated_at = datetime('now') WHERE user_id = ${userId}`;

    // Award streak badges
    if (newStreak >= 7) {
      try { await awardAchievement({ userId, badgeKey: "streak_7" }); } catch {}
    }

    // ── Notification: Streak Milestones ──
    const streakMilestones: Record<number, string> = {
      3: "Three days strong! A habit is forming.",
      7: "One full week! Consistency is your superpower.",
      14: "Two weeks locked in. You're building something real.",
      30: "30-day streak! You're unstoppable.",
    };
    if (streakMilestones[newStreak]) {
      try {
        await createNotification({
          userId,
          type: "streak",
          title: `${newStreak}-Day Streak!`,
          body: streakMilestones[newStreak],
        });
      } catch {}
    }

    return getStreak({ userId });
  }
);

// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  badgeKey: string;
  title: string;
  description: string;
  earnedAt: string | null;
}

export interface GetAchievementsResponse {
  achievements: Achievement[];
  totalBadges: number;
  earnedCount: number;
  totalXp: number;
  seasonProgress: { level: string; currentXp: number; nextLevelXp: number };
}

export const getAchievements = api(
  { expose: true, method: "GET", path: "/streaks/achievements/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetAchievementsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    const earnedRows = await db.query`SELECT badge_key, title, description, earned_at FROM achievements WHERE user_id = ${userId}`;
    const earned = new Map<string, any>();
    for await (const row of earnedRows) {
      const r = row as any;
      earned.set(r.badge_key, r);
    }

    const streakRow = await db.queryRow`SELECT total_xp FROM streaks WHERE user_id = ${userId}`;
    const totalXp = (streakRow as any)?.total_xp ?? 0;

    const achievements: Achievement[] = BADGES.map(b => ({
      id: b.key,
      badgeKey: b.key,
      title: b.title,
      description: b.description,
      earnedAt: earned.has(b.key) ? earned.get(b.key).earned_at : null,
    }));

    const level = totalXp >= 2000 ? "Expert" : totalXp >= 1000 ? "Advanced" : totalXp >= 500 ? "Intermediate" : "Beginner";
    const nextXp = totalXp >= 2000 ? 3000 : totalXp >= 1000 ? 2000 : totalXp >= 500 ? 1000 : 500;

    return {
      achievements,
      totalBadges: BADGES.length,
      earnedCount: earned.size,
      totalXp,
      seasonProgress: { level, currentXp: totalXp, nextLevelXp: nextXp },
    };
  }
);

export const awardAchievement = api(
  { expose: false },
  async ({ userId, badgeKey }: { userId: string; badgeKey: string }): Promise<{ success: boolean }> => {

    const badge = BADGES.find(b => b.key === badgeKey);
    if (!badge) throw APIError.notFound("badge not found");

    const exists = await db.queryRow`SELECT id FROM achievements WHERE user_id = ${userId} AND badge_key = ${badgeKey}`;
    if (exists) return { success: true }; // already earned

    const id = crypto.randomUUID();
    await db.exec`INSERT INTO achievements (id, user_id, badge_key, title, description) VALUES (${id}, ${userId}, ${badgeKey}, ${badge.title}, ${badge.description})`;
    await db.exec`UPDATE streaks SET total_xp = total_xp + ${badge.xp} WHERE user_id = ${userId}`;

    // Create notification
    await createNotification({ userId, type: "achievement", title: "New Achievement!", body: `You've unlocked the "${badge.title}" badge. Keep building that momentum.` });

    return { success: true };
  }
);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getNotifications = api(
  { expose: true, method: "GET", path: "/streaks/notifications/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetNotificationsResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    const rows = await db.query`SELECT id, type, title, body, read, created_at FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;
    const notifications: Notification[] = [];
    let unreadCount = 0;
    for await (const row of rows) {
      const r = row as any;
      const notif = { id: r.id, type: r.type, title: r.title, body: r.body, read: !!r.read, createdAt: r.created_at };
      notifications.push(notif);
      if (!notif.read) unreadCount++;
    }
    return { notifications, unreadCount };
  }
);

export const markNotificationsRead = api(
  { expose: true, method: "POST", path: "/streaks/notifications/read", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");
    await db.exec`UPDATE notifications SET read = 1 WHERE user_id = ${userId}`;
    return { success: true };
  }
);

export const createNotification = api(
  { expose: false },
  async ({ userId, type, title, body }: { userId: string; type: string; title: string; body: string }): Promise<{ id: string }> => {
    const id = crypto.randomUUID();
    await db.exec`INSERT INTO notifications (id, user_id, type, title, body) VALUES (${id}, ${userId}, ${type}, ${title}, ${body})`;
    return { id };
  }
);

// ── CERTIFICATES ──────────────────────────────────────────────────────────────

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string | null;
  verified: boolean;
  url: string | null;
  createdAt: string;
}

export interface GetCertificatesResponse { certificates: Certificate[]; }

export const getCertificates = api(
  { expose: true, method: "GET", path: "/streaks/certificates/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<GetCertificatesResponse> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    const rows = await db.query`SELECT id, name, issuer, issued_date, verified, url, created_at FROM certificates WHERE user_id = ${userId} ORDER BY created_at DESC`;
    const certificates: Certificate[] = [];
    for await (const row of rows) {
      const r = row as any;
      certificates.push({ id: r.id, name: r.name, issuer: r.issuer, issuedDate: r.issued_date, verified: !!r.verified, url: r.url, createdAt: r.created_at });
    }
    return { certificates };
  }
);

export const addCertificate = api(
  { expose: true, method: "POST", path: "/streaks/certificates", auth: true },
  async ({ userId, name, issuer, issuedDate, url }: { userId: string; name: string; issuer: string; issuedDate?: string; url?: string }): Promise<{ certificate: Certificate }> => {
    const { userID } = getAuthData<AuthData>()!;
    if (userID !== userId) throw APIError.permissionDenied("not your data");

    const id = crypto.randomUUID();
    await db.exec`INSERT INTO certificates (id, user_id, name, issuer, issued_date, url) VALUES (${id}, ${userId}, ${name}, ${issuer}, ${issuedDate ?? null}, ${url ?? null})`;

    return {
      certificate: { id, name, issuer, issuedDate: issuedDate ?? null, verified: false, url: url ?? null, createdAt: new Date().toISOString() },
    };
  }
);

// ── Admin Endpoints ──────────────────────────────────────────────────────────

export const adminCertificateStatus = api(
  { expose: true, method: "GET", path: "/admin/certificate-status", auth: true },
  async (): Promise<{ userIds: string[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const userIds: string[] = [];
    try {
      const rows = db.query`SELECT DISTINCT user_id FROM certificates`;
      for await (const row of rows) {
        userIds.push((row as any).user_id);
      }
    } catch {}

    return { userIds };
  }
);

export const adminLastActive = api(
  { expose: true, method: "GET", path: "/admin/last-active", auth: true },
  async (): Promise<{ users: { userId: string; lastActiveDate: string | null }[] }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    const map: Record<string, string | null> = {};

    // Get last_active_date from streaks table
    try {
      const rows = db.query`SELECT user_id, last_active_date FROM streaks`;
      for await (const row of rows) {
        const uid = (row as any).user_id;
        const date = (row as any).last_active_date;
        if (date) map[uid] = date;
      }
    } catch {}

    // Also check activity_log for most recent activity per user (more reliable)
    try {
      const rows = db.query`SELECT user_id, MAX(active_date) as latest FROM activity_log GROUP BY user_id`;
      for await (const row of rows) {
        const uid = (row as any).user_id;
        const latest = (row as any).latest;
        if (latest && (!map[uid] || latest > map[uid]!)) {
          map[uid] = latest;
        }
      }
    } catch {}

    const users = Object.entries(map).map(([userId, lastActiveDate]) => ({ userId, lastActiveDate }));
    return { users };
  }
);

export const adminDeleteUserStreaks = api(
  { expose: true, method: "DELETE", path: "/admin/user-streaks/:userId", auth: true },
  async ({ userId }: { userId: string }): Promise<{ success: boolean }> => {
    const { userID } = getAuthData<AuthData>()!;
    const { isAdmin } = await checkAdmin({ userID });
    if (!isAdmin) throw APIError.permissionDenied("admin access required");

    try { await db.exec`DELETE FROM certificates WHERE user_id = ${userId}`; } catch {}
    try { await db.exec`DELETE FROM notifications WHERE user_id = ${userId}`; } catch {}
    try { await db.exec`DELETE FROM achievements WHERE user_id = ${userId}`; } catch {}
    try { await db.exec`DELETE FROM streaks WHERE user_id = ${userId}`; } catch {}
    return { success: true };
  }
);
