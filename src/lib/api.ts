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
const REMEMBER_KEY = 'pathwise_remember';

export const tokenStore = {
  get: () =>
    localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY),
  set: (t: string, remember = true) => {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(REMEMBER_KEY, '1');
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, t);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
  isRemembered: () => localStorage.getItem(REMEMBER_KEY) === '1',
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
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/signin';
          throw new Error('Session expired');
        }
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
  forgotPassword: (data: { email: string }) =>
    request<{ success: boolean }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { tokenId: string; token: string; newPassword: string }) =>
    request<{ success: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  deleteAccount: () => request<{ success: boolean }>('/auth/account', { method: 'DELETE' }),
  exportData: () => request<{ data: any }>('/auth/export'),
  getProfileSettings: () =>
    request<{ profilePublic: boolean; profileSlug: string | null; headline: string | null; bio: string | null }>('/auth/profile-settings'),
  updateProfileSettings: (data: { profilePublic?: boolean; profileSlug?: string; headline?: string; bio?: string }) =>
    request<{ success: boolean }>('/auth/profile-settings', { method: 'PATCH', body: JSON.stringify(data) }),
};

// --- Assessment ---
export const assessment = {
  getResult: (userId: string) => request(`/assessment/${userId}`),
  submit: (data: unknown)     => request('/assessment', { method: 'POST', body: JSON.stringify(data) }),
  submitV2: (data: any) => request<any>('/assessment-v2', { method: 'POST', body: JSON.stringify(data) }),
  getCertificates: (data: unknown) =>
    request('/assessment/certificates', { method: 'POST', body: JSON.stringify(data) }),
  getCareerRecommendations: (data: unknown) =>
    request('/assessment/career-recommendations', { method: 'POST', body: JSON.stringify(data) }),
  getSkillGapAnalysis: (data: unknown) =>
    request('/assessment/skill-gap-analysis', { method: 'POST', body: JSON.stringify(data) }),
  saveProgress: (data: unknown) =>
    request<{ success: boolean }>('/assessment-v2/progress', { method: 'POST', body: JSON.stringify(data) }),
  getProgress: () =>
    request<{ progress: any | null }>('/assessment-v2/progress'),
};

