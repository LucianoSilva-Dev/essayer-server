import { PrismaService } from '@core/prisma';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTeacherRequest(userId: string, lattes: string) {
    return this.prisma.teacherRequest.create({ data: { userId, lattes } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        createdAt: true,
        lattes: true,
        imageFileId: true,
      },
      where: { id },
    });
  }

  getProfile(id: string) {
    return this.prisma.user.findUnique({
      select: { name: true, id: true, image: true },
      where: { id },
    });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  savePicture(id: string, fileId?: string, url?: string) {
    return this.prisma.user.update({
      where: { id },
      data: { imageFileId: fileId, image: url },
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  getPicture(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { image: true, imageFileId: true },
    });
  }
}
