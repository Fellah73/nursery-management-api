import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth-dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get() // GET auth/
  getAuth() {
    return this.authService.getAuth();
  }
  @Get('/me') // GET auth/me
  getLoggingStatus() {
    return this.authService.getLoggingStatus();
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
}
