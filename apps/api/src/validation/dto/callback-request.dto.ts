import { IsOptional, IsString } from "class-validator";

export class CallbackRequestDto {
  @IsOptional() @IsString() requestedFor?: string; // ISO date-time
  @IsOptional() @IsString() reason?: string;
}
