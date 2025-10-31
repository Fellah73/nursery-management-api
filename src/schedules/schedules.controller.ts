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
  DeleteScheduleSlotDto,
  DeleteSlotDto,
  ScheduleDtoGet,
  SlotDto,
  UpdateSchedulePeriodDto,
  UpdateScheduleSlotDto,
  UpdateSlotDto,
} from './dto/schedules-dto';
import { SchedulesAuthGuard } from './guards/auth/auth.guard';
import { SchedulesClassroomsGuard } from './guards/services/classroom.guard';
import { SchedulesPeriodGuard } from './guards/services/period.guard';
import {
  ValidateSchedulePeriodCreationPipe,
  ValidateSchedulePeriodUpdatePipe,
} from './pipes/validate-periods';
import { ValidateSlotsPipe } from './pipes/validate-slots';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // Global schedule operations

  // guards : done , service : done , handleCall : done
  @Get('/period')
  @UseGuards(SchedulesAuthGuard)
  async getGlobalSchedulePeriod(
    @Query() query: ScheduleDtoGet,
    @Query('type') type: string,
  ) {
    return this.schedulesService.getGlobalSchedulePeriods(query, type);
  }

  // guards : done , service : done , handleCall : done
  @Get('/classroom/unscheduled')
  @UseGuards(SchedulesAuthGuard)
  async getClassroomsWithoutSchedule(@Query('admin_id') adminId: string) {
    return this.schedulesService.getClassroomsWithoutSchedule();
  }

  // guards : done , service : done , handleCall : done
  @Get('period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async getSchedulePeriodById(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getSchedulePeriodById(Number(periodId));
  }

  // Classroom-level operations

  // guards : done , service : done , handleCall : done
  @Get('/classroom/:classroomId')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async getSchedulePeriods(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getSchedulesByClassroom(Number(classroomId));
  }

  // guards : done , service : done , handleCall : done
  @Get('/classroom/:classroomId/week')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async getWeeklySchedule(
    @Param('classroomId') classroomId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.getWeeklyCompleteSchedule(Number(classroomId));
  }

  // guards : done , pipe: done , service : done , handleCall : done
  @Post('/classroom/:classroomId/period')
  @UseGuards(SchedulesAuthGuard, SchedulesClassroomsGuard)
  async createSchedulePeriod(
    @Param('classroomId') classroomId: string,
    @Query('type') type: string,
    @Body(ValidateSchedulePeriodCreationPipe) body: CreateSchedulePeriodDto,
  ) {
    return this.schedulesService.createSchedulePeriod(
      Number(classroomId),
      type,
      body,
    );
  }

  // Period-level operations
  // guards : done , pipe : done , service : done , handleCall : done
  @Patch('classroom/period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async updateSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateSchedulePeriodUpdatePipe) body: UpdateSchedulePeriodDto,
  ) {
    return this.schedulesService.updateSchedulePeriod(Number(periodId), body);
  }

  // guards : done , service : done , handleCall : done
  @Delete('classroom/period/:periodId')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async deleteSchedulePeriod(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
  ) {
    return this.schedulesService.deleteSchedulePeriod(Number(periodId));
  }

  // Slot-level operations
  // guards : done , pipe : done , service : done , handleCall : done
  @Post('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async createScheduleSlots(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateSlotsPipe<CreateScheduleSlotsDto, SlotDto>)
    body: CreateScheduleSlotsDto,
  ) {
    return this.schedulesService.createScheduleSlots(Number(periodId), body);
  }

  // guards : done , pipe : done , service : done , handleCall : done
  @Patch('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async updateScheduleSlot(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateSlotsPipe<UpdateScheduleSlotDto, UpdateSlotDto>)
    body: UpdateScheduleSlotDto,
  ) {
    return this.schedulesService.updateScheduleSlot(Number(periodId), body);
  }

  // guards : done , pipe : done , service : done , handleCall : done
  @Delete('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesAuthGuard, SchedulesPeriodGuard)
  async deleteScheduleSlot(
    @Param('periodId') periodId: string,
    @Query('admin_id') adminId: string,
    @Body(ValidateSlotsPipe<DeleteScheduleSlotDto, DeleteSlotDto>)
    body: DeleteScheduleSlotDto,
  ) {
    return this.schedulesService.deleteScheduleSlot(Number(periodId), body);
  }
}
