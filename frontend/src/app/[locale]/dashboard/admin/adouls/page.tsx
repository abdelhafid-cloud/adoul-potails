"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, FolderOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { api } from "@/services/api";
import { adminLabels } from "@/lib/admin-labels";
import type { AdminAdoul, AdminCabinet } from "@/types";
import { cn } from "@/lib/utils";

const A = adminLabels.adouls;
const U = adminLabels.users;
const C = adminLabels.cabinets;

function roleLabel(role: string) {
  const roles = U.roles as Record<string, { fr: string; ar: string }>;
  return roles[role] ?? { fr: role, ar: role };
}

export default function AdminAdoulsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [cabinetId, setCabinetId] = useState("");
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  const { data: cabinets } = useQuery<AdminCabinet[]>({
    queryKey: ["admin-cabinets"],
    queryFn: async () => (await api.get("/admin/cabinets")).data,
  });

  const { data: adouls, isLoading } = useQuery<AdminAdoul[]>({
    queryKey: ["admin-adouls", cabinetId],
    queryFn: async () =>
      (await api.get("/admin/adouls", { params: cabinetId ? { cabinet_id: cabinetId } : {} })).data,
  });

  const selectClass =
    "mb-4 h-10 max-w-md rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      <BilingualHeading label={A.title} subtitle={A.subtitle} />

      <select className={selectClass} value={cabinetId} onChange={(e) => setCabinetId(e.target.value)}>
        <option value="">{adminLabels.activity.allCabinets.fr} / {adminLabels.activity.allCabinets.ar}</option>
        {cabinets?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {isLoading ? (
        <p className="text-center text-brand-slate">Chargement...</p>
      ) : !adouls?.length ? (
        <p className="text-center text-brand-slate">
          <BilingualText label={A.noResults} size="sm" />
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adouls.map((adoul) => {
            const rl = roleLabel(adoul.role);
            return (
              <Card key={adoul.id} className="border-brand-gray/30 shadow-sm transition hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={adoul.full_name}
                        imageUrl={adoul.profile_image_url}
                        size="lg"
                      />
                      <div>
                        <CardTitle className="text-base text-brand-navy">{adoul.full_name}</CardTitle>
                        <p className="text-xs text-brand-slate">{adoul.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      adoul.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                    )}>
                      {adoul.is_active ? C.active.fr : C.inactive.fr}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      adoul.role === "cabinet_owner" ? "bg-violet-100 text-violet-800" : "bg-brand-blue-50 text-brand-blue",
                    )}>
                      {rl.fr}
                    </span>
                    {adoul.is_verified && (
                      <span className="text-xs text-emerald-600">✓ {U.verified.fr}</span>
                    )}
                  </div>

                  {adoul.cabinet_name && (
                    <p className="flex items-center gap-1.5 text-brand-slate">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-brand-gray" />
                      {adoul.cabinet_name}
                      {adoul.cabinet_city && (
                        <span className="text-xs text-brand-gray">({adoul.cabinet_city})</span>
                      )}
                    </p>
                  )}

                  {adoul.phone && (
                    <p className="text-xs text-brand-slate" dir="ltr">{adoul.phone}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#fafafa] p-3">
                    <div className="text-center">
                      <FolderOpen className="mx-auto h-4 w-4 text-brand-gray" />
                      <p className="mt-1 font-bold text-brand-navy">{adoul.dossiers_count}</p>
                      <p className="text-[10px] text-brand-slate">{A.dossiers.fr}</p>
                    </div>
                    <div className="text-center">
                      <Clock className="mx-auto h-4 w-4 text-brand-gray" />
                      <p className="mt-1 text-xs font-medium text-brand-navy">
                        {adoul.last_login
                          ? new Date(adoul.last_login).toLocaleDateString(dateLocale)
                          : "—"}
                      </p>
                      <p className="text-[10px] text-brand-slate">{U.lastLogin.fr}</p>
                    </div>
                  </div>

                  {adoul.last_activity_at && (
                    <p className="flex items-center gap-1 text-xs text-brand-slate">
                      <Clock className="h-3 w-3" />
                      {A.lastActivity.fr}: {new Date(adoul.last_activity_at).toLocaleString(dateLocale)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
