import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("stats")
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("artisans")
  listArtisans() {
    return this.adminService.listArtisans();
  }

  @Get("clients")
  listClients() {
    return this.adminService.listClients();
  }

  @Get("requests")
  listRequests() {
    return this.adminService.listRequests();
  }

  @Post("users/:id/suspend")
  suspendUser(@Param("id") id: string) {
    return this.adminService.setUserStatus(id, "SUSPENDED");
  }

  @Post("users/:id/activate")
  activateUser(@Param("id") id: string) {
    return this.adminService.setUserStatus(id, "ACTIVE");
  }
}
