import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportUserDto, SearchUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {

  }
  async searchUser(dto: SearchUserDto) {
    const users = await this.prisma.user.findMany({
      where: {
        [dto.selectionBy]: {
          contains: dto.selectionId
        }
      },
      select: {
        addressOfBuisness: true,
        designation: true,
        gstNumber: true,
        email: true,
        panNumber: true,
        mobileNumber: true,
        typeOfBuisness: true,
        tradeName: true,
        id: true
      }
    })

    if (users.length === 0) {
      throw new ForbiddenException("No one found with the selection criteria")
    }

    return users;
  }

  async reportUser(dto: ReportUserDto, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId
      }
    })

    if (!user) {
      throw new ForbiddenException("No user found with this data")
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: dto.userId
      },
      data: {
        reportedBy: {
          connect: {
            id: currentUser.sub
          }
        }
      },
      select: {
        addressOfBuisness: true,
        designation: true,
        gstNumber: true,
        email: true,
        panNumber: true,
        mobileNumber: true,
        typeOfBuisness: true,
        tradeName: true,
        id: true,
        reportedBy: {
          select: {
            id: true,
            mobileNumber: true,
            email: true
          }
        }
      }
    })
    return updatedUser;
  }
  async getMe(currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub
      }
    })

    delete me.password;

    return me
  }
}
