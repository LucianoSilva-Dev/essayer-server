import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface ISseNotificationEvent {
  event: string;
  data: string;
}

@Injectable()
export class SseConnectionsManager {
  private connections = new Map<string, Set<Subject<ISseNotificationEvent>>>();

  addConnection(userId: string, subject: Subject<ISseNotificationEvent>) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(subject);
  }

  removeConnection(userId: string, subject: Subject<ISseNotificationEvent>) {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return;

    userConnections.delete(subject);
    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }
  }

  pushToUser(userId: string, event: ISseNotificationEvent) {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return;

    for (const subject of userConnections) {
      subject.next(event);
    }
  }

  pushToUsers(userIds: string[], event: ISseNotificationEvent) {
    for (const userId of userIds) {
      this.pushToUser(userId, event);
    }
  }
}
