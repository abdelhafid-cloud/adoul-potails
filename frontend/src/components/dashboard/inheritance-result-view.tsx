"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Download, ArrowRight, FolderOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualText } from "@/components/dashboard/bilingual-text";
import { InheritanceLegalProof } from "@/components/dashboard/inheritance-legal-proof";
import { InheritanceSummaryKpis } from "@/components/dashboard/inheritance-summary-kpis";
import { HeirDetailsTable } from "@/components/dashboard/heir-details-table";
import { InheritanceAddHeirPanel } from "@/components/dashboard/inheritance-add-heir-panel";
import { CHART_COLORS, dashboardLabels } from "@/lib/dashboard-labels";
import { HEIR_CHART_COLORS, heirTypeLabel, normalizeHeirType } from "@/lib/heir-types";
import { formatCurrency, cn } from "@/lib/utils";
import { downloadPdf, invalidateDossierQueries } from "@/lib/download-pdf";
import { getWasiyyahHref } from "@/lib/calculator-routes";
import type { InheritanceCalculation } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const L = dashboardLabels.pages.inheritance;
const E = dashboardLabels.estate;

function renderPieLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  value?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, name = "", value = 0 } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#1e3a5f"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${name} ${value.toFixed(2)}%`}
    </text>
  );
}

interface Props {
  calculation: InheritanceCalculation;
  locale: string;
  headerActions?: ReactNode;
}

