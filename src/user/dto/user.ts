import { IsEmail, IsNotEmpty, IsString, ValidateIf } from "class-validator"

export class SearchUserDto {

  @IsNotEmpty()
  selectionBy: SelectionType
  @IsNotEmpty()
  selectionId: string
}
type SelectionType = 'addressOfBuisness' | 'gstNumber' | 'panNumber' | 'tradeName' | 'mobileNumber' | 'email'



export class ReportUserDto {
  @IsNotEmpty()
  userId: string
}

export class UpdateUserDto {
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
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
