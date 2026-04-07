import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateUserEssayDto } from './dto/create-user-essay.dto';
import { UpdateUserEssayDto } from './dto/update-user-essay.dto';

@Injectable()
export class UserEssayRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserEssay(studentId: string, data: CreateUserEssayDto) {
    return this.prisma.userEssay.create({
      data: {
        studentId,
        theme: data.theme,
        text: data.text || null,
        duration: data.duration || null,
        date: new Date(),
      },
    });
  }

  async getAllUserEssays(studentId: string, theme?: string) {
    const where: any = { studentId };

    if (theme) {
      where.theme = {
        contains: theme,
        mode: 'insensitive',
      };
    }

    return this.prisma.userEssay.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getUserEssayById(userEssayId: string) {
    return this.prisma.userEssay.findUnique({
      where: { id: userEssayId },
    });
  }

  async updateUserEssay(userEssayId: string, data: UpdateUserEssayDto) {
    const updateData: any = {};

    if (data.text !== undefined) updateData.text = data.text;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.finished !== undefined) updateData.finished = data.finished;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    updateData.updatedAt = new Date();

    return this.prisma.userEssay.update({
      where: { id: userEssayId },
      data: updateData,
    });
  }

  async deleteUserEssay(userEssayId: string) {
    return this.prisma.userEssay.delete({
      where: { id: userEssayId },
    });
  }
}
