import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateSchedulePeriodDto,
  CreateScheduleSlotsDto,
  ScheduleDtoGet,
  UpdateSchedulePeriodDto,
  UpdateScheduleSlotDto,
} from './dto/schedules-dto';
import { SchedulesAuthGuard } from './guards/auth/auth.guard';
import { SchedulesClassroomsGuard } from './guards/services/classroom.guard';
import { SchedulesPeriodGuard } from './guards/services/period.guard';
import {
  ValidateSchedulePeriodPipe,
  ValidateSchedulePeriodUpdatePipe,
} from './pipes/validate-periods';
import { SchedulesService } from './schedules.service';
import { ValidateScheduleSlotsPipe } from './pipes/validate-slots';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // Global schedule operations
  // guards : done , service : done
  @Get('/period')
  @UseGuards(SchedulesAuthGuard)
  async getGlobalSchedulePeriod(
    @Query() query: ScheduleDtoGet,
    @Query('type') type: string,
  ) {
    return this.schedulesService.getGlobalSchedulePeriods(query, type);
  }

  // guards : done , service : done
  @Get('/classroom/unscheduled')
  @UseGuards(SchedulesAuthGuard)
  async getClassroomsWithoutSchedule(@Query('admin_id') adminId: string) {
    return this.schedulesService.getClassroomsWithoutSchedule();
  }

  // guards : done , service : done
  @Get('period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async getSchedulePeriodById(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getSchedulePeriodById(Number(periodId));
  }

  // Classroom-level operations

  // guards : done , service : done
  @Get('/classroom/:classroomId')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async getSchedulePeriods(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getSchedulesByClassroom(Number(classroomId));
  }

  // guards : done , service : done
  @Get('/classroom/:classroomId/week')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async getWeeklySchedule(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getWeeklyCompleteSchedule(Number(classroomId));
  }

  // guards : done , pipe: done , service : done
  @Post('/classroom/:classroomId/period')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async createSchedulePeriod(
    @Param('classroomId') classroomId: string,
    @Query('type') type: string,
    @Body(ValidateSchedulePeriodPipe) body: CreateSchedulePeriodDto,
  ) {
    return this.schedulesService.createSchedulePeriod(
      Number(classroomId),
      type,
      body,
    );
  }

  // Period-level operations
  // guards : done , pipe : done , service : done
  @Patch('classroom/period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async updateSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateSchedulePeriodUpdatePipe) body: UpdateSchedulePeriodDto,
  ) {
    return this.schedulesService.updateSchedulePeriod(Number(periodId), body);
  }

  // guards : done , service : done
  @Delete('classroom/period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async deleteSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.deleteSchedulePeriod(Number(periodId));
  }

  // Slot-level operations
  // guards : done , pipe : done , service : done
  @Post('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async createScheduleSlots(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateScheduleSlotsPipe) body: CreateScheduleSlotsDto,
  ) {
    return this.schedulesService.createScheduleSlots(Number(periodId), body);
  }

  // guards : failed , pipe : failed , service : failed
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
