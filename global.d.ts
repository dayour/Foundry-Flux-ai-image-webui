import type { PrismaClient } from "@prisma/client";

declare module "mime-types";
declare module "next-intl";

declare global {
    // Prisma client cached on the global scope in development
    // to avoid exhausting database connections during hot reloads.
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export {};
