import { randomBytes } from "node:crypto";
import { TurmaModel } from "../Model";

export async function gerarCodigoConvite(): Promise<string> {
  const codigo = randomBytes(6).toString('base64').toUpperCase();
  const turma = await TurmaModel.findOne({ codigoConvite: codigo })

  if (!turma) {
    return codigo
  }

  return await gerarCodigoConvite()
}