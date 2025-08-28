import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import {
  CreateSchedulePeriodDto,
  CreateScheduleSlotsDto,
  ScheduleDtoGet,
  UpdateSchedulePeriodDto,
  UpdateScheduleSlotDto,
} from './dto/schedules-dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // Global schedule operations
  @Get('/period')
  async getGlobalSchedulePeriod(@Query() query: ScheduleDtoGet) {
    return this.schedulesService.getGlobalSchedulePeriods(query);
  }

  @Get('/classroom/unscheduled')
  async getClassroomsWithoutSchedule(@Query('admin_id') adminId: string) {
    return this.schedulesService.getClassroomsWithoutSchedule(Number(adminId));
  }

  // Classroom-level operations
  @Get('/classroom/:classroomId')
  async getSchedulePeriods(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getSchedulesByClassroom(
      Number(classroomId),
      Number(adminId),
    );
  }

  @Get('/classroom/:classroomId/week')
  async getWeeklySchedule(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getWeeklyCompleteSchedule(
      Number(classroomId),
      Number(adminId),
    );
  }

  @Post('/classroom/:classroomId/period')
  async createSchedulePeriod(
    @Param('classroomId') classroomId: string,
    @Query('type') type: string,
    @Body() body: CreateSchedulePeriodDto,
  ) {
    return this.schedulesService.createSchedulePeriod(
      Number(classroomId),
      type,
      body,
    );
  }

  // Period-level operations
  @Patch('classroom/period/:periodId')
  async updateSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body() body: UpdateSchedulePeriodDto,
  ) {
    return this.schedulesService.updateSchedulePeriod(
      Number(periodId),
      Number(adminId),
      body,
    );
  }

  @Delete('classroom/period/:periodId')
  async deleteSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.deleteSchedulePeriod(
      Number(periodId),
      Number(adminId),
    );
  }

  // Slot-level operations
  @Post('classroom/period/:periodId/slots/bulk')
  async createScheduleSlots(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body() body: CreateScheduleSlotsDto,
  ) {
    return this.schedulesService.createScheduleSlots(
      Number(periodId),
      Number(adminId),
      body,
    );
  }

  @Patch('period/:periodId/slots/bulk')
  async updateScheduleSlot(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body() body: UpdateScheduleSlotDto,
  ) {
    return this.schedulesService.updateScheduleSlot(
      Number(periodId),
      Number(adminId),
      body,
    );
  }
}
