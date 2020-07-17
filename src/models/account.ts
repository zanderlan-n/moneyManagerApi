import mongoose, { Schema, Document } from 'mongoose';
import { IReservePart } from './reservePart';

export interface IAccount extends Document {
  name: string;
  total_value: number;
  net_value: number;
  reserves_parts: IReservePart[];
}

const AccountSchema = new Schema({
  name: {
    type: String,
    required: [true, '*Campo obrigatório!'],
  },
  total_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  net_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  reserves_parts: [{ type: Schema.Types.ObjectId, ref: 'reservesParts' }],
});

export const Account = mongoose.model<IAccount>('accounts', AccountSchema);
