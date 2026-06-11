"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/sidebar";
import { useAuth, useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { isSuperAdmin } from "@/lib/auth-utils";
import type { User } from "@/types";

export function DashboardShell({ children, locale }: { children: React.ReactNode; locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    api.get<User>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, [isReady, isAuthenticated, setUser]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    if (pathname?.includes("/dashboard/admin") && !isSuperAdmin(user)) {
      router.push(`/${locale}/dashboard`);
    }
  }, [isReady, isAuthenticated, pathname, user, router, locale]);

  return <DashboardLayout locale={locale}>{children}</DashboardLayout>;
}
