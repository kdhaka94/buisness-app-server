import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { SignUpDto, SignUpFromAdminDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MerchantInfoDto, ReportUserDto, SearchUserDto, UpdateUserDto } from './dto';
import { getDifferenceBetweenDates } from './utils/date-time-helper';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

// import { PaytmChecksum } from './paytm/checksum'
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async searchUser(dto: SearchUserDto, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });
    if (!me.isPaymentDone) {
      throw new ForbiddenException('Please complete payment before using this service');
    }
    const users = await this.prisma.user.findMany({
      where: {
        [dto.selectionBy]: {
          contains: dto.selectionId,
        },
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
      },
    });

    if (users.length === 0) {
      throw new ForbiddenException('No one found with the selection criteria');
    }

    return users;
  }

  async reportUser(dto: ReportUserDto, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new ForbiddenException('No user found with this data');
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        reportedBy: {
          connect: {
            id: currentUser.sub,
          },
        },
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
            email: true,
          },
        },
      },
    });
    return updatedUser;
  }

  async blockUser(dto: ReportUserDto, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });
    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new ForbiddenException('No user found with this data');
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        isBlocked: true,
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
            email: true,
          },
        },
      },
    });
    return updatedUser;
  }

  async unblockUser(dto: ReportUserDto, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });
    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new ForbiddenException('No user found with this data');
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: dto.userId,
      },
      data: {
        isBlocked: false,
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
            email: true,
          },
        },
      },
    });
    return updatedUser;
  }

  async getMe(currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
      select: {
        addressOfBuisness: true,
        designation: true,
        email: true,
        createdAt: true,
        gstNumber: true,
        id: true,
        isAdmin: true,
        isBlocked: true,
        isPaymentDone: true,
        mobileNumber: true,
        panNumber: true,
        isAccountVerified: true,
        reportedBy: {
          select: {
            id: true,
            mobileNumber: true,
            email: true,
            gstNumber: true,
          },
        },
        startYear: true,
        tradeName: true,
        typeOfBuisness: true,
        updatedAt: true,
        username: true,
      },
    });
    if (me.isBlocked) {
      throw new ForbiddenException('Your accound has been blocked');
    }

    return me;
  }

  async updateUser(dto: UpdateUserDto, currentUser: any) {
    // *** implementation for unique values on server side
    const tempVal = dto;
    Object.keys(tempVal).map((key) => {
      if (!tempVal[key]) {
        delete tempVal[key];
      }
    });
    dto = tempVal;
    // *** END
    const updated = this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        ...dto,
      },
    });
    return updated;
  }

  async verifyMe(otp: string, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });

    if ((me?.verificationInfo?.lastOtp || '') != otp) {
      throw new ForbiddenException('OTP did not match');
    }
    if (me?.verificationInfo?.lastOtpSentAt) {
      const diff = getDifferenceBetweenDates(
        new Date(me.verificationInfo.lastOtpSentAt),
        new Date()
      );
      if (diff.mm > 5) {
        throw new ForbiddenException('Last otp has expired');
      }
    }

    const updated = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        isAccountVerified: true,
        verificationInfo: {
          verifiedAt: new Date(),
        },
      },
    });
    return { success_message: 'Verifed successfully' };
  }

  async getPaymentToken(currentUser: any): Promise<any> {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });

    /*
     * import checksum generation utility
     * You can get this utility from https://developer.paytm.com/docs/checksum/
     */
    try {
      let paytmParams: any = {
        body: {},
        head: {},
      };

      const paymentInfo = await this.prisma.merchantInfo.findFirst();

      paytmParams.body = ((orderId = randomUUID()) => ({
        requestType: 'Payment',
        mid: paymentInfo.mid,
        websiteName: paymentInfo.websiteName || 'YOUR_WEBSITE_NAME',
        orderId: orderId,
        callbackUrl: 'https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=' + orderId,
        txnAmount: {
          value: paymentInfo.amount,
          currency: 'INR',
        },
        userInfo: {
          custId: 'USER_' + me.id,
        },
      }))();

      /*
       * Generate checksum by parameters we have in body
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */

      let paytmData = {
        body: {},
        head: {},
        response: {},
      };

      const checksum = await PaytmChecksum.generateSignature(
        JSON.stringify(paytmParams.body),
        paymentInfo.mkey
      );

      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path:
          '/theia/api/v1/initiateTransaction?mid=DGgeEm22265131278555&orderId=' +
          paytmParams.body?.orderId,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length,
        },
      };

      const res: any = await new Promise((resolve, reject) => {
        this.get_txnToken(post_data, options, resolve, reject);
      });

      paytmData.body = paytmParams.body;
      paytmData.head = paytmParams.head;
      paytmData.response = res;

      return {
        ...paytmData.body,
        txnToken: res.body.txnToken,
      };
    } catch (error) {
      console.log({ error });
    }

    // let paytmParams = {};
    // paytmParams["MID"] = "DGgeEm22265131278555";
    // paytmParams["ORDERID"] = randomUUID();
    // paytmParams["TXN_AMOUNT"] = '100';
    // paytmParams["WEBSITE"] = 'WEBSTAGING';
    // paytmParams["CUST_ID"] = "USER_" + me.id
    // paytmParams["EMAIL"] = me.email;
    // paytmParams["MOBILE_NUMBER"] = "987654310"
    // paytmParams["CHANNEL_ID"] = "WEB"

    // const paytmChecksum = await PaytmChecksum.generateSignature(paytmParams, "EpUQGhs_2whyCGPy");
    // const verifyChecksum = await PaytmChecksum.verifySignature(paytmParams, "EpUQGhs_2whyCGPy", paytmChecksum);

    // console.log({ paytmChecksum, paytmParams, verifyChecksum })

    // if (verifyChecksum) {
    //   return {
    //     ...paytmParams,
    //     CHECKSUMHASH: paytmChecksum
    //   };
    // }
  }

  async get_txnToken(post_data, options, resolve, reject) {
    let response = '';
    var post_req = https.request(options, function (post_res) {
      post_res.on('data', function (chunk) {
        response += chunk;
      });

      post_res.on('end', function () {
        console.log('Response: ', response);
        resolve(JSON.parse(response));
      });
    });
    post_req.on('error', (error) => {
      console.log('An error', error);
      reject(error);
    });
    post_req.write(post_data);
    post_req.end();
  }

  async verifyPayment(currentUser: any, data: any) {
    const me = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        isPaymentDone: true,
      },
    });
    const payment = await this.prisma.payment.create({
      data: {
        data,
      },
    });
    return payment;
  }

  async getAllUsers(currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });
    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        isAdmin: true,
        isBlocked: true,
        isPaymentDone: true,
        username: true,
        reportedBy: {
          select: {
            username: true,
            mobileNumber: true,
          },
        },
        email: true,
        gstNumber: true,
        createdAt: true,
        panNumber: true,
        tradeName: true,
        mobileNumber: true,
      },
    });
    return users;
  }

  async setPaymentInfo(info: MerchantInfoDto, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });

    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }
    const admin = await this.prisma.merchantInfo.findFirst();

    const data = await this.prisma.merchantInfo.update({
      where: {
        id: admin.id,
      },
      data: {
        ...info,
      },
    });
    return data;
  }

  async getPaymentInfo(currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });

    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }

    const data = await this.prisma.merchantInfo.findFirst();

    return data;
  }

  async sendVerificationCode(currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });
    if (me.isAccountVerified) {
      throw new ForbiddenException('Account already verified');
    }
    if (me?.verificationInfo?.lastOtpSentAt) {
      const diff = getDifferenceBetweenDates(
        new Date(me?.verificationInfo?.lastOtpSentAt),
        new Date()
      );

      if (diff.mm <= 1) {
        throw new ForbiddenException('Otp send less than 1 min ago,\n please wait!');
      }
    }
    function randomIntFromInterval(min, max) {
      // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const code = randomIntFromInterval(100000, 999999).toString();

    const codeString = encodeURIComponent(
      `${code} is your one time password (OTP) for verification at buisnessapp. OTP Count 6 and valid for 5Minutes. Thanks`
    );

    const admin = await this.prisma.merchantInfo.findFirst();
    const response = await axios.get(
      `https://api.msg91.com/api/sendhttp.php?authkey=${admin.otpAuthKey}&mobiles=${me.mobileNumber}&message=${codeString}&sender=VHTOTP&route=4&country=91&DLT_TE_ID=${admin.otpTemplateId}&response=json`
    );
    await this.prisma.merchantInfo.update({
      where: {
        id: admin.id,
      },
      data: {
        otpCount: {
          increment: 1,
        },
      },
    });

    const update = await this.prisma.user.update({
      where: {
        id: currentUser.sub,
      },
      data: {
        verificationInfo: {
          lastOtp: code,
          lastOtpSentAt: new Date(),
        },
      },
    });

    return { success_message: 'OTP Sent!' };
  }

  async signUpFromAdmin(dto: SignUpFromAdminDto, currentUser: any) {
    const me = await this.prisma.user.findUnique({
      where: {
        id: currentUser.sub,
      },
    });

    if (!me.isAdmin) {
      throw new ForbiddenException('Not authorized to perform this action');
    }

    const tempVal = dto;
    Object.keys(tempVal).map((key) => {
      if (!tempVal[key]) {
        delete tempVal[key];
      }
    });
    dto = tempVal;
    // *** END
    const password =
      parseInt(dto.mobileNumber.slice(dto.mobileNumber.length - 4, dto.mobileNumber.length)) * 5;
    console.log({ password });
    const hash = await argon.hash(`${password}`);
    dto.password = hash;

    dto.gstNumberId = '';
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
          username: true,
          isPaymentDone: true,
        },
      });

      // return the record of the user
      // return user;
      return { sucess: 'User Created Successfully' };
    } catch (error) {
      console.log({ error });
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User Already registerd');
        }
      }
      throw error;
    }
  }
}
