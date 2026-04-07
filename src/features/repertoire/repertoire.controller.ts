import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Session,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OptionalAuth, Roles, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { RepertoireService } from './repertoire.service';
import { GetAllRepertoireQueryDto } from './dto/get-all-repertoire-query.dto';
import { GetAllRepertoireResponseDto } from './dto/repertoire-response.dto';
import { GetRepertoireByIdsQueryDto } from './dto/get-repertoire-by-ids-query.dto';
import { GenericSuccessResponseDto } from '@common/dto/genericResponseDto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FixCommentDto } from './dto/fix-comment.dto';

@ApiTags('Repertoire')
@Controller('repertoire')
@UsePipes(ZodValidationPipe)
export class RepertoireController {
  constructor(private readonly service: RepertoireService) {}

  @Get()
  @OptionalAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves all repertoires' })
  @ApiQuery({ type: GetAllRepertoireQueryDto })
  @ZodResponse({
    status: 200,
    description: 'repertoires retrieved successfully',
    type: GetAllRepertoireResponseDto,
  })
  getAll(
    @Query() query: GetAllRepertoireQueryDto,
    @Session() session: UserSession,
    @Req() request: Request,
  ) {
    const userId = session?.user?.id;
    return this.service.getAll(query, userId, request.originalUrl);
  }

  @Get('bulk-search')
  @OptionalAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Searches repertoires by a list of IDs' })
  @ApiQuery({ type: GetRepertoireByIdsQueryDto })
  getByIds(@Query() query: GetRepertoireByIdsQueryDto, @Session() session: UserSession) {
    const userId = session?.user?.id;
    return this.service.getByIds(query.ids, userId);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a like on the selected repertoire' })
  @ZodResponse({
    status: 201,
    description: 'like added successfully',
    type: GenericSuccessResponseDto,
  })
  createLike(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.createLike(id, session.user.id);
  }

  @Delete(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Removes a like from the selected repertoire' })
  @ZodResponse({
    status: 200,
    description: 'like removed successfully',
    type: GenericSuccessResponseDto,
  })
  deleteLike(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.deleteLike(id, session.user.id);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adds a repertoire to the favourites list' })
  @ZodResponse({
    status: 201,
    description: 'favourited successfully',
    type: GenericSuccessResponseDto,
  })
  createFavorite(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.createFavorite(id, session.user.id);
  }

  @Delete(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Removes a repertoire from the favourites list' })
  @ZodResponse({
    status: 200,
    description: 'favourite removed successfully',
    type: GenericSuccessResponseDto,
  })
  deleteFavorite(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.deleteFavorite(id, session.user.id);
  }

  @Delete(':id')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes selected repertoire' })
  @ZodResponse({
    status: 200,
    description: 'repertoire deleted successfully',
    type: GenericSuccessResponseDto,
  })
  delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.delete(id, session.user.id, session.user.role);
  }

  @Post(':id/comment')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a comment on the selected repertoire' })
  @ApiBody({ type: CreateCommentDto })
  @ZodResponse({
    status: 201,
    description: 'comment created successfully',
    type: GenericSuccessResponseDto,
  })
  createComment(
    @Param('id') id: string,
    @Body() data: CreateCommentDto,
    @Session() session: UserSession,
  ) {
    return this.service.createComment(id, data, session.user.id);
  }

  @Put('comment/:id')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates a comment of the selected repertoire' })
  @ApiBody({ type: UpdateCommentDto })
  @ZodResponse({
    status: 200,
    description: 'comment updated successfully',
    type: GenericSuccessResponseDto,
  })
  updateComment(
    @Param('id') id: string,
    @Body() data: UpdateCommentDto,
    @Session() session: UserSession,
  ) {
    return this.service.updateComment(id, data, session.user.id);
  }

  @Delete('comment/:id')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Removes a comment from the selected repertoire' })
  @ZodResponse({
    status: 200,
    description: 'comment deleted successfully',
    type: GenericSuccessResponseDto,
  })
  deleteComment(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.deleteComment(id, session.user.id, session.user.role);
  }

  @Put(':id/comment/:commentId/fix')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pin or unpin a comment (only repertoire creator or admin)',
  })
  @ApiBody({ type: FixCommentDto })
  @ZodResponse({
    status: 200,
    description: 'comment fixed successfully',
    type: GenericSuccessResponseDto,
  })
  fixComment(
    @Param('id') repertoireId: string,
    @Param('commentId') commentId: string,
    @Body() data: FixCommentDto,
    @Session() session: UserSession,
  ) {
    return this.service.fixComment(repertoireId, commentId, data, session.user.id);
  }
}
