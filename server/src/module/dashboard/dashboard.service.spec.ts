import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      task: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      habit: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      habitRecord: {
        count: jest.fn(),
      },
      dayReview: {
        findMany: jest.fn(),
      },
    };
    service = new DashboardService(prismaMock);
  });

  it('should return 0% completion rate when there are no tasks', async () => {
    prismaMock.task.count.mockResolvedValue(0);
    prismaMock.habit.count.mockResolvedValue(0);
    prismaMock.habitRecord.count.mockResolvedValue(0);

    const result = await service.getSummary('user-1', { date: '2026-09-14' });

    expect(result.tasks.total).toBe(0);
    expect(result.tasks.completed).toBe(0);
    expect(result.tasks.completionRate).toBe(0);
    expect(result.habits.completionRate).toBe(0);
  });

  it('should calculate accurate completion rate based on daily tasks', async () => {
    // 2 total tasks today, 2 completed today
    prismaMock.task.count.mockImplementation(({ where }: any) => {
      if (where.status === 'DONE') return Promise.resolve(2);
      return Promise.resolve(2);
    });
    // 3 total habits, 3 checked today
    prismaMock.habit.count.mockResolvedValue(3);
    prismaMock.habitRecord.count.mockResolvedValue(3);

    const result = await service.getSummary('user-1', { date: '2026-09-14' });

    expect(result.tasks.total).toBe(2);
    expect(result.tasks.completed).toBe(2);
    expect(result.tasks.completionRate).toBe(100);
    expect(result.habits.completionRate).toBe(100);
  });

  it('should compute analytics data accurately across a 7-day range', async () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    prismaMock.habit.findMany.mockResolvedValue([
      {
        id: 'h1',
        name: 'Chạy bộ',
        frequency: 'DAILY',
        createdAt: new Date('2026-09-01'),
        records: [
          { id: 'r1', completedAt: new Date() },
        ],
      },
    ]);

    prismaMock.task.findMany.mockResolvedValue([
      {
        id: 't1',
        name: 'Code NestJS',
        status: 'DONE',
        dueDate: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
      },
    ]);

    prismaMock.dayReview.findMany.mockResolvedValue([
      {
        id: 'dr1',
        moodScore: 5,
        productivity: 4,
        reviewDate: new Date(),
      },
    ]);

    const res = await service.getAnalytics('user-1', { range: '7d' });

    expect(res.range).toBe('7d');
    expect(res.dailyStats).toHaveLength(7);
    expect(res.topHabits).toHaveLength(1);
    expect(res.topHabits[0].name).toBe('Chạy bộ');
    expect(res.topHabits[0].currentStreak).toBe(1);
    expect(res.totalTasksCompleted).toBe(1);
    expect(res.totalHabitCompletions).toBe(1);
    expect(res.overallScore).toBeGreaterThanOrEqual(0);
  });
});
