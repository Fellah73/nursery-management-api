import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { ChildrenGuard } from './guards/children.guard';
import { StaffGuard } from './guards/staff.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, StaffGuard, ChildrenGuard],
})
export class AttendanceModule {}
