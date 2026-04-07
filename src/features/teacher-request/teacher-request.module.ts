import { Module } from '@nestjs/common';
import { TeacherRequestController } from './teacher-request.controller';
import { TeacherRequestService } from './teacher-request.service';
import { TeacherRequestRepository } from './teacher-request.repository';

@Module({
  controllers: [TeacherRequestController],
  providers: [TeacherRequestService, TeacherRequestRepository],
})
export class TeacherRequestModule {}
