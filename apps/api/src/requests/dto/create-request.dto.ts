import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { UrgencyLevel } from "@khedmati/database";

/**
 * Le client peut soumettre une demande via texte libre (section 27,
 * option 1/3) ou formulaire guidé (option 2). `professionId`/`specialtyId`
 * sont facultatifs : si absents, un service d'IA externe (non couvert par
 * ce scaffold) peut les déduire de `rawDescription` avant validation par
 * appel — voir `structuredSummary` / `aiConfidence` dans le schéma.
 */
export class CreateRequestDto {
  @IsString()
  rawDescription!: string;

  @IsOptional() @IsString() professionId?: string;
  @IsOptional() @IsString() specialtyId?: string;

  @IsOptional() @IsEnum(UrgencyLevel) urgency?: UrgencyLevel;
  @IsOptional() @IsString() desiredDate?: string;
  @IsOptional() @IsString() budgetIndicative?: string;

  @IsOptional() @IsString() locationId?: string;

  @IsOptional() @IsArray() attachmentUrls?: string[];
}
