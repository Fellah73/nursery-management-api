import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserAuthGuard } from './guards/auth/auth.guards';
import { UserGuard } from './guards/user/user.gurads';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UserAuthGuard, UserGuard],
  controllers: [UsersController],
})
export class UsersModule {}
