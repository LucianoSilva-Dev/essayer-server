import { Schema, model } from 'mongoose';

const ReqSchema = new Schema(
  {
    nome: { type: String, required: true },
    senha: { type: String, required: true },
    email: { type: String, required: true },
    codigo: { type: String, required: true },
  },
  { timestamps: true },
);

export const RequisicaoUsuarioModel = model('RequisicaoUsuario', ReqSchema);
