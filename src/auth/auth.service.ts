import { Body, Injectable, Query, Req, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth-dto';
@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private formatUser(user: any) {
    const { password, created_at, updated_at, ...formattedUser } = user;
    return formattedUser;
  }
  // service : done
  async getAuth() {
    const allUsers = await this.prismaService.user.findMany();
    if (!allUsers || allUsers.length === 0) {
      return {
        message: 'No users found',
        statusCode: 404,
      };
    }
    return {
      message: 'Users retrieved successfully',
      data: allUsers.map(this.formatUser),
    };
  }

  // service : done
  async getLoggingStatus(@Req() req: Request) {
    try {
      const token = req.cookies?.authToken || null;

      if (!token) {
        return {
          message: 'no token provided',
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
          message: 'User not found',
          success: false,
        };
      }

      return {
        user: this.formatUser(user),
        message: 'User is authenticated',
        success: true,
      };
    } catch (error) {
      return {
        error: 'Failed to retrieve logging status',
        success: false,
      };
    }
  }

  // service : done
  async login(@Body() body: LoginDto, @Res() res: Response) {
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

  // service : done
  async register(body: RegisterDto, @Res() res: Response) {
    try {
      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      if (!hashedPassword) {
        return res.status(500).json({
          message: 'Erreur lors du hachage du mot de passe',
          success: false,
          statusCode: 500,
        });
      }

      const registerBody = {
        ...body,
        phone: Number(body.phone),
        password: hashedPassword,
      };

      const newUser = await this.prismaService.user.create({
        data: registerBody,
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
        maxAge: 60 * 60 * 1000,
        sameSite: 'strict',
        secure: false, // Set to true if using HTTPS
        path: '/',
      });

      return res.status(201).json({
        message: 'Registration successful',
        user: this.formatUser(newUser),
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: `registration failed ${error.message ?? error}`,
        success: false,
      });
    }
  }

  // service : done
  async logout(@Req() req: Request, @Res() response: Response) {
    try {
      const token = req.cookies?.authToken || null;
      if (!token) {
        return {
          message: 'No token provided',
          success: false,
        };
      }

      const payload = jwt.verify(token, process.env.AUTH_SECRET_KEY!) as any;

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return response.status(404).json({
          message: 'User not found',
          success: false,
        });
      }

      response.setHeader(
        'Set-Cookie',
        'authToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax',
      );

      return response.status(200).json({
        message: 'Logout successful',
        success: true,
      });
    } catch (error) {
      return {
        message: error.message || error,
        success: false,
      };
    }
  }

  // service : done
  async forgotPassword(@Query('email') email: LoginDto['email']) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          message: 'User not found',
          success: false,
        };
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
        return {
          message: 'Pas de question de sécurité trouvée pour cet utilisateur',
          success: false,
        };
      }

      return {
        message: 'Password reset question sent successfully',
        question: secretQuestion.question.label,
        success: true,
      };
    } catch (error) {
      return {
        message: 'Error processing forgot password request',
        error: error.message || error,
        success: false,
      };
    }
  }

  // service : done
  async getSecretQuestions() {
    try {
      const secretQuestions = await this.prismaService.question.findMany({});

      if (!secretQuestions || secretQuestions.length === 0) {
        return {
          message: 'No security question found for this user',
          success: false,
        };
      }

      return {
        message: 'Security question retrieved successfully',
        question: secretQuestions.map((q) => ({ id: q.id, label: q.label })),
        success: true,
      };
    } catch (error) {
      return {
        message: 'Error retrieving security question',
        error: error.message || error,
        success: false,
      };
    }
  }

  // service : done
  async verifySecretAnswer(@Query() query: ForgotPasswordDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: query.email },
      });
      if (!user) {
        return {
          message: 'User not found',
          success: false,
          statusCode: 404,
        };
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
        return {
          message: 'No security question found for this user',
          success: false,
          statusCode: 404,
        };
      }

      // verify same labels
      if (query.questionId !== secretQuestion?.question_id.toString()) {
        return {
          message: 'Question label does not match',
          error: 'question',
          success: false,
          statusCode: 400,
        };
      }

      // verify same answers
      const isAnswerCorrect =
        secretQuestion.response.toLowerCase() === query.answer.toLowerCase();
      if (!isAnswerCorrect) {
        return {
          message: 'Incorrect answer to the security question',
          error: 'answer',
          success: false,
          statusCode: 400,
        };
      }
      return {
        message: 'Secret answer verified successfully',
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'Error verifying secret answer',
        error: error.message || error,
        success: false,
        statusCode: 500,
      };
    }
  }

  // service : done
  async resetPassword(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false,
          statusCode: 404,
        });
      }

      const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS as string, 10) || 5;
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);
      if (!hashedPassword) {
        return res.status(500).json({
          message: 'Error hashing password',
          success: false,
        });
      }

      const updatedUser = await this.prismaService.user.update({
        where: { email: body.email },
        data: { password: hashedPassword },
      });

      if (!updatedUser) {
        return res.status(500).json({
          message: 'Failed to update password',
          success: false,
        });
      }

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
        user: this.formatUser(updatedUser),
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

  // service : done
  async addAnswer(@Body() body: ForgotPasswordDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });

      // check if user exists
      if (!user) {
        return {
          message: 'Unable to add answer',
          success: false,
          statusCode: 404,
        };
      }

      const question = await this.prismaService.question.findUnique({
        where: { id: Number(body.questionId) },
      });

      // check if question exists
      if (!question) {
        return {
          message: 'Question not found',
          success: false,
          statusCode: 404,
        };
      }

      const existingResponse = await this.prismaService.userResponse.findFirst({
        where: {
          user_id: user.id,
        },
      });

      // check if answer already exists for this user
      if (existingResponse) {
        return {
          message: 'Answer already exists for this user',
          error: 'duplicate_answer',
          success: false,
          statusCode: 400,
        };
      }

      const newResponse = await this.prismaService.userResponse.create({
        data: {
          response: body.answer,
          user_id: user.id,
          question_id: question.id,
        },
      });

      if (!newResponse) {
        return {
          message: 'Error adding security answer',
          success: false,
          statusCode: 500,
        };
      }

      return {
        message: 'Security answer added successfully',
        success: true,
        statusCode: 201,
      };
    } catch (error) {
      return {
        message: 'Error adding security answer',
        error: error.message || error,
        success: false,
      };
    }
  }
}
