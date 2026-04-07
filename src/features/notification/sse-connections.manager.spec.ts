import { beforeEach, describe, expect, it } from 'vitest';
import { Subject } from 'rxjs';
import { SseConnectionsManager, type ISseNotificationEvent } from './sse-connections.manager';

describe('SseConnectionsManager', () => {
  let manager: SseConnectionsManager;

  beforeEach(() => {
    manager = new SseConnectionsManager();
  });

  describe('addConnection', () => {
    it('should add a connection for a new user', () => {
      const subject = new Subject<ISseNotificationEvent>();
      manager.addConnection('user-1', subject);

      const received: ISseNotificationEvent[] = [];
      subject.subscribe((event) => received.push(event));

      manager.pushToUser('user-1', { event: 'TEST', data: 'hello' });
      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ event: 'TEST', data: 'hello' });
    });

    it('should add multiple connections for the same user', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      const subject2 = new Subject<ISseNotificationEvent>();

      manager.addConnection('user-1', subject1);
      manager.addConnection('user-1', subject2);

      const received1: ISseNotificationEvent[] = [];
      const received2: ISseNotificationEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToUser('user-1', { event: 'TEST', data: 'hello' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('should handle connections for different users independently', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      const subject2 = new Subject<ISseNotificationEvent>();

      manager.addConnection('user-1', subject1);
      manager.addConnection('user-2', subject2);

      const received1: ISseNotificationEvent[] = [];
      const received2: ISseNotificationEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToUser('user-1', { event: 'TEST', data: 'only-user-1' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(0);
    });
  });

  describe('removeConnection', () => {
    it('should remove a specific connection', () => {
      const subject = new Subject<ISseNotificationEvent>();
      manager.addConnection('user-1', subject);
      manager.removeConnection('user-1', subject);

      const received: ISseNotificationEvent[] = [];
      subject.subscribe((event) => received.push(event));

      manager.pushToUser('user-1', { event: 'TEST', data: 'hello' });
      expect(received).toHaveLength(0);
    });

    it('should clean up user entry when last connection is removed', () => {
      const subject = new Subject<ISseNotificationEvent>();
      manager.addConnection('user-1', subject);
      manager.removeConnection('user-1', subject);

      manager.pushToUser('user-1', { event: 'TEST', data: 'hello' });

      const received: ISseNotificationEvent[] = [];
      subject.subscribe((event) => received.push(event));
      expect(received).toHaveLength(0);
    });

    it('should keep other connections when removing one', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      const subject2 = new Subject<ISseNotificationEvent>();

      manager.addConnection('user-1', subject1);
      manager.addConnection('user-1', subject2);
      manager.removeConnection('user-1', subject1);

      const received2: ISseNotificationEvent[] = [];
      subject2.subscribe((event) => received2.push(event));

      manager.pushToUser('user-1', { event: 'TEST', data: 'hello' });
      expect(received2).toHaveLength(1);
    });

    it('should do nothing when removing from non-existent user', () => {
      const subject = new Subject<ISseNotificationEvent>();
      expect(() => manager.removeConnection('user-999', subject)).not.toThrow();
    });
  });

  describe('pushToUser', () => {
    it('should not throw when user has no connections', () => {
      expect(() =>
        manager.pushToUser('user-999', { event: 'TEST', data: 'hello' }),
      ).not.toThrow();
    });

    it('should deliver event to all connections of a user', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      const subject2 = new Subject<ISseNotificationEvent>();

      manager.addConnection('user-1', subject1);
      manager.addConnection('user-1', subject2);

      const received1: ISseNotificationEvent[] = [];
      const received2: ISseNotificationEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToUser('user-1', { event: 'ACTIVITY_SENT', data: '{"id":"1"}' });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
      expect(received1[0].event).toBe('ACTIVITY_SENT');
    });
  });

  describe('pushToUsers', () => {
    it('should deliver events to multiple users', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      const subject2 = new Subject<ISseNotificationEvent>();

      manager.addConnection('user-1', subject1);
      manager.addConnection('user-2', subject2);

      const received1: ISseNotificationEvent[] = [];
      const received2: ISseNotificationEvent[] = [];
      subject1.subscribe((event) => received1.push(event));
      subject2.subscribe((event) => received2.push(event));

      manager.pushToUsers(['user-1', 'user-2'], {
        event: 'ACTIVITY_SENT',
        data: '{"id":"1"}',
      });

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('should skip users with no connections', () => {
      const subject1 = new Subject<ISseNotificationEvent>();
      manager.addConnection('user-1', subject1);

      const received1: ISseNotificationEvent[] = [];
      subject1.subscribe((event) => received1.push(event));

      expect(() =>
        manager.pushToUsers(['user-1', 'user-999'], {
          event: 'ACTIVITY_SENT',
          data: '{"id":"1"}',
        }),
      ).not.toThrow();

      expect(received1).toHaveLength(1);
    });

    it('should handle empty user list', () => {
      expect(() =>
        manager.pushToUsers([], { event: 'TEST', data: 'hello' }),
      ).not.toThrow();
    });
  });
});
