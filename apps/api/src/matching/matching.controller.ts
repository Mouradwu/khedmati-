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

  // Envoi ciblé à UN artisan choisi par l'Admin Validation (section 13) —
  // remplace l'ancienne diffusion automatique à tous les compatibles.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("requests/:id/send/:professionalId")
  sendToArtisan(@Param("id") id: string, @Param("professionalId") professionalId: string) {
    return this.matchingService.sendToArtisan(id, professionalId);
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
