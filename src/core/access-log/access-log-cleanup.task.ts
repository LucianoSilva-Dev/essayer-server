import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class AccessLogCleanupTask {
  private readonly logger = new Logger(AccessLogCleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredAccessLogs() {
    try {
      const deleted = await this.prisma.accessLog.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      this.logger.log(`Access log cleanup: ${deleted.count} registros removidos`);
      return deleted.count;
    } catch (error) {
      this.logger.error('Erro ao executar limpeza de access logs expirados', error);
      throw error;
    }
  }
}
