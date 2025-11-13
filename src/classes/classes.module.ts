import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClassesAuthGuard } from './guards/auth.gurad';
import { ClassesTeacherGuard } from './guards/teacher.guard';
import { ClassesGuard } from './guards/class.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesAuthGuard,ClassesTeacherGuard,ClassesGuard],
})
export class ClassesModule {}
