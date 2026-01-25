/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { setupCloudinaryProvider } from './helpers/setup.cloudinary.provider';
import { setupDropboxProvider } from './helpers/setup.dropbox.provider'; // Importe o novo helper
import { setupR2Provider } from './helpers/setup.r2.provider';
import { SmartStorageProvider } from './providers/smart.storage.provider';
import { STORAGE_PROVIDER, storageDriverOptions } from './storage.constants'; // Import storageDriverOptions
import type { IStorageModuleAsyncOptions, IStorageModuleOptions, IStorageProvider } from './types';

@Global()
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: required for NestJS modules register logic
export class StorageModule {
  static register(options: IStorageModuleOptions): DynamicModule {
    const storageProvider: Provider = {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService): IStorageProvider => {
        // Adicione o tipo de retorno IStorageProvider
        if (options.driver === storageDriverOptions.r2) {
          // Use a constante
          return setupR2Provider(configService);
        }
        if (options.driver === storageDriverOptions.dropbox) {
          // Adicione a condição para Dropbox
          return setupDropboxProvider(configService);
        }
        throw new Error(`Unsupported storage driver: ${options.driver}`); // Melhore a mensagem de erro
      },
      inject: [ConfigService],
    };

    return {
      module: StorageModule,
      providers: [storageProvider],
      exports: [storageProvider],
    };
  }

  static registerAsync(options: IStorageModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'STORAGE_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const storageProvider: Provider = {
      provide: STORAGE_PROVIDER,
      useFactory: (opts: IStorageModuleOptions, configService: ConfigService): IStorageProvider => {
        let defaultProvider: IStorageProvider;

        if (opts.driver === storageDriverOptions.r2) {
          defaultProvider = setupR2Provider(configService);
        } else if (opts.driver === storageDriverOptions.dropbox) {
          defaultProvider = setupDropboxProvider(configService);
        } else {
          throw new Error(`Unsupported storage driver: ${opts.driver}`);
        }

        // Cloudinary é sempre configurado como o "imageProvider"
        // Se as chaves não existirem, setupCloudinaryProvider vai lançar erro
        const cloudinaryProvider = setupCloudinaryProvider(configService);
        return new SmartStorageProvider(defaultProvider, cloudinaryProvider);
      },
      inject: ['STORAGE_OPTIONS', ConfigService],
    };

    return {
      module: StorageModule,
      imports: options.imports || [],
      providers: [optionsProvider, storageProvider],
      exports: [storageProvider],
    };
  }
}
