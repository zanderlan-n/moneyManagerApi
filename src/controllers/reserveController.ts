import { ObjectId } from 'mongodb';
import { Reserve, IReserve } from '../models/reserve';
import { camelObjToSnake } from '../utils/parsers';
import { isNumber } from '../utils/validators';
import { Account, IAccount } from '../models/account';
import log from './logController';
import {
  Investment,
  IInvestmentHistory,
  HistoryType,
} from '../models/investment';
import { ReservePart, IReservePart } from '../models/reservePart';
import { sumItensInArray } from '../utils/utils';

const getReserveCurrentValue = async (id: any) => {
  const [{ totalValue }] = await ReservePart.aggregate([
    { $match: { reserve: new ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: { $sum: '$value' },
        },
      },
    },
  ]);
  return totalValue;
};
const getReserveMissingValue = (goalValue: number, currentValue: number) => {
  const result = goalValue - currentValue;
  return result < 0 ? 0 : result;
};

const reservesController = {
  get: async (req, res) => {
    try {
      const reserve = await Reserve.findById(req.params.id).populate({
        path: 'reserves_parts',
        populate: {
          path: 'account',
          model: 'accounts',
          select: 'name',
        },
      });

      if (reserve)
        reserve.current_value = sumItensInArray(
          reserve?.reserves_parts,
          'value'
        );
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
      const reserves = await Reserve.find({}).populate('reserves_parts');
      reserves.forEach((item, i) => {
        const currentValue = sumItensInArray(item.reserves_parts, 'value');
        reserves[i].current_value = currentValue;
        const missingValue = reserves[i].goal_value - currentValue;
        reserves[i].missing_value = missingValue >= 0 ? missingValue : 0;
      });
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
    try {
      const reserve = await Reserve.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateReserve),
        },
        { new: true }
      );
      if (!reserve) {
        res.status(422).send({
          msg: 'Não possivel localizar a reserva.',
          code: 422,
        });
        return;
      }
      res.send(reserve);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da reserva',
        code: 422,
        stacktrace: err,
      });
    }
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
  withdrawMoney: async (req, res) => {
    const {
      amount,
      reserve: reserveId,
      account: accountId,
      refund,
      investment: investmentId,
    } = req.body;
    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }

    try {
      if (!accountId && !investmentId) {
        res.status(422).send({
          msg: 'Envie a conta ou reserva.',
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
      let queryParam: any = {};
      let accountToUpdate: any;
      let investmentToUpdate: any;
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
        queryParam = { investment: investmentId };
        investmentToUpdate = await Investment.findById(investmentId);
        if (!investmentToUpdate) {
          res.status(422).send({
            msg: 'Investimento não encontrado',
            code: 422,
          });
          return;
        }
      }
      queryParam.reserve = reserveId;
      const reservePart = await ReservePart.findOne(queryParam);
      if (!reservePart) {
        res.status(422).send({
          msg: 'Parte da reserva não encontrada',
          code: 422,
        });
        return;
      }
      reservePart.value -= amount;
      if (accountId) {
        accountToUpdate.total_value -= amount;
        await accountToUpdate.save();
      } else if (investmentId) {
        const detail: Partial<IInvestmentHistory> = {
          amount: amount * -1,
          date: new Date(),
          type: HistoryType.NEW,
          before_amount: investmentToUpdate.current_value,
        };
        investmentToUpdate.history.push(detail);
        investmentToUpdate.invested_amount -= amount;
        investmentToUpdate.current_value -= amount;
        await investmentToUpdate.save();
      }
      await reservePart.save();
      await reserveToUpdate.save();
      const currentValue = await getReserveCurrentValue(reserveToUpdate.id);
      reserveToUpdate.missing_value = getReserveMissingValue(
        reserveToUpdate.goal_value,
        currentValue
      );
      if (refund) {
        reservePart.refund_value += amount;
      }
      reserveToUpdate.current_value = currentValue;
      log.insert({
        date: new Date(),
        description: `Removido ${amount} reais da reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} valor final ${currentValue}`,
      });
      res.send(reserveToUpdate);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da quantia',
        code: 422,
        stacktrace: err,
      });
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
      let investmentToUpdate: any;
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
        queryParam = { investment: investmentId };
        investmentToUpdate = await Investment.findById(investmentId);
        if (!investmentToUpdate) {
          res.status(422).send({
            msg: 'Investimento não encontrado',
            code: 422,
          });
          return;
        }
      }
      const reserveToUpdate: any = await Reserve.findById(reserveId);
      if (!reserveToUpdate) {
        res.status(422).send({
          msg: 'Reserva não encontrada',
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
          refund_value: 0,
        });
        isNewReservePart = true;
      } else {
        reservePart.value += amount;
      }
      if (isNewReservePart) {
        reserveToUpdate.reserves_parts.push(reservePart.id);
      }
      if (accountId) {
        if (isNewReservePart) {
          accountToUpdate.reserves_parts.push(reservePart.id);
        }
        accountToUpdate.total_value += amount;
        await accountToUpdate.save();
      } else if (investmentId) {
        if (isNewReservePart) {
          investmentToUpdate.reserves_parts.push(reservePart.id);
        }
        const detail: Partial<IInvestmentHistory> = {
          amount,
          date: new Date(),
          before_amount: investmentToUpdate.current_value,
          type: HistoryType.NEW,
        };
        investmentToUpdate.history.push(detail);
        investmentToUpdate.invested_amount += amount;
        investmentToUpdate.current_value += amount;
        investmentToUpdate.save();
      }
      if (reservePart.refund_value - amount < 0) {
        reservePart.refund_value = 0;
      } else {
        reservePart.refund_value -= amount;
      }

      await reservePart.save();
      await reserveToUpdate.save();

      reserveToUpdate.current_value = await getReserveCurrentValue(
        reserveToUpdate.id
      );

      reserveToUpdate.missing_value = getReserveMissingValue(
        reserveToUpdate.goal_value,
        reserveToUpdate.current_value
      );
      log.insert({
        date: new Date(),
        description: `Adicionado ${amount} reais a reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} valor final ${reserveToUpdate.current_value}`,
      });

      res.send(reserveToUpdate);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da quantia',
        code: 422,
        stacktrace: err,
      });
    }
  },
  updateGoal: async (req, res) => {
    const { reserve: reserveId, newGoal } = req.body;
    if (!newGoal && !isNumber(newGoal)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }
    if (!reserveId) {
      res.status(422).send({
        msg: 'Envie um id valido',
        code: 422,
      });
      return;
    }
    try {
      const reserveToUpdate = await Reserve.findById(reserveId);
      if (!reserveToUpdate) {
        res.status(422).send({
          msg: 'Reserva não encontrada',
          code: 422,
        });
        return;
      }

      reserveToUpdate.goal_value = newGoal;
      await reserveToUpdate.save();

      reserveToUpdate.current_value = await getReserveCurrentValue(
        reserveToUpdate.id
      );
      reserveToUpdate.missing_value = getReserveMissingValue(
        reserveToUpdate.goal_value,
        reserveToUpdate.current_value
      );
      log.insert({
        date: new Date(),
        description: `A reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} teve sua meta atualizada para ${reserveToUpdate.goal_value}`,
      });
      res.status(200).send(reserveToUpdate);
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da quantia',
        code: 422,
        stacktrace: err,
      });
    }
  },
  transferMoneyBetweenReserves: async (req, res) => {
    const {
      oldReserve: oldReserveId,
      newReserve: newReserveId,
      account: accountId,
      amount,
    } = req.body;
    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
      return;
    }
    if (!oldReserveId || !newReserveId) {
      res.status(422).send({
        msg: 'Envie as reservas.',
        code: 422,
      });
      return;
    }
    try {
      const oldReservePart = await ReservePart.findOne({
        reserve: oldReserveId,
        account: accountId,
      });

      if (!oldReservePart) {
        res.oldReservePart(422).send({
          msg: 'Reserva antiga não encontrada',
          code: 422,
        });
        return;
      }
      oldReservePart.value -= amount;
      let newReservePart: any = await ReservePart.findOne({
        reserve: newReserveId,
        account: accountId,
      });
      const reserve = await Reserve.findById(newReserveId);

      if (!newReservePart) {
        newReservePart = await ReservePart.create({
          value: amount,
          account: accountId,
          reserve: newReserveId,
        });

        await Account.updateOne(
          {
            _id: new ObjectId(accountId),
          },
          { $push: { reserves_parts: newReservePart.id } }
        );
        reserve.reserves_parts.push(newReservePart.id);
        reserve.save();
      } else {
        newReservePart.value += amount;
        await newReservePart.save();
      }
      await oldReservePart.save();

      log.insert({
        date: new Date(),
        description: `Foi transferido ${amount} da reserva ${reserve.name} ID: ${oldReservePart.reserve} para a reserva de ID: ${newReservePart.reserve.id}`,
      });
      res.status(200).send({ oldReservePart, newReservePart });
    } catch (err) {
      console.error(err);
      res.status(422).send({
        msg: 'Falha na atualização da quantia',
        code: 422,
        stacktrace: err,
      });
    }
  },
  setMoneyAsReserve: async (req, res) => {
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
      let investmentToUpdate: any;
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
        queryParam = { investment: investmentId };
        investmentToUpdate = await Investment.findById(investmentId);
        if (!investmentToUpdate) {
          res.status(422).send({
            msg: 'Investimento não encontrado',
            code: 422,
          });
          return;
        }
      }
      const reserveToUpdate: any = await Reserve.findById(reserveId);
      if (!reserveToUpdate) {
        res.status(422).send({
          msg: 'Reserva não encontrada',
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
          refund_value: 0,
        });
        isNewReservePart = true;
      } else {
        reservePart.value += amount;
      }
      if (isNewReservePart) {
        reserveToUpdate.reserves_parts.push(reservePart.id);
      }
      if (accountId) {
        if (isNewReservePart) {
          accountToUpdate.reserves_parts.push(reservePart.id);
        }
        accountToUpdate.net_value -= amount;
        await accountToUpdate.save();
      } else if (investmentId) {
        // TODO NET VALUE INVESTIMENT
        // if (isNewReservePart) {
        //   investmentToUpdate.reserves_parts.push(reservePart.id);
        // }
        // const detail: Partial<IInvestmentHistory> = {
        //   amount,
        //   date: new Date(),
        //   before_amount: investmentToUpdate.current_value,
        //   type: HistoryType.NEW,
        // };
        // investmentToUpdate.history.push(detail);
        // investmentToUpdate.invested_amount += amount;
        // investmentToUpdate.current_value += amount;
        // investmentToUpdate.save();
      }
      if (reservePart.refund_value - amount < 0) {
        reservePart.refund_value = 0;
      } else {
        reservePart.refund_value -= amount;
      }

      await reservePart.save();
      await reserveToUpdate.save();

      reserveToUpdate.current_value = await getReserveCurrentValue(
        reserveToUpdate.id
      );

      reserveToUpdate.missing_value = getReserveMissingValue(
        reserveToUpdate.goal_value,
        reserveToUpdate.current_value
      );
      log.insert({
        date: new Date(),
        description: `Foi definito ${amount} reais como parte da reserva ${reserveToUpdate.name} de ID: ${reserveToUpdate.id} valor final ${reserveToUpdate.current_value}`,
      });

      res.send(reserveToUpdate);
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
