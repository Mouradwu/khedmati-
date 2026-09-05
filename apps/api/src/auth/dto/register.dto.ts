import { IsEmail, IsEnum, IsIn, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator";
import { Language, UserRole } from "@khedmati/database";

/**
 * Inscription volontairement légère (section 3) : pas de vérification
 * téléphonique bloquante au MVP. Le numéro est stocké et pourra être
 * validé plus tard par un appel KHEDMATI (section 4).
 *
 * Sécurité : seuls CLIENT et PROFESSIONAL sont autorisés ici. Les comptes
 * OPERATOR/ADMIN/SUPER_ADMIN ne peuvent être créés que par un
 * administrateur déjà authentifié (voir AdminController.createAdminUser) —
 * jamais via cet endpoint public, même si UserRole en tant que type
 * contient ces valeurs.
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

  @IsIn(["CLIENT", "PROFESSIONAL"], {
    message: "Seuls les rôles CLIENT et PROFESSIONAL sont autorisés à l'inscription publique.",
  })
  role!: typeof UserRole.CLIENT | typeof UserRole.PROFESSIONAL;

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
