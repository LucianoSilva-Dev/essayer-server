import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CorrectionCompletedListener } from './correction-completed.listener';
import { CorrectionSseListener } from './correction-sse.listener';
import { UserEssayRepository } from './user-essay.repository';
import { CorrectionSseConnectionsManager } from './correction-sse-connections.manager';
import {
  CorrectionCompletedPayload,
  CorrectionPersistedPayload,
  CorrectionDelayedPayload,
} from '@core/events/payloads/correction.payloads';

describe('CorrectionCompletedListener', () => {
  let listener: CorrectionCompletedListener;
  let repository: UserEssayRepository;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    repository = {
      updateAiCorrectionToFinished: vi.fn(),
    } as any;

    eventEmitter = {
      emit: vi.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        CorrectionCompletedListener,
        { provide: UserEssayRepository, useValue: repository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    listener = module.get(CorrectionCompletedListener);
  });

  it('persists correction and emits correction.ai.persisted on success', async () => {
    const payload = new CorrectionCompletedPayload(
      'essay-1',
      'corr-1',
      'user-1',
      {
        gradeC1: 1,
        gradeC2: 2,
        gradeC3: 3,
        gradeC4: 4,
        gradeC5: 5,
        feedbackC1: 'a',
        feedbackC2: 'b',
        feedbackC3: 'c',
        feedbackC4: 'd',
        feedbackC5: 'e',
      },
    );

    (repository.updateAiCorrectionToFinished as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await listener.handleCorrectionCompleted(payload);

    expect(repository.updateAiCorrectionToFinished).toHaveBeenCalledWith(
      'corr-1',
      payload.correction,
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'correction.ai.persisted',
      expect.any(CorrectionPersistedPayload),
    );

    const emittedPayload = (eventEmitter.emit as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(emittedPayload.freeWritingId).toBe('essay-1');
    expect(emittedPayload.correctionId).toBe('corr-1');
    expect(emittedPayload.userId).toBe('user-1');
  });

  it('does not propagate error when repository throws', async () => {
    const payload = new CorrectionCompletedPayload(
      'essay-1',
      'corr-1',
      'user-1',
      {
        gradeC1: 1,
        gradeC2: 2,
        gradeC3: 3,
        gradeC4: 4,
        gradeC5: 5,
        feedbackC1: 'a',
        feedbackC2: 'b',
        feedbackC3: 'c',
        feedbackC4: 'd',
        feedbackC5: 'e',
      },
    );

    (repository.updateAiCorrectionToFinished as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('db error'),
    );

    await expect(listener.handleCorrectionCompleted(payload)).resolves.toBeUndefined();

    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});

describe('CorrectionSseListener', () => {
  let listener: CorrectionSseListener;
  let sseManager: CorrectionSseConnectionsManager;
  let repository: UserEssayRepository;

  beforeEach(async () => {
    sseManager = {
      pushToEssay: vi.fn(),
    } as any;

    repository = {
      findAiCorrectionById: vi.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        CorrectionSseListener,
        { provide: CorrectionSseConnectionsManager, useValue: sseManager },
        { provide: UserEssayRepository, useValue: repository },
      ],
    }).compile();

    listener = module.get(CorrectionSseListener);
  });

  describe('handleCorrectionPersisted', () => {
    it('pushes ESSAY_CORRECTED when correction status is FINISHED', async () => {
      const payload = new CorrectionPersistedPayload('essay-1', 'corr-1', 'user-1');

      (repository.findAiCorrectionById as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'FINISHED',
      });

      await listener.handleCorrectionPersisted(payload);

      expect(sseManager.pushToEssay).toHaveBeenCalledWith('essay-1', {
        event: 'ESSAY_CORRECTED',
        data: JSON.stringify({ correctionId: 'corr-1', status: 'FINISHED' }),
      });
    });

    it('pushes ESSAY_CORRECTION_ERROR when correction status is not FINISHED', async () => {
      const payload = new CorrectionPersistedPayload('essay-1', 'corr-1', 'user-1');

      (repository.findAiCorrectionById as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 'ERROR',
      });

      await listener.handleCorrectionPersisted(payload);

      expect(sseManager.pushToEssay).toHaveBeenCalledWith('essay-1', {
        event: 'ESSAY_CORRECTION_ERROR',
        data: JSON.stringify({ correctionId: 'corr-1', status: 'ERROR' }),
      });
    });

    it('does nothing when correction is not found', async () => {
      const payload = new CorrectionPersistedPayload('essay-1', 'corr-1', 'user-1');

      (repository.findAiCorrectionById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await listener.handleCorrectionPersisted(payload);

      expect(sseManager.pushToEssay).not.toHaveBeenCalled();
    });

    it('does not throw when repository throws', async () => {
      const payload = new CorrectionPersistedPayload('essay-1', 'corr-1', 'user-1');

      (repository.findAiCorrectionById as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('db error'),
      );

      await expect(listener.handleCorrectionPersisted(payload)).resolves.toBeUndefined();
    });
  });

  describe('handleCorrectionDelayed', () => {
    it('pushes CORRECTION_DELAYED event', async () => {
      const payload = new CorrectionDelayedPayload('essay-1', 'user-1');

      await listener.handleCorrectionDelayed(payload);

      expect(sseManager.pushToEssay).toHaveBeenCalledWith('essay-1', {
        event: 'CORRECTION_DELAYED',
        data: JSON.stringify({ message: 'Correction is taking longer than expected' }),
      });
    });

    it('does not throw when pushToEssay throws', async () => {
      const payload = new CorrectionDelayedPayload('essay-1', 'user-1');

      (sseManager.pushToEssay as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('sse error');
      });

      await expect(listener.handleCorrectionDelayed(payload)).resolves.toBeUndefined();
    });
  });
});
