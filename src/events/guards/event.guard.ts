import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const event_id = request.params.id;

    if (!event_id) {
      throw new ForbiddenException('Event ID is required');
    }

    const event = await this.prismaService.event.findUnique({
      where: { id: Number(event_id) },
    });

    if (!event) {
      throw new ForbiddenException('Event not found');
    }

    return true;
  }
}
  