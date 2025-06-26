import { EMAIL } from '../Env';
import { RequisicaoProfessorModel } from '../models/RequisicaoProfessorModel';
import { UsuarioModel } from '../models/UsuarioModel';
import { Transporter } from '../Transporter';

export const RequisicaoProfessorService = {
  getAll: async () => {
    const reqs = await RequisicaoProfessorModel.find()
      .select('_id lattes requisitante revisor status createdAt')
      .populate('requisitante', 'nome email id')
      .populate('revisor', 'nome');

    return reqs;
  },

  get: async (id: string) => {
    const req = await RequisicaoProfessorModel.findById(id)
      .select('lattes requisitante revisor status createdAt')
      .populate('requisitante', 'nome email id')
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

  updateStatus: async (
    idReq: string,
    idRevisor: string,
    status: string,
    motivo?: string,
  ) => {
    const approved = status === 'aprovado';

    if (!approved && !motivo) {
      return {
        success: false,
        status: 400,
        message: 'É necessário apontar o motivo da recusa.',
      };
    }

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
        message: `Usuário com id ${req.requisitante} não existe.`,
      };
    }

    const config = {
      from: `Incita <${EMAIL}>`,
      to: usuario.email,
      subject: 'Requisição de cadastro de professor',
      template: approved ? 'aprovado' : 'recusado',
      context: {
        motivo: motivo,
      },
    }

    Transporter.sendMail(config);

    if (approved) {
      await UsuarioModel.findOneAndUpdate(req.requisitante, {
        cargo: 'professor',
        lattes: req.lattes
      });
    }

    return {
      success: true,
      message: 'Status atualizado com sucesso.',
    };
  },
};
