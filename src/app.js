import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import router from './routes';

const app = express();
const port = process.env.port || 5000;
const dbName = 'moneymanager';

mongoose.connect(`mongodb://localhost/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', function () {
  console.info(`Connected to Database: ${dbName}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Database error ${err}`);
});

app.use(bodyParser.json());

app.use('/api', router);

app.listen(port, () => {
  console.info(`Server running in port: ${port}`);
});
