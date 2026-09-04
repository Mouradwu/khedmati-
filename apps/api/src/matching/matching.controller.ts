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

  // Déclenché par un opérateur/admin juste après VALIDATED -> PUBLISHED,
  // ou par un job planifié. Volontairement explicite plutôt qu'automatique
  // pour garder une trace de qui a lancé le matching.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("requests/:id/run")
  run(@Param("id") id: string) {
    return this.matchingService.runMatching(id);
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
