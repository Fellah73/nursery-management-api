import { Controller, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async getStaffAttendanceRecords(
    @Query('admin_id') admin_id: number
  ) {
    return this.attendanceService.getStaffAttendanceRecords(Number(admin_id));
  }


  // need to be with pagination next hour
  @Get('global-children')
  async getGlobalChildrenAttendanceRecords(
    @Query('admin_id') admin_id: number
  ) {
    return this.attendanceService.getChildrenAttendanceRecords(Number(admin_id));
  }

  @Get('children')
  async getChildrenAttendanceRecords(
    @Query('admin_id') admin_id: number
  ) {
    return this.attendanceService.getChildrenAttendanceRecords(Number(admin_id));
  }
}
