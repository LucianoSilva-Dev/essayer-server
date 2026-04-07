import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Session,
  Sse,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { UserEssayService } from './user-essay.service';
import { CreateUserEssayDto } from './dto/create-user-essay.dto';
import { GetAllUserEssayQueryDto } from './dto/get-all-user-essay-query.dto';
import { GetUserEssayResponseDto } from './dto/get-user-essay-response.dto';
import { UpdateUserEssayDto } from './dto/update-user-essay.dto';
import { CorrectEssayDto } from './dto/correct-essay.dto';
import { GenericSuccessResponseDto } from '@common/dto/genericResponseDto';
import { IdOnlyResponseDto } from '@common/dto/idOnlyResponseDto';

@ApiTags('UserEssay')
@Controller('user-essay')
@UsePipes(ZodValidationPipe)
export class UserEssayController {
  constructor(private readonly service: UserEssayService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a user essay draft.' })
  @ApiBody({ type: CreateUserEssayDto })
  @ZodResponse({
    status: 201,
    description: 'user essay created successfully',
    type: IdOnlyResponseDto,
  })
  create(@Body() data: CreateUserEssayDto, @Session() session: UserSession) {
    return this.service.create(data, session.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves all user essays for the authenticated student.' })
  @ApiQuery({ type: GetAllUserEssayQueryDto })
  @ZodResponse({
    status: 200,
    description: 'user essays retrieved successfully',
    type: [GetUserEssayResponseDto],
  })
  getAll(@Session() session: UserSession, @Query() query: GetAllUserEssayQueryDto) {
    return this.service.getAll(session.user.id, query.theme);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves a specific user essay with its corrections.' })
  @ZodResponse({
    status: 200,
    description: 'user essay retrieved successfully',
    type: GetUserEssayResponseDto,
  })
  get(@Param('id') userEssayId: string, @Session() session: UserSession) {
    return this.service.get(userEssayId, session.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates a user essay.' })
  @ApiBody({ type: UpdateUserEssayDto })
  @ZodResponse({
    status: 200,
    description: 'user essay updated successfully',
    type: GenericSuccessResponseDto,
  })
  update(
    @Param('id') userEssayId: string,
    @Body() data: UpdateUserEssayDto,
    @Session() session: UserSession,
  ) {
    return this.service.update(userEssayId, data, session.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes a user essay.' })
  @ZodResponse({
    status: 200,
    description: 'user essay deleted successfully',
    type: GenericSuccessResponseDto,
  })
  delete(@Param('id') userEssayId: string, @Session() session: UserSession) {
    return this.service.delete(userEssayId, session.user.id);
  }

  @Post(':id/correct')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Submits the specified essay for AI correction.' })
  @ApiBody({ type: CorrectEssayDto })
  correct(
    @Param('id') essayId: string,
    @Body() dto: CorrectEssayDto,
    @Session() session: UserSession,
  ) {
    return this.service.correct(essayId, dto, session.user.id);
  }

  @Sse(':id/correction/listen')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listens for a correction event of the specified essay via SSE.',
  })
  listenCorrection(
    @Param('id') essayId: string,
    @Session() session: UserSession,
  ): Observable<MessageEvent> {
    return this.service.listenCorrection(essayId, session.user.id);
  }

  @Delete(':id/correction/:correctionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes an AI correction of a free essay.' })
  @ZodResponse({
    status: 200,
    description: 'correction deleted successfully',
    type: GenericSuccessResponseDto,
  })
  deleteCorrection(
    @Param('id') essayId: string,
    @Param('correctionId') correctionId: string,
    @Session() session: UserSession,
  ) {
    return this.service.deleteCorrection(essayId, correctionId, session.user.id);
  }

  @Post(':id/correction/:correctionId/retry')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Retries a failed essay correction.' })
  @ZodResponse({
    status: 200,
    description: 'correction retry initiated',
    type: GenericSuccessResponseDto,
  })
  retryCorrection(
    @Param('id') essayId: string,
    @Param('correctionId') correctionId: string,
    @Session() session: UserSession,
  ) {
    return this.service.retryCorrection(essayId, correctionId, session.user.id);
  }
}
