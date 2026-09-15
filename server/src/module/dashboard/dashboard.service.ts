import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  AnalyticsQuery,
  AnalyticsResponse,
  DailyAnalyticsStat,
  DashboardQuery,
  TopHabitAnalytics,
} from "./dashboard.type.js";
import { calculateHabitStats } from "../habit/habit.util.js";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, query: DashboardQuery) {
    const targetDate = query.date ? new Date(query.date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Chạy song song 4 truy vấn bằng Promise.all
    const [totalTasks, completedTasks, totalHabits, completedHabits] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          OR: [
            { dueDate: { gte: startOfDay, lte: endOfDay } },
            {
              dueDate: null,
              createdAt: { gte: startOfDay, lte: endOfDay },
            },
            {
              completedAt: { gte: startOfDay, lte: endOfDay },
            },
          ],
        }
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: "DONE",
          completedAt: { gte: startOfDay, lte: endOfDay },
        }
      }),
      this.prisma.habit.count({
        where: {
          userId,
          createdAt: { lte: endOfDay },
        }
      }),
      this.prisma.habitRecord.count({
        where: {
          habit: { userId },
          completedAt: { gte: startOfDay, lte: endOfDay },
        }
      })
    ]);

    const effectiveTotalTasks = Math.max(totalTasks, completedTasks);
    const taskCompletionRate = effectiveTotalTasks === 0 ? 0 : Math.min(100, Math.round((completedTasks / effectiveTotalTasks) * 100));
    const habitCompletionRate = totalHabits === 0 ? 0 : Math.min(100, Math.round((completedHabits / totalHabits) * 100));

    return {
      date: startOfDay.toISOString().split("T")[0],
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: taskCompletionRate
      },
      habits: {
        total: totalHabits,
        completed: completedHabits,
        completionRate: habitCompletionRate
      }
    };
  }

  async getAnalytics(userId: string, query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const range = query.range || "7d";
    let startDate: Date;
    let endDate: Date;

    if (query.from && query.to) {
      startDate = new Date(query.from);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(query.to);
      endDate.setUTCHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
      endDate.setUTCHours(23, 59, 59, 999);
      const daysCount = range === "30d" ? 30 : 7;
      startDate = new Date(endDate);
      startDate.setUTCDate(startDate.getUTCDate() - (daysCount - 1));
      startDate.setUTCHours(0, 0, 0, 0);
    }

    const [habits, tasks, dayReviews] = await Promise.all([
      this.prisma.habit.findMany({
        where: { userId },
        include: { records: true },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          OR: [
            { dueDate: { gte: startDate, lte: endDate } },
            {
              dueDate: null,
              createdAt: { gte: startDate, lte: endDate },
            },
            {
              completedAt: { gte: startDate, lte: endDate },
            },
          ],
        },
      }),
      this.prisma.dayReview.findMany({
        where: {
          userId,
          reviewDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dailyStats: DailyAnalyticsStat[] = [];
    const curr = new Date(startDate);

    let totalTasksCompleted = 0;
    let totalHabitCompletions = 0;

    while (curr <= endDate) {
      const d0 = new Date(curr);
      d0.setUTCHours(0, 0, 0, 0);
      const d1 = new Date(curr);
      d1.setUTCHours(23, 59, 59, 999);

      const dateStr = d0.toISOString().split("T")[0];
      const dayOfWeek = dayNames[d0.getUTCDay()];

      // Habits
      const activeHabits = habits.filter((h) => new Date(h.createdAt) <= d1);
      const totalHabits = activeHabits.length;
      let completedHabits = 0;
      for (const h of activeHabits) {
        const hasCompleted = (h.records || []).some((r: any) => {
          const rDate = new Date(r.completedAt);
          return rDate >= d0 && rDate <= d1;
        });
        if (hasCompleted) {
          completedHabits++;
        }
      }
      const habitRate = totalHabits === 0 ? 0 : Math.min(100, Math.round((completedHabits / totalHabits) * 100));

      // Tasks
      const tasksOnDay = tasks.filter((t) => {
        const dueMatch = t.dueDate && new Date(t.dueDate) >= d0 && new Date(t.dueDate) <= d1;
        const createdMatch = !t.dueDate && new Date(t.createdAt) >= d0 && new Date(t.createdAt) <= d1;
        const completedMatch = t.completedAt && new Date(t.completedAt) >= d0 && new Date(t.completedAt) <= d1;
        return dueMatch || createdMatch || completedMatch;
      });
      const completedTasksOnDay = tasks.filter((t) => {
        return t.status === "DONE" && t.completedAt && new Date(t.completedAt) >= d0 && new Date(t.completedAt) <= d1;
      });

      const dayCompletedTasksCount = completedTasksOnDay.length;
      const dayTotalTasksCount = Math.max(tasksOnDay.length, dayCompletedTasksCount);
      const taskRate = dayTotalTasksCount === 0 ? 0 : Math.min(100, Math.round((dayCompletedTasksCount / dayTotalTasksCount) * 100));

      totalTasksCompleted += dayCompletedTasksCount;
      totalHabitCompletions += completedHabits;

      // DayReview
      const review = dayReviews.find((r) => {
        const rDate = new Date(r.reviewDate);
        return rDate >= d0 && rDate <= d1;
      });

      dailyStats.push({
        date: dateStr,
        dayOfWeek,
        habitRate,
        taskRate,
        moodScore: review?.moodScore,
        reviewScore: review?.productivity,
        completedTasks: dayCompletedTasksCount,
        totalTasks: dayTotalTasksCount,
        completedHabits,
        totalHabits,
      });

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    // Top habits
    const topHabits: TopHabitAnalytics[] = habits
      .map((h) => {
        const stats = calculateHabitStats(h);
        return {
          id: h.id,
          name: h.name,
          frequency: h.frequency,
          currentStreak: stats.streak.current,
          maxStreak: stats.streak.max,
          completionRate: stats.completionRate,
        };
      })
      .sort((a, b) => {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.completionRate - a.completionRate;
      })
      .slice(0, 5);

    const habitAverageRate =
      dailyStats.length === 0
        ? 0
        : Math.round(dailyStats.reduce((acc, s) => acc + s.habitRate, 0) / dailyStats.length);
    const taskAverageRate =
      dailyStats.length === 0
        ? 0
        : Math.round(dailyStats.reduce((acc, s) => acc + s.taskRate, 0) / dailyStats.length);
    const overallScore = Math.round((habitAverageRate + taskAverageRate) / 2);

    return {
      range,
      from: startDate.toISOString().split("T")[0],
      to: endDate.toISOString().split("T")[0],
      habitAverageRate,
      taskAverageRate,
      overallScore,
      totalHabitCompletions,
      totalTasksCompleted,
      dailyStats,
      topHabits,
    };
  }
}
