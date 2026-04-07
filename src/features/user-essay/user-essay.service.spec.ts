import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserEssayService } from './user-essay.service';
import { UserEssayRepository } from './user-essay.repository';
import { EssayCorrectionQueue } from './essay-correction.queue';
import { CorrectionSseConnectionsManager } from './correction-sse-connections.manager';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('UserEssayService', () => {
  let service: UserEssayService;
  let repository: UserEssayRepository;
  let correctionQueue: EssayCorrectionQueue;
  let correctionSseManager: CorrectionSseConnectionsManager;

  const mockRepository = {
    getUserEssayById: vi.fn(),
    getActiveCorrectionCount: vi.fn(),
    createAiCorrection: vi.fn(),
    findAiCorrectionById: vi.fn(),
    updateAiCorrectionStatus: vi.fn(),
    deleteAiCorrection: vi.fn(),
  };

  const mockCorrectionQueue = {
    addCorrectionJob: vi.fn(),
    getJob: vi.fn(),
    removeJob: vi.fn(),
  };

  const mockSseManager = {
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserEssayService,
        { provide: UserEssayRepository, useValue: mockRepository },
        { provide: EssayCorrectionQueue, useValue: mockCorrectionQueue },
        { provide: CorrectionSseConnectionsManager, useValue: mockSseManager },
      ],
    }).compile();

    service = module.get<UserEssayService>(UserEssayService);
    repository = module.get<UserEssayRepository>(UserEssayRepository);
    correctionQueue = module.get<EssayCorrectionQueue>(EssayCorrectionQueue);
    correctionSseManager = module.get<CorrectionSseConnectionsManager>(CorrectionSseConnectionsManager);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('correct', () => {
    const essayId = 'essay-1';
    const studentId = 'student-1';
    const dto = { theme: 'My theme', essayText: 'Some text' };

    it('should create correction and add job on success', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.getActiveCorrectionCount.mockResolvedValue(0);
      mockCorrectionQueue.getJob.mockResolvedValue(undefined);
      mockRepository.createAiCorrection.mockResolvedValue({ id: 'correction-1' });
      mockCorrectionQueue.addCorrectionJob.mockResolvedValue(undefined);

      const result = await service.correct(essayId, dto, studentId);

      expect(result).toBeNull();
      expect(repository.createAiCorrection).toHaveBeenCalledWith(essayId, dto.essayText);
      expect(correctionQueue.addCorrectionJob).toHaveBeenCalledWith({
        essayId,
        correctionId: 'correction-1',
        theme: dto.theme,
        text: dto.essayText,
        userId: studentId,
      });
    });

    it('should throw NotFoundException when essay not found', async () => {
      mockRepository.getUserEssayById.mockResolvedValue(null);

      await expect(service.correct(essayId, dto, studentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId: 'other-student' });

      await expect(service.correct(essayId, dto, studentId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when active correction exists', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.getActiveCorrectionCount.mockResolvedValue(1);

      await expect(service.correct(essayId, dto, studentId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when job is already in progress', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.getActiveCorrectionCount.mockResolvedValue(0);
      mockCorrectionQueue.getJob.mockResolvedValue({ getState: vi.fn().mockResolvedValue('active') });

      await expect(service.correct(essayId, dto, studentId)).rejects.toThrow(ConflictException);
    });

    it('should allow correction when job state is failed', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.getActiveCorrectionCount.mockResolvedValue(0);
      mockCorrectionQueue.getJob.mockResolvedValue({ getState: vi.fn().mockResolvedValue('failed') });
      mockRepository.createAiCorrection.mockResolvedValue({ id: 'correction-1' });
      mockCorrectionQueue.addCorrectionJob.mockResolvedValue(undefined);

      const result = await service.correct(essayId, dto, studentId);

      expect(result).toBeNull();
      expect(repository.createAiCorrection).toHaveBeenCalledWith(essayId, dto.essayText);
    });

    it('should allow correction when no job exists', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.getActiveCorrectionCount.mockResolvedValue(0);
      mockCorrectionQueue.getJob.mockResolvedValue(undefined);
      mockRepository.createAiCorrection.mockResolvedValue({ id: 'correction-1' });
      mockCorrectionQueue.addCorrectionJob.mockResolvedValue(undefined);

      const result = await service.correct(essayId, dto, studentId);

      expect(result).toBeNull();
    });
  });

  describe('retryCorrection', () => {
    const essayId = 'essay-1';
    const correctionId = 'correction-1';
    const studentId = 'student-1';

    it('should retry job and update status on success', async () => {
      const mockRetry = vi.fn().mockResolvedValue(undefined);
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.findAiCorrectionById.mockResolvedValue({ id: correctionId, status: 'ERROR' });
      mockCorrectionQueue.getJob.mockResolvedValue({ getState: vi.fn().mockResolvedValue('failed'), retry: mockRetry });
      mockRepository.updateAiCorrectionStatus.mockResolvedValue(undefined);

      const result = await service.retryCorrection(essayId, correctionId, studentId);

      expect(result).toEqual({ message: 'Correction retry initiated successfully' });
      expect(mockRetry).toHaveBeenCalled();
      expect(repository.updateAiCorrectionStatus).toHaveBeenCalledWith(correctionId, 'PENDING');
    });

    it('should throw NotFoundException when essay not found', async () => {
      mockRepository.getUserEssayById.mockResolvedValue(null);

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId: 'other-student' });

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when correction not found', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.findAiCorrectionById.mockResolvedValue(null);

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when correction status is not ERROR', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.findAiCorrectionById.mockResolvedValue({ id: correctionId, status: 'FINISHED' });

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when job not found', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.findAiCorrectionById.mockResolvedValue({ id: correctionId, status: 'ERROR' });
      mockCorrectionQueue.getJob.mockResolvedValue(undefined);

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when job state is not failed', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockRepository.findAiCorrectionById.mockResolvedValue({ id: correctionId, status: 'ERROR' });
      mockCorrectionQueue.getJob.mockResolvedValue({ getState: vi.fn().mockResolvedValue('active') });

      await expect(service.retryCorrection(essayId, correctionId, studentId)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCorrection', () => {
    const essayId = 'essay-1';
    const correctionId = 'correction-1';
    const studentId = 'student-1';

    it('should remove job and delete correction on success', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId });
      mockCorrectionQueue.removeJob.mockResolvedValue(undefined);
      mockRepository.deleteAiCorrection.mockResolvedValue(undefined);

      const result = await service.deleteCorrection(essayId, correctionId, studentId);

      expect(result).toEqual({ message: 'Correction deleted successfully' });
      expect(correctionQueue.removeJob).toHaveBeenCalledWith(correctionId);
      expect(repository.deleteAiCorrection).toHaveBeenCalledWith(correctionId);
    });

    it('should throw NotFoundException when essay not found', async () => {
      mockRepository.getUserEssayById.mockResolvedValue(null);

      await expect(service.deleteCorrection(essayId, correctionId, studentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not the owner', async () => {
      mockRepository.getUserEssayById.mockResolvedValue({ id: essayId, studentId: 'other-student' });

      await expect(service.deleteCorrection(essayId, correctionId, studentId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listenCorrection', () => {
    const essayId = 'essay-1';
    const studentId = 'student-1';

    it('should return an Observable', () => {
      const result = service.listenCorrection(essayId, studentId);

      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should add connection to SSE manager', () => {
      service.listenCorrection(essayId, studentId);

      expect(correctionSseManager.addConnection).toHaveBeenCalledWith(
        essayId,
        expect.any(Object),
      );
    });

    it('should remove connection from SSE manager on finalize', () => {
      const observable = service.listenCorrection(essayId, studentId);

      const subscription = observable.subscribe();
      subscription.unsubscribe();

      expect(correctionSseManager.removeConnection).toHaveBeenCalledWith(
        essayId,
        expect.any(Object),
      );
    });
  });
});
