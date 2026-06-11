"use client";

import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calculator, FolderOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { DossierStatusBadge, DossierTypeBadge } from "@/components/dashboard/status-badge";
import { DossierDocumentsPanel } from "@/components/dashboard/dossier-documents-panel";
import { api } from "@/services/api";
import { downloadPdf, invalidateDossierQueries, pdfFilenameForCalculation, pdfPathForCalculation } from "@/lib/download-pdf";
import { getCalculatorHref, getWasiyyahHref } from "@/lib/calculator-routes";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency } from "@/lib/utils";
import type { DossierDetail } from "@/types";
import type { Bilingual } from "@/lib/dashboard-labels";

const L = dashboardLabels.pages.dossiers;
const F = dashboardLabels.fields;
const C = dashboardLabels.common;

function MetaField({ label, children }: { label: Bilingual; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-brand-gray/20 bg-[#fafafa] px-4 py-3">
      <BilingualLabel label={label} className="mb-0" />
      <div className="min-h-[1.75rem]">{children}</div>
    </div>
  );
}

function calcTypeLabel(type: string) {
  if (type === "inheritance") return dashboardLabels.dossierTypes.heritage;
  const key = type as keyof typeof dashboardLabels.dossierTypes;
  return dashboardLabels.dossierTypes[key] || { fr: type, ar: type };
}

export default function DossierDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const dossierId = params?.id as string;
  const queryClient = useQueryClient();

  const { data: dossier, isLoading } = useQuery<DossierDetail>({
    queryKey: ["dossier", dossierId],
    queryFn: async () => (await api.get(`/dossiers/${dossierId}`)).data,
    enabled: !!dossierId,
  });


  const [pdfError, setPdfError] = useState("");

  const handleDownloadPdf = async (type: string, id: string) => {
    const path = pdfPathForCalculation(type, id);
    if (!path) return;
    setPdfError("");
    try {
      await downloadPdf(path, pdfFilenameForCalculation(type, id), {
        onSuccess: () => invalidateDossierQueries(queryClient, dossierId),
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Erreur PDF");
    }
  };

  const calculatorHref = dossier ? getCalculatorHref(locale, dossier.type, dossier.id) : null;
  const wasiyyahHref = dossier?.type === "heritage" ? getWasiyyahHref(locale, dossier.id) : null;

  if (isLoading) {
    return (
      <p className="py-12 text-center">
        <BilingualText label={C.loading} className="justify-center" />
      </p>
    );
  }

  if (!dossier) {
    return (
      <p className="py-12 text-center">
        <BilingualText label={C.noResults} className="justify-center" />
      </p>
    );
  }

  const calculations = dossier.calculations || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-brand-slate">
          <Link href={`/${locale}/dashboard/dossiers`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="ms-1">{L.back.fr} / {L.back.ar}</span>
          </Link>
        </Button>
        <BilingualHeading label={L.detail} />
      </div>

      {pdfError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pdfError}</div>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-brand-blue" />
              <span className="font-mono text-lg text-brand-blue">{dossier.number}</span>
            </div>
            {dossier.title && <CardTitle className="text-brand-navy">{dossier.title}</CardTitle>}
          </div>
          {calculatorHref && (
            <Button asChild className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700">
              <Link href={calculatorHref}>
                <Calculator className="h-4 w-4" />
                <span className="ms-2">{L.openCalculator.fr} / {L.openCalculator.ar}</span>
              </Link>
            </Button>
          )}
          {wasiyyahHref && (
            <Button asChild variant="outline" className="border-brand-accent text-brand-accent">
              <Link href={wasiyyahHref}>
                <span className="ms-1">{dashboardLabels.nav.wasiyyah.fr} / {dashboardLabels.nav.wasiyyah.ar}</span>
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetaField label={F.client}>
              <p className="font-medium text-brand-navy">{dossier.client_name}</p>
            </MetaField>
            <MetaField label={F.type}>
              <DossierTypeBadge type={dossier.type} className="w-fit px-3 py-1" />
            </MetaField>
            <MetaField label={F.status}>
              <DossierStatusBadge status={dossier.status} className="w-fit px-3 py-1" />
            </MetaField>
            {dossier.created_at && (
              <MetaField label={{ fr: "Date de création", ar: "تاريخ الإنشاء" }}>
                <p className="font-medium text-brand-navy">
                  {new Date(dossier.created_at).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-MA")}
                </p>
              </MetaField>
            )}
          </dl>
        </CardContent>
      </Card>

      <DossierDocumentsPanel dossierId={dossierId} />

      <Card>
        <CardHeader>
          <CardTitle><BilingualCardTitle label={L.calculations} /></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!calculations.length ? (
            <div className="px-4 py-8 text-center">
              <p className="mb-4 text-brand-slate">{L.noCalculations.fr} / {L.noCalculations.ar}</p>
              {calculatorHref && (
                <Button asChild className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700">
                  <Link href={calculatorHref}>
                    <Calculator className="h-4 w-4" />
                    <span className="ms-2">{L.openCalculator.fr} / {L.openCalculator.ar}</span>
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray/30 bg-[#fafafa]">
                  <th className="px-4 py-3 text-start"><BilingualText label={F.type} size="xs" /></th>
                  <th className="px-4 py-3 text-start"><BilingualText label={F.title} size="xs" /></th>
                  <th className="px-4 py-3 text-end"><BilingualText label={dashboardLabels.estate.netEstate} size="xs" /></th>
                  <th className="px-4 py-3 text-end">PDF</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => {
                  const lbl = calcTypeLabel(calc.type);
                  return (
                    <tr key={calc.id} className="border-b border-brand-gray/20">
                      <td className="px-4 py-3">
                        <BilingualText label={lbl} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-brand-navy">{calc.title}</td>
                      <td className="px-4 py-3 text-end text-brand-slate">{formatCurrency(calc.total_amount)}</td>
                      <td className="px-4 py-3 text-end">
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(calc.type, calc.id)}>
                          <Download className="h-4 w-4 text-brand-blue" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
