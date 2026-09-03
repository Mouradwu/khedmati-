import { IsOptional, IsString } from "class-validator";

export class UpdateClientProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() locationId?: string;
}
