import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get() // GET auth/
  getAuth() {
    return this.authService.getAuth();
  }

  @Get('/me') // GET auth/me
  getProfile() {
    return this.authService.getProfile();
  }

  @Post('/login') // POST auth/login
  login() {
    return this.authService.login();
  }
  @Post('/register') // POST auth/register
  register(@Body () body: any) {
    return this.authService.register(body);
  }

  @Post('/forgot-password') // POST auth/forgot-password
  forgotPassword() {
    return this.authService.forgotPassword();
  }

  @Post('/logout') // POST auth/logout
  logout() {
    return this.authService.logout();
  }
}
