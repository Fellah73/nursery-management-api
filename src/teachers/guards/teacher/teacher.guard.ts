import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeachersGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const teacher_id = request.params.id;
    if (!teacher_id) {
      throw new ForbiddenException('Teacher ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(teacher_id) },
    });

    if (!user || user.role !== 'TEACHER') {
      throw new ForbiddenException('Teacher access required');
    }

    return true;
  }
}
