import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { ChildrenGuard } from './gurads/child.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ChildrenController],
  providers: [ChildrenService, ChildrenGuard],
})
export class ChildrenModule {}
