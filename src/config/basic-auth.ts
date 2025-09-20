import type { FastifyBasicAuthOptions } from '@fastify/basic-auth'
import { AUTH_PASSWORD, AUTH_USERNAME } from '../shared/Env'

export const BasicAuthOpts: FastifyBasicAuthOptions = {
    validate(username, password, _req, _reply, done) {
        if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
            return done(new Error('Invalid Credentials'))
        }
        done()
    },
    authenticate: true
}