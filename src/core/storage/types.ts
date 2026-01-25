import type { storageDriverOptions } from './storage.constants';

export interface ISaveFileResponse {
  fileId: string;
  url: string;
  originalName: string;
}

export interface IStorageProvider {
  save(file: Buffer, originalName: string): Promise<ISaveFileResponse>;

  delete(fileId: string): Promise<void>;

  download(fileId: string): Promise<Buffer>;

  /**
   * Lists all file IDs stored in this provider.
   * Used for orphan file cleanup.
   */
  list(): Promise<string[]>;
}

export type StorageDriverOptions = keyof typeof storageDriverOptions;

export interface IStorageModuleOptions {
  driver: StorageDriverOptions;
}

export interface IStorageModuleAsyncOptions {
  // biome-ignore lint/suspicious/noExplicitAny: NestJS module types
  imports?: any[];
  // biome-ignore lint/suspicious/noExplicitAny: NestJS module types
  inject?: any[];
  // biome-ignore lint/suspicious/noExplicitAny: NestJS module types
  useFactory: (...args: any[]) => Promise<IStorageModuleOptions> | IStorageModuleOptions;
}
