import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RepertoireRepository } from './repertoire.repository';
import { GetAllRepertoireQueryDto } from './dto/get-all-repertoire-query.dto';
import { WorkType } from '@core/prisma';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FixCommentDto } from './dto/fix-comment.dto';

type RepertoireBase = {
  id: string;
  author: string;
  creator: { id: string; name: string; image?: string | null };
  totalLikes: number;
  comments: Array<{
    id: string;
    text: string;
    fixed: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; name: string; image?: string | null };
  }>;
  totalComments: number;
  subtopics: string[];
  topics: string[];
  favourited: boolean;
  liked: boolean;
};

type RepertoireWork = RepertoireBase & {
  workType: WorkType;
  title: string;
  synopsis: string;
  repertoireType: 'WORK';
};

type RepertoireArticle = RepertoireBase & {
  title: string;
  abstract: string;
  source: string | null;
  repertoireType: 'ARTICLE';
};

type RepertoireCitation = RepertoireBase & {
  quote: string;
  source: string | null;
  repertoireType: 'CITATION';
};

export type RepertoireOutput = RepertoireWork | RepertoireArticle | RepertoireCitation;

@Injectable()
export class RepertoireService {
  constructor(private readonly repository: RepertoireRepository) {}

  private makeSort(query: GetAllRepertoireQueryDto) {
    switch (query.orderBy) {
      case 'MaxLikes':
        return { _count: { likes: 'desc' } };
      case 'MinLikes':
        return { _count: { likes: 'asc' } };
      case 'Newest':
        return { createdAt: 'desc' };
      case 'Oldest':
        return { createdAt: 'asc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private makeFilter(query: GetAllRepertoireQueryDto, userId?: string) {
    if (!userId && (query.favourited || query.liked))
      throw new UnauthorizedException('User must be logged in');

    const where: any = {};

    if (query.reperoireType) {
      where.type = Array.isArray(query.reperoireType)
        ? { in: query.reperoireType }
        : query.reperoireType;
    }

    if (query.content) {
      where.OR = [
        { author: { contains: query.content, mode: 'insensitive' } },
        { article: { title: { contains: query.content, mode: 'insensitive' } } },
        { article: { abstract: { contains: query.content, mode: 'insensitive' } } },
        { article: { source: { contains: query.content, mode: 'insensitive' } } },
        { citation: { quote: { contains: query.content, mode: 'insensitive' } } },
        { citation: { source: { contains: query.content, mode: 'insensitive' } } },
        { work: { title: { contains: query.content, mode: 'insensitive' } } },
        { work: { synopsis: { contains: query.content, mode: 'insensitive' } } },
      ];
    }

    if (query.subtopics) {
      const subtopics = Array.isArray(query.subtopics) ? query.subtopics : [query.subtopics];
      where.subtopics = { hasSome: subtopics };
    }

    if (query.topics) {
      const topics = Array.isArray(query.topics) ? query.topics : [query.topics];
      where.topics = { hasSome: topics };
    }

    if (query.creator) {
      where.creatorId = query.creator;
    }

    if (typeof query.favourited === 'boolean' && userId) {
      where.favourites = query.favourited ? { some: { id: userId } } : { none: { id: userId } };
    }

    if (typeof query.liked === 'boolean' && userId) {
      where.likes = query.liked ? { some: { id: userId } } : { none: { id: userId } };
    }

    return where;
  }

  private makePagination(
    query: GetAllRepertoireQueryDto,
    totalDocuments: number,
    requestUrl: string,
  ) {
    const nextOffset = Math.min(query.offset + query.limit, totalDocuments);
    const prevOffset = Math.max(query.offset - query.limit, 0);

    let cleanUrl = requestUrl.replace(/([?&])(offset|limit)=\d+/g, '');
    cleanUrl = cleanUrl.replace(/[?&]$/, '');

    const separator = cleanUrl.includes('?') ? '&' : '?';

    const nextPageUrl =
      nextOffset >= totalDocuments
        ? null
        : `${cleanUrl}${separator}offset=${nextOffset}&limit=${query.limit}`;

    const previousPageUrl =
      query.offset === 0
        ? null
        : `${cleanUrl}${separator}offset=${prevOffset}&limit=${query.limit}`;

    return {
      offset: query.offset,
      limit: query.limit,
      nextPageUrl,
      previousPageUrl,
      totalDocuments,
    };
  }

  private mapRepertoire(repertoire: any): RepertoireOutput {
    const base = {
      id: repertoire.id,
      author: repertoire.author,
      creator: repertoire.creator,
      totalLikes: repertoire._count?.likes ?? 0,
      comments: (repertoire.comments ?? []).map((c: any) => ({
        id: c.id,
        text: c.text,
        fixed: c.fixed,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user,
      })),
      totalComments: repertoire._count?.comments ?? 0,
      subtopics: repertoire.subtopics,
      topics: repertoire.topics,
      favourited: !!(repertoire.favourites && repertoire.favourites.length > 0),
      liked: !!(repertoire.likes && repertoire.likes.length > 0),
    };

    if (repertoire.type === 'WORK') {
      return {
        ...base,
        workType: repertoire.work?.type ?? 'WORK',
        title: repertoire.work?.title ?? '',
        synopsis: repertoire.work?.synopsis ?? '',
        repertoireType: 'WORK',
      };
    }

    if (repertoire.type === 'ARTICLE') {
      return {
        ...base,
        title: repertoire.article?.title ?? '',
        abstract: repertoire.article?.abstract ?? '',
        source: repertoire.article?.source ?? null,
        repertoireType: 'ARTICLE',
      };
    }

    if (repertoire.type === 'CITATION') {
      return {
        ...base,
        quote: repertoire.citation?.quote ?? '',
        source: repertoire.citation?.source ?? null,
        repertoireType: 'CITATION',
      };
    }

    throw new BadRequestException(`Unknown repertoire type: ${repertoire.type}`);
  }

  async getAll(query: GetAllRepertoireQueryDto, userId?: string, requestUrl = '/repertoire') {
    if (!userId && (query.favourited || query.liked)) {
      throw new UnauthorizedException('User must be logged in');
    }

    const where = this.makeFilter(query, userId);
    const orderBy = this.makeSort(query);

    const [repertoires, totalDocuments] = await Promise.all([
      this.repository.getAll(where, orderBy, query.offset, query.limit, userId),
      this.repository.count(where),
    ]);

    const formatted = repertoires.map((item) => this.mapRepertoire(item));

    return {
      documents: formatted,
      pagination: this.makePagination(query, totalDocuments, requestUrl),
    };
  }

  async getByIds(ids: string[], userId?: string) {
    const repertoires = await this.repository.getByIds(ids, userId);

    const repertoireMap = new Map(repertoires.map((r) => [r.id, r]));

    const orderedRepertoires = ids.map((id) => repertoireMap.get(id) || null);

    return orderedRepertoires.map((r) => (r ? this.mapRepertoire(r) : null));
  }

  async delete(id: string, userId: string, userRole?: string | string[]) {
    let searchId = true;

    if (userRole === 'admin' || userRole?.includes('admin')) searchId = false;

    try {
      await this.repository.deleteRepertoire(id, userId, searchId);

      return { message: 'repertoire deleted successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error deleting repertoire');
    }
  }

  async createComment(id: string, data: CreateCommentDto, userId: string) {
    try {
      await this.repository.createComment(id, data, userId);

      return { message: 'comment created successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error creating comment');
    }
  }

  async updateComment(id: string, data: CreateCommentDto, userId: string) {
    try {
      await this.repository.updateComment(id, data, userId);

      return { message: 'comment updated successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error updating comment');
    }
  }

  async deleteComment(id: string, userId: string, userRole?: string | string[]) {
    let searchId = true;

    if (userRole === 'admin' || userRole?.includes('admin')) searchId = false;

    try {
      await this.repository.deleteComment(id, userId, searchId);

      return { message: 'comment deleted successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error deleting comment');
    }
  }

  async fixComment(repertoireId: string, commentId: string, data: FixCommentDto, userId: string) {
    const repertoire = await this.repository.findOne(repertoireId);

    if (!repertoire) throw new NotFoundException('repertoire not found');

    if (repertoire.creatorId !== userId) throw new ForbiddenException('cannot pin this comment');

    try {
      await this.repository.fixComment(commentId, data);

      return { message: 'comment fixed successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error fixing comment');
    }
  }

  async createLike(repertoireId: string, userId: string) {
    try {
      await this.repository.createLike(userId, repertoireId);

      return { message: 'like added successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error adding like');
    }
  }

  async deleteLike(repertoireId: string, userId: string) {
    try {
      await this.repository.removeLike(userId, repertoireId);

      return { message: 'like removed successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error removing like');
    }
  }

  async createFavorite(repertoireId: string, userId: string) {
    try {
      await this.repository.createFavourite(userId, repertoireId);

      return { message: 'favourited successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error favouriting');
    }
  }

  async deleteFavorite(repertoireId: string, userId: string) {
    try {
      await this.repository.removeFavourite(userId, repertoireId);

      return { message: 'favourite removed successfully' };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error removing favourite');
    }
  }
}
