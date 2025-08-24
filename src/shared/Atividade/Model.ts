import { Schema, model } from 'mongoose';
import type { Atividade } from './Types';

const AtividadeSchema = new Schema<Atividade>(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    dataLimite: { type: Date, default: null }, // Data final para entrega
    turma: { type: Schema.Types.ObjectId, ref: 'Turma', required: true },
    tipoAtividade: { type: String, required: true },
  },
  {
    timestamps: true,
    discriminatorKey: 'tipoAtividade', // Chave para diferenciar os tipos de atividade
  },
);

export const AtividadeModel = model<Atividade>('Atividade', AtividadeSchema);