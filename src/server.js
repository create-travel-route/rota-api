import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';

import 'dotenv/config';
import 'colors';
import connectToMongo from './db.js';

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());

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
