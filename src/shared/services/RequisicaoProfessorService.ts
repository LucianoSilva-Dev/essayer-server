import { isDeepStrictEqual } from 'node:util';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';
import { UsuarioModel } from '../models/UsuarioModel';

export const RequisicaoProfessorService = {
  getAll: async () => {
    const reqs = await RequisicaoProfessorModel.find()
      .select('_id lattes requisitante revisor status')
      .populate('requisitante', 'nome')
      .populate('revisor', 'nome');

    return reqs;
  },

  get: async (id: string) => {
    const req = await RequisicaoProfessorModel.findById(id)
      .select('lattes requisitante revisor status')
      .populate('requisitante', 'nome')
      .populate('revisor', 'nome');

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${id} não existe.`,
      };
    }

    return {
      success: true,
      data: req,
    };
  },

  updateStatus: async (idReq: string, idRevisor: string, status: string) => {
    const req = await RequisicaoProfessorModel.findByIdAndUpdate(idReq, {
      $set: { status: status, revisor: idRevisor },
    })
      .select('lattes requisitante revisor status')
      .populate('requisitante', 'nome')
      .populate('revisor', 'nome');

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${idReq} não existe.`,
      };
    }

    if (status === 'aprovado') {
      await UsuarioModel.findOneAndUpdate(req.requisitante, {
        cargo: 'professor',
      });
    }

    return {
      success: true,
      message: "Status atualizado com sucesso.",
    };
  },
};
