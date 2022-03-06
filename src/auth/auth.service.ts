import { Injectable } from '@nestjs/common';


@Injectable()
export class AuthService {
  signin(req) {
    return { req };
  }

  signup() {
    return 'SIGN UP';
  }
}
