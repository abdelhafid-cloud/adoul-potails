"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency } from "@/lib/utils";
import type { InheritanceCalculationSummary, PaginatedResponse } from "@/types";

const L = dashboardLabels.pages.inheritance;

interface Props {
  onSelect: (calcId: string) => void;
  onNew: () => void;
  locale: string;
  dossierIdFilter?: string;
}

export function InheritanceCalculationsTable({ onSelect, onNew, locale, dossierIdFilter }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<InheritanceCalculationSummary>>({
    queryKey: ["inheritance-calculations", page, search, dossierIdFilter],
    queryFn: async () => {
      const res = await api.get("/inheritance", {
        params: {
          page,
          per_page: 15,
          search: search || undefined,
          dossier_id: dossierIdFilter || undefined,
        },
      });
      return res.data;
    },
  });

  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle><BilingualCardTitle label={L.savedCalculations} /></CardTitle>
          <BilingualText label={L.savedCalculationsHint} size="sm" className="mt-1 text-brand-slate" />
        </div>
        <Button onClick={onNew} className="bg-brand-accent text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          <span className="ms-2 text-xs">{L.tabNew.fr} / {L.tabNew.ar}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`${L.searchCalculations.fr} / ${L.searchCalculations.ar}`}
            className="border-brand-gray/50 ps-9"
          />
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-brand-slate">
            {dashboardLabels.common.loading.fr} / {dashboardLabels.common.loading.ar}
          </p>
        ) : !items.length ? (
          <div className="py-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-brand-gray" />
            <p className="mb-4 text-brand-slate">{L.noSavedCalculations.fr} / {L.noSavedCalculations.ar}</p>
            <Button onClick={onNew} className="bg-brand-accent text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              <span className="ms-2">{L.tabNew.fr} / {L.tabNew.ar}</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-brand-gray/25">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-brand-gray/30 bg-[#fafafa]">
                    <th className="px-4 py-3 text-start"><BilingualText label={L.colDate} size="xs" /></th>
                    <th className="px-4 py-3 text-start"><BilingualText label={dashboardLabels.fields.title} size="xs" /></th>
                    <th className="px-4 py-3 text-start"><BilingualText label={L.colDossier} size="xs" /></th>
                    <th className="px-4 py-3 text-start"><BilingualText label={L.colDeceased} size="xs" /></th>
                    <th className="px-4 py-3 text-center"><BilingualText label={L.colHeirs} size="xs" /></th>
                    <th className="px-4 py-3 text-end"><BilingualText label={L.colNet} size="xs" /></th>
                    <th className="px-4 py-3 text-end"><BilingualText label={L.colActions} size="xs" /></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((calc) => (
                    <tr
                      key={calc.id}
                      className="cursor-pointer border-b border-brand-gray/20 transition-colors hover:bg-brand-blue-50/40"
                      onClick={() => onSelect(calc.id)}
                    >
                      <td className="px-4 py-3 text-brand-slate">
                        {calc.created_at
                          ? new Date(calc.created_at).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-MA")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-navy">{calc.title}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-brand-blue">{calc.dossier_number || "—"}</span>
                        {calc.client_name && (
                          <span className="mt-0.5 block text-xs text-brand-slate">{calc.client_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-slate">
                        {calc.deceased_name ? (
                          <>
                            <span>{calc.deceased_name}</span>
                            {calc.deceased_name_ar && (
                              <span className="block text-xs" dir="rtl">{calc.deceased_name_ar}</span>
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-slate">
                        {calc.heirs_count ?? "—"}
                        {(calc.excluded_count ?? 0) > 0 && (
                          <span className="block text-xs text-amber-700">
                            −{calc.excluded_count} hajb
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-end font-medium text-brand-navy">
                        {formatCurrency(calc.net_estate_value)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-brand-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(calc.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="ms-1 hidden sm:inline text-xs">{L.viewCalculation.fr}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-brand-slate text-brand-slate"
                >
                  ←
                </Button>
                <span className="text-xs text-brand-slate">
                  {page} / {data.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-brand-slate text-brand-slate"
                >
                  →
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
