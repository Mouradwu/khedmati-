import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// @Global() : tous les modules métier peuvent injecter PrismaService sans
// réimporter PrismaModule partout.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
