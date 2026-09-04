import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateProfessionalProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() businessName?: string;
  @IsOptional() @IsString() activityType?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() locationId?: string;

  @IsOptional() @IsBoolean()
  isAcceptingRequests?: boolean; // statut 🟢 Disponible / 🔴 Indisponible

  @IsOptional() @IsInt() @Min(1)
  interventionRadiusKm?: number;

  @IsOptional() @IsInt() @Min(0)
  yearsExperience?: number;

  // IDs de professions / spécialités / services choisis dans la taxonomie
  // administrable (section 12) — jamais de texte libre non structuré ici.
  @IsOptional() @IsArray() professionIds?: string[];
  @IsOptional() @IsArray() specialtyIds?: string[];
  @IsOptional() @IsArray() serviceIds?: string[];
}
