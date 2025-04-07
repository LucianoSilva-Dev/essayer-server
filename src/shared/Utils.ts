import type { FastifyInstance } from 'fastify';

export function AddEntityWiseTags(
  app: FastifyInstance,
  tags: readonly string[],
) {
    app.addHook('onRoute', (routeOptions) => {
    if (routeOptions.schema) {
      routeOptions.schema.tags = tags;
    } else {
      routeOptions.schema = { tags };
    }
  });
}
