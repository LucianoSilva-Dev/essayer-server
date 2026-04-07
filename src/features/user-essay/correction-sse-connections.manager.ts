import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface ICorrectionSseEvent {
  event: string;
  data: string;
}

@Injectable()
export class CorrectionSseConnectionsManager {
  private connections = new Map<string, Set<Subject<ICorrectionSseEvent>>>();

  addConnection(essayId: string, subject: Subject<ICorrectionSseEvent>) {
    if (!this.connections.has(essayId)) {
      this.connections.set(essayId, new Set());
    }
    this.connections.get(essayId)!.add(subject);
  }

  removeConnection(essayId: string, subject: Subject<ICorrectionSseEvent>) {
    const essayConnections = this.connections.get(essayId);
    if (!essayConnections) return;

    essayConnections.delete(subject);
    if (essayConnections.size === 0) {
      this.connections.delete(essayId);
    }
  }

  pushToEssay(essayId: string, event: ICorrectionSseEvent) {
    const essayConnections = this.connections.get(essayId);
    if (!essayConnections) return;

    for (const subject of essayConnections) {
      subject.next(event);
    }
  }
}
