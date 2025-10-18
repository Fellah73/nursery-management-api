// src/attendance/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const admin_id = request.query.admin_id || request.body.admin_id;
    
    if (!admin_id) {
      throw new ForbiddenException('Admin ID is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: Number(admin_id) },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}