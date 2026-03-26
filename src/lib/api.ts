/**
 * PathWise API Client
 * Connects to the Encore.dev backend.
 * Base URL is set via VITE_API_BASE_URL environment variable.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth ---
export const auth = {
  me: () => request('/auth/me'),
};

// --- Assessment ---
export const assessment = {
  getResult: (userId: string) => request(`/assessment/${userId}`),
  submit: (data: unknown) => request('/assessment', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Roadmap ---
export const roadmap = {
  get: (userId: string) => request(`/roadmap/${userId}`),
};

// --- Tasks ---
export const tasks = {
  list: (userId: string) => request(`/tasks?userId=${userId}`),
  update: (taskId: string, data: unknown) =>
    request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// --- Progress ---
export const progress = {
  getStats: (userId: string) => request(`/progress/${userId}`),
};
