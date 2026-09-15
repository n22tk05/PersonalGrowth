import { api } from "@/lib/api";

export interface DashboardSummaryQuery {
  date?: string; // YYYY-MM-DD
}

export interface DashboardSummaryResponse {
  date: string;
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
  };
  habits: {
    total: number;
    completed: number;
    completionRate: number;
  };
}

export interface AnalyticsQuery {
  range?: "7d" | "30d";
  from?: string;
  to?: string;
}

export interface DailyAnalyticsStat {
  date: string;
  dayOfWeek: string;
  habitRate: number;
  taskRate: number;
  moodScore?: number;
  reviewScore?: number;
  completedTasks: number;
  totalTasks: number;
  completedHabits: number;
  totalHabits: number;
}

export interface TopHabitAnalytics {
  id: string;
  name: string;
  frequency: string;
  currentStreak: number;
  maxStreak: number;
  completionRate: number;
}

export interface AnalyticsResponse {
  range: string;
  from: string;
  to: string;
  habitAverageRate: number;
  taskAverageRate: number;
  overallScore: number;
  totalHabitCompletions: number;
  totalTasksCompleted: number;
  dailyStats: DailyAnalyticsStat[];
  topHabits: TopHabitAnalytics[];
}

export const dashboardApi = {
  getSummary: (query?: DashboardSummaryQuery) =>
    api.get<DashboardSummaryResponse>("/dashboard/summary", query as Record<string, string>),
  getAnalytics: (query?: AnalyticsQuery) =>
    api.get<AnalyticsResponse>("/dashboard/analytics", query as Record<string, string>),
};