// Backend/src/features/Repertorios/Validations/RepertorioValidation.ts
import { genericError, schemaValidationError } from '../../../shared/Schemas';
import type { EntitySchema } from '../../../shared/Types';
import {
  genericSuccessResponse,
  idValidation,
} from '../../../shared/Validations';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../../shared/middlewares/Authentication';
import { authProfessor } from '../../../shared/middlewares/Authorization';
import {
  createComentarioBodyValidation,
  getAllRepertorioQueryValidation,
  getAllRepertorioResponse,
  updateComentarioBodyValidation, // ADICIONADO
} from '../Validations/RepertorioValidation';

export const RepertorioSchema: EntitySchema = {
  get_all: {
    preHandler: optionalAuthMiddleware,
    schema: {
      security: [{ jwtAuth: [] }, {}], // "{}" significa autenticacão opcional
      querystring: getAllRepertorioQueryValidation,
      response: {
        200: getAllRepertorioResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Recupera todos os repertórios',
    },
  },
  delete: {
    preHandler: authProfessor,
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
      summary: 'Exclui repertório selecionado',
    },
  },

  createComentario: {
    preHandler: authMiddleware, // Alterado para permitir qualquer usuário logado
    schema: {
      security: [{ jwtAuth: [] }],
      body: createComentarioBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Cria um comentário no repertório selecionado',
    },
  },
  updateComentario: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      body: updateComentarioBodyValidation,
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Atualiza um comentário do repertório selecionado',
    }
  },
  deleteComentario: {
    preHandler: authMiddleware, // Alterado para permitir qualquer usuário logado
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        403: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Remove um comentário do repertório selecionado',
    },
  },

  createLike: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Cria um like no repertório selecionado',
    },
  },
  deleteLike: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Remove um like do repertório selecionado',
    },
  },

  createFavorito: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        409: genericError,
        500: genericError,
      },
      summary: 'Adiciona um repertório à lista de favoritos',
    },
  },
  deleteFavorito: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      response: {
        200: genericSuccessResponse,
        400: schemaValidationError,
        401: genericError,
        404: genericError,
        500: genericError,
      },
      summary: 'Remove um repertório da lista de favoritos',
    },
  },
};