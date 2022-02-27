import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signin')
  signin(@Body() req) {
    return this.authService.signin()
  }

  @Post('signup')
  signup(@Req() req) {
    return this.authService.signup()
  }
}
