"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FolderOpen, Calculator,
  Building2, Bot, ScanLine, LogOut, Scale, Menu, Shield, Activity,
  Gift, HandCoins, FileSignature,
} from "lucide-react";
import { isSuperAdmin } from "@/lib/auth-utils";
import { adminLabels } from "@/lib/admin-labels";
import { useAuthStore, useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { User } from "@/types";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: dashboardLabels.nav.dashboard },
  { href: "/dashboard/clients", icon: Users, label: dashboardLabels.nav.clients },
  { href: "/dashboard/dossiers", icon: FolderOpen, label: dashboardLabels.nav.dossiers },
  { href: "/dashboard/inheritance", icon: Calculator, label: dashboardLabels.nav.inheritance },
  { href: "/dashboard/wasiyyah", icon: Scale, label: dashboardLabels.nav.wasiyyah },
  { href: "/dashboard/property-share", icon: Building2, label: dashboardLabels.nav.propertyShare },
  { href: "/dashboard/calculate/marriage", icon: Scale, label: dashboardLabels.nav.marriage },
  { href: "/dashboard/calculate/sale", icon: HandCoins, label: dashboardLabels.nav.sale },
  { href: "/dashboard/calculate/donation", icon: Gift, label: dashboardLabels.nav.donation },
  { href: "/dashboard/calculate/procuration", icon: FileSignature, label: dashboardLabels.nav.procuration },
  { href: "/dashboard/assistant", icon: Bot, label: dashboardLabels.nav.assistant, comingSoon: true },
  { href: "/dashboard/ocr", icon: ScanLine, label: dashboardLabels.nav.ocr, comingSoon: true },
] as const;

export function DashboardLayout({ children, locale }: { children: React.ReactNode; locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { isReady, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isReady, isAuthenticated, router, locale]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_image", file);
      const res = await api.post<{ user: User }>("/auth/me/profile-image", formData);
      setUser(res.data.user);
    } catch {
      /* ignore */
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  return (
    <div className="dashboard-theme min-h-screen bg-white">
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex h-screen w-72 flex-col border-e border-brand-gray/30 bg-white shadow-xl transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-gray/30 px-5">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 text-brand-navy">
            <Scale className="h-6 w-6 text-brand-blue" />
            <span className="text-lg font-bold">Portail</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const href = `/${locale}${item.href}`;
            const active =
              pathname === href ||
              (item.href !== "/dashboard" && pathname.startsWith(href));

            if ("comingSoon" in item && item.comingSoon) {
              return (
                <div
                  key={item.href}
                  title={`${dashboardLabels.common.comingSoon.fr} / ${dashboardLabels.common.comingSoon.ar}`}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-45"
                  aria-disabled
                >
                  <item.icon className="h-5 w-5 shrink-0 text-brand-gray" />
                  <div className="min-w-0 flex-1">
                    <BilingualText
                      label={item.label}
                      size="xs"
                      className="[&_.text-brand-gray]:text-brand-gray [&_span]:text-brand-gray"
                    />
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-gray/15 px-2 py-0.5 text-[10px] font-semibold text-brand-gray">
                    {dashboardLabels.common.comingSoon.fr}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  active
                    ? "border border-blue-200 bg-brand-blue-50 text-brand-blue shadow-sm"
                    : "text-brand-slate hover:bg-brand-blue-50/60 hover:text-brand-blue",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <BilingualText
                  label={item.label}
                  size="xs"
                  className={active ? "[&_span]:text-brand-blue [&_.text-brand-gray]:text-brand-blue/70" : undefined}
                />
              </Link>
            );
          })}
          {isSuperAdmin(user) && (
            <div className="my-3 border-t border-brand-gray/20 pt-3">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Super Admin
              </p>
              {[
                { href: "/dashboard/admin", icon: Shield, label: adminLabels.nav.overview, exact: true },
                { href: "/dashboard/admin/adouls", icon: Scale, label: adminLabels.nav.adouls },
                { href: "/dashboard/admin/activity", icon: Activity, label: adminLabels.nav.activity },
                { href: "/dashboard/admin/cabinets", icon: Building2, label: adminLabels.nav.cabinets },
                { href: "/dashboard/admin/users", icon: Users, label: adminLabels.nav.users },
              ].map((item) => {
                const href = `/${locale}${item.href}`;
                const active = "exact" in item && item.exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                      active
                        ? "border border-amber-200 bg-amber-50 text-amber-800 shadow-sm"
                        : "text-amber-700 hover:bg-amber-50/80 hover:text-amber-800",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <BilingualText
                      label={item.label}
                      size="xs"
                      className={active ? "[&_span]:text-amber-800 [&_.text-brand-gray]:text-amber-700/80" : "[&_span]:text-amber-700 [&_.text-brand-gray]:text-amber-600/80"}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="border-t border-brand-gray/30 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#fafafa] px-3 py-2">
            <button
              type="button"
              title="Changer la photo / تغيير الصورة"
              disabled={avatarLoading}
              onClick={() => avatarInputRef.current?.click()}
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-gray/30 bg-brand-blue-50"
            >
              {user?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-brand-blue">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-brand-navy/50 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                {avatarLoading ? "…" : "Photo"}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-navy">{user?.full_name}</p>
              <p className="truncate text-xs text-brand-slate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-brand-slate hover:bg-[#fafafa] hover:text-brand-navy"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <BilingualText label={dashboardLabels.nav.logout} size="xs" />
          </Button>
        </div>
      </aside>

      {/* Overlay mobile — fond bleu navy */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-brand-navy/75 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <div className="flex min-h-screen min-w-0 flex-col lg:ms-72">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-brand-gray/30 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-brand-navy lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link
              href={`/${locale}`}
              className="hidden text-sm text-brand-slate transition hover:text-brand-navy sm:inline"
            >
              ← {dashboardLabels.nav.home.fr} / {dashboardLabels.nav.home.ar}
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-[#fafafa] p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
