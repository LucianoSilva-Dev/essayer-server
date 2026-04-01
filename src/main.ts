import { LoggerService } from "@core/logger/logger.service";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setAppContext } from "./app.registry";
import type { EnvConfig } from "./config";
import { setupDocs } from "./core/docs/setup.docs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  
  // Get config service
  const configService = app.get<ConfigService<EnvConfig>>(ConfigService);
  const port = configService.get<number>("PORT") ?? 3000;

  // Configure custom logger
  app.useLogger(app.get(LoggerService));

  // Set the global app context
  setAppContext(app);

  // Enable CORS
  app.enableCors({
    origin: true, // TODO: Configure proper origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Setup Scalar Docs
  await setupDocs(app, port);

  await app.listen(port);

  const url = await app.getUrl();
  console.log(`🚀 Server running at ${url} 🚀`);
  console.log(`📚 Documentation available at ${url}/docs`);
}

void bootstrap();
