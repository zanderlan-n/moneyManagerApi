import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  date: Date;
  description: string;
}

const LogSchema = new Schema({
  date: {
    type: Date,
    required: [true, '*Campo obrigatório!'],
  },
  description: {
    type: String,
    required: [true, '*Campo obrigatório!'],
  },
});

export const Log = mongoose.model<ILog>('logs', LogSchema);
