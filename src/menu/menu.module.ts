import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { AuthGuard } from './guards/auth/auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [MenuController],
  providers: [MenuService, AuthGuard],
})
export class MenuModule {}
