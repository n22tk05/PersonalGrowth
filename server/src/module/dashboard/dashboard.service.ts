import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { DashboardQuery } from "./dashboard.type.js";

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
}
