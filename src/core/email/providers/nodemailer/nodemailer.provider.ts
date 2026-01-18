import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ConfigService } from '@config/config.service';
import { Injectable, Logger } from '@nestjs/common';
import { lookup } from 'mime-types';
import type { SendMailOptions as NodemailerOptions, Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import type SmtpTransport from 'nodemailer/lib/smtp-transport';
import * as pug from 'pug';
import type {
  IEmailAttachment,
  IEmailProvider,
  ISendMailOptions,
  ISendMailResult,
} from '../../types';

/**
 * Email provider implementation using Nodemailer with SMTP transport
 */
@Injectable()
export class NodemailerProvider implements IEmailProvider {
  private readonly transporter: Transporter<SmtpTransport.SentMessageInfo>;
  private readonly logger = new Logger(NodemailerProvider.name);
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    this.defaultFrom = this.configService.get('EMAIL_FROM') ?? 'noreply@example.com';

    const transportOptions: SmtpTransport.Options = {
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    };

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async sendMail(options: ISendMailOptions): Promise<ISendMailResult> {
    try {
      const { to, subject, template, context, html, text, from, attachments } = options;

      let htmlContent = html;

      // Render Pug template if provided
      if (template) {
        const templatePath = this.getTemplatePath(template);
        htmlContent = pug.renderFile(templatePath, context ?? {});
      }

      const mailOptions: NodemailerOptions = {
        from: from ?? this.defaultFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html: htmlContent,
        text,
        attachments: attachments?.map((attachment: IEmailAttachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType:
            attachment.contentType ?? (lookup(attachment.filename) || 'application/octet-stream'),
        })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to ${JSON.stringify(to)} - MessageId: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error('Failed to send email via SMTP', error);
      throw error;
    }
  }

  /**
   * Resolves template path - checks dist first, then src
   */
  private getTemplatePath(templateName: string): string {
    const compiledTemplatesDir = join(__dirname, '../../../common/templates');
    const srcTemplatesDir = join(process.cwd(), 'src/common/templates');

    const templateDir = existsSync(compiledTemplatesDir) ? compiledTemplatesDir : srcTemplatesDir;

    const filename = templateName.endsWith('.pug') ? templateName : `${templateName}.pug`;

    return join(templateDir, filename);
  }
}