// --- Roadmap ---
export const roadmap = {
  get:      (userId: string) => request(`/roadmap/${userId}`),
  generate: (data: unknown)  => request('/roadmap', { method: 'POST', body: JSON.stringify(data) }),
  updateTimeline: (data: { userId: string; timeline: string }) =>
    request('/roadmap/timeline', { method: 'PATCH', body: JSON.stringify(data) }),
  completeMilestone: (milestoneId: string) =>
    request(`/roadmap/milestones/${milestoneId}/complete`, { method: 'POST', body: JSON.stringify({}) }),
  getCertificate: () => request<{ certificate: { id: string; targetRole: string; issuedAt: string } | null }>('/roadmap/certificate'),
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
  getTaskStats: () => request<{ stats: { userId: string; taskCount: number; completedTaskCount: number }[] }>('/admin/task-stats'),
  getAssessmentStats: () => request<{ userIdsWithAssessment: string[] }>('/admin/assessment-stats'),
  deleteUser: (userId: string) => request<{ success: boolean }>(`/admin/users/${userId}`, { method: 'DELETE' }),
  getUserDetail: (userId: string) => request<any>(`/admin/user/${userId}/detail`),
  updatePlan: (userId: string, plan: string) => request<{ success: boolean }>(`/admin/users/${userId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan }) }),
  impersonate: (userId: string) => request<{ token: string }>(`/admin/impersonate/${userId}`, { method: 'POST', body: JSON.stringify({}) }),
  getAssessment: (userId: string) => request<any>(`/admin/assessment/${userId}`),
  getRoadmapUserStatus: () => request<{ statuses: { userId: string; hasRoadmap: boolean; milestonesTotal: number; milestonesCompleted: number }[] }>('/admin/roadmap-user-status'),
  getCertificateStatus: () => request<{ userIds: string[] }>('/admin/certificate-status'),
  getLastActive: () => request<{ users: { userId: string; lastActiveDate: string | null }[] }>('/admin/last-active'),
  getAnalytics: () => request<{ totalAssessments: number; topCareers: { title: string; count: number }[] }>('/admin/analytics'),
  getTickets: () => request<{ tickets: AdminTicket[] }>('/admin/tickets'),
  updateTicket: (ticketId: string, status: string) =>
    request<{ success: boolean }>(`/admin/tickets/${ticketId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTicket: (ticketId: string) =>
    request<{ success: boolean }>(`/admin/tickets/${ticketId}`, { method: 'DELETE' }),
  replyToTicket: (ticketId: string, data: { subject: string; message: string; additionalTo?: string[]; cc?: string[]; from?: string; rawHtml?: string }) =>
    request<{ success: boolean }>(`/admin/tickets/${ticketId}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  broadcastEmail: (data: { subject: string; message: string; targetEmails?: string[] }) =>
    request<{ success: boolean; sent: number }>('/admin/broadcast-email', { method: 'POST', body: JSON.stringify(data) }),
  getTicketThread: (ticketId: string) =>
    request<{ replies: Array<{ id: string; direction: 'admin' | 'user'; authorEmail: string; authorName: string | null; body: string; createdAt: string }> }>(`/admin/tickets/${ticketId}/thread`),
  previewTicketReply: (ticketId: string, data: { subject: string; message: string }) =>
    request<{ subject: string; html: string }>(`/admin/tickets/${ticketId}/reply/preview`, { method: 'POST', body: JSON.stringify(data) }),
  markTicketRead: (ticketId: string) =>
    request<{ success: boolean }>(`/admin/tickets/${ticketId}/read`, { method: 'POST' }),
  composeEmail: (data: { to: string[]; cc?: string[]; subject: string; message: string; from?: string; rawHtml?: string }) =>
    request<{ success: boolean; sent: number; ticketIds: string[]; failures: Array<{ to: string; error: string }> }>('/admin/compose-email', { method: 'POST', body: JSON.stringify(data) }),
  listSenders: () =>
    request<{ senders: Array<{ key: string; address: string; label: string }> }>('/admin/senders'),
  listInboundLog: () =>
    request<{ entries: Array<{
      id: string; receivedAt: string; decision: string;
      fromEmail: string | null; toAddresses: string[];
      subject: string | null; reason: string | null;
      hasSvixHeaders: boolean; resendEmailId: string | null;
    }> }>('/admin/inbound-log'),
  previewCompose: (data: { subject: string; message: string }) =>
    request<{ subject: string; html: string }>('/admin/compose-email/preview', { method: 'POST', body: JSON.stringify(data) }),
  listRoles: () =>
    request<{ entries: Array<{ email: string; role: 'admin' | 'support_agent'; addedByEmail: string | null; addedAt: string; isBootstrap: boolean; hasAccount: boolean; userName: string | null }> }>('/admin/roles'),
  addRole: (email: string, role: 'admin' | 'support_agent') =>
    request<{ success: boolean }>('/admin/roles', { method: 'POST', body: JSON.stringify({ email, role }) }),
  removeRole: (email: string, role: 'admin' | 'support_agent') =>
    request<{ success: boolean }>(`/admin/roles?email=${encodeURIComponent(email)}&role=${role}`, { method: 'DELETE' }),
  listSnippets: () =>
    request<{ snippets: Snippet[] }>('/admin/snippets'),
  createSnippet: (data: { title: string; body: string }) =>
    request<Snippet>('/admin/snippets', { method: 'POST', body: JSON.stringify(data) }),
  updateSnippet: (id: string, data: { title: string; body: string }) =>
    request<Snippet>(`/admin/snippets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSnippet: (id: string) =>
    request<{ success: boolean }>(`/admin/snippets/${id}`, { method: 'DELETE' }),
};

export type Snippet = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminTicket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  lastActivityAt: string;
  unread: boolean;
  replyCount: number;
  initiatedBy: 'user' | 'agent';
};

export const getMyAccess = () =>
  request<{ isAdmin: boolean; isSupportAgent: boolean; canAccessTickets: boolean }>('/auth/me/access');

export const getMySignature = () =>
  request<{ signature: string }>('/auth/me/signature');

export const updateMySignature = (signature: string) =>
  request<{ success: boolean }>('/auth/me/signature', { method: 'PATCH', body: JSON.stringify({ signature }) });

// --- Tickets ---
export const tickets = {
  submit: (data: { name: string; email: string; subject?: string; message: string }) =>
    request<{ id: string; success: boolean }>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
};

// --- Public ---
export const publicApi = {
  getProfile: (slug: string) =>
    request<{ profile: any }>(`/profile/${slug}`),
};

// --- Certificates ---
export const certificates = {
  get: (userId: string) => request(`/streaks/certificates/${userId}`),
  add: (data: { userId: string; name: string; issuer: string; issuedDate?: string; url?: string }) =>
    request('/streaks/certificates', { method: 'POST', body: JSON.stringify(data) }),
};
