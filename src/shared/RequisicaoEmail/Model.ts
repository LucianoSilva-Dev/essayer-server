import { Schema, model } from 'mongoose';

const ReqSchema = new Schema(
  {
    requisitante: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Usuario',
    },
    email: {type: String, required: true},
    codigo: { type: String, required: true },
  },
  { timestamps: true },
);

export const RequisicaoEmailModel = model('RequisicaoEmail', ReqSchema);
