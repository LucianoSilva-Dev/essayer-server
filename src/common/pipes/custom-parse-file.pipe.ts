import {
  ParseFilePipe,
  FileValidator,
  FileTypeValidator,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { defaultCustomParseFilePipeOpts } from '../constants/default-custom-parse-file-pipe-opts';

export type CustomParseFilePipeParams = {
  maxSizeBytes?: number;
  fileType?: string | RegExp;
  fileIsRequired?: boolean;
};

/**
 * Mapeamento de MIME-types para nomes amigáveis ao usuário
 */
const mimeTypeToFriendlyName: Record<string, string> = {
  // Imagens
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
  'image/bmp': 'BMP',
  'image/tiff': 'TIFF',
  'image/ico': 'ICO',
  'image/x-icon': 'ICO',

  // Documentos
  'application/pdf': 'PDF',
  'application/msword': 'Word (DOC)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Word (DOCX)',
  'application/vnd.ms-excel': 'Excel (XLS)',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'Excel (XLSX)',
  'application/vnd.ms-powerpoint': 'PowerPoint (PPT)',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'PowerPoint (PPTX)',
  'text/plain': 'Texto (TXT)',
  'text/csv': 'CSV',
  'application/rtf': 'RTF',

  // Vídeos
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/ogg': 'OGG',
  'video/mpeg': 'MPEG',
  'video/quicktime': 'MOV',
  'video/x-msvideo': 'AVI',
  'video/x-ms-wmv': 'WMV',

  // Áudios
  'audio/mpeg': 'MP3',
  'audio/wav': 'WAV',
  'audio/ogg': 'OGG',
  'audio/webm': 'WebM Audio',
  'audio/aac': 'AAC',
  'audio/flac': 'FLAC',

  // Arquivos compactados
  'application/zip': 'ZIP',
  'application/x-rar-compressed': 'RAR',
  'application/x-7z-compressed': '7Z',
  'application/gzip': 'GZIP',
  'application/x-tar': 'TAR',

  // Outros
  'application/json': 'JSON',
  'application/xml': 'XML',
  'text/html': 'HTML',
  'text/css': 'CSS',
  'application/javascript': 'JavaScript',
};

/**
 * Converte bytes para uma string legível (KB, MB, GB)
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

/**
 * Converte um MIME-type ou padrão para um nome amigável
 */
function getFriendlyFileTypeName(fileType: string | RegExp): string {
  if (fileType instanceof RegExp) {
    // Para regex, tenta extrair os tipos do padrão
    const regexStr = fileType.source;

    // Verifica padrões comuns de categoria
    if (regexStr.includes('image/') || regexStr.startsWith('image')) {
      return 'imagens';
    }
    if (regexStr.includes('video/') || regexStr.startsWith('video')) {
      return 'vídeos';
    }
    if (regexStr.includes('audio/') || regexStr.startsWith('audio')) {
      return 'áudios';
    }
    if (
      regexStr.includes('application/pdf') ||
      regexStr.includes('application/')
    ) {
      return 'documentos';
    }

    return 'arquivos do tipo especificado';
  }

  // Para string simples
  const friendlyName = mimeTypeToFriendlyName[fileType];
  if (friendlyName) {
    return friendlyName;
  }

  // Tenta extrair a categoria do MIME-type
  if (fileType.startsWith('image/')) {
    return 'imagens';
  }
  if (fileType.startsWith('video/')) {
    return 'vídeos';
  }
  if (fileType.startsWith('audio/')) {
    return 'áudios';
  }
  if (fileType.startsWith('application/')) {
    return 'documentos';
  }
  if (fileType.startsWith('text/')) {
    return 'arquivos de texto';
  }

  return fileType;
}

/**
 * Validator customizado para tamanho máximo de arquivo com mensagem amigável
 */
class FriendlyMaxFileSizeValidator extends FileValidator<{
  maxSize: number;
}> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return true;
    return file.size <= this.validationOptions.maxSize;
  }

  buildErrorMessage(): string {
    const maxSize = formatFileSize(this.validationOptions.maxSize);
    return `O arquivo enviado excede o tamanho máximo permitido de ${maxSize}.`;
  }
}

