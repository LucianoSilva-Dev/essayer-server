import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CitationRepository } from './citation.repository';
import { CreateCitationDto } from './dto/create-citation.dto';
import { UpdateCitationDto } from './dto/update-citation.dto';
import { CitationResponseDto } from './dto/citation-response.dto';

@Injectable()
export class CitationService {
  constructor(private readonly repository: CitationRepository) {}

  async create(id: string, data: CreateCitationDto) {
    const citation = await this.repository.create(id, data);
    return { id: citation.id };
  }

  async update(id: string, data: UpdateCitationDto) {
    try {
      await this.repository.update(id, data);
      return { message: 'citation updated successfully' };
    } catch (err: any) {
      if (err?.code === 'P2025') throw new NotFoundException('citation not found');
      console.log(err);
      throw new InternalServerErrorException('Error updating citation');
    }
  }

  async get(id: string, userId?: string) {
    const citation = await this.repository.get(id, userId);

    if (!citation) throw new NotFoundException('citation not found');

    const formattedCitation: CitationResponseDto = {
      id: citation.repertoire.id,
      quote: citation.quote,
      author: citation.repertoire.author,
      source: citation.source,
      creator: citation.repertoire.creator,
      totalLikes: citation.repertoire._count.likes,
      comments: citation.repertoire.comments.map((c: any) => ({
        id: c.id,
        text: c.text,
        fixed: c.fixed,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: c.user,
      })),
      totalComments: citation.repertoire._count.comments,
      subtopics: citation.repertoire.subtopics,
      topics: citation.repertoire.topics,
      favourited: citation.repertoire.favourites.length > 0,
      liked: citation.repertoire.likes.length > 0,
    };

    return formattedCitation;
  }
}
