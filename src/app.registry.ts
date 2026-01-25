import type { INestApplication } from '@nestjs/common';

let appContext: INestApplication;

export function setAppContext(app: INestApplication): void {
  appContext = app;
}

export function getAppContext(): INestApplication {
  if (!appContext) {
    throw new Error('App context has not been initialized');
  }
  return appContext;
}

/**
 * Safely attempts to get the app context without throwing.
 * Returns null if the context has not been initialized yet.
 */
export function tryGetAppContext(): INestApplication | null {
  return appContext ?? null;
}
