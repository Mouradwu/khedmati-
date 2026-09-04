import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { RequestsService } from "./requests.service";
import { CreateRequestDto } from "./dto/create-request.dto";

@Controller("requests")
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Get("me")
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.requestsService.findMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.requestsService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Post(":id/complete")
  markCompleted(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.requestsService.markCompleted(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch(":id")
  updateDraft(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Partial<CreateRequestDto>,
  ) {
    return this.requestsService.updateDraft(id, user.id, dto);
  }
}
