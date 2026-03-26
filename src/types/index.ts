// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
}

// Career Assessment
export interface AssessmentResult {
  userId: string;
  completedAt: string;
  strengths: string[];
  values: string[];
  personalityType: string;
  careerMatches: CareerMatch[];
}

export interface CareerMatch {
  title: string;
  matchScore: number; // 0–100
  description: string;
  requiredSkills: string[];
}

// Roadmap
export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  completionPercent: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'in_progress' | 'completed';
  dueDate?: string;
  tasks: Task[];
}

// Tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  milestoneId?: string;
}

// Progress
export interface ProgressStats {
  roadmapCompletion: number;  // 0–100
  tasksFinished: number;
  tasksRemaining: number;
  jobReadinessScore: number;  // 0–100
  careerReadinessScore: number; // 0–100
}
