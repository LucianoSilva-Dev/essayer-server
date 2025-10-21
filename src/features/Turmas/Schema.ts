import { z } from 'zod';
import type { EntitySchema } from '../../shared/Types';
import { genericError, schemaValidationError } from '../../shared/Schemas';
import {
  createTurmaBodyValidation,
  updateTurmaBodyValidation,
  solicitarEntradaBodyValidation,
  getTurmaResponse,
  getTurmasResponse,
  getCodigoConviteResponse,
  getAlunosPendentesResponse,
  getAlunosResponse,
  regenerarCodigoResponse,
  getAtividadesResponse,
  getTurmasCriadasResponse,
  getAllTurmaQueryValidation,
  getAllAtividadesQueryValidation,
  getAtividadesCriadorResponse,
  getAllFeedbacksResponse,
} from './Validation';
import { idValidation, genericSuccessResponse } from '../../shared/Validations';
import { authProfessor, authProfessorCreate } from '../../shared/middlewares/Authorization';
import { authMiddleware } from '../../shared/middlewares/Authentication';

export const TurmaSchema: EntitySchema = {
  create: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ jwtAuth: [] }],
      body: createTurmaBodyValidation,
      response: {
        201: z.void(),
        400: schemaValidationError,

        403: genericError,
      },
      summary: 'Professor cria uma nova turma',
    },
  },
  getAll: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      querystring: getAllTurmaQueryValidation,
      response: {
        200: getTurmasResponse,
        401: genericError,
      },
      summary:
        'Lista turmas em que o usuário (aluno/professor) está matriculado',
    },
  },
  getCriadas: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      querystring: getAllTurmaQueryValidation,
      response: {
        200: getTurmasCriadasResponse,
        401: genericError,
        403: genericError,
      },
      summary: 'Lista turmas criadas pelo professor',
    },
  },
  getById: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getTurmaResponse,
        401: genericError,
        403: genericError,
        404: genericError,
      },
      summary: 'Obtém detalhes de uma turma específica',
    },
  },
  update: {
    preHandler: authProfessorCreate,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      body: updateTurmaBodyValidation,
      response: {
        204: z.void(),
        400: schemaValidationError,
        403: genericError,
        404: genericError,
      },
      summary: 'Professor atualiza dados da turma',
    },
  },
  delete: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: { 204: z.void(), 403: genericError, 404: genericError },
      summary: 'Professor exclui uma turma',
    },
  },
  solicitarEntrada: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      body: solicitarEntradaBodyValidation,
      response: {
        200: z.void(),
        404: genericError,
        409: genericError,
      },
      summary: 'Aluno solicita entrada em uma turma',
    },
  },
  getPedidos: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getAlunosPendentesResponse,
        403: genericError,
        404: genericError,
      },
      summary: 'Professor visualiza pedidos de entrada pendentes',
    },
  },
  aprovarPedido: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: z.object({
        id: idValidation.shape.id,
        alunoId: idValidation.shape.id,
      }),
      response: {
        200: genericSuccessResponse,
        403: genericError,
        404: genericError,
      },
      summary: 'Professor aprova a entrada de um aluno',
    },
  },
  recusarPedido: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: z.object({
        id: idValidation.shape.id,
        alunoId: idValidation.shape.id,
      }),
      response: { 204: z.void(), 403: genericError, 404: genericError },
      summary: 'Professor recusa a entrada de um aluno',
    },
  },
  getAllAlunos: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getAlunosResponse,
        403: genericError,
        404: genericError,
      },
      summary: 'Professor visualiza todos os alunos da turma',
    },
  },
  getCodigoConvite: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getCodigoConviteResponse,
        403: genericError,
        404: genericError,
      },
      summary: 'Obtém o código de convite de uma turma',
    },
  },
  regenerarCodigoConvite: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: regenerarCodigoResponse,
        403: genericError,
        404: genericError,
      },
      summary: 'Gera um novo código de convite para a turma',
    },
  },
  getAllAtividades: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      querystring: getAllAtividadesQueryValidation,
      response: { 200: getAtividadesResponse, 404: genericError },
      summary: 'Obtém todas as atividades de uma turma em que é membro',
    },
  },
  getAllAtividadesCriador: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      querystring: getAllAtividadesQueryValidation,
      response: { 200: getAtividadesCriadorResponse, 404: genericError },
      summary: 'Obtém todas as atividades de uma turma em que é o criador',
    },
  },
  removerAluno: {
    preHandler: authProfessor,
    schema: {
      security: [{ jwtAuth: [] }],
      params: z.object({
        id: idValidation.shape.id,
        alunoId: idValidation.shape.id,
      }),
      response: { 204: z.void(), 403: genericError, 404: genericError },
      summary: 'Professor remove um aluno da turma',
    },
  },
  getAllFeedbacks: {
    preHandler: authMiddleware,
    schema: {
      security: [{ jwtAuth: [] }],
      params: idValidation,
      response: {
        200: getAllFeedbacksResponse,
        400: schemaValidationError,
        401: genericError,
        500: genericError,
      },
      summary: 'Obtém todos os feedbacks de atividades da turma',
    }
  }
};
