import { Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.registerUser(token);
  }
  
  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.loginUser(token);
  }

}
