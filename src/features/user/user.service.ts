import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { STORAGE_PROVIDER } from '@core/storage/storage.constants';
import { IStorageProvider } from '@core/storage/types';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    @Inject(STORAGE_PROVIDER) private readonly storageService: IStorageProvider,
  ) {}

  async get(id: string) {
    const user = await this.repository.findById(id);

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async createTeacher(id: string, data: CreateTeacherDto) {
    const { lattes } = data;
    try {
      await this.repository.createTeacherRequest(id, lattes);
      return { message: 'request created successfully' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException("Error creating 'teacherRequest'");
    }
  }

  async update(id: string, data: UpdateUserDto, requesterId: string) {
    if (id !== requesterId) throw new ForbiddenException('unable to edit other accounts info');

    try {
      await this.repository.update(id, data);

      return { message: 'user updated successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(id: string, requesterId: string) {
    if (id !== requesterId) throw new ForbiddenException('unable to delete other accounts');

    const user = await this.repository.findById(id);

    if (!user) throw new NotFoundException(`user with id ${id} not found`);

    try {
      if (user.imageFileId) {
        await this.storageService.delete(user.imageFileId);
      }

      await this.repository.delete(id);

      return { message: 'user deleted successfully' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async profile(id: string) {
    const user = await this.repository.getProfile(id);

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async getPicture(id: string) {
    const picture = await this.repository.getPicture(id);

    if (!picture) throw new NotFoundException('user not found');

    return picture;
  }

  async createPicture(id: string, requesterId: string, picture: Express.Multer.File) {
    if (id !== requesterId) throw new ForbiddenException('unable to edit other accounts info');

    const user = await this.repository.findById(id);

    if (!user) throw new NotFoundException(`user with id ${id} not found`);

    try {
      const savedFile = await this.storageService.save(picture.buffer, picture.originalname);
      const pictureFileId = savedFile.fileId;
      const pictureUrl = savedFile.url;

      await this.repository.savePicture(id, pictureFileId, pictureUrl);

      return { message: 'picture added successfully' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException('Error adding profile picture');
    }
  }

  async updatePicture(id: string, requesterId: string, picture: Express.Multer.File) {
    if (id !== requesterId) throw new ForbiddenException('unable to edit other accounts info');

    const user = await this.repository.findById(id);

    if (!user) throw new NotFoundException(`user with id ${id} not found`);

    try {
      if (user.imageFileId) await this.storageService.delete(user.imageFileId);

      const savedFile = await this.storageService.save(picture.buffer, picture.originalname);
      const pictureFileId = savedFile.fileId;
      const pictureUrl = savedFile.url;

      await this.repository.savePicture(id, pictureFileId, pictureUrl);

      return { message: 'picture updated successfully' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException('Error updating profile picture');
    }
  }

  async deletePicture(id: string, requesterId: string) {
    if (id !== requesterId) throw new ForbiddenException('unable to edit other accounts info');

    const user = await this.repository.findById(id);

    if (!user) throw new NotFoundException(`user with id ${id} not found`);

    try {
      if (user.imageFileId) await this.storageService.delete(user.imageFileId);

      await this.repository.savePicture(id, undefined, undefined);

      return { message: 'image deleted succeddfully' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException('Error deleting profile picture');
    }
  }
}
