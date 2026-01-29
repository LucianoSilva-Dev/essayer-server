/**
 * Global API Models Registry
 *
 * This file centralizes the registration of DTOs/models that should be
 * available globally in the OpenAPI documentation.
 *
 * When you add a DTO here, it will:
 * 1. Be registered in the OpenAPI components.schemas section
 * 2. Be referenceable via getSchemaPath() in any controller
 * 3. Generate a single, consistent schema across all API routes
 *
 * This prevents duplicate schemas when generating API clients.
 *
 * @example
 * ```typescript
 * // In your controller:
 * import { getSchemaPath } from '@nestjs/swagger';
 * import { UserResponseDto } from '@features/users/dto/user-response.dto';
 *
 * @ApiResponse({
 *   status: 200,
 *   schema: { $ref: getSchemaPath(UserResponseDto) }
 * })
 * ```
 */

// Import DTOs that should be registered globally
// Example (uncomment when features are implemented):
// import { UserResponseDto } from '@features/users/dto/user-response.dto';
// import { ClassResponseDto } from '@features/classes/dto/class-response.dto';

/**
 * Array of model classes to be registered globally in OpenAPI.
 * Add DTOs here as they are created during feature implementation.
 */
// biome-ignore lint/complexity/noBannedTypes: Function type is required for NestJS Swagger extraModels
export const GlobalApiModels: Function[] = [
  // Add DTOs here as features are implemented in Phase 3
  // UserResponseDto,
  // ClassResponseDto,
  // ActivityResponseDto,
];
