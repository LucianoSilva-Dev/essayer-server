import type { ConfigService } from 'src/config';
import { CloudinaryStorageProvider } from '../providers/Cloudinary/cloudinary.storage.provider';
import type { ICloudinaryStorageConfig } from '../providers/Cloudinary/cloudinary.storage.types';

export function setupCloudinaryProvider(configService: ConfigService) {
  const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
  const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
  const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');
  const appFolder = configService.get<string>('STORAGE_APP_FOLDER');

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing required Cloudinary environment variables');
  }

  const cloudinaryConfig: ICloudinaryStorageConfig = {
    cloudName,
    apiKey,
    apiSecret,
    appFolder,
  };
  return new CloudinaryStorageProvider(cloudinaryConfig);
}
