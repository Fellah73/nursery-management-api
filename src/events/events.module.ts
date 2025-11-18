import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsAuthGuard } from './guards/auth.guard';
import { EventsGuard } from './guards/event.guard';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController],
  providers: [EventsService, EventsAuthGuard, EventsGuard],
})
export class EventsModule {}
