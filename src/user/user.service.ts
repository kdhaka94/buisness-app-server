import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { delay } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportUserDto, SearchUserDto } from './dto';
// import { PaytmChecksum } from './paytm/checksum'
const https = require('https');
const PaytmChecksum = require('paytmchecksum');
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



    /*
    * import checksum generation utility
    * You can get this utility from https://developer.paytm.com/docs/checksum/
    */
    try {
      let paytmParams: any = { body: {}, head: {} };

      paytmParams.body = ((orderId = randomUUID()) => ({
        "requestType": "Payment",
        "mid": "DGgeEm22265131278555",
        "websiteName": "YOUR_WEBSITE_NAME",
        "orderId": orderId,
        "callbackUrl": "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" + orderId,
        "txnAmount": {
          "value": "1.00",
          "currency": "INR",
        },
        "userInfo": {
          "custId": "USER_" + me.id
        },
      }))();

      /*
      * Generate checksum by parameters we have in body
      * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
      */

      let paytmData = { body: {}, head: {}, response: {} }

      const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "EpUQGhs_2whyCGPy")

      paytmParams.head = {
        "signature": checksum
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {

        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: '/theia/api/v1/initiateTransaction?mid=DGgeEm22265131278555&orderId=' + paytmParams.body?.orderId,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
        }
      };

      const res: any = await new Promise((resolve, reject) => {
        this.get_txnToken(post_data, options, resolve, reject)
      })


      paytmData.body = paytmParams.body;
      paytmData.head = paytmParams.head;
      paytmData.response = res;

      return { ...paytmData.body, txnToken: res.body.txnToken };

    } catch (error) {
      console.log({ error })
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
    let response = "";
    var post_req = https.request(options, function (post_res) {
      post_res.on('data', function (chunk) {
        response += chunk;
      });

      post_res.on('end', function () {
        console.log('Response: ', response);
        resolve(JSON.parse(response))
      });
    });
    post_req.on('error', (error) => {
      console.log('An error', error);
      reject(error)
    });
    post_req.write(post_data);
    post_req.end();
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

