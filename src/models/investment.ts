import mongoose, { Schema, Document } from 'mongoose';
import { IReservePart } from './reservePart';

export enum HistoryType {
  NEW = 'new',
  UPDATE = 'update',
}

export interface IInvestmentHistory extends Document {
  type: string;
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
  history: IInvestmentHistory[];
  reserves_parts: IReservePart[];
}

const InvestmentHistorySchema = new Schema({
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
  type: {
    type: String,
    enum: Object.values(HistoryType),
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
  history: {
    type: [InvestmentHistorySchema],
  },
  reserves_parts: [{ type: Schema.Types.ObjectId, ref: 'reservesParts' }],
});

export const Investment = mongoose.model<IInvestment>(
  'Investments',
  InvestmentSchema
);
