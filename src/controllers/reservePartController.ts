import { ReservePart, IReservePart } from '../models/reservePart';
import { camelObjToSnake } from '../utils/parsers';
import { isNumber } from '../utils/validators';
import { Account, IAccount } from '../models/account';
import log from './logController';
import { Reserve, IReserve } from '../models/reserve';
import { Investment } from '../models/investment';

const reservePartsController = {
  get: async (req, res) => {
    try {
      const reservePart = await ReservePart.findById(req.params.id);
      res.send(reservePart);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca da parte da reserva',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  list: async (req, res) => {
    try {
      const reserveParts = await ReservePart.find({});
      res.send(reserveParts);
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
      const reservePart = await ReservePart.create(camelObjToSnake(req.body));
      return res.json(reservePart);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na criação da parte da reserva',
        code: 422,
        stacktrace: err,
      };
      return res.status(422).json(error);
    }
  },
  update: async (req, res) => {
    const toUpdateReservePart: Partial<IReservePart> = { ...req.body };

    try {
      const reservePart = await ReservePart.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateReservePart),
        },
        { new: true }
      );
      res.send(reservePart);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na atualização da parte da reserva',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      const deletedReservePart = await ReservePart.findByIdAndRemove(
        req.params.id
      );
      res.send(deletedReservePart);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na exclusão da parte da reserva',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  addMoney: async (req, res) => {
    const {
      amount,
      account: accountId,
      reserve: reserveId,
      investment: investmentId,
    } = req.body;

    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }
    if (
      (!investmentId && !accountId) ||
      (investmentId && accountId) ||
      !reserveId
    ) {
      res.status(422).send({
        msg: 'Envie somente uma conta ou investimento e uma reserva',
        code: 422,
      });
      return;
    }
    const reserveToUpdate = await Reserve.findById(reserveId);
    if (!reserveToUpdate) {
      res.status(422).send({
        msg: 'Reserva não encontrada',
        code: 422,
      });
      return;
    }
    reserveToUpdate.current_value += amount;
    reserveToUpdate.missing_value -= amount;
    reserveToUpdate.save();

    if (accountId) {
      const accountToUpdate = await Account.findById(accountId);
      accountToUpdate.total_value += amount;
    } else if (investmentId) {
      // TODO INVESTMENT
      // const investmentToUpdate = await Investment.findById(accountId);
      // investmentToUpdate.total_value += amount;
      res.status(422).send({
        msg: 'TODO INVESTEMTNT',
        code: 422,
      });
      return;
    }

    try {
      const reservePart = await ReservePart.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { value: amount },
        },
        { new: true }
      );
      if (!reservePart) {
        res.status(422).send({
          msg: 'Não foi possivel atualizar a parte da reserva',
          code: 422,
        });
      } else {
        log.insert({
          date: new Date(),
          description: `Adicionado ${amount} reais a reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} valor final ${reserveToUpdate.current_value}`,
        });
        res.send(reservePart);
      }
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
export default reservePartsController;
