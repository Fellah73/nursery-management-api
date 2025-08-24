import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChildrenModule } from './children/children.module';
import { MenuModule } from './menu/menu.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, ChildrenModule, MenuModule, TeachersModule, ClassesModule, AssignmentsModule, SchedulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
