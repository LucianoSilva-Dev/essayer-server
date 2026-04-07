import { beforeEach, describe, expect, it } from 'vitest';
import { Subject } from 'rxjs';
import { CorrectionSseConnectionsManager, ICorrectionSseEvent } from './correction-sse-connections.manager';

describe('CorrectionSseConnectionsManager', () => {
  let manager: CorrectionSseConnectionsManager;

  beforeEach(() => {
    manager = new CorrectionSseConnectionsManager();
  });

  describe('addConnection', () => {
    it('should add a connection for a new essay', () => {
      const subject = new Subject<ICorrectionSseEvent>();
      manager.addConnection('essay-1', subject);

      const received: ICorrectionSseEvent[] = [];
      subject.subscribe((event) => received.push(event));

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'hello' });
      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ event: 'TEST', data: 'hello' });
    });

    it('should add multiple connections for the same essay', () => {
      const subject1 = new Subject<ICorrectionSseEvent>();
      const subject2 = new Subject<ICorrectionSseEvent>();

      manager.addConnection('essay-1', subject1);
      manager.addConnection('essay-1', subject2);

      const received1: ICorrectionSseEvent[] = [];
      const received2: ICorrectionSseEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'hello' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('should handle connections for different essays independently', () => {
      const subject1 = new Subject<ICorrectionSseEvent>();
      const subject2 = new Subject<ICorrectionSseEvent>();

      manager.addConnection('essay-1', subject1);
      manager.addConnection('essay-2', subject2);

      const received1: ICorrectionSseEvent[] = [];
      const received2: ICorrectionSseEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'only-essay-1' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(0);
    });
  });

  describe('removeConnection', () => {
    it('should remove a specific connection', () => {
      const subject = new Subject<ICorrectionSseEvent>();
      manager.addConnection('essay-1', subject);
      manager.removeConnection('essay-1', subject);

      const received: ICorrectionSseEvent[] = [];
      subject.subscribe((event) => received.push(event));

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'hello' });
      expect(received).toHaveLength(0);
    });

    it('should clean up essay entry when last connection is removed', () => {
      const subject = new Subject<ICorrectionSseEvent>();
      manager.addConnection('essay-1', subject);
      manager.removeConnection('essay-1', subject);

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'hello' });

      const received: ICorrectionSseEvent[] = [];
      subject.subscribe((event) => received.push(event));
      expect(received).toHaveLength(0);
    });

    it('should keep other connections when removing one', () => {
      const subject1 = new Subject<ICorrectionSseEvent>();
      const subject2 = new Subject<ICorrectionSseEvent>();

      manager.addConnection('essay-1', subject1);
      manager.addConnection('essay-1', subject2);
      manager.removeConnection('essay-1', subject1);

      const received2: ICorrectionSseEvent[] = [];
      subject2.subscribe((event) => received2.push(event));

      manager.pushToEssay('essay-1', { event: 'TEST', data: 'hello' });
      expect(received2).toHaveLength(1);
    });

    it('should do nothing when removing from non-existent essay', () => {
      const subject = new Subject<ICorrectionSseEvent>();
      expect(() => manager.removeConnection('essay-999', subject)).not.toThrow();
    });
  });

  describe('pushToEssay', () => {
    it('should not throw when essay has no connections', () => {
      expect(() =>
        manager.pushToEssay('essay-999', { event: 'TEST', data: 'hello' }),
      ).not.toThrow();
    });

    it('should deliver event to all connections of an essay', () => {
      const subject1 = new Subject<ICorrectionSseEvent>();
      const subject2 = new Subject<ICorrectionSseEvent>();

      manager.addConnection('essay-1', subject1);
      manager.addConnection('essay-1', subject2);

      const received1: ICorrectionSseEvent[] = [];
      const received2: ICorrectionSseEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToEssay('essay-1', { event: 'CORRECTION_DONE', data: '{"id":"1"}' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
      expect(received1[0].event).toBe('CORRECTION_DONE');
    });
  });
});
