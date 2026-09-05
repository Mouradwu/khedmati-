import { Module } from "@nestjs/common";
import { ValidationController } from "./validation.controller";
import { ValidationService } from "./validation.service";
import { RequestsModule } from "../requests/requests.module";
import { OffersModule } from "../offers/offers.module";
import { UploadsModule } from "../uploads/uploads.module";

@Module({
  imports: [RequestsModule, OffersModule, UploadsModule],
  controllers: [ValidationController],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}
