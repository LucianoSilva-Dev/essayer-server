import { sanitizeFilename } from '@common/utils/string.utils';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { ISaveFileResponse, IStorageProvider } from 'src/core/storage/types';
import * as streamifier from 'streamifier';
import type { ICloudinaryStorageConfig } from './cloudinary.storage.types';

@Injectable()
export class CloudinaryStorageProvider implements IStorageProvider {
  private logger = new Logger(CloudinaryStorageProvider.name);

  constructor(private readonly config: ICloudinaryStorageConfig) {
    cloudinary.config({
      // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
      cloud_name: this.config.cloudName,
      // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
      api_key: this.config.apiKey,
      // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
      api_secret: this.config.apiSecret,
    });
  }

  async save(file: Buffer, originalName: string): Promise<ISaveFileResponse> {
    const sanitizedName = sanitizeFilename(originalName);
    const baseId = crypto.randomUUID();
    const fileId = this.config.appFolder ? `${this.config.appFolder}/${baseId}` : baseId;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          public_id: fileId,
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          resource_type: 'auto',
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          filename_override: sanitizedName,
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          use_filename: false,
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          unique_filename: false,
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          ...(this.config.appFolder && { asset_folder: this.config.appFolder }),
        },
        (error, result) => {
          if (error) {
            this.logger.error('Error saving file to Cloudinary', error);
            return reject(
              new InternalServerErrorException('Falha ao fazer upload da imagem no Cloudinary.'),
            );
          }
          if (!result) {
            return reject(
              new InternalServerErrorException(
                'Falha desconhecida ao fazer upload da imagem no Cloudinary.',
              ),
            );
          }

          resolve({
            fileId: result.public_id,
            url: result.secure_url,
            originalName: sanitizedName,
          });
        },
      );

      streamifier.createReadStream(file).pipe(uploadStream);
    });
  }

  async delete(fileId: string): Promise<void> {
    try {
      // Cloudinary destroy usa o public_id
      await cloudinary.uploader.destroy(fileId);
    } catch (error) {
      this.logger.error(`Error deleting file from Cloudinary: ${fileId}`, error);
      throw new InternalServerErrorException('Falha ao remover arquivo do Cloudinary.');
    }
  }

  // Cloudinary não é ideal para baixar o buffer de volta dado que é focado em CDN
  // Mas para manter a interface, podemos implementar fetch
  async download(fileId: string): Promise<Buffer> {
    try {
      // Para baixar, precisamos da URL. A interface IStorageProvider assume que "fileId" é suficiente
      // Se não temos a URL completa aqui, podemos tentar reconstruir ou usar api.resource
      const resource = await cloudinary.api.resource(fileId);
      const url = resource.secure_url;

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch file from Cloudinary: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`Error downloading file from Cloudinary: ${fileId}`, error);
      throw new InternalServerErrorException('Falha ao baixar arquivo do Cloudinary.');
    }
  }

  async list(): Promise<string[]> {
    const fileIds: string[] = [];
    let nextCursor: string | undefined;

    try {
      do {
        // biome-ignore lint/suspicious/noExplicitAny: Cloudinary API usage
        const options: Record<string, any> = {
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          max_results: 500,
          // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
          resource_type: 'image',
          type: 'upload',
        };

        if (this.config.appFolder) {
          options.prefix = this.config.appFolder;
        }

        if (nextCursor) {
          options.next_cursor = nextCursor;
        }

        const result = await cloudinary.api.resources(options);

        for (const resource of result.resources) {
          if (resource.public_id) {
            fileIds.push(resource.public_id);
          }
        }

        nextCursor = result.next_cursor;
      } while (nextCursor);

      // Also list raw and video resources
      for (const resourceType of ['raw', 'video'] as const) {
        nextCursor = undefined;
        do {
          // biome-ignore lint/suspicious/noExplicitAny: Cloudinary API usage
          const options: Record<string, any> = {
            // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
            max_results: 500,
            // biome-ignore lint/style/useNamingConvention: Cloudinary API expects snake_case
            resource_type: resourceType,
            type: 'upload',
          };

          if (this.config.appFolder) {
            options.prefix = this.config.appFolder;
          }

          if (nextCursor) {
            options.next_cursor = nextCursor;
          }

          const result = await cloudinary.api.resources(options);

          for (const resource of result.resources) {
            if (resource.public_id) {
              fileIds.push(resource.public_id);
            }
          }

          nextCursor = result.next_cursor;
        } while (nextCursor);
      }

      return fileIds;
    } catch (error) {
      this.logger.error('Error listing files from Cloudinary', error);
      throw new InternalServerErrorException('Falha ao listar arquivos do Cloudinary.');
    }
  }
}
