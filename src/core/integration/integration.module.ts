import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { IntegrationController } from './integration.controller';
import { IntegrationUserGuard } from './integration.guard';
import { IntegrationUserMiddleware } from './integration.middleware';
import { IntegrationRepository } from './integration.repository';
import { IntegrationService } from './integration.service';

@Global()
@Module({
  controllers: [IntegrationController],
  providers: [
    IntegrationRepository,
    IntegrationService,
    {
      provide: APP_GUARD,
      useClass: IntegrationUserGuard,
    },
  ],
  exports: [IntegrationService, IntegrationRepository],
})
export class IntegrationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Register middleware for all routes
    consumer.apply(IntegrationUserMiddleware).forRoutes('*');
  }
}
