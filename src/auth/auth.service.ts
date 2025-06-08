import { Injectable } from '@nestjs/common';
import { error } from 'console';
import { stat } from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAuth() {
    const response = await this.prismaService.user.findMany();
    if (!response || response.length === 0) {
      return {
        message: 'No users found',
        statusCode: 404,
      };
    }
    return {
      message: 'Users retrieved successfully',
      data: response,
    };
  }

  getProfile() {
    return 'Profile endpoint';
  }
  login() {
    return 'Login endpoint';
  }
  register(body: any) {
    console.log('Registering user with data:', body);
    return this.prismaService.user.create({
      data: body,
    });
  }
  forgotPassword() {
    return 'Forgot password endpoint';
  }
  logout() {
    return 'Logout endpoint';
  }
}
