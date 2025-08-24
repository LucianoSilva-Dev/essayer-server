import type { Types } from 'mongoose';
import type { z } from 'zod';
import type { tiposAtividade } from './Validations';

// Interface base para todas as atividades
export type Atividade = {
  _id: Types.ObjectId;
  titulo: string;
  descricao: string;
  dataLimite: Date | null;
  turma: Types.ObjectId;
  tipoAtividade: TiposAtividade; // Discriminator key
  createdAt: Date;
  updatedAt: Date;
};

export type TiposAtividade = z.infer<typeof tiposAtividade>