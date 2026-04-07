import { GenericSuccessResponseDto } from '@common/dto/genericResponseDto';
import { CustomParseFilePipe } from '@common/pipes/custom-parse-file.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ProfileDto } from './dto/profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { PictureResponseDto } from './dto/picture-response.dto';

@ApiTags('User')
@Controller('user')
@UsePipes(ZodValidationPipe)
export class UserController {
  constructor(private readonly service: UserService) {}

  @AllowAnonymous()
  @Post(':id/teacher')
  @ApiOperation({ summary: 'Creates a teacher registration request' })
  @ApiBody({ type: CreateTeacherDto })
  @ZodResponse({
    status: 201,
    description: 'request created successfully',
    type: GenericSuccessResponseDto,
  })
  createTeacher(@Param('id') id: string, @Body() data: CreateTeacherDto) {
    return this.service.createTeacher(id, data);
  }

  @AllowAnonymous()
  @Get(':id/profile')
  @ApiOperation({ summary: "Retrieves a user's profile" })
  @ZodResponse({
    status: 200,
    description: 'profile retrieved successfully',
    type: ProfileDto,
  })
  profile(@Param('id') id: string) {
    return this.service.profile(id);
  }

  @AllowAnonymous()
  @Get('picture/:id')
  @ApiOperation({ summary: "Retrieves a user's photo" })
  @ZodResponse({
    status: 200,
    description: 'profile picture retrieved successfully',
    type: PictureResponseDto,
  })
  getPicture(@Param('id') id: string) {
    return this.service.getPicture(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieves selected user' })
  @ZodResponse({
    status: 200,
    description: 'user retrieved successfully',
    type: UserResponseDto,
  })
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates user data' })
  @ApiBody({ type: UpdateUserDto })
  @ZodResponse({
    status: 200,
    description: 'user updated successfully',
    type: GenericSuccessResponseDto,
  })
  update(@Param('id') id: string, @Body() data: UpdateUserDto, @Session() session: UserSession) {
    return this.service.update(id, data, session.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes selected user' })
  @ZodResponse({
    status: 200,
    description: 'user deleted successfully',
    type: GenericSuccessResponseDto,
  })
  delete(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.delete(id, session.user.id);
  }

  @Post('picture/:id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adds a photo to a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        picture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ZodResponse({
    status: 201,
    description: 'picture added successfully',
    type: GenericSuccessResponseDto,
  })
  createPicture(
    @Param('id') id: string,
    @Session() session: UserSession,
    @UploadedFile(
      CustomParseFilePipe({
        maxSizeBytes: 5 * 1024 * 1024,
        fileType: 'image/',
        fileIsRequired: true,
      }),
    )
    picture: Express.Multer.File,
  ) {
    return this.service.createPicture(id, session.user.id, picture);
  }

  @Put('picture/:id')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Updates a user's photo" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        picture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ZodResponse({
    status: 200,
    description: 'picture updated successfully',
    type: GenericSuccessResponseDto,
  })
  updatePicture(
    @Param('id') id: string,
    @Session() session: UserSession,
    @UploadedFile(
      CustomParseFilePipe({
        maxSizeBytes: 5 * 1024 * 1024,
        fileType: 'image/',
        fileIsRequired: true,
      }),
    )
    picture: Express.Multer.File,
  ) {
    return this.service.updatePicture(id, session.user.id, picture);
  }

  @Delete('picture/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deletes a user's photo" })
  @ZodResponse({
    status: 200,
    description: 'picture deleted successfully',
    type: GenericSuccessResponseDto,
  })
  deletePicture(@Param('id') id: string, @Session() session: UserSession) {
    return this.service.deletePicture(id, session.user.id);
  }
}
