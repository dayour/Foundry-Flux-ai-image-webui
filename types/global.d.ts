import type { PrismaClient } from "@prisma/client";

declare module "mime-types";
declare module "next-intl";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }

  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export {};
