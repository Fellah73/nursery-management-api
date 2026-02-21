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

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.authToken;

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.AUTH_SECRET_KEY || 'your-secret-key',
      });

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new ForbiddenException('Utilisateur non trouvé');
      }

      // 4. Vérifier les rôles requis
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        'roles',
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(user.role as UserRole)) {
          throw new ForbiddenException(
            `Rôle insuffisant. Rôles requis: ${requiredRoles.join(', ')}`,
          );
        }
      }

      //Attacher l'utilisateur à la requête (accessible dans le controller)
      request.user = user;

      return true;
    } catch (error) {
      throw error;
    }
  }
}
