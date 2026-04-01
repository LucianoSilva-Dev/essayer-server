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
  Session,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles, UserSession } from "@thallesp/nestjs-better-auth";
import { ZodResponse, ZodValidationPipe } from "nestjs-zod";
import { ActivityService } from "./activity.service";
import { CreateEssayActivityDto } from "./dto/create-essay-activity.dto";
import { UpdateEssayActivityDto } from "./dto/update-essay-activity.dto";
import { ProvideFeedbackDto } from "./dto/provide-feedback.dto";
import { SubmitEssayResponseDto } from "./dto/submit-essay-response.dto";
import { GetAllAnswersQueryDto } from "./dto/get-all-answers-query.dto";
import { GenericSuccessResponseDto } from "@common/dto/genericResponseDto";
import {
  EssayActivityResponseDto,
  RecentActivityResponseDto,
  StudentActivityResponseDto,
  PaginatedAnswersResponseDto,
  CorrectionResponseDto,
} from "./dto/activity-response.dto";

@ApiTags("Activity")
@Controller("activity")
@UsePipes(ZodValidationPipe)
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @Get("essay/:id")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Gets details of an essay activity.",
  })
  @ZodResponse({
    status: 200,
    description: "activity retrieved successfully",
    type: EssayActivityResponseDto,
  })
  get(@Param("id") activityId: string) {
    return this.service.get(activityId);
  }

  @Post("essay/:id/start")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Starts the response of an essay." })
  @ZodResponse({
    status: 200,
    description: "essay response started successfully",
    type: GenericSuccessResponseDto,
  })
  start(
    @Param("id") activityId: string,
    @Session() session: UserSession
  ) {
    return this.service.start(activityId, session.user.id);
  }

  @Post("essay/:id/send")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Sends the essay response." })
  @ApiBody({ type: SubmitEssayResponseDto })
  @ZodResponse({
    status: 200,
    description: "essay response submitted successfully",
    type: GenericSuccessResponseDto,
  })
  send(
    @Param("id") activityId: string,
    @Body() data: SubmitEssayResponseDto,
    @Session() session: UserSession
  ) {
    return this.service.send(activityId, session.user.id, data);
  }

  @Put("answers/:id/feedback/seen")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates the 'seen' status in an essay response" })
  @ZodResponse({
    status: 200,
    description: "feedback status updated successfully",
    type: GenericSuccessResponseDto,
  })
  updateFeedbackStatus(
    @Param("id") responseId: string,
    @Session() session: UserSession
  ) {
    return this.service.updateFeedbackStatus(
      responseId,
      session.user.id
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Returns all activities from all classes the user is a member of.",
  })
  @ZodResponse({
    status: 200,
    description: "activities retrieved successfully",
    type: [StudentActivityResponseDto],
  })
  getAll(@Session() session: UserSession) {
    return this.service.getAll(session.user.id);
  }

  @Get("essay/:activityId/correction/:studentId")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Returns the correction of an activity." })
  @ZodResponse({
    status: 200,
    description: "correction retrieved successfully",
    type: CorrectionResponseDto,
  })
  getCorrection(
    @Param("activityId") activityId: string,
    @Param("studentId") studentId: string,
    @Session() session: UserSession
  ) {
    return this.service.getCorrection(
      activityId,
      studentId,
      session.user.id
    );
  }

  @Post("essay")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Creates a new essay activity." })
  @ApiBody({ type: CreateEssayActivityDto })
  @ZodResponse({
    status: 201,
    description: "activity created successfully",
    type: GenericSuccessResponseDto,
  })
  create(
    @Body() data: CreateEssayActivityDto,
    @Session() session: UserSession
  ) {
    return this.service.create(data, session.user.id);
  }

  @Patch("essay/:id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates an activity." })
  @ApiBody({ type: UpdateEssayActivityDto })
  @ZodResponse({
    status: 200,
    description: "activity updated successfully",
    type: GenericSuccessResponseDto,
  })
  update(
    @Param("id") activityId: string,
    @Body() data: UpdateEssayActivityDto,
    @Session() session: UserSession
  ) {
    return this.service.update(activityId, data, session.user.id);
  }

  @Roles(["teacher", "admin"])
  @Get("essay/:id/answers")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieves all responses of an activity." })
  @ApiQuery({ type: GetAllAnswersQueryDto })
  @ZodResponse({
    status: 200,
    description: "responses retrieved successfully",
    type: PaginatedAnswersResponseDto,
  })
  getAllAnswers(
    @Param("id") activityId: string,
    @Query() query: GetAllAnswersQueryDto,
    @Session() session: UserSession
  ) {
    return this.service.getAllAnswers(
      activityId,
      session.user.id,
      query.offset,
      query.limit
    );
  }

  @Get("recent")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Returns the four most recent activities from all classes created by the teacher.",
  })
  @ZodResponse({
    status: 200,
    description: "recent activities retrieved successfully",
    type: [RecentActivityResponseDto],
  })
  recent(@Session() session: UserSession) {
    return this.service.recent(session.user.id);
  }

  @Put("answers/:id/feedback")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Adds or updates the feedback of a response." })
  @ApiBody({ type: ProvideFeedbackDto })
  @ZodResponse({
    status: 200,
    description: "feedback provided successfully",
    type: GenericSuccessResponseDto,
  })
  feedback(
    @Param("id") responseId: string,
    @Body() data: ProvideFeedbackDto,
    @Session() session: UserSession
  ) {
    return this.service.feedback(responseId, data, session.user.id);
  }

  @Delete(":id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deletes an activity." })
  @ZodResponse({
    status: 200,
    description: "activity deleted successfully",
    type: GenericSuccessResponseDto,
  })
  delete(
    @Param("id") activityId: string,
    @Session() session: UserSession
  ) {
    return this.service.delete(activityId, session.user.id);
  }
}
