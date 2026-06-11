"use client";

import { BilingualText } from "@/components/dashboard/bilingual-text";
import { HeirStatusBadge } from "@/components/dashboard/status-badge";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { heirTypeLabel } from "@/lib/heir-types";
import { cn, formatCurrency } from "@/lib/utils";
import type { HeirDetail } from "@/types";

const L = dashboardLabels.pages.inheritance;

function TableHead({ label, align = "start" }: { label: { fr: string; ar: string }; align?: "start" | "end" | "center" }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-slate",
        align === "end" && "text-end",
        align === "center" && "text-center",
        align === "start" && "text-start",
      )}
    >
      <span className="text-brand-navy">{label.fr}</span>
      <span className="mx-1.5 font-normal text-brand-gray">·</span>
      <span dir="rtl" lang="ar" className="font-normal normal-case">{label.ar}</span>
    </th>
  );
}

function GenderCell({ genderFr, genderAr }: { genderFr?: string; genderAr?: string }) {
  if (!genderFr && !genderAr) {
    return <span className="text-brand-gray">—</span>;
  }
  const isFemale = genderFr?.toLowerCase().includes("femme") || genderAr === "أنثى";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-gray/20 bg-white px-2 py-0.5 text-xs text-brand-navy">
      <span className={cn("text-sm leading-none", isFemale ? "text-pink-600" : "text-blue-600")}>
        {isFemale ? "♀" : "♂"}
      </span>
      <span>{genderFr}</span>
      {genderAr && (
        <>
          <span className="text-brand-gray">·</span>
          <span dir="rtl">{genderAr}</span>
        </>
      )}
    </span>
  );
}

interface Props {
  heirs: HeirDetail[];
  className?: string;
}

export function HeirDetailsTable({ heirs, className }: Props) {
  const showReasonCol = heirs.some(
    (h) => h.status !== "inherits" && (h.reason_fr || h.reason_ar),
  );

  const totalAmount = heirs
    .filter((h) => h.status === "inherits")
    .reduce((sum, h) => sum + (h.amount || 0), 0);

  const totalPct = heirs
    .filter((h) => h.status === "inherits")
    .reduce((sum, h) => sum + (h.percentage || 0), 0);

  return (
    <div className={cn("mt-6", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <BilingualText label={L.heirDetails} size="sm" className="font-semibold" />
        <span className="text-xs text-brand-slate">
          {heirs.length} {heirs.length > 1 ? "personnes" : "personne"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-gray/25 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-brand-gray/25 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]">
                <th className="w-10 px-3 py-3 text-center text-xs font-semibold text-brand-slate">#</th>
                <TableHead label={L.heirColumn} />
                <TableHead label={L.genderColumn} />
                <TableHead label={L.statusColumn} align="center" />
                <TableHead label={L.percentColumn} align="end" />
                <TableHead label={L.amountColumn} align="end" />
                {showReasonCol && <TableHead label={L.reasonColumn} />}
              </tr>
            </thead>
            <tbody>
              {heirs.map((h, i) => {
                const blocked = h.status === "blocked";
                const pending = h.status === "pending";
                const inherits = h.status === "inherits";
                const typeLbl = heirTypeLabel(h.type);
                const isAutoArLabel = !!h.name_ar && /[\d/]|الزوجة|الابن|البنت|الأخ|الأخت|العم|الخال/.test(h.name_ar);
                const subtitleIsType = !h.name_ar || isAutoArLabel;

                return (
                  <tr
                    key={`${h.type}-${h.index ?? i}`}
                    className={cn(
                      "border-b border-brand-gray/15 transition-colors last:border-0",
                      i % 2 === 1 && "bg-[#fafafa]/80",
                      inherits && "hover:bg-blue-50/40",
                      blocked && "bg-amber-50/50 hover:bg-amber-50/70",
                      pending && "bg-pink-50/40 hover:bg-pink-50/60",
                    )}
                  >
                    <td className="px-3 py-3 text-center text-xs font-medium text-brand-slate">
                      {h.index ?? i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-navy">{h.name}</p>
                      {subtitleIsType ? (
                        <p className="mt-0.5 text-xs text-brand-slate">
                          {typeLbl.fr}
                          <span className="mx-1 text-brand-gray">·</span>
                          <span dir="rtl">{typeLbl.ar}</span>
                          {h.index && h.count_total && h.count_total > 1 && (
                            <span className="ms-1 text-brand-gray">({h.index}/{h.count_total})</span>
                          )}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-brand-slate" dir="rtl">{h.name_ar}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <GenderCell genderFr={h.gender_fr} genderAr={h.gender_ar} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <HeirStatusBadge status={h.status} compact />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <span
                        className={cn(
                          "inline-block min-w-[3.5rem] rounded-md px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
                          inherits
                            ? "bg-blue-50 text-brand-blue"
                            : "bg-brand-gray/10 text-brand-slate",
                        )}
                      >
                        {h.percentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <span className="whitespace-nowrap font-mono text-sm font-medium tabular-nums text-brand-navy">
                        {inherits ? formatCurrency(h.amount) : "—"}
                      </span>
                    </td>
                    {showReasonCol && (
                      <td className="max-w-[220px] px-4 py-3 text-xs leading-relaxed text-brand-slate">
                        {!inherits && h.reason_fr ? (
                          <>
                            <span>{h.reason_fr}</span>
                            {h.reason_ar && (
                              <p className="mt-1 text-[11px] text-brand-slate/90" dir="rtl">{h.reason_ar}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-brand-gray">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            {heirs.some((h) => h.status === "inherits") && (
              <tfoot>
                <tr className="border-t-2 border-brand-gray/30 bg-[#f8fafc]">
                  <td colSpan={4} className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-brand-slate">
                    Total / المجموع
                  </td>
                  <td className="px-4 py-3 text-end">
                    <span className="font-mono text-sm font-bold tabular-nums text-brand-blue">
                      {totalPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <span className="whitespace-nowrap font-mono text-sm font-bold tabular-nums text-brand-blue">
                      {formatCurrency(totalAmount)}
                    </span>
                  </td>
                  {showReasonCol && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
