import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateProfessionDto {
  @IsString() categoryId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() nameAr?: string;
  @IsOptional() @IsArray() synonyms?: string[];
}
