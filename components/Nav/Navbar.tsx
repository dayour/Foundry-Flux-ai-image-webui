/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import Brand from "@/components/Brand/Logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import SignButtonGroup from "@/components/Nav/SignButtonGroup";
import MobileListButton from "@/components/Nav/MobileListButton";
import DarkModeToggle from "@/components/Nav/DarkModeToggle";
import LocaleSwitcher from "@/components/Nav/LocaleSwitcher";

export default function Navbar({ user = null }: { user: any }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/sign-up" || pathname === "/sign-in") return null;

  return (
    <>
      {/* HEADER */}
      <header
        className={cn(
          "sticky top-0 z-[52] w-full transition-all duration-300",
          isScrolled ? "nav-glass nav-glass--compact shadow-[0_10px_30px_rgba(6,2,18,0.4)]" : "py-6"
        )}
      >
        <nav
          className="relative mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 md:px-8"
          aria-label="Global"
        >
          {/* Logo */}
          <div className="flex items-center">
            <Brand />
          </div>
          {/* End Logo */}

          {/* Button Group */}
          <div className="hidden md:flex items-center gap-x-3 ms-auto py-1 md:ps-6 md:order-3">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            {/* End Dark Mode Toggle */}
            {!user ? (
              <div className="flex items-center gap-x-3">
                <LocaleSwitcher />
                {/* For PC Sign Button Group */}
                <SignButtonGroup />
              </div>
            ) : (
              <>
                <LocaleSwitcher />
                <Link
                  href="/ai-image-generator"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-200 transition hover:bg-primary/20 focus-visible:shadow-focus-ring"
                  aria-label="My images"
                >
                  My images
                </Link>
                <UserDropdown user={user} />
              </>
            )}
          </div>
          {/* End Button Group */}

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-x-2">
            {/* Dark Mode Toggle For Mobile */}
            <DarkModeToggle />
            {/* End Dark Mode Toggle For Mobile */}
            {user ? (
              <Link
                href="/ai-image-generator"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary-200 focus-visible:shadow-focus-ring"
              >
                My images
              </Link>
            ) : null}
            <UserDropdown user={user} />
            <MobileListButton />
          </div>
          {/* End Mobile Button */}

          {/* Menu */}
          <div
            id="navbar-collapse-with-animation"
            className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block md:w-auto md:order-2 md:basis-auto"
          >
            <div className="flex flex-col gap-y-4 gap-x-0 mt-5 md:flex-row md:justify-center md:items-center md:gap-y-0 md:gap-x-7 md:mt-0">
              {navigation.map((item, idx) => {
                return (
                  <div key={idx}>
                    <a
                      className={cn(
                        "inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-white/75 transition focus-visible:shadow-focus-ring",
                        pathname === item.href
                          ? "text-primary-200"
                          : "hover:text-white"
                      )}
                      href={item.href}
                      title={item.title}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.title}
                    </a>
                  </div>
                );
              })}

              {/* For Mobile Sign Button Group */}
              {!user ? (
                <div className="flex items-center gap-x-2 md:hidden">
                  <LocaleSwitcher />
                  <SignButtonGroup />
                </div>
              ) : (
                <div className="flex items-center gap-x-2 md:hidden">
                  <LocaleSwitcher />
                  <Link
                    href="/ai-image-generator"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-200 focus-visible:shadow-focus-ring"
                  >
                    My images
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* End Menu */}
        </nav>
      </header>
    </>
  );
}
