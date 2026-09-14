import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import HabitService from './habit.service.js';

describe('HabitService', () => {
  let service: HabitService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      checkedHabitRecord: jest.fn(),
      deleteHabitRecord: jest.fn(),
    };
    service = new HabitService(repositoryMock);
  });

  describe('calculateStats & formatHabit', () => {
    it('should return 0 streak and 0 completionRate when habit has no records', async () => {
      repositoryMock.findById.mockResolvedValue({
        id: 'h1',
        name: 'Đọc sách',
        frequency: 'DAILY',
        userId: 'u1',
        createdAt: new Date(),
        records: [],
      });

      const result = await service.findOne('h1', 'u1');
      expect(result.streak).toEqual({ current: 0, max: 0 });
      expect(result.completionRate).toBe(0);
    });

    it('should calculate streak for consecutive days check-in', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      repositoryMock.findById.mockResolvedValue({
        id: 'h2',
        name: 'Uống nước',
        frequency: 'DAILY',
        userId: 'u1',
        createdAt: yesterday,
        records: [
          { id: 'r1', completedAt: today.toISOString() },
          { id: 'r2', completedAt: yesterday.toISOString() },
        ],
      });

      const result = await service.findOne('h2', 'u1');
      expect(result.streak.current).toBe(2);
      expect(result.streak.max).toBe(2);
      expect(result.completionRate).toBeGreaterThan(0);
    });

    it('should support weekly frequency adherence calculation without deflation', async () => {
      const pastMonth = new Date();
      pastMonth.setDate(pastMonth.getDate() - 28); // 4 weeks ago

      repositoryMock.findById.mockResolvedValue({
        id: 'h3',
        name: 'Chạy bộ cuối tuần',
        frequency: 'WEEKLY',
        userId: 'u1',
        createdAt: pastMonth,
        records: [
          { id: 'r1', completedAt: new Date().toISOString() },
          { id: 'r2', completedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
          { id: 'r3', completedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
          { id: 'r4', completedAt: new Date(Date.now() - 21 * 86400000).toISOString() },
        ],
      });

      const result = await service.findOne('h3', 'u1');
      // 4 check-ins in 4-5 weeks should give high completion rate, not 4/28 (14%)
      expect(result.completionRate).toBeGreaterThanOrEqual(80);
    });
  });

  describe('ownership checks', () => {
    it('should throw Forbidden if habit belongs to another user', async () => {
      repositoryMock.findById.mockResolvedValue({
        id: 'h1',
        userId: 'other-user',
      });

      await expect(service.findOne('h1', 'u1')).rejects.toThrow(
        new HttpException('Forbidden', HttpStatus.FORBIDDEN),
      );
    });

    it('should throw NotFound if habit does not exist', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findOne('h1', 'u1')).rejects.toThrow(
        new HttpException('Habit not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
