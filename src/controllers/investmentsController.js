import Investment from '../models/investment';

// exports.create = function (req, res) {
//   console.log('You made a POST request: ', req);
//   res.send({
//     type: 'POST',
//     name: req.body.name,
//     rank: req.body.rank,
//   });
// };
exports.get = function (req, res) {
  res.send({ type: 'GET' });
};
exports.list = function (req, res) {
  res.send({ type: 'GET' });
};
exports.add = async function (req, res) {
  try {
    const investment = await Investment.create(req.body);
    res.send(investment);
  } catch (err) {
    console.log(err);
    throw new Error('Falha na criação do investimento');
  }
};
exports.update = function (req, res) {
  res.send({ type: 'PUT' });
};
exports.delete = async (req, res, next) => {
  try {
    const deletedInvestment = await Investment.findByIdAndRemove(req.params.id);
    res.send(deletedInvestment);
  } catch (err) {
    console.log(err);
    throw new Error('Falha na exclusão do investimento');
  }
};
