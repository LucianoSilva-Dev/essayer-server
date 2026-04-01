import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { ClassRepository } from "./class.repository";
import { CreateClassDto } from "./dto/create-class.dto";
import { generateInviteCode } from "@common/utils/generateInviteCode";
import { GetAllClassesQueryDto } from "./dto/get-all-classes-query.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { JoinClassDto } from "./dto/join-class.dto";
import { GetAllActivitiesQueryDto } from "./dto/get-all-activities-query.dto";

@Injectable()
export class ClassService {
  constructor(private readonly repository: ClassRepository) { }

  async create(data: CreateClassDto, userId: string) {
    const code = generateInviteCode()

    try {
      await this.repository.create(data, userId, code)

      return { message: 'class created succeddfully' }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error creating class')
    }
  }

  async getAll(query: GetAllClassesQueryDto, userId: string) {
    try {
      const classes = await this.repository.getAll(query, userId)
      const totalDocuments = await this.repository.getTotalClasses(userId)

      const documents = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        school: cls.school,
        iconId: cls.iconId,
        creator: {
          id: cls.creator.id,
          name: cls.creator.name,
          image: cls.creator.image
        }
      }))

      const nextOffset = Math.min(query.offset + query.limit, totalDocuments)
      const prevOffset = Math.max(query.offset - query.limit, 0)

      const totalPages = Math.ceil(totalDocuments / query.limit)
      const pages = Array.from({ length: totalPages }, (_, i) => `offset=${i * query.limit}&limit=${query.limit}`)

      return {
        documents,
        pagination: {
          offset: query.offset,
          limit: query.limit,
          nextPageUrl: nextOffset >= totalDocuments ? null : `/offset=${nextOffset}&limit=${query.limit}`,
          previousPageUrl: query.offset === 0 ? null : `/offset=${prevOffset}&limit=${query.limit}`,
          totalDocuments,
          pagesUrl: pages
        }
      }
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Error fetching classes')
    }
  }

  async getCreated(query: GetAllClassesQueryDto, userId: string) {
    try {
      const classes = await this.repository.getCreated(userId, query)
      const totalDocuments = await this.repository.getTotalCreatedClasses(userId)

      const documents = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        school: cls.school,
        iconId: cls.iconId
      }))

      const nextOffset = Math.min(query.offset + query.limit, totalDocuments)
      const prevOffset = Math.max(query.offset - query.limit, 0)

      const totalPages = Math.ceil(totalDocuments / query.limit)
      const pages = Array.from({ length: totalPages }, (_, i) => `offset=${i * query.limit}&limit=${query.limit}`)

      return {
        documents,
        pagination: {
          offset: query.offset,
          limit: query.limit,
          nextPageUrl: nextOffset >= totalDocuments ? null : `/offset=${nextOffset}&limit=${query.limit}`,
          previousPageUrl: query.offset === 0 ? null : `/offset=${prevOffset}&limit=${query.limit}`,
          totalDocuments,
          pagesUrl: pages
        }
      }
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Error fetching created classes')
    }
  }

  async getById(classId: string, userId: string) {
    try {
      const cls = await this.repository.getById(classId, userId)

      if (!cls) {
        throw new NotFoundException('Class not found or you do not have access')
      }

      return {
        id: cls.id,
        name: cls.name,
        school: cls.school,
        iconId: cls.iconId,
        creator: {
          id: cls.creator.id,
          name: cls.creator.name,
          image: cls.creator.image
        },
        members: cls.members.map(member => ({
          id: member.id,
          name: member.name,
          image: member.image
        })),
        totalMembers: cls._count.members
      }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error fetching class')
    }
  }

  async update(classId: string, data: UpdateClassDto, userId: string) {
    try {
      const result = await this.repository.update(classId, data, userId)

      if (result.count === 0) {
        throw new NotFoundException('Class not found or you do not have permission to update it')
      }

      return { message: 'Class updated successfully' }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error updating class')
    }
  }

  async delete(classId: string, userId: string) {
    try {
      const result = await this.repository.delete(classId, userId)

      if (result.count === 0) {
        throw new NotFoundException('Class not found or you do not have permission to delete it')
      }

      return { message: 'Class deleted successfully' }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error deleting class')
    }
  }

  async getAllActivities(classId: string, userId: string, query: GetAllActivitiesQueryDto) {
    try {
      const activities = await this.repository.getAllActivities(classId, userId, query)

      return activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        deadline: activity.deadline,
        activityType: activity.type,
        status: this.calculateActivityStatus(activity.deadline, activity.essay?.responses?.[0]?.answerDate)
      }))
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Error fetching activities')
    }
  }

  async getAllActivitiesCreator(classId: string, userId: string, query: GetAllActivitiesQueryDto) {
    try {
      const activities = await this.repository.getAllActivitiesCreator(classId, userId, query)

      return activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        deadline: activity.deadline,
        activityType: activity.type,
        usersResponded: activity.essay?.responses?.filter(r => r.answerDate).map(r => r.student) || [],
        totalMembers: activity.class._count.members
      }))
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Error fetching activities')
    }
  }

  async getInviteCode(classId: string, userId: string) {
    try {
      const cls = await this.repository.getInviteCode(classId, userId)

      if (!cls) {
        throw new NotFoundException('Class not found or you do not have permission')
      }

      return { code: cls.code }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error fetching invite code')
    }
  }

  async regenerateInviteCode(classId: string, userId: string) {
    try {
      const newCode = generateInviteCode()
      const result = await this.repository.regenerateInviteCode(classId, userId, newCode)

      if (result.count === 0) {
        throw new NotFoundException('Class not found or you do not have permission')
      }

      return { code: newCode }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error regenerating invite code')
    }
  }

  async requestEntry(data: JoinClassDto, userId: string) {
    try {
      const cls = await this.repository.requestEntry(data.inviteCode, userId)

      if (!cls) {
        throw new BadRequestException('Invalid invite code')
      }

      if (cls.creator.id === userId) {
        throw new BadRequestException('You cannot join your own class')
      }

      if (cls.members.length > 0) {
        throw new BadRequestException('You are already a member of this class')
      }

      if (cls.pendingMembers.length > 0) {
        throw new BadRequestException('Your request is already pending')
      }

      if (cls.members.length >= 120) {
        throw new BadRequestException('Class has reached maximum capacity')
      }

      await this.repository.addPendingMember(cls.id, userId)

      return { message: 'Entry request sent successfully' }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error requesting entry')
    }
  }

  async getRequests(classId: string, userId: string) {
    try {
      const cls = await this.repository.getRequests(classId, userId)

      if (!cls) {
        throw new NotFoundException('Class not found or you do not have permission')
      }

      return cls.pendingMembers
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error fetching requests')
    }
  }

  async approveRequest(classId: string, studentId: string, userId: string) {
    try {
      const cls = await this.repository.approveRequest(classId, studentId, userId)

      if (!cls) {
        throw new NotFoundException('Class not found or you do not have permission')
      }

      if (cls.members.length > 0) {
        throw new BadRequestException('Student is already a member')
      }

      if (cls.pendingMembers.length === 0) {
        throw new NotFoundException('Student not found in pending requests')
      }

      if (cls._count.members >= 120) {
        throw new BadRequestException('Class has reached maximum capacity')
      }

      await this.repository.approveRequestUpdate(classId, studentId)

      return { message: 'Request approved successfully' }
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error approving request')
    }
  }

  async rejectRequest(classId: string, studentId: string, userId: string) {
    try {
      const result = await this.repository.rejectRequest(classId, studentId, userId)

      return { message: 'Request rejected successfully' }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error rejecting request')
    }
  }

  async getAllStudents(classId: string, userId: string) {
    try {
      const cls = await this.repository.getAllStudents(classId, userId)

      if (!cls) {
        throw new NotFoundException('Class not found or you do not have permission')
      }

      return cls.members
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error fetching students')
    }
  }

  async removeStudent(classId: string, studentId: string, userId: string) {
    try {
      const result = await this.repository.removeStudent(classId, studentId, userId)

      return { message: 'Student removed successfully' }
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      console.log(err)
      throw new InternalServerErrorException('Error removing student')
    }
  }

  async getAllFeedbacks(classId: string, userId: string) {
    try {
      const feedbacks = await this.repository.getAllFeedbacks(classId, userId)

      return feedbacks.map(feedback => ({
        id: feedback.teacherCorrection!.id,
        feedback: {
          gradeC1: feedback.gradeC1,
          gradeC2: feedback.gradeC2,
          gradeC3: feedback.gradeC3,
          gradeC4: feedback.gradeC4,
          gradeC5: feedback.gradeC5,
          feedbackC1: feedback.feedbackC1,
          feedbackC2: feedback.feedbackC2,
          feedbackC3: feedback.feedbackC3,
          feedbackC4: feedback.feedbackC4,
          feedbackC5: feedback.feedbackC5
        },
        seen: feedback.teacherCorrection!.seen,
        date: feedback.createdAt,
        activity: {
          id: feedback.teacherCorrection!.response.essay.activity.id,
          title: feedback.teacherCorrection!.response.essay.activity.title,
          activityType: feedback.teacherCorrection!.response.essay.activity.type
        }
      }))
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('Error fetching feedbacks')
    }
  }

  private calculateActivityStatus(deadline: Date | null, answerDate: Date | null | undefined): string {
    if (answerDate) {
      return 'Completed'
    }

    if (!deadline) {
      return 'Pending'
    }

    if (new Date() > deadline) {
      return 'Overdue'
    }

    return 'In Progress'
  }
}