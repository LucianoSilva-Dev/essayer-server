/**
 * AI Correction event payloads
 * Events related to the AI essay correction workflow
 */

export interface ICorrectionResult {
  gradeC1: number;
  gradeC2: number;
  gradeC3: number;
  gradeC4: number;
  gradeC5: number;
  feedbackC1: string;
  feedbackC2: string;
  feedbackC3: string;
  feedbackC4: string;
  feedbackC5: string;
}

/**
 * Emitted when AI finishes processing a correction (before persistence)
 */
export class CorrectionCompletedPayload {
  constructor(
    public readonly freeWritingId: string,
    public readonly correctionId: string,
    public readonly userId: string,
    public readonly correction: ICorrectionResult,
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
