import { ConfigService } from '@config/config.service';
import { EMAIL_PROVIDER, type IEmailProvider } from '@core/email';
import { Controller, Get, Inject, InternalServerErrorException, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

/**
 * Test controller for email functionality
 * This endpoint is for development/testing purposes only
 */
@ApiTags('Test - Email')
@Controller('http-test/email')
export class EmailTestController {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send a test email to verify email configuration is working
   */
  @AllowAnonymous()
  @Get('send')
  @ApiOperation({ summary: 'Envia um email de teste para verificar configuração' })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Email do destinatário (opcional, usa EMAIL_FROM se não informado)',
  })
  async sendTestEmail(@Query('to') to?: string) {
    const recipient = to || this.configService.get('EMAIL_FROM') || 'test@example.com';
    const driver = this.configService.get('EMAIL_DRIVER');

    try {
      const result = await this.emailProvider.sendMail({
        to: recipient,
        subject: '🧪 Teste de Email - Essayer Server',
        html: this.getTestEmailHtml(driver),
        text: `Este é um email de teste do Essayer Server.\n\nDriver: ${driver}\nData: ${new Date().toISOString()}`,
      });

      return {
        success: result.success,
        messageId: result.messageId,
        driver,
        recipient,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Falha ao enviar email de teste',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        driver,
        recipient,
      });
    }
  }

  private getTestEmailHtml(driver: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #2563eb; margin-bottom: 24px;">🧪 Email de Teste</h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Este é um email de teste enviado pelo <strong>Essayer Server</strong> para verificar que a configuração de email está funcionando corretamente.
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1f2937;">📋 Detalhes</h3>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Driver:</strong> ${driver}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Data:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-top: 32px; text-align: center;">
            Este email foi enviado automaticamente para fins de teste.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
