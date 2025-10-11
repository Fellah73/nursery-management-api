import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('staff')
  async getStaffAttendanceRecords(@Query('admin_id') admin_id: number) {
    return this.attendanceService.getStaffAttendanceRecords(Number(admin_id));
  }
  // need to be with pagination next hour
  @Get('global-children')
  async getGlobalChildrenAttendanceRecords(
    @Query('admin_id') admin_id: number,
    @Query('classroom_id') classroom_id: number,
  ) {
    return this.attendanceService.getGlobalChildrenAttendanceRecords(
      Number(admin_id),
      Number(classroom_id),
    );
  }

  @Get('children')
  async getChildrenAttendanceRecords(@Query('admin_id') admin_id: number) {
    return this.attendanceService.getChildrenAttendanceRecords(
      Number(admin_id),
    );
  }

  @Patch('staff/:id/check-in')
  async staffCheckInHandler(
    @Param('id') id: number,
    @Query('admin_id') admin_id: number,
    @Query('approve') approve: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.staffCheckInHandler(
      Number(id),
      Number(admin_id),
      approve,
      date,
    );
  }
  @Patch('staff/:id/check-out')
  async staffCheckOutHandler(
    @Param('id') id: number,
    @Query('admin_id') admin_id: number,
    @Query('approve') approve: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.staffCheckOutHandler(
      Number(id),
      Number(admin_id),
      approve,
      date,
    );
  }

  @Patch('staff/:id/mark-absent')
  async staffMarkAbsentHandler(
    @Param('id') id: number,
    @Query('admin_id') admin_id: number,
    @Query('date') date: string,
  ) {
    return this.attendanceService.StaffMarkAbsentHandler(
      Number(id),
      Number(admin_id),
    );
  }
}
