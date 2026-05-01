import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';

@Injectable()
export class WorkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateWorkDto) {
    const { topics, subtopics, author, synopsis, workType: type, title } = data;

    const repertoire = await this.prisma.repertoire.create({
      data: { topics, subtopics, author, creatorId: creator, type: 'WORK' },
    });

    await this.prisma.work.create({
      data: { title, synopsis, type, repertoireId: repertoire.id },
    });

    return { id: repertoire.id };
  }

  update(id: string, data: UpdateWorkDto) {
    return this.prisma.work.update({ where: { repertoireId: id }, data });
  }

  get(id: string, userId?: string) {
    return this.prisma.work.findUnique({
      where: { repertoireId: id },
      select: {
        id: true,
        title: true,
        synopsis: true,
        type: true,
        repertoire: {
          select: {
            id: true,
            author: true,
            topics: true,
            subtopics: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: {
              where: { id: userId },
              select: { id: true },
            },
            favourites: {
              where: { id: userId },
              select: { id: true },
            },
            comments: {
              orderBy: {
                fixed: 'desc',
              },
              select: {
                id: true,
                text: true,
                fixed: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
