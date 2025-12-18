import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentsClassRoomGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const classroom_id =
      request.query.classroomId ||
      request.query.class_id ||
      request.params.classroomId ||
      request.body.classroomId;

    if (!classroom_id) {
      throw new ForbiddenException('Classroom ID is required');
    }

    const classroom = await this.prismaService.classroom.findUnique({
      where: { id: Number(classroom_id) },
    });

    if (!classroom) {
      throw new ForbiddenException('Classroom not found');
    }

    return true;
  }
}
