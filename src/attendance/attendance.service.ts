import { Body, Injectable, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceDto, AttendanceUpdateDto } from './attendance-dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prismaService: PrismaService) {}

  // initialize attendanceDate and attendanceRecords for all active teachers and children for today
  async initAllAttendanceForToday() {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to midday

    const existingAttendancesDate =
      await this.prismaService.attendanceDate.findFirst({
        where: {
          date: today,
        },
      });

    if (existingAttendancesDate) {
      return; // Attendance records for today already initialized
    }

    // Create a new attendance date record for today
    const newAttendanceDate = await this.prismaService.attendanceDate.create({
      data: {
        date: today,
      },
    });

    const teachers = await this.prismaService.user.findMany({
      where: {
        isActive: true,
        classroom: { isNot: null },
      },
    });

    const children = await this.prismaService.children.findMany({
      where: {
        assignments: { some: {} },
      },
    });

    if (teachers.length === 0 && children.length === 0) {
      return; // No users or children to create attendance records for
    }

    // create a new attendance date record for teachers
    teachers.forEach(async (teacher) => {
      await this.prismaService.attendance.create({
        data: {
          attendanceDateId: newAttendanceDate.id,
          entityType: 'STAFF',
          userId: teacher.id,
          status: 'PENDING',
        },
      });
    });

    // create a new attendance date record for children
    children.forEach(async (child) => {
      await this.prismaService.attendance.create({
        data: {
          attendanceDateId: newAttendanceDate.id,
          entityType: 'CHILD',
          childId: child.id,
          status: 'PENDING',
        },
      });
    });
  }

  // privacy check for admin and super admin
  async privacyCheck(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return {
        success: false,
        message: 'Utilisateur non trouvé',
        status: 404,
      };
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        user: user,
        status: 403,
        message: "Vous n'avez pas les droits pour accéder à cette ressource",
      };
    }

    return {
      success: true,
      user: user,
      status: 200,
    };
  }

  // get all attendance records for staff
  // service : done
  async getStaffAttendanceRecords(admin_id: number) {
    // init attendance records if not already done
    await this.initAllAttendanceForToday();

    // attendance date
    const attendanceDate = await this.prismaService.attendanceDate.findFirst({
      where: {
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    // return all attendance dates with attendance records
    const attendanceRecords = await this.prismaService.attendance.findMany({
      where: {
        entityType: 'STAFF',
        attendanceDate: {
          id: attendanceDate?.id,
        },
      },
      select: {
        id: true,
        status: true,
        checkInTime: true,
        checkOutTime: true,
        user: {
          select: {
            name: true,
            familyName: true,
            email: true,
            gender: true,
            classroom: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!attendanceRecords) {
      return {
        message: 'Aucun registre de présence trouvé',
        status: 404,
        success: false,
      };
    }

    return {
      message: 'Présences récupérées avec succès',
      status: 200,
      success: true,
      length: attendanceRecords.length,
      attendances: attendanceRecords,
    };
  }

  // get all attendance records for children paged by classroom
  // service : done
  async getGlobalChildrenAttendanceRecords(
    admin_id: number,
    classroom_id: number,
  ) {
    // init attendance records if not already done
    await this.initAllAttendanceForToday();

    // get all classroom
    const classRoomData = await this.prismaService.classroom.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: { category: 'asc' },
      where: {
        assignments: {
          some: {},
        },
      },
    });

    // group classrooms by category
    const groupedClassrooms = classRoomData.reduce((acc, classroom) => {
      if (!acc[classroom.category]) {
        acc[classroom.category] = [];
      }
      acc[classroom.category].push(classroom);
      return acc;
    }, {});

    if (!classroom_id) {
      return {
        message: 'Classroom ID is required',
        status: 400,
        success: false,
      };
    }

    // get attendance Date
    const attendanceDate = await this.prismaService.attendanceDate.findFirst({
      where: {
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    let attendanceRecords;
    if (classroom_id === -1) {
      // get the children attendance records for only the first classroom of the grouoped classrooms
      const firstClassroomId =
        groupedClassrooms[Object.keys(groupedClassrooms)[0]][0].id;
      attendanceRecords = await this.prismaService.attendance.findMany({
        where: {
          entityType: 'CHILD',
          attendanceDateId: attendanceDate?.id,
          child: {
            assignments: {
              some: {
                classroomId: firstClassroomId,
              },
            },
          },
        },
        select: {
          id: true,
          status: true,
          child: {
            select: {
              full_name: true,
              age: true,
            },
          },
        },
      });
      // return the attendance records with classroom_id
    } else {
      attendanceRecords = await this.prismaService.attendance.findMany({
        where: {
          entityType: 'CHILD',
          attendanceDateId: attendanceDate?.id,
          child: {
            assignments: {
              some: {
                classroomId: classroom_id,
              },
            },
          },
        },
        select: {
          id: true,
          status: true,
          child: {
            select: {
              full_name: true,
              age: true,
            },
          },
        },
      });
    }

    return {
      message: 'Présences récupérées avec succès',
      status: 200,
      success: true,
      metadata: {
        classRooms: groupedClassrooms,
        classRoomsLength: classRoomData.length,
        attendancesLength: attendanceRecords.length,
      },
      attendances: attendanceRecords,
    };
  }

  // get all attendance records for children
  // service : done
  async getChildrenAttendanceRecords(admin_id: number) {
    // init attendance records if not already done
    await this.initAllAttendanceForToday();

    const user = await this.prismaService.user.findUnique({
      where: {
        id: admin_id,
      },
    });

    if (user?.role !== 'TEACHER') {
      return {
        message:
          'Accès refusé. Seuls les enseignants peuvent accéder aux registres de présence des enfants.',
        status: 403,
        success: false,
      };
    }

    // get the classroom data of the teacher
    const classRoomData = await this.prismaService.classroom.findFirst({
      where: {
        teacherId: admin_id,
      },
      select: {
        name: true,
        category: true,
        capacity: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!classRoomData) {
      return {
        message: 'Aucune salle de classe trouvée pour cet enseignant',
        status: 404,
        success: false,
      };
    }

    // attendance date
    const attendanceDate = await this.prismaService.attendanceDate.findFirst({
      where: {
        date: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    // return all attendance dates with attendance records
    const childrenAttendanceRecords =
      await this.prismaService.attendance.findMany({
        where: {
          entityType: 'CHILD',
          attendanceDate: {
            id: attendanceDate?.id,
          },
          child: {
            assignments: {
              some: {
                classroom: {
                  teacherId: admin_id,
                },
              },
            },
          },
        },
        select: {
          id: true,
          status: true,
          child: {
            select: {
              full_name: true,
              age: true,
            },
          },
        },
      });

    if (!childrenAttendanceRecords) {
      return {
        message: 'Aucun registre de présence trouvé',
        status: 404,
        success: false,
      };
    }

    return {
      message: 'Présences récupérées avec succès',
      status: 200,
      success: true,
      metadata: {
        classroom: classRoomData,
        length: childrenAttendanceRecords.length,
      },
      attendances: childrenAttendanceRecords,
    };
  }

  // staff handling

  // staff check-in handler
  // service : done
  async staffCheckInHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    try {
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id },
      });

      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      // create date with current date and provided time
      const currentDate = new Date();
      const [hours, minutes] = body.time.split(':').map(Number);
      const checkInTime = new Date(
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          hours,
          minutes,
        ),
      );

      const checkInEndTime = new Date(
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          8,
          15,
        ),
      );

      const isLate = checkInTime > checkInEndTime;
      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          status: isLate ? 'LATE' : 'PRESENT',
          checkInTime: checkInTime,
          approvedAt: new Date(),
          approvedBy: Number(body.admin_id),
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Check-in time updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          'Erreur lors de la mise à jour du registre de présence',
        status: 500,
        success: false,
      };
    }
  }

  // staff check-out handler
  // service : done
  async staffCheckOutHandler(id: number, body: AttendanceUpdateDto) {
    try {
      // check the attendance absences
      await this.staffAbsenceHandler();
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id },
      });
      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      // create date with current date and provided time
      const currentDate = new Date();
      const [hours, minutes] = body.time.split(':').map(Number);
      const checkOutTime = new Date(
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          hours,
          minutes,
        ),
      );

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          checkOutTime: checkOutTime,
          approvedBy: Number(body.admin_id),
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Check-out time updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          'Erreur lors de la mise à jour du registre de présence',
        status: 500,
        success: false,
      };
    }
  }

  // staff mark absent handler
  async StaffMarkAbsentHandler(
    @Param('id') id: number,
    @Body() body: AttendanceDto,
  ) {
    try {
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id },
      });
      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          status: 'ABSENT',
          checkInTime: null,
          checkOutTime: null,
          approvedAt: new Date(),
          approvedBy: Number(body.admin_id),
        },
      });

      return {
        message: 'marking absent updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          'Erreur lors de la mise en absence du registre de présence',
        status: 500,
        success: false,
      };
    }
  }

  // staff absence handler
  async staffAbsenceHandler() {
    if (new Date().getHours() < 18) {
      return {
        message: "La gestion des absences n'est disponible qu'après 18h00",
        status: 403,
        success: false,
      };
    }

    try {
      // to be implemented
      const checkOutEndTime = new Date();
      checkOutEndTime.setHours(18, 0, 0, 0); // Set to 6pm

      const attendanceRecords = await this.prismaService.attendance.findMany({
        where: {
          entityType: 'STAFF',
          status: 'PENDING',
        },
      });

      // update all pending attendance records to absent
      attendanceRecords.forEach(async (record) => {
        await this.prismaService.attendance.update({
          where: { id: record.id },
          data: {
            status: 'ABSENT',
          },
        });
      });

      return {
        message: 'Absences récupérées avec succès',
        status: 200,
        success: true,
        attendances: attendanceRecords,
      };
    } catch (error) {
      return {
        message: error.message || 'Erreur lors de la récupération des absences',
        status: 500,
        success: false,
      };
    }
  }

  // children handling

  // children check-in handler
  // service : done
  async checkInChildrenAttendanceHandler(
    id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    try {
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id: Number(id) },
      });

      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      const currentDate = new Date();
      const [hours, minutes] = body.time.split(':').map(Number);
      const checkInDateTime = new Date(currentDate);
      checkInDateTime.setUTCHours(hours, minutes, 0, 0);

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          status: 'PRESENT',
          checkInTime: checkInDateTime,
          approvedAt: new Date(),
          approvedBy: Number(body.admin_id),
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Attendance record updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          "Erreur lors de l'approbation du registre de présence",
        status: 500,
        success: false,
      };
    }
  }

  // children check-out handler
  // service : done
  async checkOutChildrenAttendanceHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    try {
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id },
      });
      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      const currentDate = new Date();
      const [hours, minutes] = body.time.split(':').map(Number);
      const checkOutDateTime = new Date(
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          hours,
          minutes,
        ),
      );

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          checkOutTime: checkOutDateTime,
          approvedBy: Number(body.admin_id),
        },
      });

      return {
        message: 'Checkout time updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          "Erreur lors de l'approbation du registre de présence",
        status: 500,
        success: false,
      };
    }
  }

  // children mark absent handler
  // service : done
  async markAbsentChildrenAttendanceHandler(
    @Param('id') id: number,
    @Body() body: AttendanceDto,
  ) {
    try {
      // get attendance record
      const attendance = await this.prismaService.attendance.findUnique({
        where: { id },
      });
      if (!attendance) {
        return {
          message: "Le registre de présence n'existe pas",
          status: 404,
          success: false,
        };
      }

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          status: 'ABSENT',
          checkInTime: null,
          checkOutTime: null,
          approvedAt: new Date(),
          approvedBy: Number(body.admin_id),
        },
      });

      return {
        message: 'marking absence updated successfully',
        status: 200,
        success: true,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          "Erreur lors de l'approbation du registre de présence",
        status: 500,
        success: false,
      };
    }
  }
}
