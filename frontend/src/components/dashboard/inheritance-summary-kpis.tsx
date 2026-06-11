"use client";

import { Users, UserX, Scale, TrendingUp } from "lucide-react";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency } from "@/lib/utils";
import type { InheritanceCalculation } from "@/types";

const L = dashboardLabels.pages.inheritance;

interface Props {
  calculation: InheritanceCalculation;
}

export function InheritanceSummaryKpis({ calculation }: Props) {
  const report = calculation.legal_proof?.report;
  const deceased = calculation.deceased_info || report?.deceased;
  const heirsCount = report?.heirs_count ?? calculation.distribution.filter((d) => d.amount > 0).length;
  const excludedCount = report?.excluded_count ?? calculation.excluded_heirs?.length ?? 0;
  const hasAwl = report?.has_awl ?? calculation.calculation_meta?.has_awl;
  const hasRadd = report?.has_radd ?? calculation.calculation_meta?.has_radd;

  const kpis = [
    {
      key: "net",
      icon: TrendingUp,
      label: dashboardLabels.estate.netEstate,
      value: formatCurrency(calculation.net_estate_value),
      accent: "text-brand-blue",
      bg: "bg-brand-blue-50 border-blue-100",
    },
    {
      key: "heirs",
      icon: Users,
      label: L.summaryHeirs,
      value: String(heirsCount),
      accent: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      key: "excluded",
      icon: UserX,
      label: L.summaryExcluded,
      value: String(excludedCount),
      accent: "text-amber-700",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      key: "school",
      icon: Scale,
      label: L.summarySchool,
      value: report?.school_fr ? `${report.school_fr}` : "Maliki / مالكي",
      accent: "text-brand-navy",
      bg: "bg-slate-50 border-slate-200",
    },
  ];

  return (
    <div className="space-y-4">
      {deceased && (deceased.name_fr || deceased.name_ar) && (
        <div className="rounded-xl border border-brand-gray/25 bg-white px-4 py-3">
          <BilingualText label={L.deceasedSection} size="xs" className="mb-1 text-brand-slate" />
          <p className="font-medium text-brand-navy">
            {deceased.name_fr}
            {deceased.name_ar && (
              <span className="mx-2 text-brand-gray">/</span>
            )}
            {deceased.name_ar && <span dir="rtl">{deceased.name_ar}</span>}
          </p>
          {(deceased.cin || deceased.death_date || deceased.death_place) && (
            <p className="mt-1 text-xs text-brand-slate">
              {[deceased.cin, deceased.death_date, deceased.death_place].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ key, icon: Icon, label, value, accent, bg }) => (
          <div key={key} className={`rounded-xl border p-4 ${bg}`}>
            <div className="mb-2 flex items-center gap-2">
              <Icon className={`h-4 w-4 ${accent}`} />
              <BilingualText label={label} size="xs" className="text-brand-slate" />
            </div>
            <p className={`text-lg font-semibold ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {(hasAwl || hasRadd) && (
        <div className="flex flex-wrap gap-2">
          {hasAwl && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">
              {L.awlApplied.fr} / {L.awlApplied.ar}
            </span>
          )}
          {hasRadd && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {L.raddApplied.fr} / {L.raddApplied.ar}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
