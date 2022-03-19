import { ForbiddenException, HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { ValidationError } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

  async signin(dto: SignInDto) {
    // get the user
    const user = await this.prisma.user.findUnique({
      where: {
        mobileNumber: dto.mobileNumber
      },
      select: {
        id: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
        gstNumber: true,
        password: true,
        username: true
      }
    })

    if (!user) {
      throw new ForbiddenException("Credentials incorrect")
    }
    // match password
    const pwMatches = await argon.verify(user.password, dto.password)

    if (!pwMatches) {
      throw new ForbiddenException("Credentials incorrect")
    }

    delete user.password;

    // generate a jwt token

    return this.signToken(user.id, user.mobileNumber);

  }
  async signToken(userId: string, mobileNumber: string) {

    const payload = {
      sub: userId,
      mobileNumber
    }
    const secret = this.config.get("JWT_SECRET")
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret
    });
    return {
      access_token: token
    }
  }



  async signup(dto: SignUpDto) {
    // generate hash
    const hash = await argon.hash(dto.password);
    dto.password = hash;

    // check for the gst number
    const gstNumber = await this.prisma.gstNumber.findFirst({
      where: {
        gstNumberId: dto.gstNumber
      }
    })
    // check if gst number is found
    if (!gstNumber) {
      throw new HttpException("GST Number not found in our database.", HttpStatus.CONFLICT)
    }

    dto.gstNumberId = gstNumber.id;
    // save user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          ...dto,
        },
        select: {
          id: true,
          email: true,
          mobileNumber: true,
          createdAt: true,
          gstNumber: true,
          username: true
        }
      })

      // return the record of the user
      // return user;
      return this.signToken(user.id, user.mobileNumber);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw error;
    }


  }
}
