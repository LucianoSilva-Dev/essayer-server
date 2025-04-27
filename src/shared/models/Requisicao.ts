import { Schema, model } from 'mongoose';

const ReqSchema = new Schema({
    lattes: {type: String, required: true},
    requisitante: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    revisor: {type: Schema.Types.ObjectId, ref: 'Usuario'}
}, {timestamps: true})

export const RequisicaoModel = model('Requisicao', ReqSchema);
