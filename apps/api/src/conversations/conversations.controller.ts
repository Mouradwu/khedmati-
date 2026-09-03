import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { ConversationsService } from "./conversations.service";

@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.conversationsService.listForUser(user.id);
  }

  @Get(":id/messages")
  getMessages(@Param("id") id: string) {
    return this.conversationsService.getMessages(id);
  }

  @Post(":id/messages")
  sendMessage(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { content: string; attachmentUrl?: string },
  ) {
    return this.conversationsService.sendMessage(id, user.id, body.content, body.attachmentUrl);
  }
}
