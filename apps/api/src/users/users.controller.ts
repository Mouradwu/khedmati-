import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UpdateClientProfileDto } from "./dto/update-client-profile.dto";
import { UpdateProfessionalProfileDto } from "./dto/update-professional-profile.dto";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/client-profile")
  updateClientProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateClientProfileDto) {
    return this.usersService.updateClientProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/professional-profile")
  updateProfessionalProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfessionalProfileDto,
  ) {
    return this.usersService.updateProfessionalProfile(user.id, dto);
  }

  // Profil public consulté par un client avant mise en relation.
  @Get("professionals/:id")
  getPublicProfessionalProfile(@Param("id") id: string) {
    return this.usersService.getPublicProfessionalProfile(id);
  }
}
