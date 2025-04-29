import { Schema, model } from 'mongoose';

const ReqSchema = new Schema({
    lattes: {type: String, required: true},
    requisitante: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    revisor: {type: Schema.Types.ObjectId, ref: 'Usuario'},
    status: String
}, {timestamps: true})

export const RequisicaoProfessorModel = model('RequisicaoProfessor', ReqSchema);
