import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AttendanceDto,
  AttendanceUpdateDto,
} from './attendance-dto';
import { TeacherAuthGuard } from './guards/teacher_auth.guard';
import { AdminAuthGuard } from './guards/admin_auth.guard';
import { ChildrenGuard } from './guards/children.guard';
import { StaffGuard } from './guards/staff.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // guards : done , service : done
  @Get('staff')
  @UseGuards(AdminAuthGuard)
  async getStaffAttendanceRecords(@Query('admin_id') admin_id: number) {
    return this.attendanceService.getStaffAttendanceRecords(Number(admin_id));
  }


  // guards : done , service : done
  @Get('global-children')
  @UseGuards(AdminAuthGuard)
  async getGlobalChildrenAttendanceRecords(
    @Query('admin_id') admin_id: number,
    @Query('classroom_id') classroom_id: number,
  ) {
    return this.attendanceService.getGlobalChildrenAttendanceRecords(
      Number(admin_id),
      Number(classroom_id),
    );
  }

  // children

  // guards : done , service : done
  @Get('children')
  @UseGuards(TeacherAuthGuard)
  async getChildrenAttendanceRecords(@Query('admin_id') admin_id: number) {
    return this.attendanceService.getChildrenAttendanceRecords(
      Number(admin_id),
    );
  }

  // guards : done , service : done
  @Patch('children/:id/check-in')
  @UseGuards(TeacherAuthGuard,ChildrenGuard)
  async checkInChildrenAttendanceHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.checkInChildrenAttendanceHandler(
      Number(id),
      body,
    );
  }

  // guards : done , service : done
  @Patch('children/:id/check-out')
  @UseGuards(TeacherAuthGuard,ChildrenGuard)
  async checkOutChildrenAttendanceHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.checkOutChildrenAttendanceHandler(
      Number(id),
      body,
    );
  }

  // guards : done , service : done
  @Patch('children/:id/mark-absent')
  @UseGuards(TeacherAuthGuard,ChildrenGuard)
  async markAbsentChildrenAttendanceHandler(
    @Param('id') id: number,
    @Body() body: AttendanceDto,
  ) {
    return this.attendanceService.markAbsentChildrenAttendanceHandler(
      Number(id),
      body,
    );
  }

  // staff

  // guards : done , service : done
  @Patch('staff/:id/check-in')
  @UseGuards(AdminAuthGuard,StaffGuard)
  async staffCheckInHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.staffCheckInHandler(Number(id), body);
  }

  // guards : done , service : done
  @Patch('staff/:id/check-out')
  @UseGuards(AdminAuthGuard,StaffGuard)
  async staffCheckOutHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.staffCheckOutHandler(Number(id), body);
  }

  // guards : done , service : done
  @Patch('staff/:id/absent')
  @UseGuards(AdminAuthGuard,StaffGuard)
  async staffMarkAbsentHandler(
    @Param('id') id: number,
    @Body() body: AttendanceDto,
  ) {
    return this.attendanceService.StaffMarkAbsentHandler(Number(id), body);
  }
}
