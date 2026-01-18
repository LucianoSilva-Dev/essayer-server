/**
 * Email Provider Abstraction Types
 * Defines the interface and token for email providers
 */

/**
 * Email attachment definition
 */
export interface IEmailAttachment {
  /** Filename to show in the email */
  filename: string;
  /** File content (Buffer or string) */
  content: Buffer | string;
  /** MIME type (e.g., 'application/pdf') */
  contentType?: string;
}

/**
 * Options for sending an email
 */
export interface ISendMailOptions {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** Template name (without extension) - looks in common/templates */
  template?: string;
  /** Context/variables to pass to the template */
  context?: Record<string, unknown>;
  /** Direct HTML content (used if no template provided) */
  html?: string;
  /** Plain text content */
  text?: string;
  /** Optional sender override (defaults to EMAIL_FROM env var) */
  from?: string;
  /** Optional attachments */
  attachments?: IEmailAttachment[];
}

/**
 * Result of a sent email
 */
export interface ISendMailResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Message ID from the provider */
  messageId?: string;
}

/**
 * Email provider interface
 * All email providers must implement this interface
 */
export interface IEmailProvider {
  /**
   * Send an email using the configured provider
   * @param options - Email options including recipients, subject, template, etc.
   * @returns Promise with send result
   */
  sendMail(options: ISendMailOptions): Promise<ISendMailResult>;
}

/**
 * Injection token for the email provider
 * Use with @Inject(EMAIL_PROVIDER) to inject the configured provider
 */
export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
