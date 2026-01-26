import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingsAuthGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const admin_id = request.query.admin_id || request.params.admin_id;

    if (!admin_id) {
      throw new ForbiddenException('Admin ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(admin_id) },
    });

    if (!user) {
      throw new ForbiddenException('Super Admin access required');
    }

    return true;
  }
}
  