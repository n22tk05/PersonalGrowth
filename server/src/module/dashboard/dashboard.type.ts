export interface DashboardQuery {
  date?: string; // YYYY-MM-DD
}

export interface AnalyticsQuery {
  range?: "7d" | "30d";
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
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
