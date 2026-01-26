import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageCleanupRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Finds all user image file IDs that are currently in use.
   */
  async findAllUserImageFileIds(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { imageFileId: { not: null } },
      select: { imageFileId: true },
    });

    // Type guard is technically redundant due to where clause but good for strict typing
    return users.map((user) => user.imageFileId).filter((id): id is string => id !== null);
  }
}
