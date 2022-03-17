import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportUserDto, SearchUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {

  }
  async searchUser(dto: SearchUserDto) {
    const users = await this.prisma.user.findMany({
      where: {
        [dto.selectionBy]: dto.selectionId
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
      }
    })

    if (users.length === 0) {
      throw new ForbiddenException("No one found with the selection criteria")
    }

    return users;
  }

  async reportUser(dto: ReportUserDto) {
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
            id: dto.userId
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
}