/**
 * Validator customizado para tipo de arquivo com mensagem amigável
 */
class FriendlyFileTypeValidator extends FileValidator<{
  fileType: string | RegExp;
}> {
  private readonly internalValidator: FileTypeValidator;

  constructor(validationOptions: { fileType: string | RegExp }) {
    super(validationOptions);
    this.internalValidator = new FileTypeValidator(validationOptions);
  }

  isValid(file?: Express.Multer.File): boolean | Promise<boolean> {
    return this.internalValidator.isValid(file);
  }

  buildErrorMessage(): string {
    const friendlyType = getFriendlyFileTypeName(
      this.validationOptions.fileType,
    );
    return `Tipo de arquivo não permitido. São aceitos apenas: ${friendlyType}.`;
  }
}

class EncodingFixParseFilePipe implements PipeTransform {
  private readonly validators: FileValidator[];
  private readonly fileIsRequired: boolean;
  private readonly exceptionFactory: (error: string) => any;

  constructor(options: { 
    validators: FileValidator[], 
    fileIsRequired?: boolean, 
    exceptionFactory?: (error: string) => any 
  }) {
    this.validators = options.validators || [];
    this.fileIsRequired = options.fileIsRequired ?? true;
    this.exceptionFactory = options.exceptionFactory ?? ((err) => new BadRequestException(err));
  }

  async transform(value: any): Promise<any> {
    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
      if (this.fileIsRequired) {
        throw this.exceptionFactory('O envio do arquivo é obrigatório.');
      }
      return value;
    }

    if (Array.isArray(value)) {
      for (const file of value) {
        this.fixEncoding(file);
        await this.validateOrThrow(file);
      }
    } else if (value.fieldname) {
      this.fixEncoding(value);
      await this.validateOrThrow(value);
    } else {
      for (const key of Object.keys(value)) {
        const files = value[key];
        if (Array.isArray(files)) {
          for (const file of files) {
            this.fixEncoding(file);
            await this.validateOrThrow(file);
          }
        } else if (files && files.fieldname) {
          this.fixEncoding(files);
          await this.validateOrThrow(files);
        }
      }
    }

    return value;
  }

  private fixEncoding(file: any) {
    if (file && typeof file === 'object' && typeof file.originalname === 'string') {
      // Fix Latin-1 to UTF-8 encoding issue from Multer
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
    }
  }

  private async validateOrThrow(file: any) {
    for (const validator of this.validators) {
      const isValid = await validator.isValid(file);
      if (!isValid) {
        throw this.exceptionFactory(validator.buildErrorMessage(file));
      }
    }
  }
}

export function CustomParseFilePipe(params?: CustomParseFilePipeParams) {
  const { maxSizeBytes, fileType, fileIsRequired } = params ?? {};

  return new EncodingFixParseFilePipe({
    validators: [
      new FriendlyMaxFileSizeValidator({
        maxSize: maxSizeBytes ?? defaultCustomParseFilePipeOpts.maxSizeBytes,
      }),
      new FriendlyFileTypeValidator({
        fileType: fileType ?? defaultCustomParseFilePipeOpts.fileType,
      }),
    ],
    fileIsRequired:
      fileIsRequired ?? defaultCustomParseFilePipeOpts.fileIsRequired,
    exceptionFactory: (error: string) => {
      // Mensagem amigável para "file is required"
      if (error.toLowerCase().includes('file is expected')) {
        return new BadRequestException('O envio do arquivo é obrigatório.');
      }
      return new BadRequestException(error);
    },
  });
}

// Re-exporta os validators customizados para uso direto se necessário
export { FriendlyMaxFileSizeValidator, FriendlyFileTypeValidator };
