import type { ApiServersResult, BuildApiServersParams } from '../docs.types';

/**
 * Builds API server configurations for OpenAPI documentation.
 * Creates both local and production server entries for the Swagger/Scalar UI.
 *
 * @param params - Server configuration parameters
 * @returns Object containing local and production server configurations
 */
export function buildApiServers({
  port,
  productionUrl,
  localServerVars,
  productionServerVars,
}: BuildApiServersParams): ApiServersResult {
  const localUrl = `http://localhost:${port}`;

  return {
    localServer: {
      url: localUrl,
      description: 'Local development server',
      variables: localServerVars,
    },
    productionServer: {
      url: productionUrl ?? localUrl,
      description: productionUrl ? 'Production server' : 'Local development server',
      variables: productionServerVars,
    },
  };
}
