import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { UploadsService } from "./uploads.service";
import { PrismaService } from "../prisma/prisma.service";

// "context" determine ou l'image est rangee ET les autorisations
// appliquees (section 39 : ne jamais se fier au seul frontend).
type UploadContext = "profile-photo" | "gallery" | "request-photo" | "business-logo";

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
    private prisma: PrismaService,
  ) {}

  @Post("image")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body("context") context: UploadContext,
    @Body("requestId") requestId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException("Aucun fichier reçu.");
    if (!["profile-photo", "gallery", "request-photo", "business-logo"].includes(context)) {
      throw new BadRequestException("Contexte d'upload invalide.");
    }

    // Autorisation par contexte — verifiee ici, cote serveur (section 39).
    if (context === "request-photo") {
      if (user.role !== "CLIENT") throw new ForbiddenException("Réservé aux comptes client.");
      if (requestId) {
        // Photo ajoutee sur une demande deja creee : verifie la propriete.
        const request = await this.prisma.serviceRequest.findUnique({ where: { id: requestId } });
        if (!request || request.clientId !== user.id) {
          throw new ForbiddenException("Cette demande ne vous appartient pas.");
        }
      }
      // Sans requestId : upload prealable a la creation de la demande
      // (section 6) — la cle sera rattachee au moment de POST /requests.
    } else {
      // profile-photo / gallery / business-logo : reserve aux artisans,
      // sur leur propre profil.
      if (user.role !== "PROFESSIONAL") {
        throw new ForbiddenException("Réservé aux comptes artisan.");
      }
    }

    const folder =
      context === "request-photo"
        ? `requests/${requestId ?? `pending-${user.id}`}`
        : `professionals/${user.id}/${context}`;
    const key = await this.uploadsService.uploadImage(file.buffer, file.mimetype, folder);
    const url = await this.uploadsService.getSignedUrl(key);

    return { key, url };
  }
}
