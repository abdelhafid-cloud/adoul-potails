"use client";

import {
  Activity, Calculator, FileDown, FolderPlus, UserPlus, Scale,
} from "lucide-react";
import { adminLabels } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";
import type { AdminActivityItem } from "@/types";
import type { LucideIcon } from "lucide-react";

const STYLES: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  create_dossier: { icon: FolderPlus, color: "text-brand-blue", bg: "bg-brand-blue-50" },
  create_client: { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50" },
  inheritance_calculation: { icon: Calculator, color: "text-emerald-600", bg: "bg-emerald-50" },
  act_calculation: { icon: Scale, color: "text-amber-700", bg: "bg-amber-50" },
  export_pdf: { icon: FileDown, color: "text-slate-600", bg: "bg-slate-100" },
};

function actionLabel(action: string) {
  const actions = adminLabels.activityActions as Record<string, { fr: string; ar: string }>;
  return actions[action] ?? { fr: action.replace(/_/g, " "), ar: action };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

export function AdminActivityFeed({
  items,
  locale = "fr",
  compact = false,
}: {
  items: AdminActivityItem[];
  locale?: string;
  compact?: boolean;
}) {
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        {adminLabels.activity.noResults.fr} / {adminLabels.activity.noResults.ar}
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="absolute start-[19px] top-3 bottom-3 w-px bg-brand-gray/30" aria-hidden />
      <div className="space-y-1">
        {items.map((act, i) => {
          const lbl = actionLabel(act.action);
          const style = STYLES[act.action] ?? { icon: Activity, color: "text-slate-500", bg: "bg-slate-50" };
          const Icon = style.icon;

          return (
            <div
              key={`${act.created_at}-${i}`}
              className={cn(
                "flex gap-4 rounded-xl px-1 py-2 transition hover:bg-brand-blue-50/40",
                compact && "py-1.5",
              )}
            >
              <div className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gray/30",
                style.bg,
              )}>
                <Icon className={cn("h-4 w-4", style.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className={cn("font-medium text-brand-navy", compact && "text-sm")}>
                      {lbl.fr}
                    </p>
                    {!compact && <p className="text-xs text-brand-slate" dir="rtl">{lbl.ar}</p>}
                  </div>
                  <div className="text-end">
                    <p className="text-xs font-medium text-brand-blue">{relativeTime(act.created_at)}</p>
                    <time className="text-[10px] text-brand-gray">
                      {new Date(act.created_at).toLocaleString(dateLocale, {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
                {act.context_fr && (
                  <p className="mt-0.5 text-sm text-brand-slate">{act.context_fr}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-brand-slate">
                  {act.user_name && (
                    <span>{adminLabels.activity.by.fr} <strong>{act.user_name}</strong></span>
                  )}
                  {act.cabinet_name && (
                    <span>
                      {adminLabels.activity.cabinet.fr}: <strong>{act.cabinet_name}</strong>
                      {act.cabinet_city && ` (${act.cabinet_city})`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
