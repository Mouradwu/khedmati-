import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsString() professionalId!: string;
  @IsOptional() @IsString() requestId?: string;

  @IsInt() @Min(1) @Max(5) ratingOverall!: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingPunctuality?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingQuality?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingCommunication?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) ratingValue?: number;
  @IsOptional() @IsString() comment?: string;
}
