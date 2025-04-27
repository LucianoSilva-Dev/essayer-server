import {Schema, model} from 'mongoose'

const usuarioSchema = new Schema({
    nome: {type: String, required: true},
    senha: {type: String, required: true},
    email: {type: String, required: true},
    cargo: {type: String, required: true},
    foto: String,
}, {timestamps: true})

const reqSchema = new Schema({
    lattes: {type: String, required: true},
    requisitante: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    revisor: {type: Schema.Types.ObjectId, ref: 'Usuario'}
}, {timestamps: true})

const citacaoSchema = new Schema({
    frase: {type: String, required: true},
    autor: {type: String, required: true},
    fonte: String,
    criador: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    likes: [{type: Schema.Types.ObjectId, ref: 'Usuario'}],
    comentarios: [{
        usuario: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'}, 
        texto: {type: String, required: true}
    }]
}, {timestamps: true})

const artigoSchema = new Schema({
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

const obraSchema = new Schema({
    titulo: {type: String, required: true},
    sinopse: {type: String, required: true},
    autor: {type: String, required: true},
    criador: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'},
    likes: [{type: Schema.Types.ObjectId, ref: 'Usuario'}],
    comentarios: [{
        usuario: {type: Schema.Types.ObjectId, required: true, ref: 'Usuario'}, 
        texto: {type: String, required: true}
    }]
}, {timestamps: true})

