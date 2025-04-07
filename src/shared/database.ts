import {Schema, model} from 'mongoose'

const userSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true}
})

const adminSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
})

const repSchema = new Schema({
    conteudo: {type: String, required: true},
    autor: {type: String, required: true},
    fonte: {type: String, required: true},
    usuario: {type: Schema.Types.ObjectId, ref: "Usuario"},
    admin: {type: Schema.Types.ObjectId, ref: "Admin"}
})

const t_repSchema = new Schema({
    conteudo: {type: String, required: true},
    autor: {type: String, required: true},
    fonte: {type: String, required: true},
    usuario: {type: Schema.Types.ObjectId, ref: "Usuario"},
})


export const Usuario = model('Usuario', userSchema)
export const Admin = model('Admin', adminSchema)
export const t_Repertorio = model('t_Repertorio', t_repSchema)
export const Repertorio = model('Repertorio', repSchema)
