import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { MatchingService } from "./matching.service";

@Controller("matching")
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  // Aperçu des artisans compatibles pour l'Admin Validation (section 10) —
  // aucun effet de bord, ne notifie personne, ne crée aucun match.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get("requests/:id/candidates")
  previewCandidates(@Param("id") id: string) {
    return this.matchingService.previewCandidates(id);
  }

  // Envoi à UN OU PLUSIEURS artisans choisis par l'Admin Validation, en une
  // seule action (section 1-3 du workflow multi-envoi).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("requests/:id/send")
  sendToArtisans(@Param("id") id: string, @Body() body: { professionalIds: string[] }) {
    return this.matchingService.sendToArtisans(id, body.professionalIds ?? []);
  }

  // Compatibilité : envoi à un seul artisan.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("requests/:id/send/:professionalId")
  sendToArtisan(@Param("id") id: string, @Param("professionalId") professionalId: string) {
    return this.matchingService.sendToArtisan(id, professionalId);
  }

  // Suivi individuel des artisans contactés pour une demande (section 4, 17).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get("requests/:id/dispatch-status")
  getDispatchStatus(@Param("id") id: string) {
    return this.matchingService.getDispatchStatus(id);
  }

  // Relance d'un artisan qui n'a pas encore répondu (section 18).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("requests/:id/remind/:professionalId")
  remindArtisan(@Param("id") id: string, @Param("professionalId") professionalId: string) {
    return this.matchingService.remindArtisan(id, professionalId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Get("me")
  getMyMatches(@CurrentUser() user: AuthenticatedUser) {
    return this.matchingService.getMatchesForProfessional(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Post(":matchId/respond")
  respond(
    @Param("matchId") matchId: string,
    @Body() body: { accepted: boolean; message?: string },
  ) {
    return this.matchingService.respondToMatch(matchId, body.accepted, body.message);
  }
}
