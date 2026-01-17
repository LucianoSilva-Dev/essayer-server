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
