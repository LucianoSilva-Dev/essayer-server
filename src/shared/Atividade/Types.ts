import type { Types } from 'mongoose';
import type { z } from 'zod';
import type { tiposAtividade } from './Validations';

// Interface base para todas as atividades
export type Atividade = {
  _id: Types.ObjectId;
  titulo: string;
  descricao: string;
  dataLimite: Date | null;
  turma: {
    _id: Types.ObjectId;
    nome: string;
    criador: Types.ObjectId;
    membros: Types.ObjectId[];
  };
  respostas: {
    id: Types.ObjectId;
    aluno: Types.ObjectId;
    texto?: string;
    dataEnvio?: Date;
      feedback?: {
        notaC1: Number,
        notaC2: Number,
        notaC3: Number,
        notaC4: Number,
        notaC5: Number,
        feedbackC1: String,
        feedbackC2: String,
        feedbackC3: String,
        feedbackC4: String,
        feedbackC5: String,
        visto: Boolean,
      };
  }[];
  tipoAtividade: TiposAtividade; // Discriminator key
  createdAt: Date;
  updatedAt: Date;
};

export type TiposAtividade = z.infer<typeof tiposAtividade>;
