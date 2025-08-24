import { Schema, Types } from 'mongoose';
import { AtividadeModel } from '../Model';
import type { RedacaoAtividade } from './Types';

export const RedacaoAtividadeModel = AtividadeModel.discriminator<RedacaoAtividade>(
  'Redacao',
  new Schema({
    tema: { type: String, required: true },
    tempoLimiteEmMinutos: { type: Number },
    repertoriosApoio: [{ type: Types.ObjectId, ref: 'Repertorio' }],
  }),
);