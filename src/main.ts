import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setAppContext } from './app.registry';
import type { EnvConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get config service
  const configService = app.get<ConfigService<EnvConfig>>(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // Set the global app context
  setAppContext(app);

  // Enable CORS
  app.enableCors({
    origin: true, // TODO: Configure proper origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);

  const url = await app.getUrl();
  console.log(`🚀 Server running at ${url} 🚀`);
}

void bootstrap();
