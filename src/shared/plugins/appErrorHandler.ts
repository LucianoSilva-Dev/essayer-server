import type { FastifyInstance } from 'fastify';
import { AppError, SchemaValidationError, ResponseValidationError } from '../Errors';
import type { FastifySchemaValidationError } from 'fastify/types/schema';

const mapErrorMessage = (errors: FastifySchemaValidationError[]) =>{
  return errors.map((error) => error.message || 'unknown error');
}

export const appErrorHandler: FastifyInstance['errorHandler'] = (
  error: unknown,
  request,
  reply,
) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.error }); 
  }
  if (error instanceof SchemaValidationError) {
    return reply.status(error.statusCode).send({ errors: mapErrorMessage(error.errors) }); 
  }
  if (error instanceof ResponseValidationError) {
    console.log(error.error);
    return reply.status(500).send({ error: error.message });
  }

  if (error instanceof Error && (error as any).code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send({ error: 'Arquivo muito grande. O limite máximo é de 2MB.' });
  }

  if (error instanceof Error && (error as any).code && (error as any).code.startsWith('FST_REQ_')) {
    return reply.status(400).send({ errors: ['Não foi possível salvar a foto devido a um erro nos parâmetros de upload.'] });
  }

  console.log('Erro generico capturado');
  console.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
};
