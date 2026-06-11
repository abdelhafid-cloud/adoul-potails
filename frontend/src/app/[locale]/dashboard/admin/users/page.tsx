"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { api } from "@/services/api";
import { adminLabels } from "@/lib/admin-labels";
import type { AdminCabinet, AdminUser } from "@/types";
import { cn } from "@/lib/utils";

const U = adminLabels.users;

function roleLabel(role: string) {
  const roles = U.roles as Record<string, { fr: string; ar: string }>;
  return roles[role] ?? { fr: role, ar: role };
}

export default function AdminUsersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [cabinetId, setCabinetId] = useState("");
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  const { data: cabinets } = useQuery<AdminCabinet[]>({
    queryKey: ["admin-cabinets"],
    queryFn: async () => (await api.get("/admin/cabinets")).data,
  });

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", cabinetId],
    queryFn: async () =>
      (await api.get("/admin/users", { params: cabinetId ? { cabinet_id: cabinetId } : {} })).data,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const selectClass =
    "mb-4 h-10 max-w-md rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      <BilingualHeading label={U.title} />

      <select className={selectClass} value={cabinetId} onChange={(e) => setCabinetId(e.target.value)}>
        <option value="">Tous les cabinets / كل المكاتب</option>
        {cabinets?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <Card className="border-brand-gray/30 shadow-sm">
        <CardHeader>
          <CardTitle>{users?.length ?? 0} utilisateur(s)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <p className="p-8 text-center text-brand-slate">Chargement...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray/30 bg-[#fafafa] text-start">
                  <th className="px-4 py-3 font-medium text-brand-navy">Nom</th>
                  <th className="px-4 py-3 font-medium text-brand-navy">
                    <BilingualText label={U.role} size="xs" />
                  </th>
                  <th className="px-4 py-3 font-medium text-brand-navy">
                    <BilingualText label={U.cabinet} size="xs" />
                  </th>
                  <th className="px-4 py-3 font-medium text-brand-navy">
                    <BilingualText label={U.lastLogin} size="xs" />
                  </th>
                  <th className="px-4 py-3 font-medium text-brand-navy">Statut</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => {
                  const rl = roleLabel(u.role);
                  return (
                    <tr key={u.id} className="border-b border-brand-gray/20 hover:bg-brand-blue-50/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={u.full_name}
                            imageUrl={u.profile_image_url}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-brand-navy">{u.full_name}</p>
                            <p className="text-xs text-brand-slate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          u.role === "super_admin" && "bg-amber-100 text-amber-800",
                          u.role === "cabinet_owner" && "bg-violet-100 text-violet-800",
                          u.role === "adoul" && "bg-brand-blue-50 text-brand-blue",
                          u.role === "assistant" && "bg-slate-100 text-slate-700",
                        )}>
                          {rl.fr}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-slate">
                        {u.cabinet_name ?? "—"}
                        {u.cabinet_city && <span className="text-xs text-brand-gray"> ({u.cabinet_city})</span>}
                      </td>
                      <td className="px-4 py-3 text-brand-slate">
                        {u.last_login
                          ? new Date(u.last_login).toLocaleString(dateLocale)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs font-medium",
                          u.is_active ? "text-emerald-600" : "text-red-500",
                        )}>
                          {u.is_active ? "Actif" : "Inactif"}
                          {u.is_verified && " ✓"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
