import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeachersAuthGuard } from './guards/auth/auth.guard';
import { TeachersGuard } from './guards/teacher/teacher.guard';

@Module({
  imports: [PrismaModule],
  providers: [TeachersService, TeachersAuthGuard, TeachersGuard],
  controllers: [TeachersController],
})
export class TeachersModule {}
