import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';

@Injectable()
export class WorkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateWorkDto) {
    const { topics, subtopics, author, synopsis, workType: type, title } = data;

    return this.prisma.$transaction(async (tx) => {
      const repertoire = await tx.repertoire.create({
        data: { topics, subtopics, author, creatorId: creator, type: 'WORK' },
      });

      await tx.work.create({
        data: { title, synopsis, type, repertoireId: repertoire.id },
      });

      return { id: repertoire.id };
    });
  }

  async update(id: string, data: UpdateWorkDto) {
    const { topics, subtopics, author, synopsis, workType, title } = data;

    return this.prisma.$transaction(async (tx) => {
      if (topics !== undefined || subtopics !== undefined || author !== undefined) {
        const repertoireData: any = {};
        if (topics !== undefined) repertoireData.topics = topics;
        if (subtopics !== undefined) repertoireData.subtopics = subtopics;
        if (author !== undefined) repertoireData.author = author;

        await tx.repertoire.update({
          where: { id },
          data: repertoireData,
        });
      }

      const workData: any = {};
      if (title !== undefined) workData.title = title;
      if (synopsis !== undefined) workData.synopsis = synopsis;
      if (workType !== undefined) workData.type = workType;

      if (Object.keys(workData).length > 0) {
        await tx.work.update({
          where: { repertoireId: id },
          data: workData,
        });
      }
    });
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
