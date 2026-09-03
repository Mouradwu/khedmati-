import { Controller, Get, Query } from "@nestjs/common";
import { LocationsService } from "./locations.service";

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
}
