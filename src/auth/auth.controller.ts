import { Controller, Post, Headers, Request } from '@nestjs/common';
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

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    this.authService.checkTokenType(req.user, true);
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    }
  }

  // @Post('token/access')
  // async rotateAccessToken(@Headers('authorization') token: string) {
  //   const payload = await this.authService.parseBearerToken(token);

  //   return {
  //     accessToken: await this.authService.issueToken(payload, false),
  //   }
  // }

}
