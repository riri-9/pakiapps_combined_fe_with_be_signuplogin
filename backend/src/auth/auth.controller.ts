import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthResponse } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginDto): Promise<AuthResponse> {
    return this.authService.login(body);
  }
}
