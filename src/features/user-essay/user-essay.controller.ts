import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles, UserSession } from "@thallesp/nestjs-better-auth";
import { ZodResponse, ZodValidationPipe } from "nestjs-zod";
import { UserEssayService } from "./user-essay.service";
import { CreateUserEssayDto } from "./dto/create-user-essay.dto";
import { GetAllUserEssayQueryDto } from "./dto/get-all-user-essay-query.dto";
import { GetUserEssayResponseDto } from "./dto/get-user-essay-response.dto";
import { UpdateUserEssayDto } from "./dto/update-user-essay.dto";
import { GenericSuccessResponseDto } from "@common/dto/genericResponseDto";
import { IdOnlyResponseDto } from "@common/dto/idOnlyResponseDto";

@ApiTags("UserEssay")
@Controller("user-essay")
@UsePipes(ZodValidationPipe)
export class UserEssayController {
  constructor(private readonly service: UserEssayService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Creates a user essay draft." })
  @ApiBody({ type: CreateUserEssayDto })
  @ZodResponse({
    status: 201,
    description: "user essay created successfully",
    type: IdOnlyResponseDto,
  })
  create(
    @Body() data: CreateUserEssayDto,
    @Session() session: UserSession
  ) {
    return this.service.create(data, session.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieves all user essays for the authenticated student." })
  @ApiQuery({ type: GetAllUserEssayQueryDto })
  @ZodResponse({
    status: 200,
    description: "user essays retrieved successfully",
    type: [GetUserEssayResponseDto],
  })
  getAll(
    @Session() session: UserSession,
    @Query() query: GetAllUserEssayQueryDto
  ) {
    return this.service.getAll(session.user.id, query.theme);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieves a specific user essay." })
  @ZodResponse({
    status: 200,
    description: "user essay retrieved successfully",
    type: GetUserEssayResponseDto,
  })
  get(@Param("id") userEssayId: string, @Session() session: UserSession) {
    return this.service.get(userEssayId, session.user.id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates a user essay." })
  @ApiBody({ type: UpdateUserEssayDto })
  @ZodResponse({
    status: 200,
    description: "user essay updated successfully",
    type: GenericSuccessResponseDto,
  })
  update(
    @Param("id") userEssayId: string,
    @Body() data: UpdateUserEssayDto,
    @Session() session: UserSession
  ) {
    return this.service.update(userEssayId, data, session.user.id);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deletes a user essay." })
  @ZodResponse({
    status: 200,
    description: "user essay deleted successfully",
    type: GenericSuccessResponseDto,
  })
  delete(@Param("id") userEssayId: string, @Session() session: UserSession) {
    return this.service.delete(userEssayId, session.user.id);
  }

  // ============== IGNORE ==============
  @Post(":id/correct")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submits the specified essay for AI correction." })
  correct() {
    return this.service.correct();
  }

  @Get(":id/correction/listen")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Listens for a correction event of the specified essay.",
  })
  listenCorrection() {
    return this.service.listenCorrection();
  }

  @Delete(":id/correction/:correctionId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deletes an AI correction of a free essay." })
  deleteCorrection() {
    return this.service.deleteCorrection();
  }

  @Post(":id/correction/:correctionId/retry")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retries a failed essay correction." })
  retryCorrection() {
    return this.service.retryCorrection();
  }
}

