import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateClientReviewDto {
  @IsOptional() @IsString() requestId?: string;
  @IsString() clientId!: string;

  @IsInt() @Min(1) @Max(5) ratingOverall!: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingRespect?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingCommunication?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingPunctuality?: number;
  @IsOptional() @IsString() comment?: string;
}
