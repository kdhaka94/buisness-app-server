import { IsNotEmpty, ValidateIf } from "class-validator"

export class MerchantInfoDto {

  @IsNotEmpty()
  amount: string
  @IsNotEmpty()
  mid: string
  @IsNotEmpty()
  mkey: string
}



