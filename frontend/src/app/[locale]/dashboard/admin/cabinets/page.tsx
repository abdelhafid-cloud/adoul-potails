"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, FolderOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualHeading } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { adminLabels } from "@/lib/admin-labels";
import type { AdminCabinet } from "@/types";
import { cn } from "@/lib/utils";

const C = adminLabels.cabinets;

export default function AdminCabinetsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  const { data: cabinets, isLoading } = useQuery<AdminCabinet[]>({
    queryKey: ["admin-cabinets"],
    queryFn: async () => (await api.get("/admin/cabinets")).data,
  });

  return (
    <div className="space-y-6">
      <BilingualHeading label={C.title} />

      {isLoading ? (
        <p className="text-center text-brand-slate">Chargement...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cabinets?.map((cab) => (
            <Card key={cab.id} className="border-brand-gray/30 shadow-sm transition hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-brand-blue-50 p-2 text-brand-blue">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-brand-navy">{cab.name}</CardTitle>
                      <p className="text-xs text-brand-slate">{cab.city}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    cab.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                  )}>
                    {cab.is_active ? C.active.fr : C.inactive.fr}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-brand-slate">{cab.email}</p>
                {cab.owner_name && (
                  <p className="text-xs text-brand-slate">Propriétaire: {cab.owner_name}</p>
                )}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#fafafa] p-3">
                  <div className="text-center">
                    <Users className="mx-auto h-4 w-4 text-brand-gray" />
                    <p className="mt-1 font-bold text-brand-navy">{cab.users_count}</p>
                    <p className="text-[10px] text-brand-slate">{C.users.fr}</p>
                  </div>
                  <div className="text-center">
                    <Users className="mx-auto h-4 w-4 text-brand-gray" />
                    <p className="mt-1 font-bold text-brand-navy">{cab.clients_count}</p>
                    <p className="text-[10px] text-brand-slate">{C.clients.fr}</p>
                  </div>
                  <div className="text-center">
                    <FolderOpen className="mx-auto h-4 w-4 text-brand-gray" />
                    <p className="mt-1 font-bold text-brand-navy">{cab.dossiers_count}</p>
                    <p className="text-[10px] text-brand-slate">{C.dossiers.fr}</p>
                  </div>
                </div>
                {cab.last_activity_at && (
                  <p className="flex items-center gap-1 text-xs text-brand-slate">
                    <Clock className="h-3 w-3" />
                    {C.lastActivity.fr}: {new Date(cab.last_activity_at).toLocaleString(dateLocale)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
