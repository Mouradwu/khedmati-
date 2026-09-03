import { IsPhoneNumber, IsString } from "class-validator";

export class LoginDto {
  @IsPhoneNumber("DZ")
  phone!: string;

  @IsString()
  password!: string;
}
