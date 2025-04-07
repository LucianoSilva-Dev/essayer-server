import app from './app';
import mongoose from 'mongoose';
import { MONGO_CONN_STR, SERVER_PORT } from './shared/Env';

// enable mongoose sanitization for all models
mongoose.set('sanitizeFilter', true);

mongoose
  .connect(MONGO_CONN_STR as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.listen({ port: SERVER_PORT as number }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
