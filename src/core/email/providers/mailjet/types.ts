/** Mailjet recipient format - matches Mailjet API v3.1 schema */
export interface IMailjetRecipient {
  Email: string;
  Name?: string;
}

/** Mailjet attachment format - matches Mailjet API v3.1 schema */
export interface IMailjetAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
}

/** Mailjet message format - matches Mailjet API v3.1 schema */
export interface IMailjetMessage {
  From: { Email: string; Name?: string };
  To: IMailjetRecipient[];
  Subject: string;
  HTMLPart?: string;
  TextPart?: string;
  Attachments?: IMailjetAttachment[];
}

/** Mailjet API response format - matches Mailjet API v3.1 schema */
export interface IMailjetResponse {
  Messages: Array<{
    Status: string;
    To: Array<{ Email: string; MessageID: number }>;
  }>;
}
