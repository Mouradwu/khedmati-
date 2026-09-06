import { Module, forwardRef } from "@nestjs/common";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";
import { UploadsModule } from "../uploads/uploads.module";
import { MatchingModule } from "../matching/matching.module";

@Module({
  imports: [UploadsModule, forwardRef(() => MatchingModule)],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
