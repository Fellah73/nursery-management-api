// src/attendance/guards/teacher.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeacherAuthGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const teacher_id = request.query.admin_id || request.body.admin_id;

    if (!teacher_id) {
      throw new ForbiddenException('teacher IDs is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(teacher_id) },
    });

    if (!user) {
      throw new ForbiddenException('Teacher access required');
    }

    return true;
  }
}
