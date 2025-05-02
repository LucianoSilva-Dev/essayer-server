import { Schema, model, type Document } from 'mongoose';

const CitacaoSchema = new Schema(
  {
    frase: { type: String, required: true },
    autor: { type: String, required: true },
    fonte: String,
    criador: { type: Schema.Types.ObjectId, required: true, ref: 'Usuario' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    favoritos: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    comentarios: [
      {
        usuario: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Usuario',
        },
        texto: { type: String, required: true },
      },
    ],
    subtopicos: [String],
  },
  { timestamps: true },
);

export const CitacaoModel = model('Citacao', CitacaoSchema);
