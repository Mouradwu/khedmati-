import { IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsString() name!: string;
  @IsOptional() @IsString() nameAr?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() description?: string;
}
