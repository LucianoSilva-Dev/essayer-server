import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateCitationDto } from './dto/create-citation.dto';
import { UpdateCitationDto } from './dto/update-citation.dto';

@Injectable()
export class CitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateCitationDto) {
    const { topics, subtopics, author, quote } = data;

    const repertoire = await this.prisma.repertoire.create({
      data: { topics, subtopics, author, creatorId: creator, type: 'CITATION' },
    });

    await this.prisma.citation.create({ data: { quote, repertoireId: repertoire.id } });

    return { id: repertoire.id };
  }

  update(id: string, data: UpdateCitationDto) {
    return this.prisma.citation.update({ where: { repertoireId: id }, data });
  }

  get(id: string, userId?: string) {
    return this.prisma.citation.findUnique({
      where: { repertoireId: id },
      select: {
        id: true,
        quote: true,
        source: true,
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
