import { Injectable, Logger } from '@nestjs/common';
import { lookup } from 'mime-types';
import type { ISaveFileResponse, IStorageProvider } from 'src/core/storage/types';

@Injectable()
export class SmartStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(SmartStorageProvider.name);

  constructor(
    private readonly defaultProvider: IStorageProvider,
    private readonly imageProvider: IStorageProvider,
  ) {}

  async save(file: Buffer, originalName: string): Promise<ISaveFileResponse> {
    const mimeType = lookup(originalName);

    if (typeof mimeType === 'string' && mimeType.startsWith('image/')) {
      this.logger.log(`Detectado imagem (${mimeType}). Salvando com imageProvider (Cloudinary).`);
      try {
        const result = await this.imageProvider.save(file, originalName);
        // Marcamos o ID para saber que é Cloudinary no futuro, se necessário
        // Mas a estratégia de tentativa e erro no delete é mais robusta se não quisermos mudar o formato do ID
        // Porém, para performance, um prefixo ajuda.
        // O plano original sugeriu prefixo "cloudinary:".
        return {
          ...result,
          fileId: `cloudinary:${result.fileId}`,
        };
      } catch (error) {
        this.logger.error(
          'Falha ao salvar imagem no provider dedicado. Tentando provider padrão.',
          error,
        );
        // Fallback or rethrow?
        // Se a config do Cloudinary estiver errada, talvez seja melhor falhar ou fallback?
        // Vamos lançar erro para não ocultar problemas de config.
        throw error;
      }
    }

    this.logger.log(`Arquivo não-imagem (${mimeType}). Salvando com defaultProvider.`);
    return this.defaultProvider.save(file, originalName);
  }

  async delete(fileId: string): Promise<void> {
    if (fileId.startsWith('cloudinary:')) {
      const realId = fileId.replace('cloudinary:', '');
      this.logger.log(`Deletando imagem do Cloudinary: ${realId}`);
      return this.imageProvider.delete(realId);
    }

    // Se não tem prefixo, assume que é do provider padrão (retrocompatibilidade)
    // OU poderia ser uma imagem antiga salva no R2.
    this.logger.log(`Deletando arquivo do provider padrão: ${fileId}`);
    return this.defaultProvider.delete(fileId);
  }

  async download(fileId: string): Promise<Buffer> {
    if (fileId.startsWith('cloudinary:')) {
      const realId = fileId.replace('cloudinary:', '');
      return this.imageProvider.download(realId);
    }

    return this.defaultProvider.download(fileId);
  }

  async list(): Promise<string[]> {
    this.logger.log('Listando arquivos de todos os providers...');

    // Get files from default provider (R2/Dropbox)
    const defaultFiles = await this.defaultProvider.list();

    // Get files from image provider (Cloudinary) and add prefix
    const imageFiles = await this.imageProvider.list();
    const prefixedImageFiles = imageFiles.map((id) => `cloudinary:${id}`);

    const allFiles = [...defaultFiles, ...prefixedImageFiles];
    this.logger.log(
      `Total de arquivos encontrados: ${allFiles.length} (${defaultFiles.length} default + ${imageFiles.length} cloudinary)`,
    );

    return allFiles;
  }
}
