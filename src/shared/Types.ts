import type {
  FastifyBaseLogger,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
  RouteShorthandOptions,
} from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

export type RouteSchema = RouteShorthandOptions<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  RouteGenericInterface,
  unknown,
  FastifySchema,
  ZodTypeProvider,
  FastifyBaseLogger
>;

export type EntitySchema = {
  [key: string]: RouteSchema;
};

export type ControllerMethod = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

export type Controller = Record<string, ControllerMethod>;

export type ServiceMethod = (
  // biome-ignore lint/suspicious/noExplicitAny:
  ...args: any[]
) => Promise<
  | { success: false; status: number; message: string }
  // biome-ignore lint/suspicious/noExplicitAny:
  | { success: true; data: any }
>;

export type Service = Record<string, ServiceMethod>;

export type RequestUserData = {
  id: string;
  iat: number;
};
