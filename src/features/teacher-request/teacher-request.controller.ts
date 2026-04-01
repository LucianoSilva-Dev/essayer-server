import { Body, Controller, Get, Param, Put, Session, UsePipes } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, UserSession } from "@thallesp/nestjs-better-auth";
import { ZodResponse, ZodValidationPipe } from "nestjs-zod";
import { TeacherRequestService } from "./teacher-request.service";
import { TeacherRequestResponseDto } from "./dto/teacher-request-response.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { GenericSuccessResponseDto } from "@common/dto/genericResponseDto";

@ApiTags('TeacherRequest')
@Controller("teacher-request")
@UsePipes(ZodValidationPipe)
export class TeacherRequestController {
  constructor(private readonly service: TeacherRequestService) { }

  @Get()
  @Roles(["admin"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieves all professor registration requests" })
  @ZodResponse({
    status: 200,
    description: "requests retrieved successfully",
    type: [TeacherRequestResponseDto],
  })
  getAll() {
    return this.service.getAll();
  }

  @Get(":id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Retrieves selected professor registration request",
  })
  @ZodResponse({
    status: 200,
    description: "request retrieved successfully",
    type: TeacherRequestResponseDto,
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put(":id/status")
  @Roles(["admin"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates the status of the selected request" })
  @ApiBody({ type: UpdateStatusDto })
  @ZodResponse({
    status: 200,
    description: "status updated successfully",
    type: GenericSuccessResponseDto,
  })
  updateStatus(@Body() data: UpdateStatusDto, @Param('id') id: string, @Session() session: UserSession) {
    return this.service.updateStatus(id, session.user.id, data.status, data.reason);
  }
}
