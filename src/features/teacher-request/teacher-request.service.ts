import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { TeacherRequestRepository } from "./teacher-request.repository";
import { TeacherRequestResponseDto } from "./dto/teacher-request-response.dto";
import { RequestStatus } from "@core/prisma";

@Injectable()
export class TeacherRequestService {
  constructor(private readonly repository: TeacherRequestRepository) { }

  async getAll() {
    const requests = await this.repository.getAll()

    return requests.map(request => {
      return {
        id: request.id,
        lattes: request.lattes,
        requester: request.user,
        reviewer: request.reviewer,
        status: request.status,
        createdAt: request.createdAt
      }
    })
  }

  async get(id: string) {
    const request = await this.repository.get(id)

    if (!request) throw new NotFoundException('request not found')

    return {
      id: request.id,
      lattes: request.lattes,
      requester: request.user,
      reviewer: request.reviewer,
      status: request.status,
      createdAt: request.createdAt
    }
  }

  // TODO: adicionar SSE e Email
  async updateStatus(id: string, reviewerId: string, status: RequestStatus, reason?: string) {
    if (status === 'REFUSED' && !reason) throw new BadRequestException('If status is REFUSED, a reason must be stated')

    try {
      await this.repository.update(id, status, reviewerId)

      return { message: 'status updated successfully' }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating status')
    }
  }
}
