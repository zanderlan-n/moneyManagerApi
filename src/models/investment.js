const mongoose = require('mongoose');

const { Schema } = mongoose;

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
// criar Modelo_Investment baseado em PISchema: 'PontosInteresse'->nome da // coleção
const Investment = mongoose.model('Investment', InvestmentSchema);
// exportar Modelo_Investment
module.exports = Investment;
