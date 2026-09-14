import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CheckHabitDto, CreateHabitDto, UpdateHabitDto } from "./habit.dto.js";

@Injectable()
export default class HabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateHabitDto, userId: string) {
    return await this.prisma.habit.create({
      data: {
        userId,
        name: data.name,
        frequency: data.frequency,
      },
      include: {
        records: {
          orderBy: {
            completedAt: "desc"
          }
        }
      }
    });
  }

  async findAllByUserId(userId: string) {
    return await this.prisma.habit.findMany({
      where: { userId },
      include: {
        records: {
          orderBy: {
            completedAt: "desc"
          }
        },
        _count: {
          select: {
            records: true
          }
        }
      }
    });
  }

  async findById(id: string) {
    return await this.prisma.habit.findUnique({
      where: { id },
      include: {
        records: {
          orderBy: {
            completedAt: "desc"
          }
        }
      }
    });
  }

  async update(id: string, data: UpdateHabitDto) {
    return await this.prisma.habit.update({
      where: { id },
      data: {
        name: data.name,
        frequency: data.frequency,
      },
      include: {
        records: {
          orderBy: {
            completedAt: "desc"
          }
        }
      }
    });
  }

  async delete(id: string) {
    return await this.prisma.habit.delete({
      where: { id }
    });
  }

  async uncheckHabitRecord(recordId: string) {
    await this.prisma.habitRecord.delete({
      where: { id: recordId }
    });
  }

  async checkedHabitRecord(id: string, data: CheckHabitDto) {
    await this.prisma.habitRecord.create({
      data: {
        habitId: id,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      }
    });
    return this.findById(id);
  }

  async deleteHabitRecord(id: string, recordId: string) {
    return await this.prisma.habitRecord.delete({
      where: {
        id: recordId,
      },
    });
  }
}
