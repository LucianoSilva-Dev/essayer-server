export function sanitizeFilename(filename: string): string {
  // Remove invalid file system characters: < > : " / \ | ? *
  // Preserving accents and other characters as requested
  const sanitized = filename.replace(/[<>:"/\\|?*]/g, '').trim();

  // Ensure the filename is not empty after sanitization
  if (sanitized.length === 0) {
    return 'unnamed_file';
  }

  return sanitized;
}
