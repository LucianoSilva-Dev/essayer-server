import { model, Schema } from 'mongoose';
import { CorrecaoRedacaoIASchema } from '../../shared/CorrecaoRedacaoIA/Model';

const RedacaoLiveSchema = new Schema(
  {
    aluno: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tema: { type: String, required: true },
    texto: String,
    duracao: Number,
    dataRealizacao: Date,
    finalizada: { type: Boolean, default: false },
    correcoesIA: [CorrecaoRedacaoIASchema]
  },
  { timestamps: true },
);

export const RedacaoLivreModel = model('RedacaoLivre', RedacaoLiveSchema);
