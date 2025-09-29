import { configDotenv } from 'dotenv';
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET as string;
const SMTP_KEY = process.env.SMTP_KEY as string;
const SMTP_SECRET = process.env.SMTP_SECRET as string;
const EMAIL = process.env.EMAIL as string
const HOST = process.env.HOST as string
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string

const REDIS_HOST = process.env.REDIS_HOST as string
const REDIS_PORT = process.env.REDIS_PORT as unknown as number
const REDIS_USERNAME = process.env.REDIS_USERNAME
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

const AUTH_USERNAME = process.env.AUTH_USERNAME as string
const AUTH_PASSWORD = process.env.AUTH_PASSWORD as string

if (!REDIS_HOST) {
	console.error('REDIS_HOST is not defined')
	process.exit(1)
}

if (!REDIS_PORT) {
	console.error('REDIS_PORT is not defined')
	process.exit(1)
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined');
  process.exit(1);
}

const SERVER_PORT = Number.parseInt(process.env.SERVER_PORT as string) || 3000;

if (typeof SERVER_PORT !== 'number') {
  console.error('SERVER_PORT is not a number.');
  process.exit(1);
}

const MONGO_CONN_STR = process.env.MONGO_CONN_STR;

if (!MONGO_CONN_STR) {
  console.error('MONGO_CONN_STR is not defined.');
  process.exit(1);
}

if (!SMTP_KEY || !SMTP_SECRET || !EMAIL){
  console.error("SMTP is not defined.");
  process.exit(1);
}

if (!HOST){
  console.error("HOST is not defined.");
  process.exit(1);
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
	console.error('Cloudinary envs are not defined.');
	process.exit(1);
}

if (!GEMINI_API_KEY) {
	console.error('GEMINI API KEY is not defined')
	process.exit(1)
}

// if (!AUTH_PASSWORD || ! AUTH_USERNAME) {
// 	console.error('Basic auth credentials not defined')
// 	process.exit(1)
// }

export {
	JWT_SECRET,
	SERVER_PORT,
	HOST,
	MONGO_CONN_STR,
	SMTP_KEY,
	SMTP_SECRET,
	EMAIL,
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
	GEMINI_API_KEY,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_USERNAME,
	REDIS_PASSWORD,
	AUTH_PASSWORD,
	AUTH_USERNAME
};
