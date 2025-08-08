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
  updateSenhaBodyValidation,
  updateUsuarioBodyValidation,
} from './validations/UsuarioValidation';
import type { updateStatusBodyValidation } from './validations/RequisicaoProfessorValidation';
import type { userCargo } from './Validations';
import type {
  createRequisicaoMudancaSenhaBodyValidation,
  validateRequisicaoMudancaSenhaBodyValidation,
} from './validations/RequisicaoMudancaSenhaValidation';
import type { validateRequisicaoUsuarioBodyValidation } from './validations/RequisicaoUsuarioValidation';

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

/* TODO: Isso aqui em baixo é tudo porcaria. Colocar na definição do DTO */

export type createUsuarioBody = z.infer<typeof createUsuarioBodyValidation>;
export type updateUsuarioBody = z.infer<typeof updateUsuarioBodyValidation>;
export type professorCreateBody = z.infer<typeof professorCreateBodyValidation>;
export type updateStatusBody = z.infer<typeof updateStatusBodyValidation>;
export type validateRequisicaoMudancaSenhaBody = z.infer<
  typeof validateRequisicaoMudancaSenhaBodyValidation
>;
export type validateRequisicaoUsuarioBody = z.infer<
  typeof validateRequisicaoUsuarioBodyValidation
>;
export type updateSenhaBody = z.infer<typeof updateSenhaBodyValidation>;
export type createRequisicaoMudancaSenhaBody = z.infer<
  typeof createRequisicaoMudancaSenhaBodyValidation
>;
