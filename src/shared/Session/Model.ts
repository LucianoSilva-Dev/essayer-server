import { model, Schema } from 'mongoose';
import type { Session } from './Types';

const SessionSchema = new Schema<Session>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    refreshTokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const SessionModel = model<Session>('Session', SessionSchema);

// Índice para expiração automática (opcional, mas bom para limpeza)
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1, isValid: 1 });