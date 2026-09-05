import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
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

  // --- Galerie de réalisations (section 4) ---
  @UseGuards(JwtAuthGuard)
  @Post("me/gallery")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }))
  addGalleryItem(
    @UploadedFile() file: Express.Multer.File,
    @Body("caption") caption: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.addGalleryItem(user.id, file.buffer, file.mimetype, caption);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("me/gallery/:itemId")
  deleteGalleryItem(@Param("itemId") itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteGalleryItem(user.id, itemId);
  }
}
