import { ComentarioSubDoc, PerfilUsuario } from "../Types";

export function mapAndSortComments(comments: ComentarioSubDoc[]) {
    const comentarios = comments.map((comment) => {
        return {
            id: comment._id.toString(),
            usuario: comment.usuario as unknown as PerfilUsuario,
            texto: comment.texto,
            fixado: comment.fixado
        }
    }).sort((a, b) => {
        if (a.fixado && !b.fixado) return -1;
        if (!a.fixado && b.fixado) return 1;
        return 0;
    })

    return comentarios;
}