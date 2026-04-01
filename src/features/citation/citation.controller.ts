import { Body, Controller, Get, Param, Post, Put, Session, UsePipes } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OptionalAuth, Roles, UserSession } from "@thallesp/nestjs-better-auth";
import { ZodResponse, ZodValidationPipe } from "nestjs-zod";
import { CitationService } from "./citation.service";
import { CitationResponseDto } from "./dto/citation-response.dto";
import { CreateCitationDto } from "./dto/create-citation.dto";
import { IdOnlyResponseDto } from "@common/dto/idOnlyResponseDto";
import { UpdateCitationDto } from "./dto/update-citation.dto";
import { GenericSuccessResponseDto } from "@common/dto/genericResponseDto";

@ApiTags('Citation')
@Controller("citation")
@UsePipes(ZodValidationPipe)
export class CitationController {
  constructor(private readonly service: CitationService) { }

  @Get(":id")
  @OptionalAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieves selected citation" })
  @ZodResponse({
    status: 201,
    description: "citation retrieved successfully",
    type: CitationResponseDto,
  })
  get(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.get(id, session.user.id);
  }

  @Post()
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Creates new citation" })
  @ApiBody({ type: CreateCitationDto })
  @ZodResponse({
    status: 201,
    description: "citation created successfully",
    type: IdOnlyResponseDto,
  })
  create(@Body() data: CreateCitationDto, @Session() session: UserSession) {
    return this.service.create(session.user.id, data);
  }

  @Put(":id")
  @Roles(["admin", "teacher"])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates existing citation" })
  @ApiBody({ type: UpdateCitationDto })
  @ZodResponse({
    status: 200,
    description: "citation updated successfully",
    type: GenericSuccessResponseDto,
  })
  update(@Param('id') id: string, @Body() data: UpdateCitationDto) {
    return this.service.update(id, data);
  }
}
