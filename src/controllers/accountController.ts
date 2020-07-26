import { isNumber } from '../utils/validators';
import { Account, IAccount } from '../models/account';
import { camelObjToSnake } from '../utils/parsers';
import log from './logController';

const accountsController = {
  get: async (req, res) => {
    try {
      const account = await Account.findById(req.params.id).populate({
        path: 'reserves_parts',
        populate: {
          path: 'reserve',
          model: 'reserves',
          select: 'name',
        },
      });
      res.send(account);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca da conta',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  list: async (req, res) => {
    try {
      const accounts = await Account.find({});
      res.send(accounts);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca das contas',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  add: async (req, res) => {
    try {
      const account = await Account.create(camelObjToSnake(req.body));
      return res.json(account);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na criação da conta',
        code: 422,
        stacktrace: err,
      };
      return res.status(422).json(error);
    }
  },
  update: async (req, res) => {
    const toUpdateAccount: Partial<IAccount> = { ...req.body };

    try {
      const account = await Account.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateAccount),
        },
        { new: true }
      );
      res.send(account);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na atualização da conta',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  delete: async (req, res) => {
    try {
      const deletedAccount = await Account.findByIdAndRemove(req.params.id);
      res.send(deletedAccount);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na exclusão da conta',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  addMoney: async (req, res) => {
    const { amount } = req.body;
    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
    }
    try {
      const account = await Account.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { total_value: amount, net_value: amount },
        },
        { new: true }
      );
      if (!account) {
        res.status(422).send({
          msg: 'Não foi possivel atualizar a conta',
          code: 422,
        });
      } else {
        log.insert({
          date: new Date(),
          description: `Adicionado ${amount} reais a conta ${account.name} de ID: ${account.id} valor final ${account.total_value}`,
        });
        res.send(account);
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
  removeMoney: async (req, res) => {
    const { amount } = req.body;
    if (!amount && !isNumber(amount)) {
      res.status(422).send({
        msg: 'Envie uma quantia valida',
        code: 422,
      });
    }
    try {
      const negativeAmount = amount * -1;
      const account = await Account.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { total_value: negativeAmount, net_value: negativeAmount },
        },
        { new: true }
      );
      if (!account) {
        res.status(422).send({
          msg: 'Não foi possivel atualizar a conta',
          code: 422,
        });
      } else {
        log.insert({
          date: new Date(),
          description: `Removido ${amount} reais da conta ${account.name} de ID: ${account.id} valor final ${account.total_value}`,
        });
        res.send(account);
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
export default accountsController;
