import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import type { EnvConfig } from '../../config';
import { auth } from '../auth/auth';
import { GlobalApiModels } from './docs.registry';
import { buildApiServers } from './helpers/build-api-servers';

/**
 * Configure OpenAPI documentation with Scalar UI.
 *
 * Features:
 * - Global schema registration (extraModels) to prevent duplicate schemas
 * - Multiple API sources (Base API + Auth API from better-auth)
 * - Local and production server configuration
 * - Scalar UI with modern theme
 *
 * @param app - The NestJS application instance
 * @param appPort - The port the application is running on
 */
export async function setupDocs(app: INestApplication, appPort: number) {
  // Get config service for production URL
  const configService = app.get<ConfigService<EnvConfig>>(ConfigService);
  const productionUrl = configService.get<string>('API_URL');

  // Build server configurations
  const apiServers = buildApiServers({
    port: appPort,
    productionUrl,
  });

  // Build OpenAPI document configuration
  const docsConfig = new DocumentBuilder()
    .setTitle('Essayer API')
    .setDescription('Backend API for the Essayer writing platform - Incita 2.0')
    .setVersion('2.0')
    .addBearerAuth()
    .addServer(apiServers.localServer.url, apiServers.localServer.description)
    .addServer(apiServers.productionServer.url, apiServers.productionServer.description)
    .build();

  // Create Swagger document with global models registered
  const swaggerAppDocument = SwaggerModule.createDocument(app, docsConfig, {
    extraModels: GlobalApiModels,
  });

  // Generate OpenAPI schema from better-auth (via openAPI plugin)
  const swaggerAuthDocument = await auth.api.generateOpenAPISchema();

  // Configure servers for auth API
  swaggerAuthDocument.servers = [
    { url: `${apiServers.localServer.url}/auth` },
    { url: `${apiServers.productionServer.url}/auth` },
  ];

  // Mount Scalar API reference with multiple sources
  app.use(
    '/docs',
    apiReference({
      sources: [
        {
          content: cleanupOpenApiDoc(swaggerAppDocument),
          title: 'Essayer Backend Base API',
          slug: 'essayer-backend-base-api',
        },
        {
          content: swaggerAuthDocument,
          title: 'Essayer Backend Auth API',
          slug: 'essayer-backend-auth-api',
        },
      ],
      theme: 'elysiajs',
      configuration: {
        metaData: {
          title: 'Essayer API Documentation',
        },
      },
    }),
  );
}
