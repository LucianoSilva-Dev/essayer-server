import app from './app';
import mongoose from 'mongoose';
import { HOST, MONGO_CONN_STR, SERVER_PORT } from './shared/Env';

function startServer() {
  app.listen({ port: SERVER_PORT, host: HOST }, (err, address) => {
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
    startServer()
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
