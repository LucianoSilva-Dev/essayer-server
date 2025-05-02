import { Schema, model } from 'mongoose';

const ObraSchema = new Schema(
  {
    titulo: { type: String, required: true },
    sinopse: { type: String, required: true },
    autor: { type: String, required: true },
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
    tipo: { type: String, required: true },
  },
  { timestamps: true },
);

export const ObraModel = model('Obra', ObraSchema);
