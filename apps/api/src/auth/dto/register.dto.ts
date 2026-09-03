import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { Language, UserRole } from "@khedmati/database";

/**
 * Inscription volontairement légère (section 3) : pas de vérification
 * téléphonique bloquante au MVP. Le numéro est stocké et pourra être
 * validé plus tard par un appel KHEDMATI (section 4).
 */
export class RegisterDto {
  @IsPhoneNumber("DZ", { message: "Numéro de téléphone algérien invalide." })
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole; // CLIENT ou PROFESSIONAL à l'inscription publique

  @IsOptional()
  @IsEnum(Language)
  preferredLanguage?: Language;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  // Champs facultatifs spécifiques artisan
  @IsOptional()
  @IsString()
  businessName?: string;
}
