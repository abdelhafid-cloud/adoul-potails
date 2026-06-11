"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Users, FolderOpen, Calculator, Activity, MessageSquare, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { AdminActivityFeed } from "@/components/dashboard/admin-activity-feed";
import { api } from "@/services/api";
import { adminLabels } from "@/lib/admin-labels";
import type { AdminActivityItem, AdminStats } from "@/types";

const S = adminLabels.stats;

export default function AdminOverviewPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const { data: activity } = useQuery<AdminActivityItem[]>({
    queryKey: ["admin-activity-preview"],
    queryFn: async () => (await api.get("/admin/activity", { params: { limit: 8 } })).data,
  });

  const kpis = [
    { label: S.cabinets, value: stats?.cabinets_count ?? 0, icon: Building2, color: "text-brand-blue bg-brand-blue-50" },
    { label: S.adouls, value: stats?.adouls_count ?? 0, icon: Users, color: "text-violet-600 bg-violet-50" },
    { label: S.dossiers, value: stats?.dossiers_count ?? 0, icon: FolderOpen, color: "text-brand-blue bg-brand-blue-50" },
    { label: S.calculations, value: stats?.calculations_count ?? 0, icon: Calculator, color: "text-emerald-600 bg-emerald-50" },
    { label: S.clients, value: stats?.clients_count ?? 0, icon: Users, color: "text-violet-600 bg-violet-50" },
    { label: S.activityToday, value: stats?.activity_today ?? 0, icon: Activity, color: "text-amber-700 bg-amber-50" },
    { label: S.aiChats, value: stats?.ai_conversations_count ?? 0, icon: MessageSquare, color: "text-brand-slate bg-[#fafafa]" },
  ];

  return (
    <div className="space-y-8">
      <BilingualHeading label={adminLabels.title} subtitle={adminLabels.subtitle} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label.fr} className="border-brand-gray/30 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">
                <BilingualText label={kpi.label} size="xs" />
              </CardTitle>
              <div className={`rounded-lg p-2 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-brand-navy">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-brand-gray/30 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-brand-navy">
              <BilingualText label={adminLabels.nav.activity} />
            </CardTitle>
            <p className="mt-1 text-xs text-brand-slate">
              {adminLabels.activity.subtitle.fr}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/dashboard/admin/activity`}>
              {adminLabels.activity.title.fr}
              <ChevronRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AdminActivityFeed items={activity ?? []} locale={locale} compact />
        </CardContent>
      </Card>
    </div>
  );
}
