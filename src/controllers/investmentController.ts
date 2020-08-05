import {
  Investment,
  IInvestment,
  IInvestmentDetails,
  IInvestmentDetails,
} from '../models/investment';
import { camelObjToSnake } from '../utils/parsers';
import { isNumber } from '../utils/validators';
import { Account, IAccount } from '../models/account';
import log from './logController';
import { ReservePart, IReservePart } from '../models/reservePart';

const investmentsController = {
  get: async (req, res) => {
    try {
      const investment = await Investment.findById(req.params.id);
      res.send(investment);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca do investimento',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  list: async (req, res) => {
    try {
      const investments = await Investment.find({});
      res.send(investments);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca dos investimentos',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  add: async (req, res) => {
    try {
      const investment = await Investment.create(camelObjToSnake(req.body));
      return res.json(investment);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na criação do investimento',
        code: 422,
        stacktrace: err,
      };
      return res.status(422).json(error);
    }
  },
  update: async (req, res) => {
    const toUpdateInvestment: Partial<IInvestment> = { ...req.body };
    let result;
    try {
      const investment = await Investment.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateInvestment),
        },
        { new: true }
      );
      if (!investment) {
        res.status(422);
        result = {
          msg: 'Não possivel localizar o investimento.',
          code: 422,
        };
      }
    } catch (err) {
      console.error(err);
      res.status(422);
      result = {
        msg: 'Falha na atualização do investimento',
        code: 422,
        stacktrace: err,
      };
    }

    res.send(result);
  },
  delete: async (req, res) => {
    try {
      const deletedInvestment = await Investment.findByIdAndRemove(
        req.params.id
      );
      res.send(deletedInvestment);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na exclusão do investimento',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  addMoney: async (req, res) => {
    const { amount, investment: investmentId } = req.body;

    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }
    if (!investmentId) {
      res.status(422).send({
        msg: 'Envie a conta de investimento!',
        code: 422,
      });
      return;
    }

    try {
      const investmentToUpdate = await Investment.findById(investmentId);
      if (!investmentToUpdate) {
        res.status(422).send({
          msg: 'O investimento não foi encontrado!',
          code: 422,
        });
        return;
      }
      const detail: Partial<IInvestmentDetails> = {
        amount,
        date: new Date(),
        before_amount: investmentToUpdate.current_value,
      };
      investmentToUpdate.details.push(detail);

      investmentToUpdate.invested_amount += amount;
      investmentToUpdate.current_value += amount;
      investmentToUpdate.save();
      log.insert({
        date: new Date(),
        description: `Investido ${amount} reais no ${investmentToUpdate.name} de ID: ${investmentToUpdate.id} valor final ${investmentToUpdate.current_value}`,
      });

      res.send(investmentToUpdate);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha no investimento',
        code: 422,
        stacktrace: err,
      });
    }
  },
  withdrawMoney: async (req, res) => {
    const { amount, investment: investmentId } = req.body;
    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }

    if (!investmentId) {
      res.status(422).send({
        msg: 'Envie a conta de investimento!',
        code: 422,
      });
      return;
    }

    try {
      const investmentToUpdate = await Investment.findById(investmentId);
      if (!investmentToUpdate) {
        res.status(422).send({
          msg: 'O investimento não foi encontrado!',
          code: 422,
        });
        return;
      }
      const detail: Partial<IInvestmentDetails> = {
        amount: amount * -1,
        date: new Date(),
        before_amount: investmentToUpdate.current_value,
      };
      investmentToUpdate.details.push(detail);

      investmentToUpdate.invested_amount -= amount;
      investmentToUpdate.current_value -= amount;
      investmentToUpdate.save();
      log.insert({
        date: new Date(),
        description: `Sacado ${amount} reais do ${investmentToUpdate.name} de ID: ${investmentToUpdate.id} valor final ${investmentToUpdate.current_value}`,
      });

      res.send(investmentToUpdate);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da quantia',
        code: 422,
        stacktrace: err,
      });
    }
  },
};
export default investmentsController;
