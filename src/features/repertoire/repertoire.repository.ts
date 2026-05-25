import { PrismaService } from '@core/prisma';
import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FixCommentDto } from './dto/fix-comment.dto';

@Injectable()
export class RepertoireRepository {
  constructor(private readonly prisma: PrismaService) {}

  getAll(where: any, orderBy: any, skip: number, take: number, userId?: string) {
    return this.prisma.repertoire.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        comments: {
          orderBy: { fixed: 'desc' },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: userId
          ? {
              where: { id: userId },
              select: { id: true },
            }
          : false,
        favourites: userId
          ? {
              where: { id: userId },
              select: { id: true },
            }
          : false,
        article: {
          select: { id: true, title: true, abstract: true, source: true },
        },
        citation: {
          select: { id: true, quote: true, source: true },
        },
        work: {
          select: { id: true, title: true, synopsis: true, type: true },
        },
      },
    });
  }

  getByIds(ids: string[], userId?: string) {
    return this.prisma.repertoire.findMany({
      where: { id: { in: ids } },
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        comments: {
          orderBy: { fixed: 'desc' },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: userId
          ? {
              where: { id: userId },
              select: { id: true },
            }
          : false,
        favourites: userId
          ? {
              where: { id: userId },
              select: { id: true },
            }
          : false,
        article: {
          select: { id: true, title: true, abstract: true, source: true },
        },
        citation: {
          select: { id: true, quote: true, source: true },
        },
        work: {
          select: { id: true, title: true, synopsis: true, type: true },
        },
      },
    });
  }

  count(where: any) {
    return this.prisma.repertoire.count({ where });
  }

  createLike(id: string, repertoire: string) {
    return this.prisma.repertoire.update({
      where: { id: repertoire },
      data: { likes: { connect: [{ id }] } },
    });
  }

  removeLike(id: string, repertoire: string) {
    return this.prisma.repertoire.update({
      where: { id: repertoire },
      data: { likes: { disconnect: [{ id }] } },
    });
  }

  createFavourite(id: string, repertoire: string) {
    return this.prisma.repertoire.update({
      where: { id: repertoire },
      data: { favourites: { connect: [{ id }] } },
    });
  }

  removeFavourite(id: string, repertoire: string) {
    return this.prisma.repertoire.update({
      where: { id: repertoire },
      data: { favourites: { disconnect: [{ id }] } },
    });
  }

  async createComment(id: string, data: CreateCommentDto, userId: string) {
    const comment = await this.prisma.comment.create({
      data: { text: data.text, fixed: data.fix, repertoireId: id, userId },
    });

    return this.prisma.repertoire.update({
      where: { id },
      data: { comments: { connect: [{ id: comment.id }] } },
    });
  }

  updateComment(id: string, data: CreateCommentDto, userId: string) {
    return this.prisma.comment.update({ where: { id, userId }, data });
  }

  deleteComment(id: string, userId: string, searchId: boolean) {
    const where = searchId ? { id, userId } : { id };

    return this.prisma.comment.delete({ where });
  }

  findOne(id: string) {
    return this.prisma.repertoire.findUnique({ where: { id } });
  }

  fixComment(id: string, data: FixCommentDto) {
    return this.prisma.comment.update({ where: { id }, data: { fixed: data.fix } });
  }

  async deleteRepertoire(id: string, userId: string, searchId: boolean) {
    const where: any = searchId ? { id, creatorId: userId } : { id };

    // Deleta os filhos para evitar falha de Foreign Key Constraint (caso o Prisma não esteja com Cascade ativo)
    await this.prisma.citation.deleteMany({ where: { repertoireId: id } });
    await this.prisma.work.deleteMany({ where: { repertoireId: id } });
    await this.prisma.article.deleteMany({ where: { repertoireId: id } });
    await this.prisma.comment.deleteMany({ where: { repertoireId: id } });

    return this.prisma.repertoire.delete({ where });
  }
}
