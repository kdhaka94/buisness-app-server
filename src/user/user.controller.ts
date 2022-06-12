import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { MerchantInfoDto } from './dto';
import { SearchUserDto, ReportUserDto } from './dto/user';
import { UserService } from './user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('searchUser')
  searchUser(@Body() dto: SearchUserDto, @Req() { user }: Request) {
    return this.userService.searchUser(dto, user);
  }
  @Post('reportUser')
  reportUser(@Body() dto: ReportUserDto, @Req() { user }: Request) {
    return this.userService.reportUser(dto, user);
  }
  @Post('blockUser')
  blockUser(@Body() dto: ReportUserDto, @Req() { user }: Request) {
    return this.userService.blockUser(dto, user);
  }
  @Post('unblockUser')
  unblockUser(@Body() dto: ReportUserDto, @Req() { user }: Request) {
    return this.userService.unblockUser(dto, user);
  }
  @Post('setPaymentInfo')
  setPaymentInfo(@Body() dto: MerchantInfoDto, @Req() { user }: Request) {
    return this.userService.setPaymentInfo(dto, user);
  }
  @Post('getPaymentInfo')
  getPaymentInfo(@Req() { user }: Request) {
    return this.userService.getPaymentInfo(user);
  }

  @Post('me')
  getMe(@Req() { user }: Request) {
    return this.userService.getMe(user);
  }

  @Post('paymentToken')
  paymentToken(@Req() { user }: Request) {
    return this.userService.getPaymentToken(user);
  }

  @Post('verifyPayment')
  verifyPayment(@Req() { user, body }: Request) {
    return this.userService.verifyPayment(user, body.data);
  }

  @Post('allUsers')
  allUsers(@Req() { user }: Request) {
    return this.userService.getAllUsers(user);
  }
}
