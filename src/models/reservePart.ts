import mongoose, { Schema, Document } from 'mongoose';
import { ObjectID } from 'mongodb';

export interface IReservePart extends Document {
  account: ObjectID;
  reserve: ObjectID;
  investment: ObjectID;
  value: number;
  refund_value: number;
}

export const ReservePartSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  investment: {
    type: Schema.Types.ObjectId,
    ref: 'investments',
  },
  reserve: {
    type: Schema.Types.ObjectId,
    ref: 'reserves',
    required: [true, '*Campo obrigatório!'],
  },
  value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  refund_value: {
    type: Number,
  },
});

export const ReservePart = mongoose.model<IReservePart>(
  'reservesParts',
  ReservePartSchema
);
