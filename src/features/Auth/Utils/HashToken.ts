import crypto from 'bcryptjs'

export async function hashToken(token: string): Promise<string> {
  return crypto.hash(token, 10);
}