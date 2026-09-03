import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { PlanAudience } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { BillingService } from "./billing.service";

@Controller("billing")
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get("plans")
  listPlans(@Query("audience") audience?: PlanAudience) {
    return this.billingService.listPlans(audience);
  }

  @UseGuards(JwtAuthGuard)
  @Get("subscription")
  getMySubscription(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getMySubscription(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("subscribe")
  subscribe(@CurrentUser() user: AuthenticatedUser, @Body() body: { planId: string }) {
    return this.billingService.subscribe(user.id, body.planId);
  }
}
