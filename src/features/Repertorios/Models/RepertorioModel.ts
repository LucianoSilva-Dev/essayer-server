import { Schema, type Types, model } from 'mongoose';
import type { Repertorio } from '../Types';

const ComentarioSubDocSchema = new Schema({
  
  texto: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
})

// O seguinte model é usado como um modelo base para outros tipos de repertórios,
// ele contém os campos comuns a todos os repertórios, e faz com que todos que herdem dele
// sejam armazenados na mesma coleção, facilitando a busca e o gerenciamento dos dados.
// Durante a busca, ele identifica o tipo de repertorio e retorna o modelo correto
export const RepertorioDBSchema = new Schema<Repertorio>(
  {
    autor: { type: String, required: true },
    criador: { type: Schema.Types.ObjectId, required: true, ref: 'Usuario' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    favoritos: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    comentarios: [ComentarioSubDocSchema],
    subtopicos: [{ type: String, required: true }],
    tipoRepertorio: { type: String, required: true },
  },
  { timestamps: true, discriminatorKey: 'tipoRepertorio' },
);

export const RepertorioModel = model<Repertorio>(
  'Repertorio',
  RepertorioDBSchema,
);
