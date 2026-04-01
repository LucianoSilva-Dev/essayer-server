import { PrismaService } from "@core/prisma";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}
}
