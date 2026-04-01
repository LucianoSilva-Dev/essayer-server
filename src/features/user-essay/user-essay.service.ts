import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { UserEssayRepository } from "./user-essay.repository";
import { CreateUserEssayDto } from "./dto/create-user-essay.dto";
import { UpdateUserEssayDto } from "./dto/update-user-essay.dto";

@Injectable()
export class UserEssayService {
  constructor(private readonly repository: UserEssayRepository) {}

  async create(data: CreateUserEssayDto, studentId: string) {
    try {
      const essay = await this.repository.createUserEssay(studentId, data);
      return { id: essay.id };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error creating user essay");
    }
  }

  async getAll(studentId: string, theme?: string) {
    try {
      const essays = await this.repository.getAllUserEssays(studentId, theme);
      return essays.map((essay) => ({
        id: essay.id,
        theme: essay.theme,
        text: essay.text || undefined,
        duration: essay.duration || undefined,
        date: essay.date,
        finished: essay.finished,
        createdAt: essay.createdAt,
        updatedAt: essay.updatedAt,
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error fetching user essays");
    }
  }

  async get(userEssayId: string, studentId: string) {
    const essay = await this.repository.getUserEssayById(userEssayId);

    if (!essay) throw new NotFoundException("User essay not found");
    if (essay.studentId !== studentId)
      throw new ForbiddenException("You do not have permission to access this essay");

    return {
      id: essay.id,
      theme: essay.theme,
      text: essay.text || undefined,
      duration: essay.duration || undefined,
      date: essay.date,
      finished: essay.finished,
      createdAt: essay.createdAt,
      updatedAt: essay.updatedAt,
    };
  }

  async update(userEssayId: string, data: UpdateUserEssayDto, studentId: string) {
    const essay = await this.repository.getUserEssayById(userEssayId);

    if (!essay) throw new NotFoundException("User essay not found");
    if (essay.studentId !== studentId)
      throw new ForbiddenException("You do not have permission to update this essay");

    try {
      await this.repository.updateUserEssay(userEssayId, data);
      return { message: "User essay updated successfully" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error updating user essay");
    }
  }

  async delete(userEssayId: string, studentId: string) {
    const essay = await this.repository.getUserEssayById(userEssayId);

    if (!essay) throw new NotFoundException("User essay not found");
    if (essay.studentId !== studentId)
      throw new ForbiddenException("You do not have permission to delete this essay");

    try {
      await this.repository.deleteUserEssay(userEssayId);
      return { message: "User essay deleted successfully" };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Error deleting user essay");
    }
  }

  async correct() {

  }

  async listenCorrection() {

  }

  async deleteCorrection() {

  }

  async retryCorrection() {

  }
}

