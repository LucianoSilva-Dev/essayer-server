import type { Types } from "mongoose";

export type Session = {
  user: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}