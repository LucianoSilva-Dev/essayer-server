import { configDotenv } from 'dotenv';
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined');
  process.exit(1);
}

const SERVER_PORT = process.env.SERVER_PORT || 3000;

if (typeof SERVER_PORT !== 'number') {
  console.error('SERVER_PORT is not a number.');
  process.exit(1);
}

const MONGO_CONN_STR = process.env.MONGO_CONN_STR;

if (!MONGO_CONN_STR) {
  console.error('MONGO_CONN_STR is not defined.');
  process.exit(1);
}

export { JWT_SECRET, SERVER_PORT, MONGO_CONN_STR };