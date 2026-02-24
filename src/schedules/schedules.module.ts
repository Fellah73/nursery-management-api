import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SchedulesClassroomsGuard } from './guards/classroom.guard';
import { SchedulesPeriodGuard } from './guards/period.guard';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SchedulesService,
    SchedulesPeriodGuard,
    SchedulesClassroomsGuard,
  ],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
