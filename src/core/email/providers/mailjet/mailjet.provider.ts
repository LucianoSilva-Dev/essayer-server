import { existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import type { ConfigService } from '@config/config.service';
import { Injectable, Logger } from '@nestjs/common';
import { lookup } from 'mime-types';
import Mailjet, { type Client } from 'node-mailjet';
import * as pug from 'pug';
import type {
  IEmailAttachment,
  IEmailProvider,
  ISendMailOptions,
  ISendMailResult,
} from '../../types';
import type {
  IMailjetAttachment,
  IMailjetMessage,
  IMailjetRecipient,
  IMailjetResponse,
} from './types';

/**
 * Email provider implementation using Mailjet API v3.1
 */
@Injectable()
export class MailjetProvider implements IEmailProvider {
  private readonly mailjet: Client;
  private readonly logger = new Logger(MailjetProvider.name);
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('MAILJET_API_KEY');
    const apiSecret = this.configService.get('MAILJET_SECRET_KEY');

    if (!apiKey || !apiSecret) {
      this.logger.warn('Mailjet credentials not found. Email sending will fail.');
    }

    this.mailjet = Mailjet.apiConnect(apiKey ?? '', apiSecret ?? '');
    this.defaultFrom = this.configService.get('EMAIL_FROM') ?? 'noreply@example.com';
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

      const message: IMailjetMessage = {
        From: {
          Email: from ?? this.defaultFrom,
          Name: 'Incita',
        },
        To: this.formatRecipients(to),
        Subject: subject,
        HTMLPart: htmlContent,
        TextPart: text,
        Attachments: attachments?.map((att) => this.formatAttachment(att)),
      };

      const request = this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [message],
      });

      const result = await request;
      const body = result.body as unknown as IMailjetResponse;

      const messageId = body.Messages?.[0]?.To?.[0]?.MessageID?.toString();

      this.logger.debug(`Email sent successfully to ${JSON.stringify(to)} - MessageId: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.logger.error('Failed to send email via Mailjet', error);
      throw error;
    }
  }

  /**
   * Resolves template path - checks dist first, then src
   */
  private getTemplatePath(templateName: string): string {
    const compiledTemplatesDir = join(__dirname, '../../../common/templates');
    const srcTemplatesDir = join(process.cwd(), 'src/common/templates');

    const templateDir =
      existsSync(compiledTemplatesDir) && lstatSync(compiledTemplatesDir).isDirectory()
        ? compiledTemplatesDir
        : srcTemplatesDir;

    const filename = templateName.endsWith('.pug') ? templateName : `${templateName}.pug`;

    return join(templateDir, filename);
  }

  /**
   * Formats recipients to Mailjet format
   */
  private formatRecipients(to: string | string[]): IMailjetRecipient[] {
    if (Array.isArray(to)) {
      return to.map((email) => ({ Email: email }));
    }
    return [{ Email: to }];
  }

  /**
   * Formats attachment to Mailjet format with base64 encoding
   */
  private formatAttachment(attachment: IEmailAttachment): IMailjetAttachment {
    const contentType =
      attachment.contentType ?? (lookup(attachment.filename) || 'application/octet-stream');

    let base64Content: string;
    if (Buffer.isBuffer(attachment.content)) {
      base64Content = attachment.content.toString('base64');
    } else if (typeof attachment.content === 'string') {
      base64Content = Buffer.from(attachment.content).toString('base64');
    } else {
      this.logger.warn(`Unsupported attachment content type for ${attachment.filename}`);
      base64Content = '';
    }

    return {
      ContentType: contentType,
      Filename: attachment.filename,
      Base64Content: base64Content,
    };
  }
}
