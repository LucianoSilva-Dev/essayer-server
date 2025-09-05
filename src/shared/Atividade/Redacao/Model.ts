import { Schema, Types } from 'mongoose';
import { AtividadeModel } from '../Model';
import type { RedacaoAtividade } from './Types';

const RespostaRedacaoSchema = new Schema({
  aluno: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  dataEnvio: Date,
  texto: String,
  feedback: String,
});

export const RedacaoAtividadeModel =
  AtividadeModel.discriminator<RedacaoAtividade>(
    'Redacao',
    new Schema({
      tema: { type: String, required: true },
      tempoLimiteEmMinutos: { type: Number },
      respostas: [RespostaRedacaoSchema],
      repertoriosApoio: [{ type: Types.ObjectId, ref: 'Repertorio' }],
    }),
  );
