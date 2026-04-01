import { PrismaService } from "@core/prisma";
import { Injectable } from "@nestjs/common";
import { CreateClassDto } from "./dto/create-class.dto";
import { GetAllClassesQueryDto } from "./dto/get-all-classes-query.dto";
import { GetAllActivitiesQueryDto } from "./dto/get-all-activities-query.dto";

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) { }

  create(data: CreateClassDto, creatorId: string, code: string) {
    return this.prisma.class.create({ data: { ...data, code, creatorId } })
  }

  getAll(query: GetAllClassesQueryDto, userId: string) {
    return this.prisma.class.findMany({
      where: {
        members: {
          some: {
            id: userId
          }
        }
      },
      skip: query.offset,
      take: query.limit,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
  }

  getCreated(userId: string, query: GetAllClassesQueryDto) {
    return this.prisma.class.findMany({
      where: {
        creatorId: userId
      },
      skip: query.offset,
      take: query.limit,
      select: {
        id: true,
        name: true,
        school: true,
        iconId: true
      }
    })
  }

  getById(classId: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        id: classId,
        OR: [
          { creatorId: userId },
          { members: { some: { id: userId } } }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })
  }

  update(classId: string, data: Partial<CreateClassDto>, userId: string) {
    return this.prisma.class.updateMany({
      where: {
        id: classId,
        creatorId: userId
      },
      data
    })
  }

  delete(classId: string, userId: string) {
    return this.prisma.class.deleteMany({
      where: {
        id: classId,
        creatorId: userId
      }
    })
  }

  getInviteCode(classId: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        id: classId,
        creatorId: userId
      },
      select: {
        code: true
      }
    })
  }

  regenerateInviteCode(classId: string, userId: string, newCode: string) {
    return this.prisma.class.updateMany({
      where: {
        id: classId,
        creatorId: userId
      },
      data: {
        code: newCode
      }
    })
  }

  requestEntry(inviteCode: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        code: inviteCode
      },
      select: {
        id: true,
        members: {
          where: {
            id: userId
          }
        },
        pendingMembers: {
          where: {
            id: userId
          }
        },
        creator: {
          select: {
            id: true
          }
        }
      }
    })
  }

  addPendingMember(classId: string, userId: string) {
    return this.prisma.class.update({
      where: {
        id: classId
      },
      data: {
        pendingMembers: {
          connect: {
            id: userId
          }
        }
      }
    })
  }

  getRequests(classId: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        id: classId,
        creatorId: userId
      },
      select: {
        pendingMembers: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
  }

  approveRequest(classId: string, studentId: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        id: classId,
        creatorId: userId
      },
      select: {
        members: {
          where: {
            id: studentId
          }
        },
        pendingMembers: {
          where: {
            id: studentId
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })
  }

  approveRequestUpdate(classId: string, studentId: string) {
    return this.prisma.class.update({
      where: {
        id: classId
      },
      data: {
        pendingMembers: {
          disconnect: {
            id: studentId
          }
        },
        members: {
          connect: {
            id: studentId
          }
        }
      }
    })
  }

  rejectRequest(classId: string, studentId: string, userId: string) {
    return this.prisma.class.update({
      where: {
        id: classId,
        creatorId: userId
      },
      data: {
        pendingMembers: {
          disconnect: {
            id: studentId
          }
        }
      }
    })
  }

  getAllStudents(classId: string, userId: string) {
    return this.prisma.class.findFirst({
      where: {
        id: classId,
        creatorId: userId
      },
      select: {
        members: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })
  }

  removeStudent(classId: string, studentId: string, userId: string) {
    return this.prisma.class.update({
      where: {
        id: classId,
        creatorId: userId
      },
      data: {
        members: {
          disconnect: {
            id: studentId
          }
        }
      }
    })
  }

  getAllActivities(classId: string, userId: string, query: GetAllActivitiesQueryDto) {
    return this.prisma.activity.findMany({
      where: {
        classId,
        class: {
          members: {
            some: {
              id: userId
            }
          }
        },
        title: query.title ? {
          contains: query.title,
          mode: 'insensitive'
        } : undefined
      },
      include: {
        essay: {
          include: {
            responses: {
              where: {
                studentId: userId
              },
              select: {
                answerDate: true
              }
            }
          }
        }
      }
    })
  }

  getAllActivitiesCreator(classId: string, userId: string, query: GetAllActivitiesQueryDto) {
    return this.prisma.activity.findMany({
      where: {
        classId,
        class: {
          creatorId: userId
        },
        title: query.title ? {
          contains: query.title,
          mode: 'insensitive'
        } : undefined
      },
      include: {
        essay: {
          include: {
            responses: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        class: {
          select: {
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      }
    })
  }

  getTotalClasses(userId: string) {
    return this.prisma.class.count({
      where: {
        members: {
          some: {
            id: userId
          }
        }
      }
    })
  }

  getTotalCreatedClasses(userId: string) {
    return this.prisma.class.count({
      where: {
        creatorId: userId
      }
    })
  }

  getAllFeedbacks(classId: string, userId: string) {
    return this.prisma.essayFeedback.findMany({
      where: {
        teacherCorrection: {
          response: {
            essay: {
              activity: {
                classId
              }
            },
            studentId: userId
          }
        }
      },
      select: {
        id: true,
        createdAt: true,
        gradeC1: true,
        gradeC2: true,
        gradeC3: true,
        gradeC4: true,
        gradeC5: true,
        feedbackC1: true,
        feedbackC2: true,
        feedbackC3: true,
        feedbackC4: true,
        feedbackC5: true,
        teacherCorrection: {
          select: {
            id: true,
            seen: true,
            response: {
              select: {
                essay: {
                  select: {
                    activity: {
                      select: {
                        title: true,
                        id: true,
                        type: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

}