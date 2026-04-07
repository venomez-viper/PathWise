/**
 * PathWise API Client
 * Connects to the Encore.dev backend.
 * Auto-detects environment: localhost for dev, Encore cloud for production.
 */

function getBaseUrl(): string {
  // 1. Explicit env var always wins
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  // 2. Production: use Encore staging API
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return 'https://staging-pathwise-4mxi.encr.app';
  }

  // 3. Local dev
  return 'http://localhost:4000';
}

const BASE_URL = getBaseUrl();

const TOKEN_KEY = 'pathwise_token';

export const tokenStore = {
  get: ()              => localStorage.getItem(TOKEN_KEY),
  set: (t: string)     => localStorage.setItem(TOKEN_KEY, t),
  clear: ()            => localStorage.removeItem(TOKEN_KEY),
};

/** Wake up the backend (Encore cold starts can take 5-15s) */
export async function warmup(): Promise<void> {
  try { await fetch(`${BASE_URL}/auth/me`, { method: 'GET' }); } catch {}
}

async function request<T>(path: string, options?: RequestInit, retries = 2): Promise<T> {
  const token = tokenStore.get();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? body?.code ?? `API error ${res.status}: ${res.statusText}`);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      // Network error (failed to fetch) — retry with increasing delay for cold starts
      if (attempt < retries && err instanceof TypeError) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }

  throw new Error('Request failed after retries');
}

// --- Auth ---
export const auth = {
  signup: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string; plan: string } }>(
      '/auth/signup', { method: 'POST', body: JSON.stringify(data) }
    ),
  signin: (data: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string; plan: string } }>(
      '/auth/signin', { method: 'POST', body: JSON.stringify(data) }
    ),
  me: () =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string } }>('/auth/me'),
  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<{ user: { id: string; name: string; email: string; avatarUrl?: string; plan: string } }>(
      '/auth/me', { method: 'PATCH', body: JSON.stringify(data) }
    ),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean }>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Assessment ---
export const assessment = {
  getResult: (userId: string) => request(`/assessment/${userId}`),
  submit: (data: unknown)     => request('/assessment', { method: 'POST', body: JSON.stringify(data) }),
  getCertificates: (data: unknown) =>
    request('/assessment/certificates', { method: 'POST', body: JSON.stringify(data) }),
  getCareerRecommendations: (data: unknown) =>
    request('/assessment/career-recommendations', { method: 'POST', body: JSON.stringify(data) }),
  getSkillGapAnalysis: (data: unknown) =>
    request('/assessment/skill-gap-analysis', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Roadmap ---
export const roadmap = {
  get:      (userId: string) => request(`/roadmap/${userId}`),
  generate: (data: unknown)  => request('/roadmap', { method: 'POST', body: JSON.stringify(data) }),
  completeMilestone: (milestoneId: string) =>
    request(`/roadmap/milestones/${milestoneId}/complete`, { method: 'POST', body: JSON.stringify({}) }),
};

// --- Tasks ---
export const tasks = {
  list:   (userId: string)              => request(`/tasks?userId=${encodeURIComponent(userId)}`),
  create: (data: unknown)               => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (taskId: string, data: unknown) =>
    request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (taskId: string) =>
    request<{ success: boolean }>(`/tasks/${taskId}`, { method: 'DELETE' }),
  aiGenerate: (data: unknown) =>
    request('/tasks/generate/milestone', { method: 'POST', body: JSON.stringify(data) }),
  customGenerate: (data: unknown) =>
    request('/tasks/generate/custom', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Progress ---
export const progress = {
  getStats: (userId: string) => request(`/progress/${userId}`),
};

// --- Streaks ---
export const streaks = {
  get: (userId: string) => request(`/streaks/${userId}`),
  recordActivity: (userId: string) => request('/streaks/record', { method: 'POST', body: JSON.stringify({ userId }) }),
};

// --- Achievements ---
export const achievements = {
  get: (userId: string) => request(`/streaks/achievements/${userId}`),
  award: (data: { userId: string; badgeKey: string }) => request('/streaks/achievements/award', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Notifications ---
export const notifications = {
  get: (userId: string) => request(`/streaks/notifications/${userId}`),
  markRead: (userId: string) => request('/streaks/notifications/read', { method: 'POST', body: JSON.stringify({ userId }) }),
};

// --- Admin ---
export const admin = {
  getUsers: () => request<{ users: any[] }>('/admin/users'),
  getTaskStats: () => request<{ stats: { userId: string; total: number; completed: number }[] }>('/admin/task-stats'),
  getAssessmentStats: () => request<{ userIds: string[] }>('/admin/assessment-stats'),
  deleteUser: (userId: string) => request<{ success: boolean }>(`/admin/users/${userId}`, { method: 'DELETE' }),
};

// --- Certificates ---
export const certificates = {
  get: (userId: string) => request(`/streaks/certificates/${userId}`),
  add: (data: { userId: string; name: string; issuer: string; issuedDate?: string; url?: string }) =>
    request('/streaks/certificates', { method: 'POST', body: JSON.stringify(data) }),
};
