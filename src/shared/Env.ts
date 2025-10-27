import { configDotenv } from 'dotenv';

configDotenv();

const SMTP_KEY = process.env.SMTP_KEY as string;
const SMTP_SECRET = process.env.SMTP_SECRET as string;
const EMAIL = process.env.EMAIL as string;
const HOST = process.env.HOST as string;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

const REDIS_HOST = process.env.REDIS_HOST as string;
const REDIS_PORT = process.env.REDIS_PORT as unknown as number;
const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const AUTH_USERNAME = process.env.AUTH_USERNAME as string;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD as string;

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET as string;
const COOKIE_SECRET = process.env.COOKIE_SECRET as string;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN as string;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as string;
const refresh_token_cookie_max_age_seconds = // only for validation
  process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS;
const access_token_cookie_max_age_seconds = // only for validation
  process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS;
const ENVIRONMENT = process.env.ENVIRONMENT as string;

if (!REDIS_HOST) {
  console.error('REDIS_HOST is not defined');
  process.exit(1);
}

if (!REDIS_PORT) {
  console.error('REDIS_PORT is not defined');
  process.exit(1);
}

const SERVER_PORT =
  Number.parseInt(process.env.SERVER_PORT as string, 10) || 3000;

if (typeof SERVER_PORT !== 'number') {
  console.error('SERVER_PORT is not a number.');
  process.exit(1);
}

const MONGO_CONN_STR = process.env.MONGO_CONN_STR;

if (!MONGO_CONN_STR) {
  console.error('MONGO_CONN_STR is not defined.');
  process.exit(1);
}

if (!SMTP_KEY || !SMTP_SECRET || !EMAIL) {
  console.error('SMTP is not defined.');
  process.exit(1);
}

if (!HOST) {
  console.error('HOST is not defined.');
  process.exit(1);
}

if (
  !COOKIE_SECRET ||
  !ACCESS_TOKEN_EXPIRES_IN ||
  !REFRESH_TOKEN_EXPIRES_IN ||
  !refresh_token_cookie_max_age_seconds || // only for validation
  !access_token_cookie_max_age_seconds // only for validation
) {
  console.error(
    'Not all autentication envs are defined. Check .env and env.example',
  );
  process.exit(1);
}

if (
  !Number.parseInt(refresh_token_cookie_max_age_seconds, 10) ||
  !Number.parseInt(access_token_cookie_max_age_seconds, 10)
) {
  console.error(
    'REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS or ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS is not a number.',
  );
  process.exit(1);
}

const REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = Number.parseInt(
  refresh_token_cookie_max_age_seconds,
  10,
);
const ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS = Number.parseInt(
  access_token_cookie_max_age_seconds,
  10,
);

if (
  !ENVIRONMENT ||
  (ENVIRONMENT !== 'production' && ENVIRONMENT !== 'development')
) {
  console.error('ENVIRONMENT is not defined or has an unauthorized value.');
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Cloudinary envs are not defined.');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('GEMINI API KEY is not defined');
  process.exit(1);
}

if (!AUTH_PASSWORD || !AUTH_USERNAME) {
  console.error('Basic auth credentials not defined');
  process.exit(1);
}

export {
  ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  ACCESS_TOKEN_EXPIRES_IN,
  AUTH_PASSWORD,
  AUTH_USERNAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  COOKIE_SECRET,
  EMAIL,
  GEMINI_API_KEY,
  HOST,
  JWT_TOKEN_SECRET,
  MONGO_CONN_STR,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USERNAME,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN,
  SERVER_PORT,
  SMTP_KEY,
  SMTP_SECRET,
  ENVIRONMENT
};
