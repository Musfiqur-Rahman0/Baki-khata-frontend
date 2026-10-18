"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/landing-content";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#FAF8F5]/85 backdrop-blur-md transition-all duration-200"
      data-purpose="navigation-header"
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-forest-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#desk-preview"
            className="hidden px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:text-forest-900 sm:inline-block"
          >
            লগইন
          </a>
          <a
            href="#desk-preview"
            className="inline-flex items-center justify-center rounded-full bg-[#143628] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-forest-800 focus:ring-offset-2 sm:text-sm"
          >
            ফ্রি ডেমো দেখুন
          </a>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-stone-300 md:hidden"
                />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#FAF8F5]">
              <SheetHeader>
                <SheetTitle>
                  <BrandLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-3 px-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-forest-900"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-stone-200">
                  <a
                    href="#desk-preview"
                    className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    লগইন
                  </a>
                  <a
                    href="#desk-preview"
                    className="flex items-center justify-center rounded-full bg-forest-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
                  >
                    ফ্রি ডেমো দেখুন
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
