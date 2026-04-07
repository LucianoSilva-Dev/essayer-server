import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserEssayRepository } from './user-essay.repository';
import { CreateUserEssayDto } from './dto/create-user-essay.dto';
import { UpdateUserEssayDto } from './dto/update-user-essay.dto';
import { CorrectEssayDto } from './dto/correct-essay.dto';
import { EssayCorrectionQueue } from './essay-correction.queue';
import {
  CorrectionSseConnectionsManager,
  ICorrectionSseEvent,
} from './correction-sse-connections.manager';
import { Subject, interval, merge, map, finalize } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class UserEssayService {
  constructor(
    private readonly repository: UserEssayRepository,
    private readonly correctionQueue: EssayCorrectionQueue,
    private readonly correctionSseManager: CorrectionSseConnectionsManager,
  ) {}

  async create(data: CreateUserEssayDto, studentId: string) {
    try {
      const essay = await this.repository.createUserEssay(studentId, data);
      return { id: essay.id };
    } catch (error) {
      throw new InternalServerErrorException('Error creating user essay');
    }
  }

  async getAll(studentId: string, theme?: string) {
    try {
      const essays = await this.repository.getAllUserEssays(studentId, theme);
      return essays.map((essay) => ({
        id: essay.id,
        theme: essay.theme,
        text: essay.text || undefined,
        duration: essay.duration || undefined,
        date: essay.date,
        finished: essay.finished,
        createdAt: essay.createdAt,
        updatedAt: essay.updatedAt,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error fetching user essays');
    }
  }

  async get(userEssayId: string, studentId: string) {
    const essay = await this.repository.getUserEssayWithCorrections(userEssayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to access this essay');

    const corrections = (essay.aiCorrections ?? []).map((correction) => {
      const base = {
        id: correction.id,
        status: correction.status,
        createdAt: correction.createdAt,
      };

      if (correction.status === 'FINISHED' && correction.feedback) {
        return {
          ...base,
          gradeC1: correction.feedback.gradeC1,
          gradeC2: correction.feedback.gradeC2,
          gradeC3: correction.feedback.gradeC3,
          gradeC4: correction.feedback.gradeC4,
          gradeC5: correction.feedback.gradeC5,
          feedbackC1: correction.feedback.feedbackC1,
          feedbackC2: correction.feedback.feedbackC2,
          feedbackC3: correction.feedback.feedbackC3,
          feedbackC4: correction.feedback.feedbackC4,
          feedbackC5: correction.feedback.feedbackC5,
        };
      }

      return base;
    });

    return {
      id: essay.id,
      theme: essay.theme,
      text: essay.text || undefined,
      duration: essay.duration || undefined,
      date: essay.date,
      finished: essay.finished,
      corrections,
      createdAt: essay.createdAt,
      updatedAt: essay.updatedAt,
    };
  }

  async update(userEssayId: string, data: UpdateUserEssayDto, studentId: string) {
    const essay = await this.repository.getUserEssayById(userEssayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to update this essay');

    try {
      await this.repository.updateUserEssay(userEssayId, data);
      return { message: 'User essay updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Error updating user essay');
    }
  }

  async delete(userEssayId: string, studentId: string) {
    const essay = await this.repository.getUserEssayById(userEssayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to delete this essay');

    try {
      await this.repository.deleteUserEssay(userEssayId);
      return { message: 'User essay deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user essay');
    }
  }

  async correct(essayId: string, dto: CorrectEssayDto, studentId: string) {
    const essay = await this.repository.getUserEssayById(essayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to correct this essay');

    const activeCount = await this.repository.getActiveCorrectionCount(essayId);
    if (activeCount > 0) {
      throw new ConflictException('A correction for this essay is already in progress');
    }

    const job = await this.correctionQueue.getJob(essayId);
    const jobState = await job?.getState();

    if (jobState !== undefined && jobState !== 'failed') {
      throw new ConflictException('A correction for this essay is already in progress');
    }

    const correction = await this.repository.createAiCorrection(essayId, dto.essayText);

    await this.correctionQueue.addCorrectionJob({
      essayId,
      correctionId: correction.id,
      theme: dto.theme,
      text: dto.essayText,
      userId: studentId,
    });

    return null;
  }

  listenCorrection(essayId: string, studentId: string) {
    const subject = new Subject<ICorrectionSseEvent>();

    this.correctionSseManager.addConnection(essayId, subject);

    const heartbeatStream = interval(30_000).pipe(
      map(
        () =>
          ({
            type: 'heartbeat',
          }) as MessageEvent,
      ),
    );

    const correctionStream = subject.pipe(
      map(
        (event) =>
          ({
            type: event.event,
            data: event.data,
          }) as MessageEvent,
      ),
    );

    return merge(heartbeatStream, correctionStream).pipe(
      finalize(() => {
        this.correctionSseManager.removeConnection(essayId, subject);
        subject.complete();
      }),
    );
  }

  async deleteCorrection(essayId: string, correctionId: string, studentId: string) {
    const essay = await this.repository.getUserEssayById(essayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to delete this correction');

    await this.correctionQueue.removeJob(correctionId);
    await this.repository.deleteAiCorrection(correctionId);

    return { message: 'Correction deleted successfully' };
  }

  async retryCorrection(essayId: string, correctionId: string, studentId: string) {
    const essay = await this.repository.getUserEssayById(essayId);

    if (!essay) throw new NotFoundException('User essay not found');
    if (essay.studentId !== studentId)
      throw new ForbiddenException('You do not have permission to retry this correction');

    const correction = await this.repository.findAiCorrectionById(correctionId);

    if (!correction) throw new NotFoundException('Correction not found');
    if (correction.status !== 'ERROR') {
      throw new ConflictException('Only corrections with ERROR status can be retried');
    }

    const job = await this.correctionQueue.getJob(correctionId);
    const jobState = await job?.getState();

    if (!job || jobState !== 'failed') {
      throw new ConflictException('The correction is not in a state that allows retry');
    }

    await job.retry();
    await this.repository.updateAiCorrectionStatus(correctionId, 'PENDING' as any);

    return { message: 'Correction retry initiated successfully' };
  }
}
