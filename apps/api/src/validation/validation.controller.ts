import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CallQueuePriority, UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ValidationService } from "./validation.service";
import { ResolveCallDto } from "./dto/resolve-call.dto";
import { CallbackRequestDto } from "./dto/callback-request.dto";

// Tous les endpoints de ce contrôleur sont réservés au centre d'appels
// KHEDMATI (opérateurs et administrateurs) — section 39.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller("validation")
export class ValidationController {
  constructor(private validationService: ValidationService) {}

  @Get("queue")
  getQueue(@Query("priority") priority?: CallQueuePriority) {
    return this.validationService.getQueue(priority);
  }

  @Get("cases/:id")
  getCase(@Param("id") id: string) {
    return this.validationService.getCase(id);
  }

  @Post("cases/:id/claim")
  claim(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.validationService.claim(id, user.id);
  }

  @Post("cases/:id/start-call")
  startCall(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.validationService.startCall(id, user.id);
  }

  @Post("calls/:callId/resolve")
  resolveCall(
    @Param("callId") callId: string,
    @Body() dto: ResolveCallDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.validationService.resolveCall(callId, dto, user.id);
  }

  @Post("calls/:callId/request-callback")
  requestCallback(@Param("callId") callId: string, @Body() dto: CallbackRequestDto) {
    return this.validationService.requestCallback(callId, dto);
  }

  @Post("publish")
  publish(@Body() body: { serviceRequestId?: string; offerId?: string }) {
    return this.validationService.publish(body.serviceRequestId, body.offerId);
  }
}
