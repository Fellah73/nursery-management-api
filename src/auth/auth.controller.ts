import { Body, Controller, Get, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import { Request, Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get() // GET auth/
  getAuth() {
    return this.authService.getAuth();
  }
  @Get('/me') // GET auth/me
  getLoggingStatus(@Req() req: Request, @Res() res: Response) {
    return this.authService.getLoggingStatus(req, res);
  }

  @Post('/login') // POST auth/login
  login(@Body() body: LoginDto, @Res() res: Response) {
    return this.authService.login(body, res);
  }

  @Post('/register') // POST auth/register
  register(@Body() body: RegisterDto, @Res() res: Response) {
    return this.authService.register(body, res);
  }

  @Post('/logout') // POST auth/logout
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Get('/forgot-password') // GET auth/forgot-password  //done
  forgotPassword(@Query() query: { email: string }, @Res() res: Response) {
    return this.authService.forgotPassword(query.email, res);
  }

  @Get('/secret-question') // GET auth/secret-question  //done
  getSecretQuestion(@Res() res: Response) {
    return this.authService.getSecretQuestion(res);
  }

  @Get('/verify-secret-answer') // GET auth/verify-secret-answer  //done
  verifySecretAnswer(
    @Query() query: { email: string; answer: string },
    @Res() res: Response,
  ) {
    return this.authService.verifySecretAnswer(query.email, query.answer, res);
  }

  @Patch('/reset-password') // PATCH auth/reset-password  //done
  resetPassword(
    @Body() body: { email: string; newPassword: string },
    @Res() res: Response,
  ) {
    return this.authService.resetPassword(body.email, body.newPassword, res);
  }

  @Post('/add-question') // POST auth/add-question  //done
  addQuestion(
    @Body() body: { user_id: string; question: string },
    @Res() res: Response,
  ) {
    return this.authService.addQuestion(body.user_id, body.question, res);
  }
  @Post('/add-answer') // POST auth/add-answer  //done
  addAnswer(
    @Body() body: { email: string; answer: string; question_id: string },
    @Res() res: Response,
  ) {
    return this.authService.addAnswer(
      body.email,
      body.answer,
      body.question_id,
      res,
    );
  }
}
