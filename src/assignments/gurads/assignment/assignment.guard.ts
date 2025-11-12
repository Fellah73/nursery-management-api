import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentsGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const assignment_id =
      request.query.id || request.body.id || request.params.id;

    if (!assignment_id) {
      throw new ForbiddenException('Assignment ID is required');
    }

    const assignment = await this.prismaService.assignment.findUnique({
      where: { id: Number(assignment_id) },
    });

    if (!assignment) {
      throw new ForbiddenException('Assignment not found');
    }

    return true;
  }
}
