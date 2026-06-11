"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FolderOpen, Users, Calculator, FileText, Activity,
  Plus, Scale, ChevronRight, AlertCircle, Clock,
  FileDown, UserPlus, FolderPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BilingualCardTitle, BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { DossierStatusBadge, DossierTypeBadge } from "@/components/dashboard/status-badge";
import { api } from "@/services/api";
import { CHART_COLORS, dashboardLabels } from "@/lib/dashboard-labels";
import type { DashboardStats } from "@/types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const L = dashboardLabels.pages.dashboard;

const ACTIVITY_STYLES: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  create_dossier: { icon: FolderPlus, color: "text-brand-blue", bg: "bg-brand-blue-50 border-brand-blue/20" },
  create_client: { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  inheritance_calculation: { icon: Calculator, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  act_calculation: { icon: Scale, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  export_pdf: { icon: FileDown, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
};

function activityLabel(action: string) {
  const actions = L.activityActions as Record<string, { fr: string; ar: string }>;
  return actions[action] ?? { fr: action.replace(/_/g, " "), ar: action };
}

function entityTypeLabel(entityType?: string) {
  if (!entityType) return null;
  const types = L.activityEntityTypes as Record<string, { fr: string; ar: string }>;
  return types[entityType]
    ?? dashboardLabels.dossierTypes[entityType as keyof typeof dashboardLabels.dossierTypes]
    ?? null;
}

function relativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return L.activityJustNow.fr;
  if (mins < 60) return `${mins}${L.activityMinutesAgo.fr}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${L.activityHoursAgo.fr}`;
  const days = Math.floor(hours / 24);
  return `${days}${L.activityDaysAgo.fr}`;
}

function activityHref(locale: string, act: DashboardStats["recent_activity"][0]): string | null {
  if (!act.entity_id) return null;
  if (act.link === "dossier" || act.entity_type === "dossier") {
    return `/${locale}/dashboard/dossiers/${act.entity_id}`;
  }
  if (act.link === "inheritance" || act.entity_type === "inheritance") {
    return `/${locale}/dashboard/inheritance?calc_id=${act.entity_id}`;
  }
  return null;
}

export default function DashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
  });

  const kpis = [
    { label: L.dossiers, value: stats?.dossiers_count ?? 0, icon: FolderOpen, href: `/${locale}/dashboard/dossiers`, color: "text-brand-blue bg-brand-blue-50" },
    { label: L.clients, value: stats?.clients_count ?? 0, icon: Users, href: `/${locale}/dashboard/clients`, color: "text-violet-600 bg-violet-50" },
    { label: L.calculations, value: stats?.calculations_count ?? 0, icon: Calculator, href: `/${locale}/dashboard/inheritance`, color: "text-emerald-600 bg-emerald-50" },
    { label: L.documents, value: stats?.documents_count ?? 0, icon: FileText, href: `/${locale}/dashboard/dossiers`, color: "text-amber-600 bg-amber-50" },
  ];

  const quickActions = [
    { label: L.newDossier, href: `/${locale}/dashboard/dossiers`, icon: FolderOpen },
    { label: L.newClient, href: `/${locale}/dashboard/clients`, icon: Users },
    { label: L.calcInheritance, href: `/${locale}/dashboard/inheritance`, icon: Calculator },
    { label: L.calcWasiyyah, href: `/${locale}/dashboard/wasiyyah`, icon: Scale },
  ];

  const typeData = stats?.dossiers_by_type
    ? Object.entries(stats.dossiers_by_type).map(([key, value]) => {
        const lbl = dashboardLabels.dossierTypes[key as keyof typeof dashboardLabels.dossierTypes];
        return { key, name: lbl ? lbl.fr : key, value };
      })
    : [];

  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <BilingualText label={dashboardLabels.common.loading} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <BilingualHeading
          label={L.title}
          subtitle={
            user?.full_name
              ? { fr: `${L.welcome.fr}, ${user.full_name}`, ar: `${L.welcome.ar}، ${user.full_name}` }
              : L.welcome
          }
        />
        {user?.city && (
          <span className="rounded-full border border-brand-gray/30 bg-white px-3 py-1 text-xs text-brand-slate">
            {user.city}
          </span>
        )}
      </div>

      {(stats?.pending_dossiers_count ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            <strong>{stats?.pending_dossiers_count}</strong> {L.pendingAlert.fr}
            <span className="mx-2 text-amber-700">/</span>
            <span dir="rtl">{stats?.pending_dossiers_count} {L.pendingAlert.ar}</span>
          </p>
          <Button asChild size="sm" variant="outline" className="ms-auto border-amber-300 text-amber-800">
            <Link href={`/${locale}/dashboard/dossiers`}>
              {L.viewAll.fr}
              <ChevronRight className="ms-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label.fr} href={kpi.href}>
            <Card className="h-full transition hover:border-brand-blue/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <BilingualText label={kpi.label} size="xs" />
                </CardTitle>
                <div className={cn("rounded-xl p-2", kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-brand-navy">{kpi.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle><BilingualCardTitle label={L.quickActions} /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.label.fr}
                asChild
                variant="outline"
                className="h-auto justify-start gap-3 border-brand-gray/30 py-3 hover:border-brand-blue/40 hover:bg-brand-blue-50/50"
              >
                <Link href={action.href}>
                  <div className="rounded-lg bg-brand-blue-50 p-2 text-brand-blue">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-start text-sm">
                    {action.label.fr} / {action.label.ar}
                  </span>
                  <Plus className="ms-auto h-4 w-4 text-brand-gray" />
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dossiers récents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle><BilingualCardTitle label={L.recentDossiers} /></CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-brand-blue">
              <Link href={`/${locale}/dashboard/dossiers`}>
                {L.viewAll.fr}
                <ChevronRight className="ms-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stats?.recent_dossiers ?? []).map((d) => (
              <Link
                key={d.id}
                href={`/${locale}/dashboard/dossiers/${d.id}`}
                className="block rounded-xl border border-brand-gray/20 bg-white p-3 transition hover:border-brand-blue/30 hover:bg-brand-blue-50/30"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-brand-blue">{d.number}</span>
                  <DossierStatusBadge status={d.status} />
                </div>
                <p className="truncate text-sm font-medium text-brand-navy">
                  {d.client_name || d.title || "—"}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <DossierTypeBadge type={d.type} className="scale-90" />
                  {d.updated_at && (
                    <span className="flex items-center gap-1 text-xs text-brand-slate">
                      <Clock className="h-3 w-3" />
                      {new Date(d.updated_at).toLocaleDateString(dateLocale)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {!stats?.recent_dossiers?.length && (
              <div className="py-6 text-center">
                <BilingualText label={L.noDossiers} className="mb-3 justify-center text-brand-slate" />
                <Button asChild size="sm" className="bg-brand-accent text-white">
                  <Link href={`/${locale}/dashboard/dossiers`}>
                    <Plus className="h-4 w-4" />
                    <span className="ms-1">{L.newDossier.fr}</span>
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dossiers par type */}
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.dossiersByType} /></CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#94a3b8" }}
                  >
                    {typeData.map((entry, i) => (
                      <Cell key={entry.key} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-brand-slate">{L.noDossiers.fr}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activité récente — timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="rounded-xl bg-brand-blue-50 p-2 text-brand-blue">
            <Activity className="h-5 w-5" />
          </div>
          <CardTitle><BilingualCardTitle label={L.recentActivity} /></CardTitle>
        </CardHeader>
        <CardContent>
          {(stats?.recent_activity ?? []).length > 0 ? (
            <div className="relative space-y-0">
              <div className="absolute start-[19px] top-2 bottom-2 w-px bg-brand-gray/30" aria-hidden />
              {stats!.recent_activity.map((act, i) => {
                const lbl = activityLabel(act.action);
                const style = ACTIVITY_STYLES[act.action] ?? {
                  icon: Activity,
                  color: "text-brand-slate",
                  bg: "bg-[#fafafa] border-brand-gray/30",
                };
                const Icon = style.icon;
                const etypeLbl = entityTypeLabel(act.entity_type);
                const href = activityHref(locale, act);
                const content = (
                  <div className="flex gap-4 py-3">
                    <div className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      style.bg,
                    )}>
                      <Icon className={cn("h-4 w-4", style.color)} />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-brand-navy">
                            {lbl.fr}
                            {etypeLbl && act.action !== "create_dossier" && act.action !== "create_client" && (
                              <span className="ms-2 rounded-md bg-brand-gray/15 px-1.5 py-0.5 text-xs font-normal text-brand-slate">
                                {etypeLbl.fr}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-brand-slate" dir="rtl">{lbl.ar}</p>
                        </div>
                        <div className="text-end">
                          <p className="text-xs font-medium text-brand-blue">
                            {relativeTime(act.created_at, locale)}
                          </p>
                          <time className="text-[10px] text-brand-gray">
                            {new Date(act.created_at).toLocaleString(dateLocale, {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                      </div>
                      {(act.context_fr || act.context_ar) && (
                        <p className="mt-1 text-sm text-brand-slate">
                          {act.context_fr}
                          {act.context_ar && act.context_ar !== act.context_fr && (
                            <span className="ms-2" dir="rtl">{act.context_ar}</span>
                          )}
                        </p>
                      )}
                      {act.user_name && (
                        <p className="mt-1 text-xs text-brand-gray">
                          {L.activityBy.fr} {act.user_name}
                          <span className="mx-1">/</span>
                          <span dir="rtl">{L.activityBy.ar} {act.user_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );

                return href ? (
                  <Link
                    key={i}
                    href={href}
                    className="block rounded-xl transition hover:bg-brand-blue-50/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={i}>{content}</div>
                );
              })}
            </div>
          ) : (
            <BilingualText label={L.noActivity} className="py-8 text-center text-brand-slate" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
