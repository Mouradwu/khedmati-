import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";

// Toutes les routes ci-dessous sont reservees a l'"Admin Complet"
// (ADMIN / SUPER_ADMIN) — l'"Admin Validation" (OPERATOR) n'a acces qu'aux
// routes /validation/* (sections 28-31, 37). Verifie cote serveur, pas
// seulement par un bouton cache au frontend.
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
  suspendUser(@Param("id") id: string, @CurrentUser() admin: AuthenticatedUser, @Body() body: { reason?: string }) {
    return this.adminService.setUserStatus(id, "SUSPENDED", admin.id, body?.reason);
  }

  @Post("users/:id/activate")
  activateUser(@Param("id") id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminService.setUserStatus(id, "ACTIVE", admin.id);
  }

  // --- Gestion des administrateurs (sections 28-31, 36) ---
  @Get("admins")
  listAdmins() {
    return this.adminService.listAdminUsers();
  }

  @Post("admins")
  createAdmin(@CurrentUser() admin: AuthenticatedUser, @Body() dto: CreateAdminUserDto) {
    return this.adminService.createAdminUser(admin.role, dto);
  }

  // --- Journal d'audit (section 38) ---
  @Get("audit-log")
  getAuditLog() {
    return this.adminService.listAuditLog();
  }
}
