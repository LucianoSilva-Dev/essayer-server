import type { FastifyServerOptions } from "fastify";
import { schemaErrorFormater } from "../shared/plugins/schemaErrorFormater";


export const appConfig: FastifyServerOptions = {
    //logger: true,
    schemaErrorFormatter: schemaErrorFormater
};
