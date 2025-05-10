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
import type {
  createUsuarioBodyValidation,
  professorCreateBodyValidation,
  updateUsuarioBodyValidation,
} from './validations/UsuarioValidation';
import type { updateStatusBodyValidation } from './validations/RequisicaoProfessorValidation';

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

export type RequestUserData = {
  id: string;
  cargo: string;
  iat: number;
};

export type createUsuarioBody = z.infer<typeof createUsuarioBodyValidation>;
export type updateUsuarioBody = z.infer<typeof updateUsuarioBodyValidation>;
export type professorCreateBody = z.infer<typeof professorCreateBodyValidation>;
export type updateStatusBody = z.infer<typeof updateStatusBodyValidation>;
