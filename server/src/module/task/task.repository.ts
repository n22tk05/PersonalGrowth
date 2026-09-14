import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateTaskDto, UpdateTaskDto } from "./task.dto.js";
import { TaskStatus } from "../../../generated/prisma/enums.js";
import { TaskFilter } from "./task.type.js";

@Injectable()
export default class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskDto, userId: string) {
    const { startTime, endTime, dueDate, ...rest } = data;
    return await this.prisma.task.create({
      data: {
        userId,
        ...rest,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }

  async filter(filter: TaskFilter, userId: string) {
    const where: any = { userId };
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }
    if (filter.dueDate) {
      const targetDate = new Date(filter.dueDate);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return await this.prisma.task.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  async task(id: string) {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }

  async update(data: UpdateTaskDto, id: string) {
    const { startTime, endTime, dueDate, status, ...rest } = data;
    const updateData: any = { ...rest };

    if (startTime !== undefined) {
      updateData.startTime = startTime ? new Date(startTime) : null;
    }
    if (endTime !== undefined) {
      updateData.endTime = endTime ? new Date(endTime) : null;
    }
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (status) {
      updateData.status = status;
      if (status === TaskStatus.DONE) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    return await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.task.delete({
      where: { id },
    });
  }

  async findCategoryById(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
    });
  }
}
