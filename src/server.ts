import app from './app';
import mongoose from 'mongoose';
import { HOST, MONGO_CONN_STR, SERVER_PORT } from './shared/Env';

function listen() {
  app.listen({ port: SERVER_PORT, host: HOST as string }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

mongoose
  .connect(MONGO_CONN_STR as string)
  .then(() => {
    console.log('Connected to MongoDB');
    listen();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
