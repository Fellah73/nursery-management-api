// src/attendance/guards/admin.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const staff_attendence_row = request.params.id;

    if (!staff_attendence_row) {
      throw new ForbiddenException('now attendenc row');
    }

    const attendanceRow = await this.prismaService.attendance.findUnique({
      where: { id: Number(staff_attendence_row) },
    });

    if (!attendanceRow) {
      throw new ForbiddenException('No attendance row found');
    }

    if (attendanceRow.entityType !== 'STAFF') {
      throw new ForbiddenException(
        'unathorized access - not a staff attendance',
      );
    }

    const staff = await this.prismaService.user.findUnique({
      where: { id: Number(attendanceRow.userId) },
    });

    if (!staff || staff.role !== 'TEACHER') {
      throw new ForbiddenException('No staff found for this attendance row');
    }

    return true;
  }
}
