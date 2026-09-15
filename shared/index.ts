/**
 * ============================================================================
 * 🌐 PERSONAL GROWTH APP - SHARED DATA TYPES CONTRACT (TYPESCRIPT)
 * Single Source of Truth for Data Models, DTOs, Enums & API Contracts
 * Shared across Backend (NestJS) and Frontend (React Native Expo)
 * ============================================================================
 */

// ============================================================================
// 1. CHUẨN PHẢN HỒI API (COMMON API RESPONSES & PAGINATION)
// ============================================================================

export type TASK_STATUS = "Todo" | "In Progress" | "Done";
export type MOOD =   "Very Happy" | "Happy" | "Normal" | "Sad" | "Very Sad"
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface PaginationMeta {
  nextCursor?: string;
  limit: number;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  cursor?: string;
  limit?: number;
  page?: number;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

// ============================================================================
// 2. CÁC ENUM ĐỒNG BỘ GIỮA DATABASE VÀ GIAO DIỆN
// ============================================================================

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export type Gender = "MALE" | "FEMALE";

export type Theme = "LIGHT" | "DARK" | "SYSTEM";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type HabitFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type MoodLevel =
  | "VERY_HAPPY"
  | "HAPPY"
  | "NORMAL"
  | "SAD"
  | "VERY_SAD";

// ============================================================================
// 3. AUTH & USER MODULE
// ============================================================================

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  fullName: string | null;
  avatar: string | null;
  birthday: string | null;
  gender: Gender | null;
  theme: Theme;
  timezone: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role?: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  avatar?: string;
  birthday?: string;
  gender?: Gender;
  theme?: Theme;
  timezone?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// ============================================================================
// 4. CATEGORY MODULE
// ============================================================================

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  icon?: string;
}

// ============================================================================
// 5. TASK & CALENDAR MODULE
// ============================================================================

export interface Task {
  id: string;
  name: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  dueDate: string | null;
  status: TaskStatus;
  completedAt: string | null;
  categoryId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  status?: TaskStatus;
  categoryId?: string;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  status?: TaskStatus;
  completedAt?: string;
  categoryId?: string;
}

export interface TaskQuery extends PaginationQuery {
  status?: TaskStatus;
  categoryId?: string;
  date?: string; // YYYY-MM-DD
}

export interface CalendarEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

// ============================================================================
// 6. HABIT & STREAK MODULE
// ============================================================================

export interface HabitRecord {
  id: string;
  completedAt: string;
  habitId: string;
}

export interface StreakInfo {
  current: number;
  max: number;
}

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  userId: string;
  createdAt: string;
  updatedAt: string;
  records?: HabitRecord[];
  streak?: StreakInfo;
}

export interface CreateHabitDto {
  name: string;
  frequency: HabitFrequency;
}

export interface UpdateHabitDto {
  name?: string;
  frequency?: HabitFrequency;
}

export interface HabitUIItem {
  id: string;
  name: string;
  rule: string;
  detail: string;
  icon: any;
  color: string;
  bgColor: string;
  streakDays: number;
  maxStreakDays?: number;
  progress: number;
  checked: boolean;
  recordId?: string;
}

// ============================================================================
// 7. JOURNAL (NHẬT KÝ) MODULE
// ============================================================================

export interface Journal {
  id: string;
  name: string | null;
  content: string;
  imageUrl: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalDto {
  name?: string;
  content: string;
  imageUrl?: string;
}

export interface UpdateJournalDto {
  name?: string;
  content?: string;
  imageUrl?: string;
}

export interface JournalQuery extends PaginationQuery {
  search?: string;
}

// ============================================================================
// 8. DAY REVIEW (ĐÁNH GIÁ NGÀY) MODULE
// ============================================================================

export interface DayReview {
  id: string;
  productivity: number; // 1 - 10
  moodScore: number;    // 1 - 10
  healthScore: number;  // 1 - 10
  satisfaction: number; // 1 - 10
  note: string | null;
  reviewDate: string;   // ISO Date
  userId: string;
  createdAt: string;
}

export interface CreateDayReviewDto {
  productivity: number; // 1 - 10
  moodScore: number;    // 1 - 10
  healthScore: number;  // 1 - 10
  satisfaction: number; // 1 - 10
  note?: string;
  reviewDate: string;   // ISO Date string (YYYY-MM-DD)
}

export interface UpdateDayReviewDto {
  productivity?: number;
  moodScore?: number;
  healthScore?: number;
  satisfaction?: number;
  note?: string;
}

export interface DayReviewQuery extends PaginationQuery {
  date?: string;
}

// ============================================================================
// 9. MOOD TRACKER MODULE
// ============================================================================

export interface Mood {
  id: string;
  level: MoodLevel;
  reason: string | null;
  note: string | null;
  userId: string;
  createdAt: string;
}

export interface CreateMoodDto {
  level: MoodLevel;
  reason?: string;
  note?: string;
}

export interface UpdateMoodDto {
  level?: MoodLevel;
  reason?: string;
  note?: string;
}

export interface MoodQuery extends PaginationQuery {
  level?: MoodLevel;
}

// ============================================================================
// 10. DASHBOARD & ANALYTICS MODULE
// ============================================================================

export interface TaskSummary {
  total: number;
  completed: number;
  completionRate: number; // 0 - 100
}

export interface HabitSummary {
  total: number;
  completed: number;
  completionRate: number; // 0 - 100
}

export interface DashboardSummaryResponse {
  date: string;
  tasks: TaskSummary;
  habits: HabitSummary;
}

export interface DashboardSummaryQuery {
  date?: string; // YYYY-MM-DD
}

export interface ChartDataPoint {
  value: number;
  label?: string;
  dataPointText?: string;
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

export interface AnalyticsQuery {
  range?: "7d" | "30d";
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
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

export interface WeeklyAnalyticsResponse {
  from: string;
  to: string;
  habitAverageRate: number;
  taskAverageRate: number;
  overallScore: number;
  dailyStats: Array<{
    date: string;
    dayOfWeek: string;
    habitRate: number;
    taskRate: number;
    moodScore?: number;
  }>;
}
