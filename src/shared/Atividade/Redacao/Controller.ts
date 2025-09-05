import { AppEventEmitter } from '../../Events/Emitter';
import { TarefaEnviadaEventPayload } from '../../Events/Types';
import type { Controller, RequestUserData } from '../../Types';
import { RedacaoService } from './Service';
import type {
  CreateRedacaoBody,
  EnviarRedacaoBody,
  FeedbackRedacaoBody,
  UpdateRedacaoBody,
} from './Types';

export const RedacaoController: Controller = {
  create: async (request, reply) => {
    const body = request.body as CreateRedacaoBody;
    const { id } = request.user as RequestUserData;

    const response = await RedacaoService.create(body, id);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    reply.status(201).send();

    // acionaremos a notificação após enviar a resposta ao cliente, para não gerar mais atrasos
    AppEventEmitter.emit('tarefa:enviada', response.data as TarefaEnviadaEventPayload)
  },
  get: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoService.get(id, requisitante);
    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send(response.data);
  },
  update: async (request, reply) => {
    const body = request.body as UpdateRedacaoBody;
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoService.update(id, body, requisitante);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  start: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoService.start(id, requisitante);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  send: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { texto } = request.body as EnviarRedacaoBody;
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoService.send(id, texto, requisitante);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send();
  },
  feedback: async (request, reply) => {
    const { id } = request.params as { id: string };
    const { feedback } = request.body as FeedbackRedacaoBody;
    const { id: requisitante } = request.user as RequestUserData;

    const response = await RedacaoService.feedback(id, feedback, requisitante);

    if (!response.success) {
      return reply
        .status(response.status as number)
        .send({ error: response.message });
    }

    return reply.status(200).send({message: "Feedback enviado com sucesso!"});
  },
};
