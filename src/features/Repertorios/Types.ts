import type {
  createArtigoBodyValidation,
  getArtigoResponse,
  updateArtigoBodyValidation,
} from './Validations/ArtigoValidation';
import type {
  getCitacaoResponse,
  createCitacaoBodyValidation,
  updateCitacaoBodyValidation,
} from './Validations/CitacaoValidation';
import type { perfilUsuarioResponse } from './Validations/Commom';
import type z from 'zod';
import type {
  createObraBodyValidation,
  getObraResponse,
  updateObraBodyValidation,
} from './Validations/ObraValidation';
import type { Types } from 'mongoose';
import type {
  getAllRepertorioResponse,
  getAllRepertorioQueryValidation,
  getAllRepertorioDocuments,
  getAllRepertorioObraDoc,
  getAllRepertorioArtigoDoc,
  getAllRepertorioCitacaoDoc,
  createComentarioBodyValidation,
} from './Validations/RepertorioValidation';

// Citacao
export type CitacaoResponse = z.infer<typeof getCitacaoResponse>;
export type CreateCitacaoBody = z.infer<typeof createCitacaoBodyValidation>;
export type UpdateCitacaoBody = z.infer<typeof updateCitacaoBodyValidation>;
export type Citacao = Repertorio & {
  frase: string;
  fonte?: string;
};

// Artigo
export type ArtigoResponse = z.infer<typeof getArtigoResponse>;
export type CreateArtigoBody = z.infer<typeof createArtigoBodyValidation>;
export type UpdateArtigoBody = z.infer<typeof updateArtigoBodyValidation>;
export type Artigo = Repertorio & {
  titulo: string;
  resumo: string;
  fonte: string;
};

// Obra
export type ObraResponse = z.infer<typeof getObraResponse>;
export type CreateObraBody = z.infer<typeof createObraBodyValidation>;
export type UpdateObraBody = z.infer<typeof updateObraBodyValidation>;
export type Obra = Repertorio & {
  titulo: string;
  sinopse: string;
  tipoObra: 'livro' | 'filme' | 'música' | 'teatro';
};

// Todos os repertorios
export type GetAllRepertorioResponse = z.infer<typeof getAllRepertorioResponse>;
export type GetAllRepertorioQueryBody = z.infer<
  typeof getAllRepertorioQueryValidation
>;
export type GetAllRepertorioDocuments = z.infer<
  typeof getAllRepertorioDocuments
>;
export type CreateComentarioBody = z.infer<
  typeof createComentarioBodyValidation
>;
export type ComentarioSubDoc = {
  _id: Types.ObjectId,
  usuario: Types.ObjectId
  texto: string
}
export type Repertorio = {
  autor: string;
  criador: Types.ObjectId;
  likes: Types.ObjectId[];
  favoritos: Types.ObjectId[];
  comentarios: ComentarioSubDoc[];
  subtopicos: string[];
  tipoRepertorio: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PopulatedRepertorio = Omit<
  Omit<Repertorio, 'criador'>,
  'comentarios'
> & {
  criador: {
    _id: Types.ObjectId;
    nome: string;
  };
  comentarios: Types.DocumentArray<{
    _id: Types.ObjectId;
    usuario: {
      _id: Types.ObjectId;
      nome: string;
    };
    texto: string;
  }>;
};

export type GetAllRepertorioObraDoc = z.infer<typeof getAllRepertorioObraDoc>;
export type GetAllRepertorioArtigoDoc = z.infer<
  typeof getAllRepertorioArtigoDoc
>;
export type GetAllRepertorioCitacaoDoc = z.infer<
  typeof getAllRepertorioCitacaoDoc
>;

// Generico
export type PerfilUsuario = z.infer<typeof perfilUsuarioResponse>;
export type PopulatedWithCriador = Pick<PopulatedRepertorio, 'criador'>;
export type PopulatedWithComentarios = Pick<PopulatedRepertorio, 'comentarios'>;
