import type { ServerVariableObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Parameters for building API server configurations.
 * Used to define local and production server URLs for the OpenAPI documentation.
 */
export type BuildApiServersParams = {
  /** Local server port */
  port: number;
  /** Optional production API URL (falls back to localhost if not provided) */
  productionUrl?: string;
  /** Optional variables for the local server */
  localServerVars?: Record<string, ServerVariableObject>;
  /** Optional variables for the production server */
  productionServerVars?: Record<string, ServerVariableObject>;
};

/**
 * API server configuration returned by buildApiServers.
 */
export type ApiServerConfig = {
  url: string;
  description: string;
  variables?: Record<string, ServerVariableObject>;
};

/**
 * Result of buildApiServers helper.
 */
export type ApiServersResult = {
  localServer: ApiServerConfig;
  productionServer: ApiServerConfig;
};
