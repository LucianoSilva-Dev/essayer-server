import { TeacherRequestStatusPayload } from '@core/events';
import { RequestStatus } from '@core/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeacherRequestRepository } from './teacher-request.repository';

@Injectable()
export class TeacherRequestService {
  constructor(
    private readonly repository: TeacherRequestRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async getAll() {
    const requests = await this.repository.getAll();

    return requests.map((request) => {
      return {
        id: request.id,
        lattes: request.lattes,
        requester: request.user,
        reviewer: request.reviewer,
        status: request.status,
        createdAt: request.createdAt,
      };
    });
  }

  async get(id: string) {
    const request = await this.repository.get(id);

    if (!request) throw new NotFoundException('request not found');

    return {
      id: request.id,
      lattes: request.lattes,
      requester: request.user,
      reviewer: request.reviewer,
      status: request.status,
      createdAt: request.createdAt,
    };
  }

  // TODO: adicionar Email
  async updateStatus(id: string, reviewerId: string, status: RequestStatus, reason?: string) {
    if (status === 'REFUSED' && !reason)
      throw new BadRequestException('If status is REFUSED, a reason must be stated');

    try {
      const request = await this.repository.get(id);

      if (!request) throw new NotFoundException('request not found');

      await this.repository.update(id, status, reviewerId);

      this.eventEmitter.emit(
        'teacher-request.status',
        new TeacherRequestStatusPayload(id, request.user.id, status === 'APPROVED', reason),
      );

      if (request.hookUrl) {
        await fetch(request.hookUrl, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ status, reason }) 
        })
      }

      return { message: 'status updated successfully' };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      console.log(err);
      throw new InternalServerErrorException('Error updating status');
    }
  }
}
