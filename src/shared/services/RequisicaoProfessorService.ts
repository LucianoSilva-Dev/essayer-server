import { EMAIL } from '../Env';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';
import { UsuarioModel } from '../models/UsuarioModel';
import {
  createApproveEmail,
  createRejectEmail,
  Transporter,
} from '../Transporter';

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
    const approved = status === 'aprovado'

    const req = await RequisicaoProfessorModel.findByIdAndUpdate(idReq, {
      $set: { status: status, revisor: idRevisor },
    }).select('lattes requisitante revisor status');

    if (!req) {
      return {
        success: false,
        status: 404,
        message: `Requisição com id ${idReq} não existe.`,
      };
    }

    const usuario = await UsuarioModel.findById(req.requisitante);

    if (!usuario) {
      return {
        success: false,
        status: 404,
        message: `Usuário com id ${req.id} não existe.`,
      };
    }

    Transporter.sendMail({
      from: `Incita <${EMAIL}>`,
      to: usuario.email,
      subject: 'Requisição de cadastro de professor',
      html: approved ? createApproveEmail() : createRejectEmail(),
    });

    if (approved) {
      await UsuarioModel.findOneAndUpdate(req.requisitante, {
        cargo: 'professor',
      });
    }

    return {
      success: true,
      message: 'Status atualizado com sucesso.',
    };
  },
};
