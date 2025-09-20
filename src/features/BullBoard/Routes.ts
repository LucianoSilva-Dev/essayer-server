import fastifyBasicAuth from "@fastify/basic-auth";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { BasicAuthOpts } from "../../config/basic-auth";
import { FastifyAdapter } from '@bull-board/fastify';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { CorrigirRedacaoQueue } from '../../shared/CorrecaoRedacaoIA/Queue';

const serverAdapter = new FastifyAdapter();
createBullBoard({
    queues: [new BullMQAdapter(CorrigirRedacaoQueue)],
    serverAdapter,
});
serverAdapter.setBasePath('/bull-board');

export const BullBoardRoutes: FastifyPluginAsyncZod = async (app) => {
    app.register(fastifyBasicAuth, BasicAuthOpts)
    app.after(() => {
        app.addHook('onRequest', app.basicAuth)
        app.register(serverAdapter.registerPlugin())
    })
}