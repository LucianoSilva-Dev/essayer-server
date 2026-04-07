import { Body, Controller, Get, Param, Post, Put, Session, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OptionalAuth, Roles, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { ArticleService } from './article.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { IdOnlyResponseDto } from '@common/dto/idOnlyResponseDto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateWorkDto } from '@features/work/dto/update-work.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GenericSuccessResponseDto } from '@common/dto/genericResponseDto';

@ApiTags('Article')
@Controller('article')
@UsePipes(ZodValidationPipe)
export class ArticleController {
  constructor(private readonly service: ArticleService) {}

  @Get(':id')
  @OptionalAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves selected article' })
  @ZodResponse({
    status: 200,
    description: 'article retrieved successfully',
    type: ArticleResponseDto,
  })
  get(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.get(id, session.user.id);
  }

  @Post()
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates new article' })
  @ApiBody({ type: CreateArticleDto })
  @ZodResponse({
    status: 201,
    description: 'article created successfully',
    type: IdOnlyResponseDto,
  })
  create(@Body() data: CreateArticleDto, @Session() session: UserSession) {
    return this.service.create(session.user.id, data);
  }

  @Put(':id')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates article data' })
  @ApiBody({ type: UpdateWorkDto })
  @ZodResponse({
    status: 200,
    description: 'article updated successfully',
    type: GenericSuccessResponseDto,
  })
  update(@Param('id') id: string, @Body() data: UpdateArticleDto) {
    return this.service.update(id, data);
  }
}
