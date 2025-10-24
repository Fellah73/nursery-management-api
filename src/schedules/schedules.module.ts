import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SchedulesAuthGuard } from './guards/auth/auth.guard';
import { SchedulesClassroomsGuard } from './guards/services/classroom.guard';
import { SchedulesPeriodGuard } from './guards/services/period.guard';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SchedulesService,
    SchedulesAuthGuard,
    SchedulesPeriodGuard,
    SchedulesClassroomsGuard,
  ],
  controllers: [SchedulesController],
})
export class SchedulesModule {}
