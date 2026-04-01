import { randomBytes } from "node:crypto";

export function generateInviteCode(): string {
  const code = randomBytes(6).toString('base64').toUpperCase();

  return code
}