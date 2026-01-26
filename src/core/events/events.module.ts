import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

/**
 * Global events module that configures the EventEmitter2 for typed pub/sub.
 *
 * This module is global, so EventEmitter2 can be injected anywhere without
 * explicitly importing EventsModule.
 *
 * @example
 * ```typescript
 * import { EventEmitter2 } from '@nestjs/event-emitter';
 *
 * @Injectable()
 * export class SomeService {
 *   constructor(private readonly eventEmitter: EventEmitter2) {}
 *
 *   async doSomething() {
 *     this.eventEmitter.emit('activity.submitted', new ActivitySubmittedPayload(...));
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      ignoreErrors: false,
    }),
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}
