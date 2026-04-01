import { PrismaService } from "@core/prisma";
import { Injectable } from "@nestjs/common";
import { CreateWorkDto } from "./dto/create-work.dto";
import { UpdateWorkDto } from "./dto/update-work.dto";

@Injectable()
export class WorkRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(creator: string, data: CreateWorkDto) {
    const { topics, subtopics, author, synopsis, workType: type, title } = data

    const repertoire = await this.prisma.repertoire.create({ data: { topics, subtopics, author, creatorId: creator, type: 'WORK' } })

    return this.prisma.work.create({ data: { title, synopsis, type, repertoireId: repertoire.id } })
  }

  update(id: string, data: UpdateWorkDto) {
    return this.prisma.work.update({ where: { id }, data })
  }

  get(id: string, userId?: string) {
    return this.prisma.work.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        synopsis: true,
        type: true,
        repertoire: {
          select: {
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
                fixed: 'desc'
              },
              select: {
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