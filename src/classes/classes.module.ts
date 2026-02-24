import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassesGuard } from './guards/class.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesGuard],
})
export class ClassesModule {}
