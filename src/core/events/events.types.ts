import type {
  ActivityClosedPayload,
  ActivityCorrectedPayload,
  ActivitySubmittedPayload,
  CorrectionCompletedPayload,
  CorrectionDelayedPayload,
  CorrectionPersistedPayload,
  NotificationCreatedPayload,
  TeacherRequestStatusPayload,
} from './payloads';

/**
 * Typed event map for the application.
 * This provides type safety when emitting and listening to events.
 *
 * @example Emitting an event
 * ```typescript
 * eventEmitter.emit('activity.submitted', new ActivitySubmittedPayload(id, recipients));
 * ```
 *
 * @example Listening to an event
 * ```typescript
 * @OnEvent('activity.submitted')
 * handleActivitySubmitted(payload: ActivitySubmittedPayload) { ... }
 * ```
 */
export interface IAppEventMap {
  // Activity events
  'activity.submitted': ActivitySubmittedPayload;
  'activity.closed': ActivityClosedPayload;
  'activity.corrected': ActivityCorrectedPayload;

  // AI Correction events
  'correction.ai.completed': CorrectionCompletedPayload;
  'correction.ai.persisted': CorrectionPersistedPayload;
  'correction.ai.delayed': CorrectionDelayedPayload;

  // Teacher request events
  'teacher-request.status': TeacherRequestStatusPayload;

  // Notification created events (for SSE dispatch)
  'notification.activity.submitted.created': NotificationCreatedPayload;
  'notification.activity.closed.created': NotificationCreatedPayload;
  'notification.activity.corrected.created': NotificationCreatedPayload;
  'notification.teacher-request.status.created': NotificationCreatedPayload;
}

/**
 * Union type of all valid event names
 */
export type AppEventName = keyof IAppEventMap;
