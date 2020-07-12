// associar as dependências instaladas
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { investimentRouter } from './routes';
// inicializar app express
const app = express();
const port = 5000;
const dbName = 'moneymanager';
// Ligar á B.D.: 'test'->user da BD, ´nnn´->pass
mongoose.connect(`mongodb://localhost/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Confirma ligação na consola
mongoose.connection.on('connected', function () {
  console.log(`Connected to Database: ${dbName}`);
});
// Mensagem de Erro
mongoose.connection.on('error', (err) => {
  console.log(`Database error ${err}`);
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Invalid endpoint!');
});
console.log('investimentRouter', investimentRouter);

app.use('/investiment', investimentRouter);

app.listen(process.env.port || port, () => {
  console.log(`Server running in port: ${port}`);
});
