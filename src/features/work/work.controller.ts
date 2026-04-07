import { Body, Controller, Get, Param, Patch, Post, Put, Session, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OptionalAuth, Roles, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { IdOnlyResponseDto } from '@common/dto/idOnlyResponseDto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { GenericSuccessResponseDto } from '@common/dto/genericResponseDto';
import { WorkResponseDto } from './dto/work-response.dto';

@ApiTags('Work')
@Controller('work')
@UsePipes(ZodValidationPipe)
export class WorkController {
  constructor(private readonly service: WorkService) {}

  @Get(':id')
  @OptionalAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves selected work' })
  @ZodResponse({
    status: 201,
    description: 'work retrieved successfully',
    type: WorkResponseDto,
  })
  get(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.get(id, session.user.id);
  }

  @Post()
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates new work' })
  @ApiBody({ type: CreateWorkDto })
  @ZodResponse({
    status: 201,
    description: 'work created successfully',
    type: IdOnlyResponseDto,
  })
  create(@Body() data: CreateWorkDto, @Session() session: UserSession) {
    return this.service.create(session.user.id, data);
  }

  @Patch(':id')
  @Roles(['admin', 'teacher'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates work data' })
  @ApiBody({ type: UpdateWorkDto })
  @ZodResponse({
    status: 200,
    description: 'work updated successfully',
    type: GenericSuccessResponseDto,
  })
  update(@Param('id') id: string, @Body() data: UpdateWorkDto) {
    return this.service.update(id, data);
  }
}
