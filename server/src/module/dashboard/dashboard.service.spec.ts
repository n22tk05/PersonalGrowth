import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      task: {
        count: jest.fn(),
      },
      habit: {
        count: jest.fn(),
      },
      habitRecord: {
        count: jest.fn(),
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
});
