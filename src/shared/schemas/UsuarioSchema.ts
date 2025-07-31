import { z } from 'zod';
import { authMiddleware } from '../middlewares/Authentication';
import { genericError, schemaValidationError } from '../Schemas';
import type { EntitySchema } from '../Types';
import { idValidation, genericSuccessResponse } from '../Validations';
import {
  createUsuarioBodyValidation,
  createUsuarioResponse,
  getUsuarioResponse,
  professorCreateBodyValidation,
  updateSenhaBodyValidation,
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
        201: createUsuarioResponse,
        400: schemaValidationError,
        401: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Cria uma requisição de cadastro de usuário.',
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
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza dados do usuário',
    },
  },

  updateSenha: {
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateSenhaBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza senha do usuário',
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
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Exclui usuário selecionado',
    },
  },

  fotoGet: {
    schema: {
      params: idValidation,
      response: {
        400: schemaValidationError,
        404: genericError,
        500: genericError,
      },
      summary: 'Recupera a foto de um usuário',
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
        403: genericError,
        404: genericError,
        409: genericError,
        415: genericError,
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
        403: genericError,
        404: genericError,
        415: genericError,
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
        403: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Exclui a foto de um usuário',
    },
  },
};
