import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { idValidation, genericSuccessResponse } from '../Validations';
import {
  createUsuarioBodyValidation,
  getUsuarioResponse,
  professorCreateBodyValidation,
  updateUsuarioBodyValidation,
} from '../validations/UsuarioValidation';

export const UsuarioSchema: EntitySchema = {
  get: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getUsuarioResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera usuário selecionado',
    },
  },

  create: {
    schema: {
      body: createUsuarioBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Cria um novo usuário',
    },
  },

  professorCreate: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      body: professorCreateBodyValidation,
      response: {
        201: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Cria uma requisição de cadastro de professor',
    },
  },

  update: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateUsuarioBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados do usuário',
    },
  },

  delete: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui usuário selecionado',
    },
  },

  fotoCreate: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Adiciona uma foto a um usuário',
    },
  },

  fotoUpdate: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza a foto de um usuário',
    },
  },

  fotoDelete: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Exclui a foto de um usuário',
    },
  },
};
