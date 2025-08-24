import type { Document, HydratedDocument, Types } from 'mongoose';
import type { z } from 'zod';
import type {
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
} from './Validation';

export type Turma = {
  _id: Types.ObjectId;
  nome: string;
  escola: string | null;
  criador: Types.ObjectId;
  membros: Types.ObjectId[];
  alunosPendentes: Types.ObjectId[];
  codigoConvite: string;
  createdAt: Date;
  updatedAt: Date;
};



export type CreateTurmaBody = z.infer<typeof createTurmaBodyValidation>;
export type UpdateTurmaBody = z.infer<typeof updateTurmaBodyValidation>;
export type SolicitarEntradaBody = z.infer<
  typeof solicitarEntradaBodyValidation
>;

export type GetTurmaResponse = z.infer<typeof getTurmaResponse>;
export type GetTurmasResponse = z.infer<typeof getTurmasResponse>;
export type GetTurmasCriadasResponse = z.infer<typeof getTurmasCriadasResponse>;
export type GetCodigoConviteResponse = z.infer<typeof getCodigoConviteResponse>;
export type GetAlunosPendentesResponse = z.infer<
  typeof getAlunosPendentesResponse
>;
export type GetAlunosResponse = z.infer<typeof getAlunosResponse>;
export type RegenerarCodigoResponse = z.infer<typeof regenerarCodigoResponse>;
export type GetAtividadesResponse = z.infer<typeof getAtividadesResponse>;
