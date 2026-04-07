import { Body, Controller, Get, Put, Session, Sse, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { NullResponseDto } from '@common/dto/nullResponseDto';

@ApiTags('Notification')
@Controller('notification')
@UsePipes(ZodValidationPipe)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gets all notifications of a user' })
  @ZodResponse({
    status: 200,
    description: 'notifications retrieved successfully',
    type: [NotificationResponseDto],
  })
  getAll(@Session() session: UserSession) {
    return this.service.getAll(session.user.id);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marks user notifications as read' })
  @ApiBody({ type: ChangeStatusDto })
  @ZodResponse({
    status: 200,
    description: 'notifications marked as read',
    type: NullResponseDto,
  })
  changeStatus(@Body() dto: ChangeStatusDto, @Session() session: UserSession) {
    return this.service.changeStatus(session.user.id, dto);
  }

  @Sse('listen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listens for new notifications via SSE' })
  listen(@Session() session: UserSession): Observable<MessageEvent> {
    return this.service.listen(session.user.id);
  }
}
