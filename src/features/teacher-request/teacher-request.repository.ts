import { PrismaService, RequestStatus } from '@core/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TeacherRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  private requestQuery = {
    id: true,
    lattes: true,
    status: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
    reviewer: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
  };

  getAll() {
    return this.prisma.teacherRequest.findMany({
      select: this.requestQuery,
    });
  }

  get(id: string) {
    return this.prisma.teacherRequest.findUnique({
      where: { id },
      select: this.requestQuery,
    });
  }

  update(id: string, status: RequestStatus, reviewerId: string) {
    return this.prisma.teacherRequest.update({ where: { id }, data: { status, reviewerId } });
  }
}
