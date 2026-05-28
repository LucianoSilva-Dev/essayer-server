import z from 'zod';

// Storage driver options
export const storageDriverOptions = ['r2', 'dropbox'] as const;

// Email driver options
export const emailDriverOptions = ['smtp', 'mailjet'] as const;

const envSchema = z
  .object({
    // ============================================
    // BASE CONFIG
    // ============================================
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    TZ: z.string().default('America/Sao_Paulo'),
    API_URL: z.url().optional(), // Production API URL (used in OpenAPI docs)
    CORS_ORIGINS: z.string().optional(), // Comma-separated allowlist for browser clients

    // ============================================
    // REDIS
    // ============================================
    REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_USERNAME: z.string().optional(), // Optional
    REDIS_PASSWORD: z.string().optional(), // Optional

    // ============================================
    // AUTHENTICATION (better-auth)
    // ============================================
    BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
    BETTER_AUTH_URL: z.url('BETTER_AUTH_URL must be a valid URL'),
    AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional().default('lax'),
    AUTH_COOKIE_SECURE: z
      .preprocess((value) => {
        if (typeof value === 'boolean') return value;
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),

    // Authentication - Social OAuth (Optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // ============================================
    // AI (Vercel AI SDK - Google)
    // ============================================
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'GOOGLE_GENERATIVE_AI_API_KEY is required'),

    // AI Model Configuration
    AI_PRIMARY_MODEL_NAME: z.string().default('gemini-3-flash-preview'),
    AI_PRIMARY_MODEL_RPM: z.coerce.number().default(15),
    AI_PRIMARY_MODEL_RPD: z.coerce.number().default(1500),
    AI_FALLBACK_MODEL_NAME: z.string().default('gemini-2.5-pro'),
    AI_FALLBACK_MODEL_RPM: z.coerce.number().default(5),
    AI_FALLBACK_MODEL_RPD: z.coerce.number().default(500),
    AI_MODEL_UNAVAILABLE_TIMEOUT_SECS: z.coerce.number().default(60),

    // ============================================
    // OBJECT STORAGE
    // ============================================
    STORAGE_DRIVER: z.enum(storageDriverOptions),
    STORAGE_APP_FOLDER: z.string().default('incita-storage'),
    STORAGE_CLEANUP_CRON: z.string().optional().default('*/2 * * * *'), // Optional - every 2 minutes

    // R2 Storage (Required if STORAGE_DRIVER === 'r2')
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_REGION: z.string().optional().default('auto'),
    R2_BUCKET_NAME: z.string().optional(),
    R2_ENDPOINT: z.url().optional(),
    R2_PUBLIC_URL: z.url().optional(),

    // Dropbox Storage (Required if STORAGE_DRIVER === 'dropbox')
    DROPBOX_CLIENT_ID: z.string().optional(),
    DROPBOX_CLIENT_SECRET: z.string().optional(),
    DROPBOX_REFRESH_TOKEN: z.string().optional(),

    // Cloudinary Storage (required by default because it is used as the imageProvider for SmartStorageProvider)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // ============================================
    // EMAIL
    // ============================================
    EMAIL_DRIVER: z.enum(emailDriverOptions).default('smtp'),
    EMAIL_FROM: z.string().optional(),

    // SMTP Configuration (Required if EMAIL_DRIVER === 'smtp')
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // Mailjet API Configuration (Required if EMAIL_DRIVER === 'mailjet')
    MAILJET_API_KEY: z.string().optional(),
    MAILJET_SECRET_KEY: z.string().optional(),

    // ============================================
    // LOGGER EMAIL NOTIFICATIONS (Optional)
    // ============================================
    LOGGER_EMAIL_ENABLED: z
      .preprocess((val) => val === 'true', z.boolean())
      .optional()
      .default(false),
    LOGGER_EMAIL_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'log', 'debug', 'verbose'])
      .optional()
      .default('error'),
    LOGGER_EMAIL_RECIPIENTS: z.string().optional(), // Comma-separated emails
    LOGGER_EMAIL_BATCH_INTERVAL_MS: z.coerce.number().optional().default(300000), // 5 min

    // ============================================
    // INTEGRATION SYNC (Anglo → Incita)
    // ============================================
    ANGLO_SYNC_SECRET: z.string().optional(), // Shared secret for server-to-server avatar sync

    // ============================================
    // ADMIN SETUP (Optional)
    // ============================================
    ADMIN_SETUP: z
      .preprocess((val) => val === 'true', z.boolean())
      .optional()
      .default(false),
    ADMIN_NAME: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate R2 config if driver is r2
      if (data.STORAGE_DRIVER === 'r2') {
        return (
          !!data.R2_ACCESS_KEY_ID &&
          !!data.R2_SECRET_ACCESS_KEY &&
          !!data.R2_BUCKET_NAME &&
          !!data.R2_ENDPOINT &&
          !!data.R2_PUBLIC_URL
        );
      }
      // Validate Dropbox config if driver is dropbox
      if (data.STORAGE_DRIVER === 'dropbox') {
        return (
          !!data.DROPBOX_CLIENT_ID && !!data.DROPBOX_CLIENT_SECRET && !!data.DROPBOX_REFRESH_TOKEN
        );
      }
      // Validate Cloudinary config if driver is cloudinary
      if (data.STORAGE_DRIVER === 'cloudinary') {
        return (
          !!data.CLOUDINARY_CLOUD_NAME && !!data.CLOUDINARY_API_KEY && !!data.CLOUDINARY_API_SECRET
        );
      }
      // Validate admin setup if admin setup is enabled
      if (data.ADMIN_SETUP) {
        return !!data.ADMIN_NAME && !!data.ADMIN_EMAIL && !!data.ADMIN_PASSWORD;
      }
      return true;
    },
    {
      message: 'Missing required storage/admin environment variables',
    },
  )
  .refine(
    (data) => {
      // Validate SMTP config if email driver is smtp
      if (data.EMAIL_DRIVER === 'smtp') {
        return !!data.SMTP_HOST && !!data.SMTP_PORT;
      }
      // Validate Mailjet config if email driver is mailjet
      if (data.EMAIL_DRIVER === 'mailjet') {
        return !!data.MAILJET_API_KEY && !!data.MAILJET_SECRET_KEY;
      }
      return true;
    },
    {
      message: 'Missing required email configuration for the selected EMAIL_DRIVER',
    },
  );

export type EnvConfig = z.infer<typeof envSchema>;

export default () => {
  return envSchema.parse(process.env);
};
