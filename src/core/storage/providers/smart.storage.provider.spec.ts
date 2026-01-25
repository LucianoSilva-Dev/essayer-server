import { Test, type TestingModule } from '@nestjs/testing';
import type { IStorageProvider } from 'src/core/storage/types';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { SmartStorageProvider } from './smart.storage.provider';

describe('SmartStorageProvider', () => {
  let provider: SmartStorageProvider;
  let defaultProvider: IStorageProvider;
  let imageProvider: IStorageProvider;

  const mockDefaultProvider = {
    save: vi.fn(),
    delete: vi.fn(),
    download: vi.fn(),
    list: vi.fn(),
  };

  const mockImageProvider = {
    save: vi.fn(),
    delete: vi.fn(),
    download: vi.fn(),
    list: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SmartStorageProvider,
          useFactory: () => new SmartStorageProvider(mockDefaultProvider, mockImageProvider),
        },
      ],
    }).compile();

    provider = module.get<SmartStorageProvider>(SmartStorageProvider);
    defaultProvider = mockDefaultProvider;
    imageProvider = mockImageProvider;
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('save', () => {
    it('should use imageProvider for images', async () => {
      const file = Buffer.from('image content');
      const originalName = 'test.png';
      const expectedResponse = {
        fileId: 'cloud-id',
        url: 'http://cloudinary/test.png',
        originalName: 'test.png',
      };

      (imageProvider.save as Mock).mockResolvedValue(expectedResponse);

      const result = await provider.save(file, originalName);

      expect(imageProvider.save).toHaveBeenCalledWith(file, originalName);
      expect(defaultProvider.save).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...expectedResponse,
        fileId: 'cloudinary:cloud-id',
      });
    });

    it('should use defaultProvider for non-images', async () => {
      const file = Buffer.from('pdf content');
      const originalName = 'test.pdf';
      const expectedResponse = {
        fileId: 'local-id',
        url: 'http://local/test.pdf',
        originalName: 'test.pdf',
      };

      (defaultProvider.save as Mock).mockResolvedValue(expectedResponse);

      const result = await provider.save(file, originalName);

      expect(defaultProvider.save).toHaveBeenCalledWith(file, originalName);
      expect(imageProvider.save).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('delete', () => {
    it('should use imageProvider when fileId starts with cloudinary:', async () => {
      const fileId = 'cloudinary:123';
      await provider.delete(fileId);
      expect(imageProvider.delete).toHaveBeenCalledWith('123');
      expect(defaultProvider.delete).not.toHaveBeenCalled();
    });

    it('should use defaultProvider when fileId does not start with cloudinary:', async () => {
      const fileId = '123';
      await provider.delete(fileId);
      expect(defaultProvider.delete).toHaveBeenCalledWith('123');
      expect(imageProvider.delete).not.toHaveBeenCalled();
    });
  });

  describe('download', () => {
    it('should use imageProvider when fileId starts with cloudinary:', async () => {
      const fileId = 'cloudinary:123';
      const buffer = Buffer.from('content');
      (imageProvider.download as Mock).mockResolvedValue(buffer);

      const result = await provider.download(fileId);

      expect(imageProvider.download).toHaveBeenCalledWith('123');
      expect(result).toBe(buffer);
    });

    it('should use defaultProvider when fileId does not start with cloudinary:', async () => {
      const fileId = '123';
      const buffer = Buffer.from('content');
      (defaultProvider.download as Mock).mockResolvedValue(buffer);

      const result = await provider.download(fileId);

      expect(defaultProvider.download).toHaveBeenCalledWith('123');
      expect(result).toBe(buffer);
    });
  });

  describe('list', () => {
    it('should combine files from both providers with cloudinary prefix', async () => {
      const defaultFiles = ['file1.pdf', 'file2.pdf'];
      const imageFiles = ['image1', 'image2'];

      (defaultProvider.list as Mock).mockResolvedValue(defaultFiles);
      (imageProvider.list as Mock).mockResolvedValue(imageFiles);

      const result = await provider.list();

      expect(defaultProvider.list).toHaveBeenCalled();
      expect(imageProvider.list).toHaveBeenCalled();
      expect(result).toEqual(['file1.pdf', 'file2.pdf', 'cloudinary:image1', 'cloudinary:image2']);
    });

    it('should return empty array when both providers have no files', async () => {
      (defaultProvider.list as Mock).mockResolvedValue([]);
      (imageProvider.list as Mock).mockResolvedValue([]);

      const result = await provider.list();

      expect(result).toEqual([]);
    });
  });
});
