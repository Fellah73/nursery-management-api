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

    // return all attendance dates with attendance records
    const attendanceRecords = await this.prismaService.attendance.findMany({
      where: {
        entityType: 'STAFF',
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

    // return all attendance dates with attendance records
    const childrenAttendanceRecords =
      await this.prismaService.attendance.findMany({
        where: {
          entityType: 'CHILD',
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
}
