import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuPeriodsGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const periodId = request.params.periodId || request.query.periodId || request.body.periodId;

    if (!periodId) {
      throw new ForbiddenException('Period ID is required');
    }

    if (periodId === 'new') {
      return true;
    }

    const period = await this.prismaService.menuPeriod.findUnique({
      where: { id: Number(periodId) },
    });

    if (!period) {
      throw new ForbiddenException('menu period not found');
    }

    return true;
  }
}
  