import mongoose, { Schema, Document } from 'mongoose';

export interface IINvestmentDetails extends Document {
  amount: number;
  date: Date;
  before_amount: number;
  after_amount: number;
}

export interface IInvestment extends Document {
  name: string;
  current_value: number;
  invested_amount: number;
  percentage: number;
  start_date: Date;
  details: IINvestmentDetails;
}

const InvestmentDetails = new Schema({
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
  after_amount: {
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
    required: [true, '*Campo obrigatório!'],
  },
  start_date: {
    type: Date,
    required: [true, '*Campo obrigatório!'],
  },
  details: {
    type: [InvestmentDetails],
  },
});

export const Investment = mongoose.model<IInvestment>(
  'Investment',
  InvestmentSchema
);
