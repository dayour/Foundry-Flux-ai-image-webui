import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, Link } from "@/app/navigation";
import { languages } from "@/config/site";

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const locales = languages.filter(item => item.lang === currentLocale);

  return (
    <>
      <div className="hs-dropdown relative inline-flex z-10">
        <button
          id="hs-dropdown-default"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="hs-dropdown-default-menu"
          aria-label="Change language"
          className="hs-dropdown-toggle inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus-visible:shadow-focus-ring"
        >
          <svg
            className="flex-shrink-0 size-3.5"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" />
            <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" />
            <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          {locales[0]?.label}
        </button>
        <div
          id="hs-dropdown-default-menu"
          className="hs-dropdown-menu mt-2 hidden min-w-56 rounded-lg border border-white/15 bg-midnight-950/95 p-2 text-sm text-white/80 shadow-[0_18px_48px_rgba(3,0,10,0.55)] backdrop-blur transition-[opacity,margin] duration hs-dropdown-open:opacity-100"
          aria-labelledby="hs-dropdown-default"
        >
        {languages.map((item: any) => (
            <Link
              key={item.lang}
              id={`locale-${item.lang}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 focus-visible:shadow-focus-ring"
              href={pathname}
              locale={item.lang}
              aria-current={item.lang === currentLocale ? "true" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
