import { ConfigService } from '@config/config.service';
import { Global, Module, type Provider } from '@nestjs/common';
import { MailjetProvider } from './providers/mailjet/mailjet.provider';
import { NodemailerProvider } from './providers/nodemailer/nodemailer.provider';
import { EMAIL_PROVIDER } from './types';

/**
 * Dynamic provider factory that selects the email provider based on EMAIL_DRIVER env var
 */
const emailProviderFactory: Provider = {
  provide: EMAIL_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const driver = configService.get('EMAIL_DRIVER');

    if (driver === 'mailjet') {
      return new MailjetProvider(configService);
    }

    // Default to SMTP/Nodemailer
    return new NodemailerProvider(configService);
  },
};

/**
 * Global Email Module
 * Provides an abstracted email provider based on EMAIL_DRIVER configuration.
 *
 * Supported drivers:
 * - 'smtp' (default): Uses Nodemailer with SMTP transport
 * - 'mailjet': Uses Mailjet API v3.1
 *
 * @example
 * // Inject the email provider
 * constructor(@Inject(EMAIL_PROVIDER) private readonly email: IEmailProvider) {}
 *
 * // Send an email with template
 * await this.email.sendMail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   template: 'welcome',
 *   context: { name: 'John' },
 * });
 */
@Global()
@Module({
  providers: [emailProviderFactory],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
