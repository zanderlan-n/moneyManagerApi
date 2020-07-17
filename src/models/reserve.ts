import mongoose, { Schema, Document } from 'mongoose';
import { IReservePart } from './reservePart';

export interface IFeeDetails extends Document {
  name: string;
  value: number;
}

export interface IFee extends Document {
  month: number;
  total_value: number;
  details: IFeeDetails[];
}

export interface IReserve extends Document {
  name: string;
  current_value: number;
  goal_value: number;
  missing_value: number;
  reserves_parts: IReservePart[];
  fee: IFee[];
}

const FeeDetailsSchema = new Schema({
  name: {
    type: String,
    required: [true, '*Campo obrigatório!'],
  },
  value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
});

const FeeSchema = new Schema({
  month: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  total_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  details: {
    type: [FeeDetailsSchema],
  },
});

export const ReserveSchema = new Schema({
  name: {
    type: String,
    required: [true, '*Campo obrigatório!'],
  },
  current_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  goal_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  missing_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  reserves_parts: [{ type: Schema.Types.ObjectId, ref: 'reservesParts' }],
  account_fee: [
    {
      type: FeeSchema,
    },
  ],
});

export const Reserve = mongoose.model<IReserve>('reserves', ReserveSchema);
