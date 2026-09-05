import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CategoriesModule } from "./categories/categories.module";
import { LocationsModule } from "./locations/locations.module";
import { RequestsModule } from "./requests/requests.module";
import { OffersModule } from "./offers/offers.module";
import { MatchingModule } from "./matching/matching.module";
import { ValidationModule } from "./validation/validation.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { BillingModule } from "./billing/billing.module";
import { AdminModule } from "./admin/admin.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Anti-spam / anti-brute-force de base (section 41). À affiner par
    // route (ex: limite plus stricte sur /auth/login) en production.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    LocationsModule,
    RequestsModule,
    OffersModule,
    MatchingModule,
    ValidationModule,
    ReviewsModule,
    NotificationsModule,
    FavoritesModule,
    ConversationsModule,
    BillingModule,
    AdminModule,
    UploadsModule,

    // TODO Phase 2 (section 47) — modules à ajouter sans réécriture
    // majeure grâce au schéma déjà en place : companies, employees,
    // phone-verification (IVR), appointments, quotes, projects, reports,
    // invoices, promotions, audit-log interceptor global.
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
