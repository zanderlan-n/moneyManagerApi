import { Log, ILog } from '../models/logs';

const logsController = {
  list: async (req, res) => {
    try {
      const logs = await Log.find({});
      res.send(logs);
    } catch (err) {
      console.error(err);
      const error = {
        msg: 'Falha na busca dos logs',
        code: 422,
        stacktrace: err,
      };
      res.status(422).send(error);
    }
  },
  insert: async (log) => {
    try {
      await Log.create(log);
    } catch (err) {
      console.error(err);
    }
  },
};
export default logsController;
