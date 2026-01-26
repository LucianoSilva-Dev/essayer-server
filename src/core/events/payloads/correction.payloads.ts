/**
 * AI Correction event payloads
 * Events related to the AI essay correction workflow
 */

/**
 * Emitted when AI finishes processing a correction (before persistence)
 */
export class CorrectionCompletedPayload {
  constructor(
    public readonly freeWritingId: string,
    public readonly correctionId: string,
    public readonly userId: string,
    public readonly correction: unknown,
  ) {}
}

/**
 * Emitted after a correction has been persisted to the database
 */
export class CorrectionPersistedPayload {
  constructor(
    public readonly freeWritingId: string,
    public readonly correctionId: string,
    public readonly userId: string,
  ) {}
}

/**
 * Emitted when AI correction is taking longer than expected
 */
export class CorrectionDelayedPayload {
  constructor(
    public readonly freeWritingId: string,
    public readonly userId: string,
  ) {}
}
