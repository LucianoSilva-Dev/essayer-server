import crypto from 'bcryptjs'

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return crypto.compare(token, hash);
}