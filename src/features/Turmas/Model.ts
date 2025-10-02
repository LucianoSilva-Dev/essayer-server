import { Schema, model, Types } from 'mongoose';
import type { Turma } from './Types';

const TurmaSchema = new Schema<Turma>(
  {
    nome: { type: String, required: true },
    iconeId: { type: String, required: true, default: 'none' },
    escola: { type: String, default: null },
    criador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    membros: [{ type: Types.ObjectId, ref: 'Usuario', default: [] }],
    alunosPendentes: [{ type: Types.ObjectId, ref: 'Usuario', default: [] }],
    codigoConvite: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const TurmaModel = model<Turma>('Turma', TurmaSchema);
