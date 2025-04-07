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

  console.log('Erro generico capturado');
  console.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
};
