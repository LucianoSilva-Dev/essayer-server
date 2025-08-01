import { configDotenv } from 'dotenv';
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET;
const SMTP_KEY = process.env.SMTP_KEY;
const SMTP_SECRET = process.env.SMTP_SECRET;
const EMAIL = process.env.EMAIL
const HOST = process.env.HOST

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
};
