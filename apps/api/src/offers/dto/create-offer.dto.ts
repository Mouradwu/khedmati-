import { IsOptional, IsString } from "class-validator";

export class CreateOfferDto {
  @IsString()
  rawDescription!: string;

  @IsOptional() @IsString()
  professionId?: string;
}
