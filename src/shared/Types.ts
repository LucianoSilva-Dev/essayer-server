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
import type { z } from 'zod';
import type { userCargo } from './Validations';
import type { PerfilUsuario } from '../features/Repertorios/Types';
import type { Types } from 'mongoose';
import type { sseGenericError, sseValidationError } from './Schemas';

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

export type UserCargo = z.infer<typeof userCargo>;

export type RequestUserData = {
  id: string;
  cargo: UserCargo;
  nome: string;
  iat: number;
};

export type PopulatedPerfilUsuario = Omit<PerfilUsuario, 'id'> & {
  _id: Types.ObjectId
}

export type Populate<
  BaseType,
  // biome-ignore lint/suspicious/noExplicitAny: pode deixar assim pai, confia na call
  Population extends Partial<Record<keyof BaseType, any>>
> = Omit<BaseType, keyof Population> & Population;

// Server Sent Events(sse) Errors
export type SSEGenericError = z.infer<typeof sseGenericError>
export type SSEValidationError = z.infer<typeof sseValidationError>