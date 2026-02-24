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
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
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
import { SchedulesClassroomsGuard } from './guards/classroom.guard';
import { SchedulesPeriodGuard } from './guards/period.guard';
import {
  ValidateSchedulePeriodCreationPipe,
  ValidateSchedulePeriodUpdatePipe,
} from './pipes/validate-periods';
import { ValidateSlotsPipe } from './pipes/validate-slots';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(GlobalAuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // Global schedule operations

  // guards : done , service : done , handleCall : done
  @Get('/period')
  async getGlobalSchedulePeriod(
    @Query() query: ScheduleDtoGet,
    @Query('type') type: string,
  ) {
    return this.schedulesService.getGlobalSchedulePeriods(query, type);
  }

  // guards : done , service : done , handleCall : done
  @Get('/classroom/unscheduled')
  async getClassroomsWithoutSchedule() {
    return this.schedulesService.getClassroomsWithoutSchedule();
  }

  // guards : done , service : done , handleCall : done
  @Get('period/:periodId')
  @UseGuards(SchedulesPeriodGuard)
  async getSchedulePeriodById(@Param('periodId') periodId: string) {
    return this.schedulesService.getSchedulePeriodById(Number(periodId));
  }

  // Classroom-level operations

  // guards : done , service : done , handleCall : done
  @Get('/classroom/:classroomId')
  @UseGuards(SchedulesClassroomsGuard)
  async getSchedulePeriods(@Param('classroomId') classroomId: string) {
    return this.schedulesService.getSchedulesByClassroom(Number(classroomId));
  }

  // guards : done , service : done , handleCall : done
  @Get('/classroom/:classroomId/week')
  @UseGuards(SchedulesClassroomsGuard)
  async getWeeklySchedule(@Param('classroomId') classroomId: string) {
    return this.schedulesService.getWeeklyCompleteSchedule(Number(classroomId));
  }

  // guards : done , pipe: done , service : done , handleCall : done
  @Post('/classroom/:classroomId/period')
  @UseGuards(SchedulesClassroomsGuard)
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
  @UseGuards(SchedulesPeriodGuard)
  async updateSchedulePeriod(
    @Param('periodId') periodId: string,
    @Body(ValidateSchedulePeriodUpdatePipe) body: UpdateSchedulePeriodDto,
  ) {
    return this.schedulesService.updateSchedulePeriod(Number(periodId), body);
  }

  // guards : done , service : done , handleCall : done
  @Delete('classroom/period/:periodId')
  @UseGuards(SchedulesPeriodGuard)
  async deleteSchedulePeriod(@Param('periodId') periodId: string) {
    return this.schedulesService.deleteSchedulePeriod(Number(periodId));
  }

  // Slot-level operations
  // guards : done , pipe : done , service : done , handleCall : done
  @Post('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesPeriodGuard)
  async createScheduleSlots(
    @Param('periodId') periodId: string,
    @Body(ValidateSlotsPipe<CreateScheduleSlotsDto, SlotDto>)
    body: CreateScheduleSlotsDto,
  ) {
    return this.schedulesService.createScheduleSlots(Number(periodId), body);
  }

  // guards : done , pipe : done , service : done , handleCall : done
  @Patch('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesPeriodGuard)
  async updateScheduleSlot(
    @Param('periodId') periodId: string,
    @Body(ValidateSlotsPipe<UpdateScheduleSlotDto, UpdateSlotDto>)
    body: UpdateScheduleSlotDto,
  ) {
    return this.schedulesService.updateScheduleSlot(Number(periodId), body);
  }

  // guards : done , pipe : done , service : done , handleCall : done
  @Delete('classroom/period/:periodId/slots/bulk')
  @UseGuards(SchedulesPeriodGuard)
  async deleteScheduleSlot(
    @Param('periodId') periodId: string,
    @Body(ValidateSlotsPipe<DeleteScheduleSlotDto, DeleteSlotDto>)
    body: DeleteScheduleSlotDto,
  ) {
    return this.schedulesService.deleteScheduleSlot(Number(periodId), body);
  }
}
