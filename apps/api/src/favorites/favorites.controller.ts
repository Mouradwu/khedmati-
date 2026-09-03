import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { FavoritesService } from "./favorites.service";

@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.list(user.id);
  }

  @Post(":professionalId")
  add(@CurrentUser() user: AuthenticatedUser, @Param("professionalId") professionalId: string) {
    return this.favoritesService.add(user.id, professionalId);
  }

  @Delete(":professionalId")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("professionalId") professionalId: string) {
    return this.favoritesService.remove(user.id, professionalId);
  }
}
