import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/guard/decorators/roles.decorator';
import { UserRole } from 'src/guard/enums/user-role.enum';
import { GlobalAuthGuard } from 'src/guard/guards/auth.guard';
import {
  AttendanceDto,
  AttendanceUpdateDto,
} from './attendance-dto';
import { AttendanceService } from './attendance.service';
import { ChildrenGuard } from './guards/children.guard';
import { StaffGuard } from './guards/staff.guard';

@Controller('attendance')
@UseGuards(GlobalAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // guards : done , service : done
  @Get('staff')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStaffAttendanceRecords() {
    return this.attendanceService.getStaffAttendanceRecords();
  }


  // guards : done , service : done
  @Get('global-children')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getGlobalChildrenAttendanceRecords(
    @Query('classroom_id') classroom_id: number,
  ) {
    return this.attendanceService.getGlobalChildrenAttendanceRecords(
      Number(classroom_id),
    );
  }

  // children

  // guards : done , service : done
  @Get('children')
  @Roles(UserRole.TEACHER)
  async getChildrenAttendanceRecords(@Query('admin_id') admin_id: number) {
    return this.attendanceService.getChildrenAttendanceRecords(
      Number(admin_id),
    );
  }
  
  // guards : done , service : done
  @Patch('children/:id/check-in')
  @UseGuards(ChildrenGuard)
  @Roles(UserRole.TEACHER)
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
  @UseGuards(ChildrenGuard)
  @Roles(UserRole.TEACHER)
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
  @Patch('children/:id/absent')
  @UseGuards(ChildrenGuard)
  @Roles(UserRole.TEACHER)
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
  @UseGuards(StaffGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async staffCheckInHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.staffCheckInHandler(Number(id), body);
  }

  // guards : done , service : done
  @Patch('staff/:id/check-out')
  @UseGuards(StaffGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async staffCheckOutHandler(
    @Param('id') id: number,
    @Body() body: AttendanceUpdateDto,
  ) {
    return this.attendanceService.staffCheckOutHandler(Number(id), body);
  }

  // guards : done , service : done
  @Patch('staff/:id/absent')
  @UseGuards(StaffGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async staffMarkAbsentHandler(
    @Param('id') id: number,
    @Body() body: AttendanceDto,
  ) {
    return this.attendanceService.StaffMarkAbsentHandler(Number(id), body);
  }
}
