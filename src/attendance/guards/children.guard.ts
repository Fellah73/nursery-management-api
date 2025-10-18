// src/attendance/guards/admin.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChildrenGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const child_attendence_row = request.params.id;

    if (!child_attendence_row) {
      throw new ForbiddenException('now attendenc row');
    }

    const attendanceRow = await this.prismaService.attendance.findUnique({
      where: { id: Number(child_attendence_row) },
    });

    if (!attendanceRow) {
      throw new ForbiddenException('No attendance row found');
    }

    if (attendanceRow.entityType !== 'CHILD') {
      throw new ForbiddenException('unathorized access - not a child attendance');
    }

    const child = await this.prismaService.children.findUnique({
      where: { id: Number(attendanceRow.childId) },
      include: { assignments: true },
    });

    if (!child) {
      throw new ForbiddenException('No child found for this attendance row');
    }

    if (!child.assignments || child.assignments.length === 0) {
      throw new ForbiddenException('Child has no classroom assignments');
    }

    return true;
  }
}
