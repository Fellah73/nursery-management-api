import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '../enums/user-role.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // public route
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.authToken;

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.AUTH_SECRET_KEY,
      });

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new ForbiddenException('Utilisateur non trouvé');
      }

      const requiredRoles = this.reflector.getAllAndMerge<UserRole[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(user.role as UserRole)) {
          throw new ForbiddenException(
            `Rôle insuffisant. Rôles requis: ${requiredRoles.join(', ')}`,
          );
        }
      }

      request.user = user;

      return true;
    } catch (error) {
      throw error;
    }
  }
}
