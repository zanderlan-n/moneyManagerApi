import mongoose, { Schema, Document } from 'mongoose';
import { IReservePart } from './reservePart';

export interface IInvestmentDetails extends Document {
  amount: number;
  date: Date;
  before_amount: number;
}

export interface IInvestment extends Document {
  name: string;
  current_value: number;
  invested_amount: number;
  percentage: number;
  start_date: Date;
  details: IInvestmentDetails[];
  reserves_parts: IReservePart[];
}

const InvestmentDetailsSchema = new Schema({
  amount: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  date: {
    type: Date,
    required: [true, '*Campo obrigatório!'],
  },
  before_amount: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
});

// Investment Schema
const InvestmentSchema = new Schema({
  name: {
    type: String,
    required: [true, '*Campo obrigatório!'],
  },
  current_value: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  invested_amount: {
    type: Number,
    required: [true, '*Campo obrigatório!'],
  },
  percentage: {
    type: Number,
  },
  start_date: {
    type: Date,
    required: [true, '*Campo obrigatório!'],
  },
  details: {
    type: [InvestmentDetailsSchema],
  },
  reserves_parts: [{ type: Schema.Types.ObjectId, ref: 'reservesParts' }],
});

export const Investment = mongoose.model<IInvestment>(
  'Investments',
  InvestmentSchema
);
