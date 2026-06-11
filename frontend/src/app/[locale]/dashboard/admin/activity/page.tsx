"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { AdminActivityFeed } from "@/components/dashboard/admin-activity-feed";
import { api } from "@/services/api";
import { adminLabels } from "@/lib/admin-labels";
import type { AdminActivityItem, AdminCabinet, AdminUser } from "@/types";

export default function AdminActivityPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [cabinetId, setCabinetId] = useState("");
  const [userId, setUserId] = useState("");

  const { data: cabinets } = useQuery<AdminCabinet[]>({
    queryKey: ["admin-cabinets"],
    queryFn: async () => (await api.get("/admin/cabinets")).data,
  });

  const { data: users } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", cabinetId],
    queryFn: async () =>
      (await api.get("/admin/users", { params: cabinetId ? { cabinet_id: cabinetId } : {} })).data,
  });

  const { data: activity, isLoading } = useQuery<AdminActivityItem[]>({
    queryKey: ["admin-activity", cabinetId, userId],
    queryFn: async () =>
      (await api.get("/admin/activity", {
        params: {
          limit: 100,
          ...(cabinetId ? { cabinet_id: cabinetId } : {}),
          ...(userId ? { user_id: userId } : {}),
        },
      })).data,
  });

  const selectClass =
    "h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      <BilingualHeading label={adminLabels.activity.title} subtitle={adminLabels.activity.subtitle} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-slate">
            <BilingualText label={adminLabels.activity.filterCabinet} size="xs" />
          </label>
          <select
            className={selectClass}
            value={cabinetId}
            onChange={(e) => { setCabinetId(e.target.value); setUserId(""); }}
          >
            <option value="">{adminLabels.activity.allCabinets.fr}</option>
            {cabinets?.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-slate">
            <BilingualText label={adminLabels.activity.filterUser} size="xs" />
          </label>
          <select className={selectClass} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">{adminLabels.activity.allUsers.fr}</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-brand-gray/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-navy">
            {activity?.length ?? 0} événement(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-brand-slate">Chargement...</p>
          ) : (
            <AdminActivityFeed items={activity ?? []} locale={locale} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
