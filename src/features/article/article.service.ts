import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ArticleRepository } from './article.repository';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  async create(id: string, data: CreateArticleDto) {
    const article = await this.repository.create(id, data);
    return { id: article.id };
  }

  async update(id: string, data: UpdateArticleDto) {
    try {
      await this.repository.update(id, data);
      return { message: 'article updated successfully' };
    } catch (err: any) {
      if (err?.code === 'P2025') throw new NotFoundException('article not found');
      console.log(err);
      throw new InternalServerErrorException('Error updating article');
    }
  }

  async get(id: string, userId?: string) {
    const article = await this.repository.get(id, userId);

    if (!article) throw new NotFoundException('article not found');

    const formattedArticle: ArticleResponseDto = {
      id: article.repertoire.id,
      title: article.title,
      abstract: article.abstract,
      author: article.repertoire.author,
      creator: article.repertoire.creator,
      totalLikes: article.repertoire._count.likes,
      comments: article.repertoire.comments.map((c: any) => ({
        id: c.id,
        text: c.text,
        fixed: c.fixed,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user,
      })),
      totalComments: article.repertoire._count.comments,
      subtopics: article.repertoire.subtopics,
      topics: article.repertoire.topics,
      source: article.source,
      favourited: article.repertoire.favourites.length > 0,
      liked: article.repertoire.likes.length > 0,
    };

    return formattedArticle;
  }
}
