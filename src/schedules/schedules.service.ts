import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSchedulePeriodDto,
  CreateScheduleSlotsDto,
  ScheduleDtoGet,
  UpdateSchedulePeriodDto,
  UpdateScheduleSlotDto,
} from './dto/schedules-dto';
import { DayOfWeek, Schedule } from 'generated/prisma';

@Injectable()
export class SchedulesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSchedulePeriod(
    classroomId: number,
    type: string,
    body: CreateSchedulePeriodDto,
  ) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(body.adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      if (!classroomId) {
        return {
          success: false,
          message: 'Classroom ID is required',
          error: 'Classroom ID is missing or invalid',
          statusCode: 400,
        };
      }

      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: classroomId },
      });
      if (!classroom) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
        };
      }
      await this.handleScheduleActivation();
      const existingPeriod = await this.prismaService.schedulePeriod.findFirst({
        where: {
          classroomId,
          isActive: true,
        },
      });

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set to start of day for date-only comparison

      console.log('Current date:', currentDate);

      // upcoming periods cannot start today
      if (
        existingPeriod &&
        new Date(body.startDate + 'T00:00:00.000Z').getTime() <=
          currentDate.getTime()
      ) {
        return {
          success: false,
          message:
            'An active schedule period already exists for this classroom',
          error: 'Invalid type for schedule period starting today',
          statusCode: 400,
        };
      }

      // create only one schedule period with no end date
      const schedulePeriod = await this.prismaService.schedulePeriod.create({
        data: {
          classroomId,
          name:
        type === 'current'
          ? `${classroom.name}-${body.startDate || 'open'}-${body.endDate || 'open'}`
          : body.name!,
          startDate: new Date((body.startDate || new Date().toISOString().split('T')[0]) + 'T00:00:00.000Z'),
          endDate: body.endDate
        ? new Date(body.endDate + 'T00:00:00.000Z')
        : null,
          isActive: type === 'current' ? true : false,
        },
      });
      return {
        message: 'Schedule period created successfully',
        schedulePeriod,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message:
          error.message ||
          'An error occurred while creating the schedule period',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async updateSchedulePeriod(
    periodId: number,
    adminId: number,
    body: UpdateSchedulePeriodDto,
  ) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!periodId) {
        return {
          success: false,
          message: 'Period ID is required',
          error: 'Period ID is missing or invalid',
          statusCode: 400,
        };
      }

      await this.handleScheduleActivation();

      const existingPeriod = await this.prismaService.schedulePeriod.findUnique(
        {
          where: { id: periodId },
        },
      );
      if (!existingPeriod) {
        return {
          success: false,
          message: 'Schedule period not found',
          error: 'The specified schedule period does not exist',
          statusCode: 404,
        };
      }

      const updatedPeriod = await this.prismaService.schedulePeriod.update({
        where: { id: periodId },
        data: {
          startDate: body.startDate
            ? new Date(body.startDate)
            : existingPeriod.startDate,
          endDate:
            body.endDate !== undefined
              ? body.endDate
                ? new Date(body.endDate)
                : null
              : existingPeriod.endDate,
          isActive:
            new Date() >=
            (body.startDate
              ? new Date(body.startDate)
              : existingPeriod.startDate)
              ? true
              : false,
          name:
            body.startDate || body.endDate
              ? `${existingPeriod.name.split('-')[0]}-${body.startDate || existingPeriod.startDate}-${body.endDate || existingPeriod.endDate || 'open'}`
              : existingPeriod.name,
        },
      });
      return {
        message: 'Schedule period updated successfully',
        schedulePeriod: updatedPeriod,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the schedule period',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async deleteSchedulePeriod(periodId: number, adminId: number) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!periodId) {
        return {
          success: false,
          message: 'Period ID is required',
          error: 'Period ID is missing or invalid',
          statusCode: 400,
        };
      }

      const existingPeriod = await this.prismaService.schedulePeriod.findUnique(
        {
          where: { id: periodId },
        },
      );
      if (!existingPeriod) {
        return {
          success: false,
          message: 'Schedule period not found',
          error: 'The specified schedule period does not exist',
          statusCode: 404,
        };
      }

      // delete associated schedules slots first
      await this.prismaService.schedule.deleteMany({
        where: { schedulePeriodId: periodId },
      });

      // then delete the schedule period
      await this.prismaService.schedulePeriod.delete({
        where: { id: periodId },
      });
      return {
        message: 'Schedule period deleted successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while deleting the schedule period',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async createScheduleSlots(
    periodId: number,
    adminId: number,
    body: CreateScheduleSlotsDto,
  ) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!periodId) {
        return {
          success: false,
          message: 'Period ID is required',
          error: 'Period ID is missing or invalid',
          statusCode: 400,
        };
      }

      const existingPeriod = await this.prismaService.schedulePeriod.findUnique(
        {
          where: { id: periodId },
        },
      );
      if (!existingPeriod) {
        return {
          success: false,
          message: 'Schedule period not found',
          error: 'The specified schedule period does not exist',
          statusCode: 404,
        };
      }

      if (!body.slots || body.slots.length === 0) {
        return {
          success: false,
          message: 'No slots provided',
          error: 'The slots array is empty or missing',
          statusCode: 400,
        };
      }

      const createdSlots: Schedule[] = [];
      for (const slot of body.slots) {
        const createdSlot = await this.prismaService.schedule.create({
          data: {
            schedulePeriodId: periodId,
            dayOfWeek: slot.dayOfWeek as DayOfWeek, // Type casting, ensure your DTO restricts values
            startTime: slot.startTime,
            endTime: slot.endTime,
            activity: slot.activity,
            location: slot.location || null,
          },
        });
        createdSlots.push(createdSlot);
      }

      return {
        message: 'Schedule slots created successfully',
        slots: createdSlots,
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: 'An error occurred while creating schedule slots',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async updateScheduleSlot(
    periodId: number,
    adminId: number,
    body: UpdateScheduleSlotDto,
  ) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!periodId) {
        return {
          success: false,
          message: 'Period ID is required',
          error: 'Period ID is missing or invalid',
          statusCode: 400,
        };
      }

      const existingPeriod = await this.prismaService.schedulePeriod.findUnique(
        {
          where: { id: periodId },
        },
      );
      if (!existingPeriod) {
        return {
          success: false,
          message: 'Schedule period not found',
          error: 'The specified schedule period does not exist',
          statusCode: 404,
        };
      }

      if (!body.slots || body.slots.length === 0) {
        return {
          success: false,
          message: 'No slots provided',
          error: 'The slots array is empty or missing',
          statusCode: 400,
        };
      }

      const deletedSlots = await this.prismaService.schedule.deleteMany({
        where: { schedulePeriodId: periodId },
      });

      // create new slots
      for (const slot of body.slots) {
        await this.prismaService.schedule.create({
          data: {
            schedulePeriodId: periodId,
            dayOfWeek: slot.dayOfWeek as DayOfWeek, // Type casting, ensure your DTO restricts values
            startTime: slot.startTime,
            endTime: slot.endTime,
            activity: slot.activity,
            location: slot.location || null,
            category: slot.category || null,
          },
        });
      }

      return {
        message: 'Schedule slots updated successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while updating the schedule slot',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async getSchedulesByClassroom(classroomId: number, adminId: number) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!classroomId) {
        return {
          success: false,
          message: 'Classroom ID is required',
          error: 'Classroom ID is missing or invalid',
          statusCode: 400,
        };
      }

      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: classroomId },
      });

      if (!classroom) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
        };
      }

      await this.handleScheduleActivation();

      const schedulePeriods = await this.prismaService.schedulePeriod.findMany({
        where: {
          classroomId,
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isActive: true,
          schedules: {
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      const currentDate = new Date();

      // Filter current active periods
      const currentSchedules = schedulePeriods.filter((period) => {
        return period.isActive;
      });

      // Filter upcoming periods (start date hasn't come yet)
      const upcomingSchedules = schedulePeriods.filter((period) => {
        const startDate = new Date(period.startDate);
        return startDate > currentDate && !period.isActive;
      });

      return {
        message: 'Schedules retrieved successfully',
        data: {
          current: currentSchedules.map((period) => ({
            id: period.id,
            startDate: period.startDate,
            endDate: period.endDate,
            isActive: period.isActive,
            slots: period.schedules,
          })),
          upcoming: upcomingSchedules.map((period) => ({
            id: period.id,
            name: period.name,
            startDate: period.startDate,
            endDate: period.endDate,
            isActive: period.isActive,
            slots: period.schedules,
          })),
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the weekly schedule',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async getWeeklyCompleteSchedule(classroomId: number, adminId: number) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }
      if (!classroomId) {
        return {
          success: false,
          message: 'Classroom ID is required',
          error: 'Classroom ID is missing or invalid',
          statusCode: 400,
        };
      }

      const classroom = await this.prismaService.classroom.findUnique({
        where: { id: classroomId },
      });

      if (!classroom) {
        return {
          success: false,
          message: 'Classroom not found',
          error: 'The specified classroom does not exist',
          statusCode: 404,
        };
      }

      await this.handleScheduleActivation();

      const schedulePeriods = await this.prismaService.schedulePeriod.findMany({
        where: {
          classroomId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isActive: true,
          schedules: {
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            select: {
              id: true,
              dayOfWeek: true,
              startTime: true,
              endTime: true,
              activity: true,
              location: true,
              category: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      console.log('Active schedule periods:', schedulePeriods);

      if (schedulePeriods.length === 0) {
        return {
          success: false,
          message: 'No active schedule period found for this classroom',
          error: 'There are no active schedule periods',
          statusCode: 404,
        };
      }

      // Assuming only one active period per classroom as per the activation logic
      const activePeriod = schedulePeriods[0];

      // Organize schedules by day of the week
      const weeklySchedule = {
        SUNDAY: [] as typeof activePeriod.schedules,
        MONDAY: [] as typeof activePeriod.schedules,
        TUESDAY: [] as typeof activePeriod.schedules,
        WEDNESDAY: [] as typeof activePeriod.schedules,
        THURSDAY: [] as typeof activePeriod.schedules,
      };

      for (const slot of activePeriod.schedules) {
        if (weeklySchedule[slot.dayOfWeek]) {
          weeklySchedule[slot.dayOfWeek].push(slot);
        }
      }

      return {
        success: true,
        message: 'Weekly schedule retrieved successfully',
        weeklySchedule: {
          name: activePeriod.name,
          startDate: activePeriod.startDate,
          endDate: activePeriod.endDate,
          slots: weeklySchedule,
          classroom: classroom,
        },
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving the weekly schedule',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async handleScheduleActivation() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for date-only comparison

    // delete slots of periods that ended one day ago
    await this.prismaService.schedule.deleteMany({
      where: {
        schedulePeriod: {
          endDate: {
            lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // delete periods that ended 1 day ago
    await this.prismaService.schedulePeriod.deleteMany({
      where: {
        endDate: { lt: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    // Activate periods that are starting today
    await this.prismaService.schedulePeriod.updateMany({
      where: {
        startDate: {
          gte: currentDate,
          lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
        isActive: false,
      },
      data: { isActive: true },
    });

    // activate periods that have started but were not activated (missed activation)
    // this can happen if the backend was down for a few days
    await this.prismaService.schedulePeriod.updateMany({
      where: {
        startDate: { lt: currentDate },
        isActive: false,
      },
      data: { isActive: true },
    });

    // if two periods are active for one classroom, delete the older one (with its slots)
    const activePeriods = await this.prismaService.schedulePeriod.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
    });

    const classroomActiveMap = new Map<number, any[]>();
    for (const period of activePeriods) {
      if (!classroomActiveMap.has(period.classroomId)) {
        classroomActiveMap.set(period.classroomId, [period]);
      } else {
        classroomActiveMap.get(period.classroomId)!.push(period);
      }
    }

    console.log(classroomActiveMap);

    for (const [classroomId, periods] of classroomActiveMap.entries()) {
      if (periods.length > 1) {
        console.log(
          `Classroom ${classroomId} has ${periods.length} active periods. Cleaning up...`,
        );
        // More than one active period for this classroom
        // Delete all but the most recent one
        const periodsToDelete = periods.slice(0, -1); // All but the last one
        const periodIdsToDelete = periodsToDelete.map((p) => p.id);

        console.log(
          `Deleting periods with IDs: ${periodIdsToDelete.join(', ')}`,
        );

        // Delete slots first
        await this.prismaService.schedule.deleteMany({
          where: { schedulePeriodId: { in: periodIdsToDelete } },
        });

        // Then delete the periods
        await this.prismaService.schedulePeriod.deleteMany({
          where: { id: { in: periodIdsToDelete } },
        });
      } else {
        console.log(`Classroom ${classroomId} has only one active period.`);
      }
    }
    return;
  }

  async getGlobalSchedulePeriods(query: ScheduleDtoGet) {
    try {
      const perPage = query.perPage ? Number(query.perPage) : 10;
      const page = query.page && query.page > 0 ? Number(query.page) : 1;

      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(query.admin_id) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      const skip = (page - 1) * perPage;

      await this.handleScheduleActivation();

      const schedulePeriods = await this.prismaService.schedulePeriod.findMany({
        take: perPage && perPage !== 0 ? perPage : undefined,
        skip: perPage !== 0 ? skip : undefined, // Only skip if we're using pagination
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          classroom: {
            select: {
              id: true,
              name: true,
              category: true,
              ageMin: true,
              ageMax: true,
              capacity: true,
              teacher: {
                select: {
                  id: true,
                  familyName: true,
                  email: true,
                  profile_picture: true,
                  gender: true,
                },
              },
              _count: {
                select: {
                  assignments: true,
                },
              },
            },
          },
          _count: {
            select: {
              schedules: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
        where: {
          isActive: true,
        },
      });

      const classRooms = await this.prismaService.classroom.count();

      const totalSlots = await this.prismaService.schedule.count({
        where: {
          schedulePeriod: {
            isActive: true,
          },
        },
      });

      const totalActiveSchedules =
        await this.prismaService.schedulePeriod.count({
          where: {
            isActive: true,
          },
        });

      return {
        message: 'Schedule periods retrieved successfully',
        schedules: schedulePeriods,
        pagination: {
          page: page,
          perPage: perPage || 'All',
          pages: perPage ? Math.ceil(totalActiveSchedules / perPage) : 1,
        },
        meta: {
          totalSlots: totalSlots,
          totalClassrooms: classRooms,
          totalActiveSchedules: totalActiveSchedules,
        },
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'An error occurred while retrieving schedule periods',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }

  async getClassroomsWithoutSchedule(adminId: number) {
    try {
      const adminUser = await this.prismaService.user.findFirst({
        where: { id: Number(adminId) },
      });
      if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Unauthorized access to this route',
          error: 'You must be an admin to access this route',
          statusCode: 403,
        };
      }

      await this.handleScheduleActivation();

      // Get all classrooms
      const allClassrooms = await this.prismaService.classroom.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          ageMin: true,
          ageMax: true,
          capacity: true,
          _count: {
            select: {
              schedulePeriods: true,
              assignments: true,
            },
          },
        },
      });

      // Get classrooms with no schedules
      const classroomsWithoutSchedule = allClassrooms.filter(
        (classroom) => !classroom._count.schedulePeriods,
      );

      return {
        message: 'Classrooms without schedules retrieved successfully',
        classrooms: classroomsWithoutSchedule,
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message:
          'An error occurred while retrieving classrooms without schedules',
        error: error.message,
        statusCode: 500,
        success: false,
      };
    }
  }
}
