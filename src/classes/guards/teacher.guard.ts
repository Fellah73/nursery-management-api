import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassesTeacherGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const teacher_id = request.query.teacherId || request.body.teacherId;

    if (!teacher_id) {
      throw new ForbiddenException('Teacher ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(teacher_id) },
    });

    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Teacher invalid or not found');
    }
    return true;
  }
}
