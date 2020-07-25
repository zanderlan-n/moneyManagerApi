import { Reserve, IReserve } from '../models/reserve';
import { camelObjToSnake } from '../utils/parsers';

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
};
export default reservesController;
