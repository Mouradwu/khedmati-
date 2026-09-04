import { Module } from "@nestjs/common";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";
import { LocationsModule } from "../locations/locations.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { RequestsModule } from "../requests/requests.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [LocationsModule, ConversationsModule, RequestsModule, NotificationsModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
