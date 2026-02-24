import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsGuard } from './gurads/assignment.guard';
import { AssignmentsClassRoomGuard } from './gurads/classroom.gurad';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsClassRoomGuard, AssignmentsGuard],
})
export class AssignmentsModule {}
