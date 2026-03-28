/**
 * PathWise API Client
 * Connects to the Encore.dev backend.
 * Base URL is set via VITE_API_BASE_URL environment variable.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const TOKEN_KEY = 'pathwise_token';

export const tokenStore = {
  get: ()              => localStorage.getItem(TOKEN_KEY),
  set: (t: string)     => localStorage.setItem(TOKEN_KEY, t),
  clear: ()            => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = tokenStore.get();
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
    throw new Error(body?.message ?? `API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
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
  aiGenerate: (data: unknown) =>
    request('/tasks/generate/milestone', { method: 'POST', body: JSON.stringify(data) }),
  customGenerate: (data: unknown) =>
    request('/tasks/generate/custom', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Progress ---
export const progress = {
  getStats: (userId: string) => request(`/progress/${userId}`),
};
