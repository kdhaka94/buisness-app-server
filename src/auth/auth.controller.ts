import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signin')
  signin(@Body() dto: any) {
    console.log({ dto })
    return this.authService.signin(dto)
  }

  @Post('signup')
  signup(@Req() dto: SignUpDto) {
    return this.authService.signup(dto)
  }
}
