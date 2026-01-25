import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { sanitizeFilename } from '@common/utils/string.utils';
import { Injectable, InternalServerErrorException, type OnModuleInit } from '@nestjs/common';
import { lookup } from 'mime-types';
import type { ISaveFileResponse, IStorageProvider } from 'src/core/storage/types';
import type { IR2StorageConfig } from './r2.storage.types';

@Injectable()
export class R2StorageProvider implements IStorageProvider, OnModuleInit {
  private client: S3Client;

  constructor(private readonly config: IR2StorageConfig) {}

  onModuleInit() {
    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async save(file: Buffer, originalName: string): Promise<ISaveFileResponse> {
    const sanitizedName = sanitizeFilename(originalName);
    const folderId = randomUUID();
    const baseId = `${folderId}/${sanitizedName}`;
    const fileId = this.config.appFolder ? `${this.config.appFolder}/${baseId}` : baseId;
    const contentType = lookup(originalName) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: fileId,
      Body: file,
      ContentType: contentType,
    });

    try {
      await this.client.send(command);
      const url = `${this.config.publicUrl}/${fileId}`;
      return {
        fileId,
        url,
        originalName: sanitizedName,
      };
    } catch (error) {
      console.error(`Error saving file to R2: ${error.message}`);
      throw new InternalServerErrorException(
        'Falha ao fazer upload do arquivo para o armazenamento R2. Por favor, tente novamente mais tarde ou verifique sua conexão.',
      );
    }
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: path,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('Erro ao deletar arquivo do R2:', error);
      throw new Error('Não foi possível deletar o arquivo do R2.');
    }
  }

  async download(fileId: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: fileId,
    });

    try {
      const response = await this.client.send(command);
      const stream = response.Body;
      const chunks: Buffer[] = [];
      // biome-ignore lint/suspicious/noExplicitAny: AWS SDK stream is async iterable
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Erro ao baixar arquivo do R2:', error);
      throw new Error('Não foi possível baixar o arquivo do R2.');
    }
  }

  async list(): Promise<string[]> {
    const fileIds: string[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.config.bucketName,
          Prefix: this.config.appFolder || undefined,
          ContinuationToken: continuationToken,
        });

        const response = await this.client.send(command);

        if (response.Contents) {
          for (const object of response.Contents) {
            if (object.Key) {
              fileIds.push(object.Key);
            }
          }
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return fileIds;
    } catch (error) {
      console.error('Erro ao listar arquivos do R2:', error);
      throw new Error('Não foi possível listar os arquivos do R2.');
    }
  }
}
