import type { ConfigService } from 'src/config';
import { R2StorageProvider } from '../providers/R2/r2.storage.provider';
import type { IR2StorageConfig } from '../providers/R2/r2.storage.types';

export function setupR2Provider(configService: ConfigService) {
  const bucketName = configService.get<string>('R2_BUCKET_NAME');
  const region = configService.get<string>('R2_REGION');
  const accessKeyId = configService.get<string>('R2_ACCESS_KEY_ID');
  const secretAccessKey = configService.get<string>('R2_SECRET_ACCESS_KEY');
  const endpoint = configService.get<string>('R2_ENDPOINT');
  const publicUrl = configService.get<string>('R2_PUBLIC_URL');
  const appFolder = configService.get<string>('STORAGE_APP_FOLDER');

  if (!bucketName || !region || !accessKeyId || !secretAccessKey || !endpoint || !publicUrl) {
    throw new Error('Missing required R2 environment variables');
  }
  const r2Config: IR2StorageConfig = {
    bucketName,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    publicUrl,
    appFolder,
  };
  return new R2StorageProvider(r2Config);
}
