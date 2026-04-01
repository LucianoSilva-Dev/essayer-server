import { Body, Controller, Delete, Get, Patch, Post, Put, Query, Session, UsePipes, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles, UserSession } from "@thallesp/nestjs-better-auth";
import { ZodResponse, ZodValidationPipe } from "nestjs-zod";
import { ClassService } from "./class.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { GenericSuccessResponseDto } from "@common/dto/genericResponseDto";
import { GetAllClassesQueryDto } from "./dto/get-all-classes-query.dto";
import { GetClassesResponseDto, GetClassResponseDto, GetCreatedClassesResponseDto, GetInviteCodeResponseDto, GetStudentsResponseDto, GetPendingStudentsResponseDto, RegenerateCodeResponseDto, GetActivitiesResponseDto, GetCreatorActivitiesResponseDto, GetAllFeedbacksResponseDto } from "./dto/class-response.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { JoinClassDto } from "./dto/join-class.dto";
import { GetAllActivitiesQueryDto } from "./dto/get-all-activities-query.dto";

@ApiTags('Class')
@Controller("class")
@UsePipes(ZodValidationPipe)
export class ClassController {
  constructor(private readonly service: ClassService) { }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Lists classes where the user (student/professor) is enrolled",
  })
  @ApiQuery({ type: GetAllClassesQueryDto })
  @ZodResponse({
    status: 200,
    description: "classes retrieved successfully",
    type: GetClassesResponseDto,
  })
  getAll(@Session() session: UserSession, @Query() query: GetAllClassesQueryDto) {
    return this.service.getAll(query, session.user.id);
  }

  @Get("created")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lists classes created by the professor" })
  @ApiQuery({ type: GetAllClassesQueryDto })
  @ZodResponse({
    status: 200,
    description: "created classes retrieved successfully",
    type: GetCreatedClassesResponseDto,
  })
  getCreated(@Session() session: UserSession, @Query() query: GetAllClassesQueryDto) {
    return this.service.getCreated(query, session.user.id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gets details of a specific class" })
  @ZodResponse({
    status: 200,
    description: "class retrieved successfully",
    type: GetClassResponseDto,
  })
  getById(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.getById(classId, session.user.id);
  }

  @Get(":id/activities")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Gets all activities of a class where the user is a member",
  })
  @ApiQuery({ type: GetAllActivitiesQueryDto })
  @ZodResponse({
    status: 200,
    description: "activities retrieved successfully",
    type: GetActivitiesResponseDto,
  })
  getAllActivities(@Param("id") classId: string, @Session() session: UserSession, @Query() query: GetAllActivitiesQueryDto) {
    return this.service.getAllActivities(classId, session.user.id, query);
  }

  @Post("request-entry")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Student requests entry into a class" })
  @ApiBody({ type: JoinClassDto })
  @ZodResponse({
    status: 200,
    description: "entry request sent successfully",
    type: GenericSuccessResponseDto,
  })
  requestEntry(@Session() session: UserSession, @Body() data: JoinClassDto) {
    return this.service.requestEntry(data, session.user.id);
  }

  @Get(":id/activities/feedbacks")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gets all feedbacks of activities in the class" })
  @ZodResponse({
    status: 200,
    description: "feedbacks retrieved successfully",
    type: GetAllFeedbacksResponseDto,
  })
  getAllFeedbacks(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.getAllFeedbacks(classId, session.user.id);
  }

  @Post()
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor creates a new class" })
  @ApiBody({ type: CreateClassDto })
  @ZodResponse({
    status: 201,
    description: "citation created successfully",
    type: GenericSuccessResponseDto,
  })
  create(@Session() session: UserSession, @Body() data: CreateClassDto) {
    return this.service.create(data, session.user.id);
  }

  @Patch(":id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor updates class data" })
  @ApiBody({ type: UpdateClassDto })
  @ZodResponse({
    status: 200,
    description: "class updated successfully",
    type: GenericSuccessResponseDto,
  })
  update(@Param("id") classId: string, @Session() session: UserSession, @Body() data: UpdateClassDto) {
    return this.service.update(classId, data, session.user.id);
  }

  @Delete(":id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor deletes a class" })
  @ZodResponse({
    status: 200,
    description: "class deleted successfully",
    type: GenericSuccessResponseDto,
  })
  delete(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.delete(classId, session.user.id);
  }

  @Get(":id/activities/creator")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Gets all activities of a class where the user is the creator",
  })
  @ApiQuery({ type: GetAllActivitiesQueryDto })
  @ZodResponse({
    status: 200,
    description: "creator activities retrieved successfully",
    type: GetCreatorActivitiesResponseDto,
  })
  getAllActivitiesCreator(@Param("id") classId: string, @Session() session: UserSession, @Query() query: GetAllActivitiesQueryDto) {
    return this.service.getAllActivitiesCreator(classId, session.user.id, query);
  }

  @Get(":id/invite")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Gets the invitation code of a class" })
  @ZodResponse({
    status: 200,
    description: "invite code retrieved successfully",
    type: GetInviteCodeResponseDto,
  })
  getInviteCode(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.getInviteCode(classId, session.user.id);
  }

  @Post(":id/regenerate-code")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generates a new invitation code for the class" })
  @ZodResponse({
    status: 200,
    description: "invite code regenerated successfully",
    type: RegenerateCodeResponseDto,
  })
  regenerateInviteCode(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.regenerateInviteCode(classId, session.user.id);
  }

  @Get(":id/requests")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor views pending entry requests" })
  @ZodResponse({
    status: 200,
    description: "pending requests retrieved successfully",
    type: GetPendingStudentsResponseDto,
  })
  getRequests(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.getRequests(classId, session.user.id);
  }

  @Post(":id/requests/:studentId/approve")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor approves a student's entry" })
  @ZodResponse({
    status: 200,
    description: "request approved successfully",
    type: GenericSuccessResponseDto,
  })
  approveRequest(@Param("id") classId: string, @Param("studentId") studentId: string, @Session() session: UserSession) {
    return this.service.approveRequest(classId, studentId, session.user.id);
  }

  @Delete(":id/requests/:studentId/reject")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor rejects a student's entry" })
  @ZodResponse({
    status: 200,
    description: "request rejected successfully",
    type: GenericSuccessResponseDto,
  })
  rejectRequest(@Param("id") classId: string, @Param("studentId") studentId: string, @Session() session: UserSession) {
    return this.service.rejectRequest(classId, studentId, session.user.id);
  }

  @Get(":id/students")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor views all students in the class" })
  @ZodResponse({
    status: 200,
    description: "students retrieved successfully",
    type: GetStudentsResponseDto,
  })
  getAllStudents(@Param("id") classId: string, @Session() session: UserSession) {
    return this.service.getAllStudents(classId, session.user.id);
  }

  @Delete(":id/students/:studentId")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Professor removes a student from the class" })
  @ZodResponse({
    status: 200,
    description: "student removed successfully",
    type: GenericSuccessResponseDto,
  })
  removeStudent(@Param("id") classId: string, @Param("studentId") studentId: string, @Session() session: UserSession) {
    return this.service.removeStudent(classId, studentId, session.user.id);
  }
}
