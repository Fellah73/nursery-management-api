import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsAuthGuard } from './gurads/auth/auth.gard';
import { AssignmentsClassRoomGuard } from './gurads/classroom/classroom.gurad';
import { AssignmentsGuard } from './gurads/assignment/assignment.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController],
  providers: [
    AssignmentsService,
    AssignmentsAuthGuard,
    AssignmentsClassRoomGuard,
    AssignmentsGuard,
  ],
})
export class AssignmentsModule {}
