import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prismaService: PrismaService) {}

  // initialize attendanceDate and attendanceRecords for all active teachers and children for today
  async initAllAttendanceForToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day

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

  // privacy check for admin, super admin and teachers to retrieve the level of access
  async privacyCheckChildren(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    // in case the user exists
    if (user?.role == 'ADMIN' || user?.role == 'SUPER_ADMIN') {
      return {
        success: false,
        status: 403,
      };
    } else if (user?.role == 'TEACHER') {
      return {
        success: true,
        status: 200,
        user: user,
      };
    } else {
      return {
        success: false,
        status: 403,
      };
    }
  }

  // get all attendance records for staff
  async getStaffAttendanceRecords(admin_id: number) {
    // privacy check
    await this.privacyCheck(admin_id);

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

    return {
      message: 'Présences récupérées avec succès',
      status: 200,
      success: true,
      length: attendanceRecords.length,
      attendances: attendanceRecords,
    };
  }

  // get all attendance records for children
  async getChildrenAttendanceRecords(admin_id: number) {
    // privacy check
    const accessLevel = await this.privacyCheckChildren(admin_id);

    // the user doesn't exist
    if (!accessLevel) {
      return {
        success: false,
        message: "User n'est pas trouvé",
        status: 403,
      };
    }

    if (!accessLevel.success) {
      return {
        success: false,
        message: 'Wrong route',
        status: 403,
      };
    }

    // init attendance records if not already done
    await this.initAllAttendanceForToday();

    // get the classroom data of the teacher
    const classRoomData = await this.prismaService.classroom.findFirst({
      where: {
        teacherId: accessLevel.user?.id,
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
                  teacherId: accessLevel.user?.id,
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

  // get all attendance records for children paged by classroom
  async getGlobalChildrenAttendanceRecords(
    admin_id: number,
    classroom_id: number,
  ) {
    await this.privacyCheck(admin_id);

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

  // staff check-in handler
  async staffCheckInHandler(
    id: number,
    admin_id: number,
    approve: string,
    time: string,
  ) {
    try {
      // privacy check
      await this.privacyCheck(admin_id);

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
      const [hours, minutes] = time.split(':').map(Number);
      const checkInDateTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours,
        minutes,
      );

      const checkInEndTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        8,
        15,
      );

      const isLate = checkInDateTime > checkInEndTime;
      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          status: approve === 'false' ? 'ABSENT' : isLate ? 'LATE' : 'PRESENT',
          checkInTime: approve === 'true' ? checkInDateTime : null,
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
          'Erreur lors de la mise à jour du registre de présence',
        status: 500,
        success: false,
      };
    }
  }
  // staff check-out handler
  async staffCheckOutHandler(
    id: number,
    admin_id: number,
    approve: string,
    time: string,
  ) {
    try {
      // privacy check
      await this.privacyCheck(admin_id);

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
      const [hours, minutes] = time.split(':').map(Number);
      const checkOutDateTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours,
        minutes,
      );

      // update attendance record
      await this.prismaService.attendance.update({
        where: { id },
        data: {
          checkOutTime: approve === 'true' ? checkOutDateTime : null,
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
          'Erreur lors de la mise à jour du registre de présence',
        status: 500,
        success: false,
      };
    }
  }

  // staff mark absent handler
  async StaffMarkAbsentHandler(id: number, admin_id: number) {
    try {
      // privacy check
      await this.privacyCheck(admin_id);
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
}
