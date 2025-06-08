import { Injectable, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
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
    const usersWithoutPassword = response.map(({ password, ...user }) => user);
    return {
      message: 'Users retrieved successfully',
      data: usersWithoutPassword,
    };
  }

  async login(body: LoginDto, @Res() res: Response) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });
      if (!user) {
        return {
          message: 'User not found',
          statusCode: 404,
        };
      }
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          message: 'Wrong information',
          statusCode: 401,
        };
      }

      const token = jwt.sign(
        { email: user.email },
        process.env?.AUTH_SECRET_KEY!,
        {
          expiresIn: '60m',
        },
      );
      res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        sameSite: 'strict',
        secure: false, // Set to true if using HTTPS
        path: '/',
      });
      return res.status(200).json({
        message: 'Login successful',
        statusCode: 200,
        role: user.role,
        success: true,
      });
    } catch (error) {
      return {
        message: 'Login failed',
        statusCode: 500,
        error: error.message || error,
        success: false,
      };
    }
  }
  async register(body: RegisterDto, @Res() res: Response) {
    try {
      const isExistingUser = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });
      if (isExistingUser) {
        return res.status(409).json({
          message: 'User already exists',
          statusCode: 409,
        });
      }
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);
      if (!hashedPassword) {
        return res.status(500).json({
          message: 'Error hashing password',
          statusCode: 500,
        });
      }
      const newUser = await this.prismaService.user.create({
        data: {
          ...body,
          password: hashedPassword,
        },
      });
      const token = jwt.sign(
        { email: body.email },
        process.env?.AUTH_SECRET_KEY!,
        {
          expiresIn: '60m',
        },
      );

      res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1h
        sameSite: 'strict',
        secure: false, // Set to true if using HTTPS
        path: '/',
      });
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        message: 'Registration successful',
        statusCode: 201,
        data: userWithoutPassword,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Registration failed',
        statusCode: 500,
        error: error.message || error,
        success: false,
      });
    }
  }
  logout(@Res() res: Response) {
    try {
      res.clearCookie('authToken');
      return res.status(200).json({
        message: 'Logout successful',
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Logout failed',
        statusCode: 500,
        error: error.message || error,
        success: false,
      });
    }
  }
  async getLoggingStatus() {
    try {
      const cookieStore = globalThis?.cookieStore || new Map();
      const cookie = await cookieStore.get('authToken');
      const token = cookie?.value || null;

      if (!token) {
        return {
          error: 'No token',
          success: false,
        };
      }

      // Vérifier et décoder le token
      const payload = jwt.verify(token, process.env.AUTH_SECRET_KEY!) as any;

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return {
          error: 'User not found',
          success: false,
        };
      }

      return {
        user: user,
        success: true,
      };
    } catch (error) {
      return {
        error: 'Failed to retrieve logging status',
        success: false,
      };
    }
  }
}
