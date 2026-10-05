import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { PrismaService } from '@core/prisma/prisma.service';

const EXCLUDED_PREFIXES = ['/health', '/metrics', '/favicon.ico'];

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AccessLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const path = req.baseUrl
      ? `${req.baseUrl}${req.path}`
      : req.path || req.url?.split('?')[0] || '/';

    // Endpoints de health check e métricas são ignorados para evitar ruído
    if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordLog(req, res.statusCode, startTime, path);
        },
        error: (error) => {
          const statusCode =
            error?.status ?? error?.statusCode ?? res.statusCode ?? 500;
          this.recordLog(req, statusCode, startTime, path);
        },
      }),
    );
  }

  private recordLog(
    req: Request,
    statusCode: number,
    startTime: number,
    path: string,
  ) {
    const durationMs = Date.now() - startTime;
    const createdAt = new Date();
    // Marco Civil da Internet (Lei 12.965/2014, Art. 15): retenção obrigatória de 6 meses (180 dias)
    const expiresAt = new Date(createdAt.getTime() + 180 * 24 * 60 * 60 * 1000);

    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || null;
    const userId =
      (req as any).user?.id ?? (req as any).session?.user?.id ?? null;

    // Gravação assíncrona para não bloquear a resposta HTTP
    this.prisma.accessLog
      .create({
        data: {
          userId,
          ipAddress: rawIp,
          userAgent,
          method: req.method,
          path,
          statusCode,
          durationMs,
          createdAt,
          expiresAt,
        },
      })
      .catch((err) => {
        this.logger.warn(`Falha ao registrar AccessLog: ${err.message}`);
      });
  }
}
