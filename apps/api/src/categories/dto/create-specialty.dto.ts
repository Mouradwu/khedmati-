import { IsOptional, IsString } from "class-validator";

export class CreateSpecialtyDto {
  @IsString() professionId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() nameAr?: string;
}
