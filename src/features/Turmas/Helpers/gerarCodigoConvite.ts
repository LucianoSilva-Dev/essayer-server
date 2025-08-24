import { randomBytes } from "node:crypto";

export function gerarCodigoConvite() {
    return randomBytes(6).toString('base64').toUpperCase();
}