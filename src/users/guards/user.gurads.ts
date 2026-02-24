import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_id = request.params.id;

    if (!user_id) {
      throw new ForbiddenException('User ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(user_id) },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return true;
  }
}
