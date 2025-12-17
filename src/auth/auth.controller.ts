import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto } from './dto/auth-dto';
import { ValidateRegisterUserPipe } from './pipe/validate-register';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // service : done
  @Get()
  getAuth() {
    return this.authService.getAuth();
  }

  // service : done
  @Get('/me')
  getLoggingStatus(@Req() req: Request) {
    return this.authService.getLoggingStatus(req);
  }


  // service : done
  @Post('/revalidate')
  getLoggingStatusRevalidation(@Req() req: Request,
  @Res() res: Response,
  @Query('email') email: string) {
    return this.authService.loggingStatusRevalidation(req,res, email);
  }

  // service : done
  @Post('/login')
  login(@Body() body: LoginDto, @Res() res: Response) {
    return this.authService.login(body, res);
  }

  // pipe : done , service : done
  @Post('/register')
  register(
    @Body(ValidateRegisterUserPipe) body: RegisterDto,
    @Res() res: Response,
  ) {
    return this.authService.register(body, res);
  }

  // service : presque-done
  @Post('/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  // service : testing
  @Get('/forgot-password')
  forgotPassword(@Query() query: { email: LoginDto['email'] }) {
    return this.authService.forgotPassword(query.email);
  }

  // service : done
  @Get('/secret-question')
  getSecretQuestions() {
    return this.authService.getSecretQuestions();
  }

  // service : done
  @Get('/verify-secret-answer')
  verifySecretAnswer(@Query() query: ForgotPasswordDto) {
    return this.authService.verifySecretAnswer(query);
  }

  // service : done
  @Patch('/reset-password')
  resetPassword(@Body() body: LoginDto, @Res() res: Response) {
    return this.authService.resetPassword(body, res);
  }

  // service : done
  @Post('/add-answer')
  addAnswer(@Body() body: ForgotPasswordDto) {
    return this.authService.addAnswer(body);
  }
}
