import Mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connect = async (err) => {
  await Mongoose.connect(process.env.MONGO_CONNECTION_STRING, {});

  await Mongoose.connection.on('connected', () => {
    console.log(`Mongoose default connection open to ${process.env.MONGO_HOST}`);
  });

  await Mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error: ${err}`);
  });

  await Mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
  });
};

export default connect;
