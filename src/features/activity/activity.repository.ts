import { PrismaService } from "@core/prisma";
import { Injectable } from "@nestjs/common";
import { CreateEssayActivityDto } from "./dto/create-essay-activity.dto";
import { UpdateEssayActivityDto } from "./dto/update-essay-activity.dto";

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  createEssayActivity(data: CreateEssayActivityDto, creatorId: string) {
    return this.prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : null,
        type: "ESSAY",
        classId: data.classId,
        essay: {
          create: {
            theme: data.theme,
            timeLimitInMinutes: data.timeLimitInMinutes,
          },
        },
      },
      include: {
        essay: true,
      },
    });
  }

  getEssayActivityDetails(activityId: string) {
    return this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        essay: true,
        class: {
          select: {
            id: true,
            name: true,
            creatorId: true,
          },
        },
      },
    });
  }

  updateEssayActivity(
    activityId: string,
    data: UpdateEssayActivityDto
  ) {
    const activityUpdate: any = {};
    const essayUpdate: any = {};

    if (data.title !== undefined) activityUpdate.title = data.title;
    if (data.description !== undefined)
      activityUpdate.description = data.description;
    if (data.deadline !== undefined)
      activityUpdate.deadline = new Date(data.deadline);

    if (data.theme !== undefined) essayUpdate.theme = data.theme;
    if (data.timeLimitInMinutes !== undefined)
      essayUpdate.timeLimitInMinutes = data.timeLimitInMinutes;

    const updates: any = {};
    if (Object.keys(activityUpdate).length > 0) {
      updates.data = activityUpdate;
    }

    if (Object.keys(essayUpdate).length > 0) {
      updates.essay = { update: essayUpdate };
    }

    return this.prisma.activity.update({
      where: { id: activityId },
      data: updates.data || {},
    });
  }

  getRecentActivities(activityIds: string[], limit: number = 4) {
    return this.prisma.activity.findMany({
      where: {
        classId: { in: activityIds },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        essay: {
          include: {
            responses: true,
          },
        },
        class: {
          select: {
            members: { select: { id: true } },
          },
        },
      },
    });
  }

  getAllActivitiesForStudent(classIds: string[]) {
    return this.prisma.activity.findMany({
      where: {
        classId: { in: classIds },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            iconId: true,
          },
        },
        essay: {
          include: {
            responses: {
              select: {
                id: true,
                answerDate: true,
              },
            },
          },
        },
      },
    });
  }

  getAllAnswersForActivity(
    essayId: string,
    offset: number,
    limit: number
  ) {
    return this.prisma.essayResponse.findMany({
      where: { essayId },
      skip: offset,
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        feedback: {
          include: {
            feedback: true,
          },
        },
      },
    });
  }

  countAnswersForActivity(essayId: string) {
    return this.prisma.essayResponse.count({
      where: { essayId },
    });
  }

  startEssayResponse(essayId: string, studentId: string) {
    return this.prisma.essayResponse.findFirst({
      where: {
        essayId,
        studentId,
      },
    }).then(existing => {
      if (existing) return existing;
      return this.prisma.essayResponse.create({
        data: {
          essayId,
          studentId,
        },
      });
    });
  }

  submitEssayResponse(
    essayId: string,
    studentId: string,
    text: string
  ) {
    return this.prisma.essayResponse.updateMany({
      where: {
        essayId,
        studentId,
      },
      data: {
        text,
        answerDate: new Date(),
      },
    }).then(() => {
      return this.prisma.essayResponse.findFirst({
        where: {
          essayId,
          studentId,
        },
      });
    });
  }

  getResponseById(responseId: string) {
    return this.prisma.essayResponse.findUnique({
      where: { id: responseId },
      include: {
        essay: {
          include: {
            activity: {
              include: {
                class: {
                  select: { creatorId: true },
                },
              },
            },
          },
        },
        student: { select: { id: true } },
        feedback: {
          include: {
            feedback: true,
          },
        },
      },
    });
  }

  async provideFeedback(
    responseId: string,
    feedback: any
  ) {
    // First, check if teacher correction already exists
    const existing = await this.prisma.teacherCorrection.findUnique({
      where: { responseId },
      include: { feedback: true },
    });

    if (existing) {
      // Update existing feedback
      return this.prisma.teacherCorrection.update({
        where: { responseId },
        data: {
          feedback: {
            update: {
              gradeC1: feedback.gradeC1,
              gradeC2: feedback.gradeC2,
              gradeC3: feedback.gradeC3,
              gradeC4: feedback.gradeC4,
              gradeC5: feedback.gradeC5,
              feedbackC1: feedback.feedbackC1,
              feedbackC2: feedback.feedbackC2,
              feedbackC3: feedback.feedbackC3,
              feedbackC4: feedback.feedbackC4,
              feedbackC5: feedback.feedbackC5,
            },
          },
        },
        include: { feedback: true },
      });
    } else {
      // Create new feedback and teacher correction
      const newFeedback = await this.prisma.essayFeedback.create({
        data: {
          gradeC1: feedback.gradeC1,
          gradeC2: feedback.gradeC2,
          gradeC3: feedback.gradeC3,
          gradeC4: feedback.gradeC4,
          gradeC5: feedback.gradeC5,
          feedbackC1: feedback.feedbackC1,
          feedbackC2: feedback.feedbackC2,
          feedbackC3: feedback.feedbackC3,
          feedbackC4: feedback.feedbackC4,
          feedbackC5: feedback.feedbackC5,
        },
      });

      return this.prisma.teacherCorrection.create({
        data: {
          responseId,
          feedbackId: newFeedback.id,
        },
        include: { feedback: true },
      });
    }
  }

  markFeedbackAsSeen(responseId: string) {
    return this.prisma.teacherCorrection.update({
      where: { responseId },
      data: { seen: true },
    });
  }

  deleteActivity(activityId: string) {
    return this.prisma.activity.delete({
      where: { id: activityId },
    });
  }

  getActivityWithClass(activityId: string) {
    return this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        class: {
          select: {
            creatorId: true,
          },
        },
      },
    });
  }

  getStudentClassIds(studentId: string) {
    return this.prisma.class.findMany({
      where: {
        members: {
          some: { id: studentId },
        },
      },
      select: { id: true },
    });
  }

  getTeacherClassIds(teacherId: string) {
    return this.prisma.class.findMany({
      where: { creatorId: teacherId },
      select: { id: true },
    });
  }

  getTeacherActivities(classIds: string[]) {
    return this.prisma.activity.findMany({
      where: {
        classId: { in: classIds },
      },
    });
  }

  getEssayByActivityId(activityId: string) {
    return this.prisma.essay.findUnique({
      where: { activityId },
    });
  }

  getResponseByEssayAndStudent(essayId: string, studentId: string) {
    return this.prisma.essayResponse.findFirst({
      where: {
        essayId,
        studentId,
      },
      include: {
        essay: {
          include: {
            activity: {
              include: {
                class: {
                  select: { creatorId: true },
                },
              },
            },
          },
        },
        feedback: {
          include: {
            feedback: true,
          },
        },
      },
    });
  }
}
