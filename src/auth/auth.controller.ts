import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signin')
  signin(@Body() req) {
    return this.authService.signin(req)
  }

  @Post('signup')
  signup(@Body() req) {
    return this.authService.signup()
  }
}
