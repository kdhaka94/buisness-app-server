import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

  signin() {
    return 'SIGN IN'
  }

  signup() {
    return 'SIGN UP'
  }
}
