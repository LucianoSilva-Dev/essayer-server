import type { INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { auth } from '../auth/auth';

/**
 * Configure Scalar API documentation.
 * Generates the OpenAPI spec from better-auth and mounts it at /docs.
 *
 * @param app - The NestJS application instance
 * @param appPort - The port the application is running on
 */
export async function setupDocs(app: INestApplication, appPort: number) {
  // Generate OpenAPI schema from better-auth (via openAPI plugin)
  const authOpenApiSpec = await auth.api.generateOpenAPISchema();

  // Define servers for valid 'Try it out' requests
  const baseUrl = `http://localhost:${appPort}`;
  authOpenApiSpec.servers = [{ url: `${baseUrl}/auth` }];

  // Mount Scalar API reference
  app.use(
    '/docs',
    apiReference({
      spec: {
        content: authOpenApiSpec,
      },
      configuration: {
        theme: 'deepSpace',
        metaData: {
          title: 'Essayer Auth API',
        },
      },
    }),
  );
}
