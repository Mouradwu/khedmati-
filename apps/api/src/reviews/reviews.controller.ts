import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateClientReviewDto } from "./dto/create-client-review.dto";

@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Get("professional/:id")
  listForProfessional(@Param("id") id: string) {
    return this.reviewsService.listForProfessional(id);
  }

  // --- Notation bidirectionnelle : artisan note client (section 10) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROFESSIONAL)
  @Post("client")
  createClientReview(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClientReviewDto) {
    return this.reviewsService.createClientReview(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("client/:id")
  listForClient(@Param("id") id: string) {
    return this.reviewsService.listForClient(id);
  }
}
