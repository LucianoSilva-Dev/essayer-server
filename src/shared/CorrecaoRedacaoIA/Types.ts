import type z from 'zod';
import type { correcaoRedacaoAIValidation } from './Validations';

export enum UnavailabilityReason {
  APIUnavailable = 'API Unavailable',
  RPDExceeded = 'RPD Exceeded',
  RPMExceeded = 'RPM Exceeded',
  Generic429HttpError = 'Generic 429 Http Error',
  GenericError = 'Generic Error',
}

export enum EnumCorrecaoRedacaoStatus {
  Finalizada = 'finalizada',
  Pendente = 'pendente',
  Erro = 'erro',
}

export type CorrecaoRedacaoIA = {
  texto: string;
  notaC1: number;
  notaC2: number;
  notaC3: number;
  notaC4: number;
  notaC5: number;
  feedbackC1: string;
  feedbackC2: string;
  feedbackC3: string;
  feedbackC4: string;
  feedbackC5: string;
  status: EnumCorrecaoRedacaoStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CorrecaoRedacaoAIValidation = z.infer<
  typeof correcaoRedacaoAIValidation
>;
