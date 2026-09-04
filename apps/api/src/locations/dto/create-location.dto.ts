import { IsLatitude, IsLongitude, IsOptional, IsString } from "class-validator";

export class CreateLocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  wilaya!: string;

  @IsOptional() @IsString() daira?: string;
  @IsOptional() @IsString() commune?: string;
  @IsOptional() @IsString() addressLine?: string;
}