export function InheritanceResultView({ calculation, locale, headerActions }: Props) {
  const queryClient = useQueryClient();
  const [pdfError, setPdfError] = useState("");

  const wasiyyah = calculation.wasiyyah ?? calculation.legal_proof?.wasiyyah;
  const faraidBase = calculation.faraid_base ?? wasiyyah?.remainder_for_heirs ?? calculation.net_estate_value;

  const chartData = calculation.distribution
    .filter((d) => d.amount > 0)
    .map((d, i) => {
      const lbl = heirTypeLabel(d.type);
      return {
        id: `${d.type}-${d.name ?? i}`,
        type: d.type,
        name: d.name || lbl.fr,
        value: Math.round(d.percentage * 100) / 100,
      };
    });

  const pieColor = (type: string, index: number) =>
    HEIR_CHART_COLORS[normalizeHeirType(type)] ?? CHART_COLORS[index % CHART_COLORS.length];

  const heirDetails = calculation.heir_details ?? [];
  const dossierId = calculation.dossier_id;

  const exportPDF = async () => {
    setPdfError("");
    try {
      await downloadPdf(`/inheritance/${calculation.id}/pdf`, `heritage_${calculation.id}.pdf`, {
        onSuccess: () => invalidateDossierQueries(queryClient, dossierId),
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Erreur PDF");
    }
  };

  return (
    <div className="space-y-6">
      {headerActions}

      {pdfError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pdfError}</div>
      )}

      <div className="rounded-xl border border-brand-gray/25 bg-white px-4 py-3">
        <p className="font-medium text-brand-navy">{calculation.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-slate">
          {calculation.dossier?.number && (
            <span className="font-mono text-brand-blue">{calculation.dossier.number}</span>
          )}
          {calculation.client?.full_name && <span>{calculation.client.full_name}</span>}
          {calculation.created_at && (
            <span>
              {new Date(calculation.created_at).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-MA", {
                dateStyle: "medium",
              })}
            </span>
          )}
        </div>
      </div>

      <InheritanceSummaryKpis calculation={calculation} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle><BilingualCardTitle label={L.distribution} /></CardTitle>
            <div className="flex flex-wrap gap-2">
              {dossierId && (
                <Button asChild size="sm" variant="outline" className="border-brand-accent text-brand-accent">
                  <Link href={`/${locale}/dashboard/dossiers/${dossierId}`}>
                    <FolderOpen className="h-4 w-4" />
                    <span className="ms-1 text-xs">{L.viewDossier.fr}</span>
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={exportPDF} className="border-brand-slate text-brand-slate">
                <Download className="h-4 w-4" />
                <span className="ms-1 text-xs">{L.exportPDF.fr} / {L.exportPDF.ar}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-3">
              <div className="rounded-xl border border-blue-100 bg-brand-blue-50 p-4">
                <BilingualText label={E.netEstate} size="xs" className="mb-1" />
                <p className="text-2xl font-bold text-brand-blue">{formatCurrency(calculation.net_estate_value)}</p>
              </div>
              {wasiyyah && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <BilingualText label={L.wasiyyahApplied} size="xs" className="mb-1 text-amber-800" />
                  <p className="text-2xl font-bold text-amber-900">
                    {formatCurrency(wasiyyah.wasiyyah_amount_applied ?? 0)}
                  </p>
                  {(wasiyyah.legatee_name || wasiyyah.legatee_name_ar) && (
                    <p className="mt-1 text-xs text-amber-800">
                      {L.legatee.fr}: {wasiyyah.legatee_name}
                      {wasiyyah.legatee_name_ar && (
                        <span className="mx-1" dir="rtl">/ {wasiyyah.legatee_name_ar}</span>
                      )}
                    </p>
                  )}
                  {wasiyyah.status_fr && (
                    <p className="mt-1 text-xs text-amber-700">{wasiyyah.status_fr}</p>
                  )}
                </div>
              )}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <BilingualText label={L.faraidBase} size="xs" className="mb-1 text-emerald-800" />
                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(faraidBase)}</p>
              </div>
              {!wasiyyah && dossierId && (
                <Button asChild size="sm" variant="outline" className="border-brand-accent text-brand-accent">
                  <Link href={getWasiyyahHref(locale, dossierId, calculation.net_estate_value)}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="ms-1 text-xs">{L.openWasiyyah.fr} / {L.openWasiyyah.ar}</span>
                  </Link>
                </Button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 28, right: 36, bottom: 12, left: 36 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={62}
                  label={renderPieLabel}
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={entry.id} fill={pieColor(entry.type, i)} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${Number(v).toFixed(2)}%`}
                  contentStyle={{ color: "#1e3a5f", borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Legend
                  wrapperStyle={{ color: "#1e3a5f", fontSize: 12, fontWeight: 600, paddingTop: 8 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 overflow-hidden rounded-xl border border-brand-gray/25">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gray/25 bg-[#f8fafc]">
                    <th className="px-4 py-2.5 text-start text-xs font-semibold text-brand-navy">
                      {L.heirColumn.fr} · <span dir="rtl">{L.heirColumn.ar}</span>
                    </th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold text-brand-navy">
                      {L.percentColumn.fr} · <span dir="rtl">{L.percentColumn.ar}</span>
                    </th>
                    <th className="px-4 py-2.5 text-end text-xs font-semibold text-brand-navy">
                      {L.amountColumn.fr} · <span dir="rtl">{L.amountColumn.ar}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.distribution.map((d, i) => {
                    const lbl = heirTypeLabel(d.type);
                    return (
                      <tr key={i} className={cn("border-b border-brand-gray/15", i % 2 === 1 && "bg-[#fafafa]/80")}>
                        <td className="px-4 py-2.5 font-medium text-brand-navy">
                          {d.name || `${lbl.fr} · ${lbl.ar}`}
                        </td>
                        <td className="px-4 py-2.5 text-end font-mono text-xs font-semibold tabular-nums text-brand-blue">
                          {d.percentage.toFixed(2)}%
                        </td>
                        <td className="px-4 py-2.5 text-end font-mono text-sm tabular-nums text-brand-navy">
                          {formatCurrency(d.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {heirDetails.length > 0 && <HeirDetailsTable heirs={heirDetails} />}

            <div className="mt-6">
              <InheritanceAddHeirPanel calculation={calculation} locale={locale} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <InheritanceLegalProof calculation={calculation} />
        </div>
      </div>
    </div>
  );
}
