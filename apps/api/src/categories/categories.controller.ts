import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@khedmati/database";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateProfessionDto } from "./dto/create-profession.dto";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // --- Public ---
  @Get()
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get("search")
  search(@Query("q") q: string) {
    return this.categoriesService.searchProfessions(q ?? "");
  }

  // --- Admin (section 12 : taxonomie 100% administrable) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("professions")
  createProfession(@Body() dto: CreateProfessionDto) {
    return this.categoriesService.createProfession(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post("specialties")
  createSpecialty(@Body() dto: CreateSpecialtyDto) {
    return this.categoriesService.createSpecialty(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(":id")
  deactivateCategory(@Param("id") id: string) {
    return this.categoriesService.deactivateCategory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete("professions/:id")
  deactivateProfession(@Param("id") id: string) {
    return this.categoriesService.deactivateProfession(id);
  }
}
