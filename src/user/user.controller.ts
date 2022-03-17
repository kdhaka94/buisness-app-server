import { Body, Controller, Post } from '@nestjs/common';
import { SearchUserDto, ReportUserDto } from './dto/user';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('searchUser')
  searchUser(@Body() dto: SearchUserDto) {
    return this.userService.searchUser(dto)
  }
  @Post('reportUser')
  reportUser(@Body() dto: ReportUserDto) {
    return this.userService.reportUser(dto)
  }
}
