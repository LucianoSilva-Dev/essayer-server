import type { ResponseSerializationError } from "fastify-type-provider-zod";
import type { FastifySchemaValidationError } from "fastify/types/schema";

export type ValidationErrorResponse = {
  errors: string[];
};

export type GenericErrorResponse = {
  error: string;
};

abstract class CustomError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    if ("captureStackTrace" in Error) {
        Error.captureStackTrace(this, CustomError);
    }else {
        this.stack = 'No stack trace available';
    }
  }
}

export class  SchemaValidationError extends CustomError {
  constructor(public errors: FastifySchemaValidationError[]) {
    super('Input Validation Error', 400);
  }
}

export class ResponseValidationError extends CustomError {
  constructor(public error: ResponseSerializationError) {
    super('Response Validation Error', 500);
  }
}

export class AppError extends CustomError {
  constructor(public statusCode: number, public error: string) {
    super('App Error', statusCode);
  }
}
