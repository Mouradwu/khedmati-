import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";

@Controller("offers")
export class OffersController {
  constructor(private offersService: OffersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Get("me")
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.offersService.findByProfessional(user.id);
  }
}
