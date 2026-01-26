/**
 * Activity event payloads
 * Events related to classroom activities (tasks/assignments)
 */

/**
 * Emitted when a student submits an activity
 */
export class ActivitySubmittedPayload {
  constructor(
    public readonly activityId: string,
    public readonly recipients: string[],
  ) {}
}

/**
 * Emitted when a teacher closes an activity (deadline reached)
 */
export class ActivityClosedPayload {
  constructor(
    public readonly activityId: string,
    public readonly recipients: string[],
  ) {}
}

/**
 * Emitted when a teacher corrects/grades an activity
 */
export class ActivityCorrectedPayload {
  constructor(
    public readonly activityId: string,
    public readonly recipients: string[],
  ) {}
}
