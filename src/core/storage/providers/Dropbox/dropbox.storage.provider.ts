import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { sanitizeFilename } from '@common/utils/string.utils';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Dropbox, type DropboxResponse, type files } from 'dropbox';
import fetch from 'node-fetch';
import type { ISaveFileResponse, IStorageProvider } from 'src/core/storage/types';
import type { IDropboxStorageConfig } from './dropbox.storage.types';

@Injectable()
export class DropboxStorageProvider implements IStorageProvider {
  private client: Dropbox;
  constructor(private readonly config: IDropboxStorageConfig) {
    this.client = new Dropbox({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      refreshToken: this.config.refreshToken,
      fetch: fetch,
    });
    console.log('Dropbox client initialized.');
  }

  /**
   * Salva um arquivo no Dropbox.
   * @param file Buffer do arquivo a ser salvo.
   * @param originalName Nome original do arquivo.
   * @returns Retorna a URL compartilhada para o arquivo ou o path se não for possível criar link.
   */
  async save(file: Buffer, originalName: string): Promise<ISaveFileResponse> {
    const sanitizedName = sanitizeFilename(originalName);
    const folderId = randomUUID();
    const baseId = `/${folderId}/${sanitizedName}`;
    const fileId = this.config.appFolder ? `/${this.config.appFolder}${baseId}` : baseId;
    let uploadedFile: files.FileMetadata;

    try {
      const response: DropboxResponse<files.FileMetadata> = await this.client.filesUpload({
        path: fileId,
        contents: file,
        mode: { '.tag': 'overwrite' },
      });
      uploadedFile = response.result;
      // biome-ignore lint/suspicious/noExplicitAny: Dropbox SDK error types are complex
    } catch (uploadError: any) {
      console.error(`Error uploading file to Dropbox: ${uploadError?.message || uploadError}`);
      throw new InternalServerErrorException(
        'Falha ao fazer upload do arquivo para o Dropbox. Por favor, tente novamente mais tarde ou verifique sua conexão.',
      );
    }

    try {
      const shareResponse = await this.client.sharingCreateSharedLinkWithSettings({
        path: uploadedFile.path_display!,
      });
      const url = shareResponse.result.url;
      return {
        fileId: uploadedFile.path_display!,
        url,
        originalName: sanitizedName,
      };
      // biome-ignore lint/suspicious/noExplicitAny: Dropbox SDK error types are complex
    } catch (shareError: any) {
      if (shareError?.error?.error?.['.tag'] === 'shared_link_already_exists') {
        const existingLinks = await this.client.sharingListSharedLinks({
          path: uploadedFile.path_display!,
          // biome-ignore lint/style/useNamingConvention: Dropbox SDK expects snake_case
          direct_only: true,
        });
        if (existingLinks.result.links.length > 0) {
          const url = existingLinks.result.links[0].url;
          return {
            fileId: uploadedFile.path_display!,
            url,
            originalName: sanitizedName,
          };
        }
      }

      // ATOMICITY: Delete the orphaned file before throwing
      console.error(
        `Failed to create shared link for ${fileId}. Deleting orphaned file.`,
        shareError,
      );
      try {
        await this.delete(fileId);
        // biome-ignore lint/suspicious/noExplicitAny: Dropbox SDK error types are complex
      } catch (deleteError: any) {
        console.error(
          `CRITICAL: Failed to delete orphaned file ${fileId} after sharing error.`,
          deleteError,
        );
      }

      throw new InternalServerErrorException(
        'Falha ao gerar link público para o arquivo enviado. Por favor, tente novamente.',
      );
    }
  }

  /**
   * Deleta um arquivo do Dropbox.
   * @param filePath Caminho completo do arquivo a ser deletado no Dropbox.
   */
  async delete(filePath: string): Promise<void> {
    // Garante que o caminho comece com '/'
    const dropboxPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

    // Determina se devemos deletar a pasta pai ou apenas o arquivo
    const dirName = path.dirname(dropboxPath);
    // Se o diretório for diferente de '/' (root), significa que estamos numa subpasta (ex: /uuid/file.ext)
    // Nesse caso, deletamos a pasta '/uuid', o que remove tudo dentro.
    // Se for na raiz (legado), deletamos apenas o arquivo.
    const pathToDelete = dirName !== '/' ? dirName : dropboxPath;

    try {
      await this.client.filesDeleteV2({
        path: pathToDelete,
      });
    } catch (error) {
      // Trata o caso específico onde o arquivo não é encontrado (path_lookup/not_found)
      if (
        error?.error?.error?.['.tag'] === 'path_lookup' &&
        error.error.error.path_lookup['.tag'] === 'not_found'
      ) {
        console.warn(`Path not found at ${pathToDelete}, skipping delete.`);
        // Pode optar por não lançar erro se o arquivo não existir
        return;
      }
      // Loga e relança outros erros
      console.error('Erro ao deletar do Dropbox:', error);
      throw new Error(`Não foi possível deletar do Dropbox: ${error.message}`);
    }
  }

  async download(fileId: string): Promise<Buffer> {
    try {
      const response = await this.client.filesDownload({
        path: fileId,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      // biome-ignore lint/suspicious/noExplicitAny: Dropbox SDK internal property access
      return (response.result as any).fileBinary;
    } catch (error) {
      console.error('Erro ao baixar arquivo do Dropbox:', error);
      throw new Error('Não foi possível baixar o arquivo do Dropbox.');
    }
  }

  async list(): Promise<string[]> {
    const fileIds: string[] = [];
    const folderPath = this.config.appFolder ? `/${this.config.appFolder}` : '';

    try {
      let response = await this.client.filesListFolder({
        path: folderPath,
        recursive: true,
      });

      for (const entry of response.result.entries) {
        if (entry['.tag'] === 'file' && entry.path_display) {
          fileIds.push(entry.path_display);
        }
      }

      while (response.result.has_more) {
        response = await this.client.filesListFolderContinue({
          cursor: response.result.cursor,
        });

        for (const entry of response.result.entries) {
          if (entry['.tag'] === 'file' && entry.path_display) {
            fileIds.push(entry.path_display);
          }
        }
      }

      return fileIds;
      // biome-ignore lint/suspicious/noExplicitAny: Dropbox SDK error types are complex
    } catch (error: any) {
      // Handle case where folder doesn't exist (empty storage)
      if (
        error?.error?.error?.['.tag'] === 'path' &&
        error.error.error.path['.tag'] === 'not_found'
      ) {
        return [];
      }
      console.error('Erro ao listar arquivos do Dropbox:', error);
      throw new Error('Não foi possível listar os arquivos do Dropbox.');
    }
  }
}
