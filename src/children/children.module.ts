import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { ChildrenAuthGuard } from './gurads/auth/auth.guard';
import { ChildrenGuard } from './gurads/child/child.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ChildrenController],
  providers: [ChildrenService, ChildrenAuthGuard, ChildrenGuard],
})
export class ChildrenModule {}
