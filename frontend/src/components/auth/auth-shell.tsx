"use client";

import Link from "next/link";
import { Scale } from "lucide-react";

export function AuthShell({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="shrink-0 border-b border-brand-gray/30 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-brand-navy">
            <Scale className="h-6 w-6 text-brand-accent" />
            <span className="text-lg font-bold">Adoul AI</span>
          </Link>
          <Link
            href={`/${locale}`}
            className="text-sm text-brand-slate transition hover:text-brand-navy"
          >
            ← Accueil / الرئيسية
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
