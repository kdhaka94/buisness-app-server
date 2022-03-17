import { IsNotEmpty, ValidateIf } from "class-validator"

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