import { Reserve, IReserve } from '../models/reserve';
import { camelObjToSnake } from '../utils/parsers';
import { isNumber } from '../utils/validators';
import { Account, IAccount } from '../models/account';
import log from './logController';
import { Investment } from '../models/investment';
import { ReservePart, IReservePart } from '../models/reservePart';

const reservesController = {
  get: async (req, res) => {
    try {
      const reserve = await Reserve.findById(req.params.id);
      res.send(reserve);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca da reserva',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  list: async (req, res) => {
    try {
      const reserves = await Reserve.find({});
      res.send(reserves);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca das reservas',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  add: async (req, res) => {
    try {
      const reserve = await Reserve.create(camelObjToSnake(req.body));
      return res.json(reserve);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na criação da reserva',
        code: 422,
        stacktrace: err,
      };
      return res.status(422).json(error);
    }
  },
  update: async (req, res) => {
    const toUpdateReserve: Partial<IReserve> = { ...req.body };
    let result;
    try {
      const reserve = await Reserve.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateReserve),
        },
        { new: true }
      );
      if (!reserve) {
        res.status(422);
        result = {
          msg: 'Não possivel localizar a reserva.',
          code: 422,
        };
      }
    } catch (err) {
      console.error(err);
      res.status(422);
      result = {
        msg: 'Falha na atualização da reserva',
        code: 422,
        stacktrace: err,
      };
    }

    res.send(result);
  },
  delete: async (req, res) => {
    try {
      const deletedReserve = await Reserve.findByIdAndRemove(req.params.id);
      res.send(deletedReserve);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na exclusão da reserva',
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

    try {
      let queryParam: any = {};
      let accountToUpdate: any;
      if (accountId) {
        queryParam = { account: accountId };
        accountToUpdate = await Account.findById(accountId);
        if (!accountToUpdate) {
          res.status(422).send({
            msg: 'Conta não encontrada',
            code: 422,
          });
          return;
        }
      } else if (investmentId) {
        // TODO INVESTMENT
        // const investmentToUpdate = await Investment.findById(accountId);
        queryParam = { investment: investmentId };
        res.status(422).send({
          msg: 'TODO INVESTEMENT',
          code: 422,
        });
        return;
      }
      queryParam.reserve = reserveId;
      let reservePart = await ReservePart.findOne(queryParam);
      let isNewReservePart = false;
      if (!reservePart) {
        reservePart = await ReservePart.create({
          ...queryParam,
          value: amount,
        });
        isNewReservePart = true;
      }

      const reserveToUpdate = await Reserve.findById(reserveId);
      if (!reserveToUpdate) {
        res.status(422).send({
          msg: 'Reserva não encontrada',
          code: 422,
        });
        return;
      }

      if (accountId) {
        if (isNewReservePart) {
          accountToUpdate.reserves_parts.push(reservePart.id);
        }
        accountToUpdate.total_value += amount;
        accountToUpdate.save();
      } else if (investmentId) {
        // if (isNewReservePart) {
        // investmentToUpdate.reserves_parts.push(reservePart.id);}
        // investmentToUpdate.total_value += amount;
        // investmentToUpdate.save();
      }
      reservePart.value += amount;
      reservePart.save();
      if (isNewReservePart) {
        reserveToUpdate.reserves_parts.push(reservePart.id);
      }
      reserveToUpdate.current_value += amount;
      if (reserveToUpdate.missing_value - amount < 0) {
        reserveToUpdate.missing_value = 0;
      } else {
        reserveToUpdate.missing_value -= amount;
      }
      reserveToUpdate.save();

      log.insert({
        date: new Date(),
        description: `Adicionado ${amount} reais a reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} valor final ${reserveToUpdate.current_value}`,
      });
      res.send(reservePart);
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
export default reservesController;
