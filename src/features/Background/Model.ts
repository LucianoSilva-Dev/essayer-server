import { Schema, model } from 'mongoose';

const BackgroundSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: String, required: true },
    font: {type: String, required: true},
    creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true },
);

export const BackgroundModel = model('Background', BackgroundSchema);
