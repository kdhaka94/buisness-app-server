import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  mobileNumber: string

  @IsString()
  @IsNotEmpty()
  password: string
}


export class SignUpDto {
  @IsNotEmpty()
  mobileNumber: string

  @IsString()
  @IsNotEmpty()
  password: string
  @IsNotEmpty()
  username: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  gstNumber: string

  @IsNotEmpty()
  tradeName: string
  @IsNotEmpty()
  designation: string
  @IsNotEmpty()
  panNumber: string
  @IsNotEmpty()
  typeOfBuisness: string
  @IsNotEmpty()
  startYear: string
  @IsNotEmpty()
  addressOfBuisness: string

  gstNumberId: string
}




