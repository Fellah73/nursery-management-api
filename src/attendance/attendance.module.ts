import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminAuthGuard } from './guards/admin_auth.guard';
import { TeacherAuthGuard } from './guards/teacher_auth.guard';
import { StaffGuard } from './guards/staff.guard';
import { ChildrenGuard } from './guards/children.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AdminAuthGuard,
    TeacherAuthGuard,
    StaffGuard,
    ChildrenGuard,
  ],
})
export class AttendanceModule {}
