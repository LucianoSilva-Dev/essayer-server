import type { FastifyMultipartOptions } from '@fastify/multipart';

export const fastifyMultipartConfig: FastifyMultipartOptions = {
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 100, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 2 * 1024 * 1024, // For multipart forms, the max file size in bytes - 2MB
    files: 1, // Max number of file fields
    headerPairs: 2000, // Max number of header key=>value pairs
    parts: 1000, // For multipart forms, the max number of parts (fields + files)
  },
};
