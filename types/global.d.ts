declare module "mime-types";
declare module "next-intl";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }

  // eslint-disable-next-line no-var
  var prisma: any;
}

export {};
