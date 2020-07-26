import { ReservePart, IReservePart } from '../models/reservePart';
import { camelObjToSnake } from '../utils/parsers';

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
};
export default reservePartsController;
