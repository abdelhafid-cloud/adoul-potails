"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, Menu, X } from "lucide-react";
import { useState, useCallback } from "react";
import { useAuth } from "@/store/auth-store";

const NAV_SECTIONS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "features", key: "features" },
  { id: "advantages", key: "advantages" },
  { id: "faq", key: "faq" },
  { id: "contact", key: "contact" },
] as const;

export function LandingHeader({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isReady, isAuthenticated } = useAuth();

  const authHref = isAuthenticated ? `/${locale}/dashboard` : `/${locale}/login`;
  const authLabel = isAuthenticated ? t("dashboard") : t("login");

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-brand-gray/40 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-brand-navy">
          <Scale className="h-7 w-7 text-brand-accent" />
          <span className="text-xl font-bold">{tCommon("appName")}</span>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex">
          {NAV_SECTIONS.map(({ id, key }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="whitespace-nowrap text-sm text-brand-slate transition-colors hover:text-brand-navy"
            >
              {t(key)}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href={authHref}>
            <Button
              variant="outline"
              className="border-brand-slate text-brand-slate hover:bg-brand-slate/5"
            >
              {isReady ? authLabel : t("login")}
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href={`/${locale}/register`}>
              <Button className="bg-brand-accent text-white hover:bg-brand-700">
                {t("register")}
              </Button>
            </Link>
          )}
        </div>

        <button
          className="text-brand-navy lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-gray/40 bg-white px-4 py-4 lg:hidden">
          {NAV_SECTIONS.map(({ id, key }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="block w-full py-2 text-start text-brand-slate transition-colors hover:text-brand-navy"
            >
              {t(key)}
            </button>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href={authHref}>
              <Button variant="outline" className="w-full border-brand-slate text-brand-slate">
                {isReady ? authLabel : t("login")}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href={`/${locale}/register`}>
                <Button className="w-full bg-brand-accent text-white hover:bg-brand-700">
                  {t("register")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
