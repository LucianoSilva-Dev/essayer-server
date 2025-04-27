import { Schema, model } from 'mongoose';

const UsuarioSchema = new Schema({
    nome: {type: String, required: true},
    senha: {type: String, required: true},
    email: {type: String, required: true},
    cargo: {type: String, required: true},
    foto: String,
}, {timestamps: true})

export const UsuarioModel = model('Usuario', UsuarioSchema);
