import { Schema, model } from 'mongoose';

const ReqSchema = new Schema(
  {
    requisitante: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Usuario',
    },
    codigo: { type: String, required: true },
  },
  { timestamps: true },
);

export const RequisicaoMudancaSenhaModel = model(
  'RequisicaoMudancaSenha',
  ReqSchema,
);
