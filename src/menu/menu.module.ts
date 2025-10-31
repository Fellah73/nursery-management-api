import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { AuthGuard } from './guards/auth/auth.guard';
import { MenuPeriodsGuard } from './guards/period/period.guard';

@Module({
  imports: [PrismaModule],
  controllers: [MenuController],
  providers: [MenuService, AuthGuard, MenuPeriodsGuard],
})
export class MenuModule {}
