import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./dto/create-location.dto";

@Controller("locations")
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  // GET /locations/nearby?lat=..&lng=..&radiusKm=5&professionId=...
  @Get("nearby")
  findNearby(
    @Query("lat") lat: string,
    @Query("lng") lng: string,
    @Query("radiusKm") radiusKm = "5",
    @Query("professionId") professionId?: string,
  ) {
    return this.locationsService.findProfessionalsNear({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radiusKm: parseFloat(radiusKm),
      professionId,
    });
  }

  // GET /locations/nearby-counts?lat=..&lng=..&radiusKm=10
  // "Plombiers disponibles : 12" â€” un mÃ©tier par ligne, avec son compte.
  @Get("nearby-counts")
  countByProfession(
    @Query("lat") lat: string,
    @Query("lng") lng: string,
    @Query("radiusKm") radiusKm = "10",
  ) {
    return this.locationsService.countProfessionalsByProfession({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radiusKm: parseFloat(radiusKm),
    });
  }

  // CrÃ©e une localisation (wilaya/commune/coordonnÃ©es) Ã  rattacher ensuite Ã 
  // un profil client ou professionnel via PATCH /users/me/*-profile.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() _user: AuthenticatedUser, @Body() dto: CreateLocationDto) {
    return this.locationsService.createLocation(dto);
  }
}
