import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';

import 'dotenv/config';
import 'colors';
import router from './Router.js';
import connectToMongo from './Database.js';
import ErrorHandler from './Middlewares/ErrorHandler.js';

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.use(ErrorHandler);

const server = http.createServer(app);

app.get('/', (req, res) => res.send('Hello World!'));

server.listen(port, () => {
  connectToMongo();
  console.log(
    `🚀 Server listening to ${`http://localhost:${port}`.green} , NODE_ENV=${
      `${process.env.NODE_ENV}`.green
    }`
  );
});
