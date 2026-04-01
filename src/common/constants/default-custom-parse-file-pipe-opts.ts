import { CustomParseFilePipeParams } from '../pipes/custom-parse-file.pipe';

export const defaultCustomParseFilePipeOpts: Required<CustomParseFilePipeParams> =
  {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    fileType: 'application/',
    fileIsRequired: true,
  };
