import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulesClassroomsGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const classroomId = request.params.classroomId || request.query.classroomId || request.body.classroomId;

    if (!classroomId) {
      throw new ForbiddenException('Classroom ID is required');
    }

    const classroom = await this.prismaService.classroom.findUnique({
      where: { id: Number(classroomId) },
    });

    if (!classroom) {
      throw new ForbiddenException('Classroom not found');
    }

    return true;
  }
}
  