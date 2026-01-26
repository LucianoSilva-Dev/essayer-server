/**
 * Notification event payloads
 * Events emitted after a notification record is created (for SSE dispatch)
 */

/**
 * Emitted when a notification is created and ready to be streamed via SSE
 */
export class NotificationCreatedPayload {
  constructor(
    public readonly notificationId: string,
    public readonly type: string,
    public readonly recipients: string[],
    public readonly data: Record<string, unknown>,
  ) {}
}
