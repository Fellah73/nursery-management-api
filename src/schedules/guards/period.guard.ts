import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulesPeriodGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const periodId = request.params.periodId || request.query.periodId || request.body.periodId;

    if (!periodId) {
      throw new ForbiddenException('Period ID is required');
    }

    const period = await this.prismaService.schedulePeriod.findUnique({
      where: { id: Number(periodId) },
    });

    if (!period) {
      throw new ForbiddenException('Period not found');
    }

    return true;
  }
}
  