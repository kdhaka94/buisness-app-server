import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportUserDto, SearchUserDto } from './dto';
import { PaytmChecksum } from './paytm/checksum'
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
        id: true,
        username: true
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
        username: true,
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

  async getPaymentToken(currentUser: any): Promise<any> {

    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub
      }
    })

    let paytmParams = {};
    paytmParams["MID"] = "DGgeEm22265131278555";
    paytmParams["ORDERID"] = randomUUID();
    paytmParams["TXN_AMOUNT"] = '100';
    paytmParams["WEBSITE"] = 'WEBSTAGING';
    paytmParams["CUST_ID"] = "USER_" + me.id

    const paytmChecksum = await PaytmChecksum.generateSignature(paytmParams, "EpUQGhs_2whyCGPy");
    const verifyChecksum = await PaytmChecksum.verifySignature(paytmParams, "EpUQGhs_2whyCGPy", paytmChecksum);

    console.log({ paytmChecksum, paytmParams, verifyChecksum })

    if (verifyChecksum) {
      return {
        ...paytmParams,
        CHECKSUMHASH: paytmChecksum
      };
    }
    throw new ForbiddenException("Failed to generate checksum")
  }

  async verifyPayment(currentUser: any) {
    const me = await this.prisma.user.update({
      where: {
        id: currentUser.sub
      },
      data: {
        isPaymentDone: true
      }
    })
    return me;
  }
}

