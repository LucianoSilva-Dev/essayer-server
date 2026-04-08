import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findIntegrationUser(integrationName: string, externalUserId: string) {
    return this.prisma.integrationUser.findFirst({
      where: {
        integrationName,
        externalUserId,
      },
      include: {
        user: true,
      },
    });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: { email: string; name: string; emailVerified?: boolean }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        emailVerified: data.emailVerified ?? true,
        role: 'student',
      },
    });
  }

  async createIntegrationUser(data: {
    integrationName: string;
    userId: string;
    externalUserId: string;
    externalRole: string;
  }) {
    return this.prisma.integrationUser.create({
      data,
      include: {
        user: true,
      },
    });
  }

}
