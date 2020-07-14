import { Investment, IInvestment } from '../models/investment';
import { snakeObjToCamel, camelObjToSnake } from '../utils/parsers';

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

    try {
      const investment = await Investment.findByIdAndUpdate(
        req.params.id,
        {
          $set: camelObjToSnake(toUpdateInvestment),
        },
        { new: true }
      );
      res.send(investment);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na atualização do investimento',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
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
};
export default investmentsController;
