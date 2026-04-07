import { ActivityCorrectedPayload, ActivitySubmittedPayload } from '@core/events';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityRepository } from './activity.repository';
import { CreateEssayActivityDto } from './dto/create-essay-activity.dto';
import { ProvideFeedbackDto } from './dto/provide-feedback.dto';
import { SubmitEssayResponseDto } from './dto/submit-essay-response.dto';
import { UpdateEssayActivityDto } from './dto/update-essay-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateEssayActivityDto, teacherId: string) {
    try {
      await this.repository.createEssayActivity(data, teacherId);
      return { message: 'activity created successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error creating activity');
    }
  }

  async get(activityId: string) {
    const activity = await this.repository.getEssayActivityDetails(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    if (!activity.essay) throw new NotFoundException('essay not found');

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      deadline: activity.deadline,
      theme: activity.essay.theme,
      timeLimitInMinutes: activity.essay.timeLimitInMinutes,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  }

  async update(activityId: string, data: UpdateEssayActivityDto, teacherId: string) {
    const activity = await this.repository.getActivityWithClass(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    if (activity.class.creatorId !== teacherId)
      throw new ForbiddenException(
        'activity does not exist or you do not have permission to update it',
      );

    try {
      await this.repository.updateEssayActivity(activityId, data);
      return { message: 'activity updated successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating activity');
    }
  }

  async getAllAnswers(activityId: string, teacherId: string, offset: number, limit: number) {
    const activity = await this.repository.getActivityWithClass(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    if (activity.class.creatorId !== teacherId)
      throw new ForbiddenException(
        'activity does not exist or you do not have permission to access it',
      );

    try {
      const essay = await this.repository.getEssayByActivityId(activityId);

      if (!essay) throw new NotFoundException('essay not found');

      const answers = await this.repository.getAllAnswersForActivity(essay.id, offset, limit);
      const totalDocuments = await this.repository.countAnswersForActivity(essay.id);

      const documents = answers.map((answer) => ({
        id: answer.id,
        studentName: answer.student.name,
        studentId: answer.student.id,
        text: answer.text || undefined,
        answerDate: answer.answerDate,
        hasFeedback: !!answer.feedback,
        feedbackSeen: answer.feedback?.seen || null,
      }));

      const nextOffset = Math.min(offset + limit, totalDocuments);
      const prevOffset = Math.max(offset - limit, 0);
      const totalPages = Math.ceil(totalDocuments / limit);
      const pagesUrl = Array.from(
        { length: totalPages },
        (_, i) => `offset=${i * limit}&limit=${limit}`,
      );

      return {
        documents,
        pagination: {
          offset,
          limit,
          nextPageUrl: nextOffset >= totalDocuments ? null : `/offset=${nextOffset}&limit=${limit}`,
          previousPageUrl: offset === 0 ? null : `/offset=${prevOffset}&limit=${limit}`,
          totalDocuments,
          pagesUrl,
        },
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error fetching activity responses');
    }
  }

  async recent(teacherId: string) {
    try {
      const classes = await this.repository.getTeacherClassIds(teacherId);
      const classIds = classes.map((c) => c.id);

      const activities = await this.repository.getRecentActivities(classIds, 4);

      return activities.map((activity) => {
        if (!activity.essay) {
          throw new NotFoundException('essay not found');
        }

        const submittedCount = activity.essay.responses.filter((r) => r.answerDate).length;
        const totalStudents = activity.class.members.length;

        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          submittedResponses: submittedCount,
          createdAt: activity.createdAt,
          totalStudents,
        };
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error fetching recent activities');
    }
  }

  async start(activityId: string, studentId: string) {
    const activity = await this.repository.getEssayActivityDetails(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    const essay = activity.essay;
    if (!essay) throw new NotFoundException('essay not found');

    try {
      await this.repository.startEssayResponse(essay.id, studentId);
      return { message: 'essay response started successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error starting essay response');
    }
  }

  async send(activityId: string, studentId: string, data: SubmitEssayResponseDto) {
    const activity = await this.repository.getEssayActivityDetails(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    const essay = activity.essay;
    if (!essay) throw new NotFoundException('essay not found');

    try {
      const response = await this.repository.submitEssayResponse(essay.id, studentId, data.text);

      const classData = await this.repository.getActivityWithClass(activityId);
      if (classData) {
        this.eventEmitter.emit(
          'activity.submitted',
          new ActivitySubmittedPayload(activityId, [classData.class.creatorId]),
        );
      }

      return { message: 'essay response submitted successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error submitting essay response');
    }
  }

  async feedback(responseId: string, data: ProvideFeedbackDto, teacherId: string) {
    const response = await this.repository.getResponseById(responseId);

    if (!response) throw new NotFoundException('response not found');

    const creatorId = response.essay.activity.class.creatorId;

    if (creatorId !== teacherId)
      throw new ForbiddenException(
        'You do not have permission to provide feedback on this response',
      );

    try {
      await this.repository.provideFeedback(responseId, data);

      const activityId = response.essay.activity.id;
      const studentId = response.student.id;
      this.eventEmitter.emit(
        'activity.corrected',
        new ActivityCorrectedPayload(activityId, [studentId]),
      );

      return { message: 'Feedback sent successfully!' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error providing feedback');
    }
  }

  async updateFeedbackStatus(responseId: string, studentId: string) {
    try {
      await this.repository.markFeedbackAsSeen(responseId);
      return { message: 'feedback status updated successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating feedback status');
    }
  }

  async delete(activityId: string, teacherId: string) {
    const activity = await this.repository.getActivityWithClass(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    if (activity.class.creatorId !== teacherId)
      throw new ForbiddenException(
        'activity does not exist or you do not have permission to delete it',
      );

    try {
      await this.repository.deleteActivity(activityId);
      return { message: 'activity deleted successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error deleting activity');
    }
  }

  async getAll(studentId: string) {
    try {
      const classes = await this.repository.getStudentClassIds(studentId);
      const classIds = classes.map((c) => c.id);

      const activities = await this.repository.getAllActivitiesForStudent(classIds);

      return activities.map((activity) => {
        if (!activity.essay) {
          throw new NotFoundException('essay not found');
        }

        const response = activity.essay.responses[0];
        let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' = 'NOT_STARTED';

        if (response?.answerDate) {
          status = 'SUBMITTED';
        } else if (response?.id) {
          status = 'IN_PROGRESS';
        }

        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          deadline: activity.deadline,
          activityType: 'ESSAY' as const,
          status,
          class: {
            id: activity.class.id,
            name: activity.class.name,
            iconId: activity.class.iconId,
          },
        };
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error fetching student activities');
    }
  }

  async getCorrection(activityId: string, studentId: string, userId: string) {
    const activity = await this.repository.getEssayActivityDetails(activityId);

    if (!activity) throw new NotFoundException('activity not found');

    const essay = activity.essay;
    if (!essay) throw new NotFoundException('essay not found');

    const response = await this.repository.getResponseByEssayAndStudent(essay.id, studentId);

    if (!response) throw new NotFoundException('correction not found');

    const creatorId = response.essay.activity.class.creatorId;

    // Verify access: student can see their own, teacher can see student responses
    const isStudent = userId === studentId;
    const isTeacher = userId === creatorId;

    if (!isStudent && !isTeacher)
      throw new ForbiddenException('You do not have permission to access this');

    return {
      id: response.id,
      title: response.essay.activity.title,
      theme: response.essay.theme,
      text: response.text || undefined,
      feedback: response.feedback?.feedback
        ? {
            gradeC1: response.feedback.feedback.gradeC1,
            gradeC2: response.feedback.feedback.gradeC2,
            gradeC3: response.feedback.feedback.gradeC3,
            gradeC4: response.feedback.feedback.gradeC4,
            gradeC5: response.feedback.feedback.gradeC5,
            feedbackC1: response.feedback.feedback.feedbackC1,
            feedbackC2: response.feedback.feedback.feedbackC2,
            feedbackC3: response.feedback.feedback.feedbackC3,
            feedbackC4: response.feedback.feedback.feedbackC4,
            feedbackC5: response.feedback.feedback.feedbackC5,
          }
        : undefined,
    };
  }
}
