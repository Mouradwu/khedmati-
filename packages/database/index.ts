import { PrismaClient } from "@prisma/client";

// Singleton pattern — évite d'ouvrir une nouvelle connexion à chaque hot-reload
// en développement (NestJS / Next.js).
declare global {
  // eslint-disable-next-line no-var
  var __khedmatiPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__khedmatiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__khedmatiPrisma = prisma;
}

export * from "@prisma/client";
