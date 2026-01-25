import type { ConfigService } from 'src/config';
import { DropboxStorageProvider } from '../providers/Dropbox/dropbox.storage.provider';
import type { IDropboxStorageConfig } from '../providers/Dropbox/dropbox.storage.types';

export function setupDropboxProvider(configService: ConfigService) {
  const clientId = configService.get<string>('DROPBOX_CLIENT_ID');
  const clientSecret = configService.get<string>('DROPBOX_CLIENT_SECRET');
  const refreshToken = configService.get<string>('DROPBOX_REFRESH_TOKEN');
  const appFolder = configService.get<string>('STORAGE_APP_FOLDER');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required Dropbox environment variable: DROPBOX_ACCESS_TOKEN');
  }

  const dropboxConfig: IDropboxStorageConfig = {
    clientId,
    clientSecret,
    refreshToken,
    appFolder,
  };
  return new DropboxStorageProvider(dropboxConfig);
}
