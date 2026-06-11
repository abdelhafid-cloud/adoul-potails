"use client";

import { dashboardLabels } from "@/lib/dashboard-labels";
import { cn } from "@/lib/utils";

const DOSSIER_STATUS_STYLES: Record<string, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

const DOSSIER_TYPE_STYLES: Record<string, string> = {
  heritage: "border-blue-200 bg-blue-50 text-blue-800",
  sale: "border-violet-200 bg-violet-50 text-violet-700",
  donation: "border-pink-200 bg-pink-50 text-pink-700",
  procuration: "border-cyan-200 bg-cyan-50 text-cyan-700",
  property_share: "border-indigo-200 bg-indigo-50 text-indigo-700",
  marriage: "border-rose-200 bg-rose-50 text-rose-700",
  other: "border-slate-200 bg-slate-50 text-slate-700",
};

const badgeBase = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

export function DossierStatusBadge({ status, className }: { status: string; className?: string }) {
  const lbl = dashboardLabels.dossierStatuses[status as keyof typeof dashboardLabels.dossierStatuses];
  const style = DOSSIER_STATUS_STYLES[status] ?? DOSSIER_STATUS_STYLES.draft;

  return (
    <span className={cn(badgeBase, style, className)}>
      {lbl ? `${lbl.fr} / ${lbl.ar}` : status}
    </span>
  );
}

export function DossierTypeBadge({ type, className }: { type: string; className?: string }) {
  const lbl = dashboardLabels.dossierTypes[type as keyof typeof dashboardLabels.dossierTypes];
  const style = DOSSIER_TYPE_STYLES[type] ?? DOSSIER_TYPE_STYLES.other;

  return (
    <span className={cn(badgeBase, style, className)}>
      {lbl ? `${lbl.fr} / ${lbl.ar}` : type}
    </span>
  );
}

export function HeirStatusBadge({
  status,
  className,
  compact = false,
}: {
  status: "inherits" | "blocked" | "pending" | string;
  className?: string;
  compact?: boolean;
}) {
  const L = dashboardLabels.pages.inheritance;
  const T = dashboardLabels.inheritanceTerms;
  const blocked = status === "blocked";
  const pending = status === "pending";

  const fr = blocked ? T.excludedHeir.fr : pending ? T.pendingHeir.fr : L.statusInherits.fr;
  const ar = blocked ? T.excludedHeir.ar : pending ? T.pendingHeir.ar : L.statusInherits.ar;

  return (
    <span
      title={`${fr} / ${ar}`}
      className={cn(
        badgeBase,
        compact && "px-2 py-0.5 text-[11px]",
        blocked
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : pending
            ? "border-pink-200 bg-pink-50 text-pink-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-700",
        className,
      )}
    >
      {compact ? (
        <>
          <span>{fr}</span>
          <span className="mx-1 text-current/40">·</span>
          <span dir="rtl" lang="ar">{ar}</span>
        </>
      ) : (
        `${fr} / ${ar}`
      )}
    </span>
  );
}
