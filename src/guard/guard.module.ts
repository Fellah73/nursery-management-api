import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GlobalAuthGuard } from './guards/auth.guard';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET_KEY,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN),
      },
    }),
  ],
  providers: [GlobalAuthGuard],
  exports: [GlobalAuthGuard, JwtModule],
})
export class GuardModule {}
