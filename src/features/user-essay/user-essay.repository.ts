import { PrismaService } from '@core/prisma';
import { AIResponseStatus } from '@core/prisma/generated/enums';
import type { AICorrection } from '@core/prisma/generated/client';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getUserEssayWithCorrections(essayId: string) {
    return this.prisma.userEssay.findUnique({
      where: { id: essayId },
      include: {
        aiCorrections: {
          include: {
            feedback: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async createAiCorrection(essayId: string, text: string) {
    const feedback = await this.prisma.essayFeedback.create({
      data: {
        gradeC1: 0,
        gradeC2: 0,
        gradeC3: 0,
        gradeC4: 0,
        gradeC5: 0,
        feedbackC1: '',
        feedbackC2: '',
        feedbackC3: '',
        feedbackC4: '',
        feedbackC5: '',
      },
    });

    return this.prisma.aICorrection.create({
      data: {
        essayId,
        text,
        status: AIResponseStatus.PENDING,
        feedbackId: feedback.id,
      },
    });
  }

  async findAiCorrectionById(correctionId: string): Promise<AICorrection | null> {
    return this.prisma.aICorrection.findUnique({
      where: { id: correctionId },
      include: {
        feedback: true,
      },
    });
  }

  async updateAiCorrectionToFinished(
    correctionId: string,
    feedbackData: {
      gradeC1: number;
      gradeC2: number;
      gradeC3: number;
      gradeC4: number;
      gradeC5: number;
      feedbackC1: string;
      feedbackC2: string;
      feedbackC3: string;
      feedbackC4: string;
      feedbackC5: string;
    },
  ) {
    const correction = await this.prisma.aICorrection.findUnique({
      where: { id: correctionId },
    });

    if (!correction) {
      throw new NotFoundException('AI correction not found');
    }

    await this.prisma.$transaction([
      this.prisma.essayFeedback.update({
        where: { id: correction.feedbackId },
        data: feedbackData,
      }),
      this.prisma.aICorrection.update({
        where: { id: correctionId },
        data: { status: AIResponseStatus.FINISHED },
      }),
    ]);

    return this.prisma.aICorrection.findUnique({
      where: { id: correctionId },
      include: {
        feedback: true,
      },
    });
  }

  async updateAiCorrectionStatus(
    correctionId: string,
    status: AIResponseStatus,
  ) {
    return this.prisma.aICorrection.update({
      where: { id: correctionId },
      data: { status },
    });
  }

  async deleteAiCorrection(correctionId: string) {
    const correction = await this.prisma.aICorrection.findUnique({
      where: { id: correctionId },
    });

    if (!correction) {
      throw new NotFoundException('AI correction not found');
    }

    await this.prisma.$transaction([
      this.prisma.aICorrection.delete({
        where: { id: correctionId },
      }),
      this.prisma.essayFeedback.delete({
        where: { id: correction.feedbackId },
      }),
    ]);
  }

  async getActiveCorrectionCount(essayId: string): Promise<number> {
    return this.prisma.aICorrection.count({
      where: {
        essayId,
        status: AIResponseStatus.PENDING,
      },
    });
  }
}
