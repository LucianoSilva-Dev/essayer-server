import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateArticleDto) {
    const { topics, subtopics, author, abstract, source, title } = data;

    return this.prisma.$transaction(async (tx) => {
      const repertoire = await tx.repertoire.create({
        data: { topics, subtopics, author, creatorId: creator, type: 'ARTICLE' },
      });

      await tx.article.create({
        data: { title, abstract, source, repertoireId: repertoire.id },
      });

      return { id: repertoire.id };
    });
  }

  async update(id: string, data: UpdateArticleDto) {
    const { topics, subtopics, author, abstract, source, title } = data;

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

      const articleData: any = {};
      if (title !== undefined) articleData.title = title;
      if (abstract !== undefined) articleData.abstract = abstract;
      if (source !== undefined) articleData.source = source;

      if (Object.keys(articleData).length > 0) {
        await tx.article.update({
          where: { repertoireId: id },
          data: articleData,
        });
      }
    });
  }

  get(id: string, userId?: string) {
    return this.prisma.article.findUnique({
      where: { repertoireId: id },
      select: {
        id: true,
        title: true,
        abstract: true,
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
