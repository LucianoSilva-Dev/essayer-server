import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WorkRepository } from './work.repository';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkResponseDto } from './dto/work-response.dto';

@Injectable()
export class WorkService {
  constructor(private readonly repository: WorkRepository) {}

  async create(id: string, data: CreateWorkDto) {
    const work = await this.repository.create(id, data);
    return { id: work.id };
  }

  async update(id: string, data: UpdateWorkDto) {
    try {
      await this.repository.update(id, data);
      return { message: 'work updated successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating work');
    }
  }

  async get(id: string, userId?: string) {
    const work = await this.repository.get(id, userId);

    if (!work) throw new NotFoundException('work not found');

    const formattedWork: WorkResponseDto = {
      id: work.id,
      title: work.title,
      synopsis: work.synopsis,
      author: work.repertoire.author,
      creator: work.repertoire.creator,
      totalLikes: work.repertoire._count.likes,
      comments: work.repertoire.comments.map((c) => c.user),
      totalComments: work.repertoire._count.comments,
      subtopics: work.repertoire.subtopics,
      topics: work.repertoire.topics,
      workType: work.type,
      favourited: work.repertoire.favourites.length > 0,
      liked: work.repertoire.likes.length > 0,
    };

    return formattedWork;
  }
}
