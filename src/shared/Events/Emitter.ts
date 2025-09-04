import { EventEmitter } from 'node:events';
import type { AppEventMap } from './Types';

// biome-ignore lint/suspicious/noExplicitAny: Complex Types
type EventMap = Record<string, any>;
type Listener<T> = (payload: T) => void;

class TypedEventEmitter<T extends EventMap> {
  private emitter = new EventEmitter();
  
  on<K extends keyof T>(eventName: K, listener: Listener<T[K]>): this {
    this.emitter.on(eventName as string, listener);
    return this;
  }

  off<K extends keyof T>(eventName: K, listener: Listener<T[K]>): this {
    this.emitter.off(eventName as string, listener)
    return this
  }

  emit<K extends keyof T>(eventName: K, payload: T[K]): boolean {
    return this.emitter.emit(eventName as string, payload);
  }
}

export const AppEventEmitter = new TypedEventEmitter<AppEventMap>()