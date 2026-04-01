import type { BetterAuthOptions, LogLevel } from 'better-auth';
import { getAppContext, tryGetAppContext } from '../../app.registry';
import { EMAIL_PROVIDER, type IEmailProvider } from '../email';
import { LoggerService } from '../logger/logger.service';

/**
 * Custom logger function for better-auth that integrates with the NestJS LoggerService.
 * This ensures that better-auth errors are monitored and sent via email like the rest of the application.
 * Falls back to console logging if the NestJS app context is not yet available.
 */
export const betterAuthLogger = (level: LogLevel, message: string, ...args: unknown[]) => {
  const appContext = tryGetAppContext();

  // Fallback to console if NestJS app is not yet initialized
  if (!appContext) {
    const prefix = `[BetterAuth]`;
    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
    }
    return;
  }

  const logger = appContext.get(LoggerService);

  switch (level) {
    case 'error':
      logger.error(message, ...args, 'BetterAuth');
      break;
    case 'warn':
      logger.warn(message, ...args, 'BetterAuth');
      break;
    case 'info':
      logger.log(message, ...args, 'BetterAuth');
      break;
    case 'debug':
      logger.debug(message, ...args, 'BetterAuth');
      break;
  }
};

type SendEmail = NonNullable<
  NonNullable<BetterAuthOptions['emailVerification']>['sendVerificationEmail']
>;

/**
 * Sends email verification to a newly registered user.
 * Uses the abstract EMAIL_PROVIDER from the DI container.
 */
export const sendVerificationEmail: SendEmail = async ({ user, url }) => {
  const appContext = getAppContext();
  const emailService = appContext.get<IEmailProvider>(EMAIL_PROVIDER);

  emailService.sendMail({
    to: user.email,
    subject: 'Verifique seu e-mail',
    template: 'verify-email',
    context: {
      name: user.name ?? user.email,
      url,
    },
  });
};

/**
 * Sends password reset email to the user.
 * Uses the abstract EMAIL_PROVIDER from the DI container.
 */
export const sendResetPassword: SendEmail = async ({ user, url, token }) => {
  const appContext = getAppContext();
  const emailService = appContext.get<IEmailProvider>(EMAIL_PROVIDER);

  emailService.sendMail({
    to: user.email,
    subject: 'Redefinição de senha',
    template: 'reset-password',
    context: {
      name: user.name ?? user.email,
      url,
      token,
    },
  });
};

type SendChangeEmailConfirmation = NonNullable<
  NonNullable<BetterAuthOptions['user']>['changeEmail']
>['sendChangeEmailConfirmation'];

/**
 * Sends email verification to the new email address when user requests an email change.
 * Uses the abstract EMAIL_PROVIDER from the DI container.
 */
export const sendChangeEmailConfirmation: SendChangeEmailConfirmation = async ({
  user,
  newEmail,
  url,
  token,
}) => {
  const appContext = getAppContext();
  const emailService = appContext.get<IEmailProvider>(EMAIL_PROVIDER);

  emailService.sendMail({
    to: newEmail,
    subject: 'Confirme seu novo e-mail',
    template: 'change-email',
    context: {
      name: user.name ?? user.email,
      newEmail,
      url,
      token,
    },
  });
};
