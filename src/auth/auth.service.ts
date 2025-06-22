import { Body, Injectable, Query, Req, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import * as jwt from 'jsonwebtoken';
import { Response,Request } from 'express';
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
        return res.status(404).json({
          message: 'User not found',
          success: false,
        });
      }
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password,
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          message: 'Wrong information',
          success: false,
        });
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
        sameSite: 'lax',
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
          message: 'utilisateur déjà existant',
          success: false,
          statusCode: 409,
        });
      }
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);
      if (!hashedPassword) {
        return res.status(500).json({
          message: 'Erreur lors du hachage du mot de passe',
          success: false,
          statusCode: 500
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
        user: userWithoutPassword,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: `registration failed ${error.message ?? error}`,
        success: false,
      });
    }
  }
  logout(@Res() res: Response) {
    try {
      res.clearCookie('authToken');
      return res.status(200).json({
        message: 'Logout successful',
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Logout failed',
        error: error.message || error,
        success: false,
      });
    }
  }
  async getLoggingStatus(@Req() req: Request, @Res() res: Response) {
    try {
  
      const token = req.cookies?.authToken || null;

      if (!token) {
        return res.status(401).json({
          message: 'no token provided',
          success: false,
        });
      }

      // Vérifier et décoder le token
      const payload = jwt.verify(token, process.env.AUTH_SECRET_KEY!) as any;

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false,
        });
      }
      
      // user without password
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        user: userWithoutPassword,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to retrieve logging status',
        success: false,
      });
    }
  }

  async forgotPassword(@Query('email') email: string, @Res() res: Response) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false,
        });
      }
      const secretQuestion = await this.prismaService.userResponse.findFirst({
        where: { user_id: user.id },
        include: {
          question: {
            select: {
              label: true,
            },
          },
        },
      });

      if (!secretQuestion) {
        return res.status(404).json({
          message: 'Pas de question de sécurité trouvée pour cet utilisateur',
          success: false,
        });
      }

      return res.status(200).json({
        message: 'Password reset link sent to your email',
        question: secretQuestion.question.label,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error processing forgot password request',
        error: error.message || error,
        success: false,
      });
    }
  }
  async verifySecretAnswer(
    @Query('email') email: string,
    @Query('answer') answer: string,
    @Res() res: Response,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false,
        });
      }
      const secretQuestion = await this.prismaService.userResponse.findFirst({
        where: { user_id: user.id },
        include: {
          question: {
            select: {
              label: true,
            },
          },
        },
      });

      if (!secretQuestion) {
        return res.status(404).json({
          message: 'No security question found for this user',
          success: false,
        });
      }

      const isAnswerCorrect =
        secretQuestion.response.toLowerCase() === answer.toLowerCase();
      if (!isAnswerCorrect) {
        return res.status(400).json({
          message: 'Incorrect answer to the security question',
          success: false,
        });
      }

      return res.status(200).json({
        message: 'Secret answer verified successfully',
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error verifying secret answer',
        error: error.message || error,
        success: false,
      });
    }
  }

  async addQuestion(user_id: string, question: string, @Res() res: Response) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: Number(user_id) },
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return res.status(404).json({
          message: 'unable to add question',
          success: false,
        });
      }

      const existingQuestion = await this.prismaService.question.findFirst({
        where: { label: question },
      });

      if (existingQuestion) {
        return res.status(409).json({
          message: 'Question already exists',
          success: false,
        });
      }

      const newQuestion = await this.prismaService.question.create({
        data: { label: question },
      });

      if (!newQuestion) {
        return res.status(500).json({
          message: 'Error adding security question',
          success: false,
        });
      }
      const questions = await this.prismaService.question.findMany({});

      return res.status(201).json({
        message: 'Security question added successfully',
        data: questions,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error adding security question',
        error: error.message || error,
        success: false,
      });
    }
  }

  async addAnswer(
    email: string,
    answer: string,
    question_id: string,
    @Res() res: Response,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res.status(404).json({
          message: 'Unable to add answer',
          success: false,
        });
      }

      const question = await this.prismaService.question.findUnique({
        where: { id: Number(question_id) },
      });

      if (!question) {
        return res.status(404).json({
          message: 'Question not found',
          success: false,
        });
      }

      const newResponse = await this.prismaService.userResponse.create({
        data: {
          response: answer,
          user_id: user.id,
          question_id: question.id,
        },
      });

      if (!newResponse) {
        return res.status(500).json({
          message: 'Error adding security answer',
          success: false,
        });
      }

      return res.status(201).json({
        message: 'Security answer added successfully',
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error adding security answer',
        error: error.message || error,
        success: false,
      });
    }
  }

  async resetPassword(
    email: string,
    newPassword: string,
    @Res() res: Response,
  ) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false,
        });
      }

      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      if (!hashedPassword) {
        return res.status(500).json({
          message: 'Error hashing password',
          success: false,
        });
      }

      const updatedUser = await this.prismaService.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      if (!updatedUser) {
        return res.status(500).json({
          message: 'Failed to update password',
          success: false,
        });
      }

      const { password, ...userWithoutPassword } = updatedUser;

      const token = jwt.sign(
        { email: updatedUser.email },
        process.env?.AUTH_SECRET_KEY!,
        {
          expiresIn: '60m',
        },
      );
      res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        sameSite: 'lax',
        secure: false, // Set to true if using HTTPS
        path: '/',
      });

      return res.status(200).json({
        message: 'Password reset successfully',
        user: userWithoutPassword,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error resetting password',
        error: error.message || error,
        success: false,
      });
    }
  }

  async getSecretQuestion(@Res() res: Response) {
    try {
      const secretQuestions = await this.prismaService.question.findMany({});

      if (!secretQuestions || secretQuestions.length === 0) {
        return res.status(404).json({
          message: 'No security question found for this user',
          success: false,
        });
      }

      return res.status(200).json({
        message: 'Security question retrieved successfully',
        question: secretQuestions,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving security question',
        error: error.message || error,
        success: false,
      });
    }
  }
}
