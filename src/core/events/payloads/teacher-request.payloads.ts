/**
 * Teacher request event payloads
 * Events related to teacher account requests (approval/rejection)
 */

/**
 * Emitted when a teacher account request status changes
 */
export class TeacherRequestStatusPayload {
  constructor(
    public readonly requestId: string,
    public readonly userId: string,
    public readonly approved: boolean,
    public readonly reason?: string,
  ) {}
}
