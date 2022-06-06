import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUpDto {
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  gstNumber: string;

  @IsNotEmpty()
  tradeName: string;
  @IsNotEmpty()
  designation: string;
  panNumber: string;
  typeOfBuisness: string;
  startYear: string;
  addressOfBuisness: string;

  gstNumberId: string;
}
