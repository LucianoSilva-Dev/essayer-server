import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateCitationDto } from './dto/create-citation.dto';
import { UpdateCitationDto } from './dto/update-citation.dto';

@Injectable()
export class CitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateCitationDto) {
    const { topics, subtopics, author, quote, source } = data;

    return this.prisma.$transaction(async (tx) => {
      const repertoire = await tx.repertoire.create({
        data: { topics, subtopics, author, creatorId: creator, type: 'CITATION' },
      });

      await tx.citation.create({ data: { quote, source, repertoireId: repertoire.id } });

      return { id: repertoire.id };
    });
  }

  async update(id: string, data: UpdateCitationDto) {
    const { topics, subtopics, author, quote, source } = data;

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

      const citationData: any = {};
      if (quote !== undefined) citationData.quote = quote;
      if (source !== undefined) citationData.source = source;

      if (Object.keys(citationData).length > 0) {
        await tx.citation.update({
          where: { repertoireId: id },
          data: citationData,
        });
      }
    });
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
