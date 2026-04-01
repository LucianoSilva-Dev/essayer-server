import { Controller, Get, Put, UsePipes } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";
import { NotificationService } from "./notification.service";

@ApiTags('Notification')
@Controller("notification")
@UsePipes(ZodValidationPipe)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gets all notifications of a user" })
  getAll() {
    return this.service.getAll();
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Marks user notifications as read" })
  changeStatus() {
    return this.service.changeStatus();
  }

  @Get("listen")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Listens for new notifications" })
  listen() {
    return this.service.listen();
  }
}
