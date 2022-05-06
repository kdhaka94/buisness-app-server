import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SearchUserDto, ReportUserDto } from './dto/user';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('searchUser')
  searchUser(@Body() dto: SearchUserDto, @Req() req: Request) {
    return this.userService.searchUser(dto)
  }
  @Post('reportUser')
  reportUser(@Body() dto: ReportUserDto, @Req() { user }: Request) {
    return this.userService.reportUser(dto, user)
  }

  @Post('me')
  getMe(@Req() { user }: Request) {
    return this.userService.getMe(user)
  }

  @Post('paymentToken')
  paymentToken(@Req() { user }: Request) {
    return this.userService.getPaymentToken(user);
  }

  @Post('verifyPayment')
  verifyPayment(@Req() { user, body }: Request) {
    return this.userService.verifyPayment(user, body.data);
  }
}
