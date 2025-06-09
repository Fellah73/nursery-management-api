import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChildrenController],
  providers: [ChildrenService]
})
export class ChildrenModule {}
