import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import HabitRepository from "./habit.repository.js";
import { CheckHabitDto, CreateHabitDto, UpdateHabitDto } from "./habit.dto.js";
import { calculateHabitStats } from "./habit.util.js";

@Injectable()
export default class HabitService {
  constructor(private readonly repository: HabitRepository) {}

  private calculateStats(habit: any) {
    return calculateHabitStats(habit);
  }

  private formatHabit(habit: any) {
    const stats = this.calculateStats(habit);
    return {
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      streak: stats.streak,
      completionRate: stats.completionRate,
      records: habit.records
        ? habit.records.map((r: any) => ({
            id: r.id,
            completedAt: r.completedAt,
          }))
        : [],
    };
  }

  async create(dto: CreateHabitDto, userId: string) {
    if (!userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.create(dto, userId);
    return this.formatHabit(habit);
  }

  async findAll(userId: string) {
    if (!userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habits = await this.repository.findAllByUserId(userId);
    return habits.map((h) => this.formatHabit(h));
  }

  async findOne(id: string, userId: string) {
    if (!id || !userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.findById(id);
    if (!habit) {
      throw new HttpException("Habit not found", HttpStatus.NOT_FOUND);
    }
    if (habit.userId !== userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    return this.formatHabit(habit);
  }

  async update(dto: UpdateHabitDto, id: string, userId: string) {
    if (!id || !userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.findById(id);
    if (!habit) {
      throw new HttpException("Habit not found", HttpStatus.NOT_FOUND);
    }
    if (habit.userId !== userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    const updated = await this.repository.update(id, dto);
    return this.formatHabit(updated);
  }

  async delete(id: string, userId: string) {
    if (!id || !userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.findById(id);
    if (!habit) {
      throw new HttpException("Habit not found", HttpStatus.NOT_FOUND);
    }
    if (habit.userId !== userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    await this.repository.delete(id);
    return { success: true };
  }

  async checkedHabitRecord(id: string, userId: string, dto: CheckHabitDto) {
     if (!id || !userId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.findById(id)
     if (!habit) {
      throw new HttpException("Habit not found", HttpStatus.NOT_FOUND);
    }
    if (habit.userId !== userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    const checked = await this.repository.checkedHabitRecord(id, dto)
    return this.formatHabit(checked)
  }

  async deleteHabitRecord(id: string, recordId: string, userId: string) {
     if (!id || !userId || !recordId) {
      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
    const habit = await this.repository.findById(id);
    if (!habit) {
      throw new HttpException("Habit not found", HttpStatus.NOT_FOUND);
    }
    if (habit.userId !== userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    await this.repository.deleteHabitRecord(id, recordId);
    return { success: true };
  }
}