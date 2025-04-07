import { Schema, model } from 'mongoose';

const AuthSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export const AuthModel = model('UserCredentials', AuthSchema);
