import { IsEnum, IsOptional, IsString } from "class-validator";
import { CallStatus } from "@khedmati/database";

export class ResolveCallDto {
  @IsEnum(CallStatus)
  outcome!: CallStatus;

  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsString() operatorNote?: string;
}
