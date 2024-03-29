import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SignUpFromAdminDto } from 'src/auth/dto';
import { MerchantInfoDto } from './dto';
import { ReportUserDto, SearchUserDto, UpdateUserDto } from './dto/user';
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
  @Post('updateProfile')
  updateProfile(@Body() dto: UpdateUserDto, @Req() { user }: Request) {
    return this.userService.updateUser(dto, user);
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
  @Post('verifyMe')
  verifyMe(@Body() { otp }: { otp: string }, @Req() { user, body }: Request) {
    return this.userService.verifyMe(otp, user);
  }

  @Post('allUsers')
  allUsers(@Req() { user }: Request) {
    return this.userService.getAllUsers(user);
  }
  @Post('sendVerificationCode')
  sendVerificationCode(@Req() { user }: Request) {
    return this.userService.sendVerificationCode(user);
  }
  @Post('signUpUser')
  signUpUser(@Body() dto: SignUpFromAdminDto, @Req() { user }: Request) {
    return this.userService.signUpFromAdmin(dto, user);
  }
}
