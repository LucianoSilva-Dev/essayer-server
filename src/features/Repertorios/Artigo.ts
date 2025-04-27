import { Schema, model } from 'mongoose';

const ArtigoSchema = new Schema({
    titulo: {type: String, required: true},
    resumo: {type: String, required: true},
    autor: {type: String, required: true},
    fonte: {type: String, required: true},
    criador: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    likes: [{type: Schema.Types.ObjectId, ref: 'Usuario'}],
    comentarios: [{
        usuario: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'}, 
        texto: {type: String, required: true}
    }]
}, {timestamps: true})

export const ArtigoModel = model('Artigo', ArtigoSchema);
