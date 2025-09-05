import { model, Schema } from 'mongoose';

const RedacaoLiveSchema = new Schema(
  {
    aluno: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tema: { type: String, required: true },
    texto: String,
    duracao: Number,
    dataRealizacao: Date,
    finalizada: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const RedacaoLivreModel = model('RedacaoLivre', RedacaoLiveSchema);
