import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SettingsAuthGuard } from './guard/auth.guard';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsAuthGuard, JwtService],
})
export class SettingsModule {}
