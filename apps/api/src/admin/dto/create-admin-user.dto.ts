import { IsIn, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class CreateAdminUserDto {
  @IsPhoneNumber("DZ", { message: "Numéro de téléphone algérien invalide." })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsIn(["OPERATOR", "ADMIN", "SUPER_ADMIN"])
  role!: "OPERATOR" | "ADMIN" | "SUPER_ADMIN";
}
