import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(creator: string, data: CreateArticleDto) {
    const { topics, subtopics, author, abstract, source, title } = data;

    const repertoire = await this.prisma.repertoire.create({
      data: { topics, subtopics, author, creatorId: creator, type: 'ARTICLE' },
    });

    await this.prisma.article.create({
      data: { title, abstract, source, repertoireId: repertoire.id },
    });

    return { id: repertoire.id };
  }

  update(id: string, data: UpdateArticleDto) {
    return this.prisma.article.update({ where: { repertoireId: id }, data });
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
