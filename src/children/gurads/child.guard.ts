import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChildrenGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const child_id = request.params.id || request.query.id || request.body.id;

    if (!child_id) {
      throw new ForbiddenException('Child ID is required');
    }

    const child = await this.prismaService.children.findUnique({
      where: { id: Number(child_id) },
    });

    if (!child) {
      throw new ForbiddenException('Child not found');
    }

    return true;
  }
}
