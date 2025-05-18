import { configDotenv } from 'dotenv';
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined');
  process.exit(1);
}

const SERVER_PORT = Number.parseInt(process.env.SERVER_PORT as string) || 3000;

if (typeof SERVER_PORT !== 'number') {
  console.error('SERVER_PORT environment variable is not a number.');
  process.exit(1);
}

const HOST = process.env.HOST

if (!HOST) {
  console.error('HOST environment variable is not defined.');
  process.exit(1);
} 

const MONGO_CONN_STR = process.env.MONGO_CONN_STR;

if (!MONGO_CONN_STR) {
  console.error('MONGO_CONN_STR environment variable is not defined.');
  process.exit(1);
}

export { JWT_SECRET, SERVER_PORT, HOST, MONGO_CONN_STR };