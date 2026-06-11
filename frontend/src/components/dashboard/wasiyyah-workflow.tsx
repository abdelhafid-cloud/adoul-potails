"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Download, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { InheritanceLegalProof } from "@/components/dashboard/inheritance-legal-proof";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency } from "@/lib/utils";
import { downloadPdf, invalidateDossierQueries } from "@/lib/download-pdf";
import type { ActCalculation, Dossier, PaginatedResponse } from "@/types";

const L = dashboardLabels.pages.wasiyyah;
const C = dashboardLabels.pages.actCalc.common;

export function WasiyyahWorkflow() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "fr";
  const queryClient = useQueryClient();

  const [dossierId, setDossierId] = useState(searchParams.get("dossier_id") || "");
  const [netEstate, setNetEstate] = useState(() => {
    const p = searchParams.get("net_estate");
    return p ? parseFloat(p) || 0 : 0;
  });
  const [debts, setDebts] = useState(0);
  const [funeral, setFuneral] = useState(0);
  const [wasiyyahAmount, setWasiyyahAmount] = useState(0);
  const [legateeName, setLegateeName] = useState("");
  const [legateeNameAr, setLegateeNameAr] = useState("");
  const [wasiyyahKind, setWasiyyahKind] = useState("cash");
  const [legateeIsHeir, setLegateeIsHeir] = useState(false);
  const [heirsConsent, setHeirsConsent] = useState(false);
  const [result, setResult] = useState<ActCalculation | null>(null);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");

  const { data: dossiers } = useQuery<PaginatedResponse<Dossier>>({
    queryKey: ["dossiers-heritage"],
    queryFn: async () => (await api.get("/dossiers", { params: { per_page: 100, type: "heritage" } })).data,
  });

  const calcMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/act-calculations/calculate", {
        type: "wasiyyah",
        dossier_id: dossierId,
        title: `Wasiyyah — ${legateeName || legateeNameAr || "légataire"}`,
        net_estate_value: netEstate,
        debts_before_wasiyyah: debts,
        funeral_expenses: funeral,
        wasiyyah_amount: wasiyyahAmount,
        wasiyyah_kind: wasiyyahKind,
        legatee_name: legateeName,
        legatee_name_ar: legateeNameAr,
        legatee_is_heir: legateeIsHeir,
        heirs_consent: heirsConsent,
      });
      return res.data as ActCalculation;
    },
    onSuccess: (data) => {
      setResult(data);
      setError("");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Erreur lors du calcul.");
    },
  });

  const selectClass =
    "flex h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  const r = result?.results as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <BilingualHeading label={L.title} subtitle={L.subtitle} />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle><BilingualCardTitle label={C.selectDossier} /></CardTitle>
        </CardHeader>
        <CardContent>
          <select className={selectClass} value={dossierId} onChange={(e) => setDossierId(e.target.value)}>
            <option value="">--</option>
            {dossiers?.items.map((d) => (
              <option key={d.id} value={d.id}>{d.number} — {d.client_name}</option>
            ))}
          </select>
          {!dossiers?.items.length && (
            <Button variant="link" className="mt-2 h-auto p-0 text-brand-accent" onClick={() => router.push(`/${locale}/dashboard/dossiers`)}>
              Créer un dossier héritage →
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.title} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <BilingualLabel label={L.netEstate} />
              <Input type="number" value={netEstate || ""} onChange={(e) => setNetEstate(parseFloat(e.target.value) || 0)} className="border-brand-gray/50" />
            </div>
            <div>
              <BilingualLabel label={L.debts} />
              <Input type="number" value={debts || ""} onChange={(e) => setDebts(parseFloat(e.target.value) || 0)} className="border-brand-gray/50" />
            </div>
            <div>
              <BilingualLabel label={L.funeral} />
              <Input type="number" value={funeral || ""} onChange={(e) => setFuneral(parseFloat(e.target.value) || 0)} className="border-brand-gray/50" />
            </div>
            <div>
              <BilingualLabel label={L.wasiyyahAmount} />
              <Input type="number" value={wasiyyahAmount || ""} onChange={(e) => setWasiyyahAmount(parseFloat(e.target.value) || 0)} className="border-brand-gray/50" />
            </div>
            <div>
              <BilingualLabel label={L.wasiyyahKind} />
              <select className={selectClass} value={wasiyyahKind} onChange={(e) => setWasiyyahKind(e.target.value)}>
                <option value="cash">{L.kindCash.fr} / {L.kindCash.ar}</option>
                <option value="property">{L.kindProperty.fr} / {L.kindProperty.ar}</option>
              </select>
            </div>
            <div>
              <BilingualLabel label={L.legateeName} />
              <Input value={legateeName} onChange={(e) => setLegateeName(e.target.value)} className="border-brand-gray/50" />
            </div>
            <div>
              <BilingualLabel label={L.legateeNameAr} />
              <Input value={legateeNameAr} onChange={(e) => setLegateeNameAr(e.target.value)} className="border-brand-gray/50" dir="rtl" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
              <input type="checkbox" checked={legateeIsHeir} onChange={(e) => setLegateeIsHeir(e.target.checked)} className="h-4 w-4" />
              <BilingualText label={L.legateeIsHeir} size="sm" />
            </label>
            {legateeIsHeir && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2">
                <input type="checkbox" checked={heirsConsent} onChange={(e) => setHeirsConsent(e.target.checked)} className="h-4 w-4" />
                <BilingualText label={L.heirsConsent} size="sm" />
              </label>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button
              disabled={!dossierId || !netEstate || calcMutation.isPending}
              onClick={() => calcMutation.mutate()}
              className="w-full bg-brand-accent text-white hover:bg-brand-700"
            >
              {L.calculate.fr} / {L.calculate.ar}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle><BilingualCardTitle label={L.applied} /></CardTitle>
            {result && (
              <Button
                size="sm"
                variant="outline"
                className="border-brand-slate text-brand-slate"
                onClick={async () => {
                  setPdfError("");
                  try {
                    await downloadPdf(`/act-calculations/${result.id}/pdf`, `wasiyyah_${result.id}.pdf`, {
                      onSuccess: () => invalidateDossierQueries(queryClient, result.dossier_id || dossierId),
                    });
                  } catch (err) {
                    setPdfError(err instanceof Error ? err.message : "Erreur PDF");
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span className="ms-1 text-xs">PDF</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {result && r ? (
              <div className="space-y-4">
                <p className="text-3xl font-bold text-brand-accent">{formatCurrency(r.wasiyyah_amount_applied as number)}</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-brand-gray/20 py-2">
                    <span className="text-brand-slate">{L.debts.fr} + {L.funeral.fr}</span>
                    <span className="font-medium">
                      {formatCurrency((r.debts_before_wasiyyah as number) + (r.funeral_expenses as number))}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-brand-gray/20 py-2">
                    <BilingualText label={L.maxWasiyyah} size="xs" />
                    <span className="font-medium">{formatCurrency(r.max_wasiyyah as number)}</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-gray/20 py-2">
                    <BilingualText label={L.remainder} size="xs" />
                    <span className="font-medium">{formatCurrency(r.remainder_for_heirs as number)}</span>
                  </div>
                </dl>
                <p className={`rounded-lg px-3 py-2 text-sm ${r.is_valid ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>
                  {String(r.status_fr)}
                  <span className="mt-1 block text-xs" dir="rtl">{String(r.status_ar)}</span>
                </p>
                {result.dossier_id && (
                  <Button asChild variant="outline" className="border-brand-accent text-brand-accent">
                    <Link href={`/${locale}/dashboard/dossiers/${result.dossier_id}`}>
                      <FolderOpen className="h-4 w-4" />
                      <span className="ms-1">{dashboardLabels.pages.inheritance.viewDossier.fr}</span>
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-brand-slate">{C.selectDossier.fr}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {pdfError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pdfError}</div>}

      {result?.legal_proof && (
        <InheritanceLegalProof
          calculation={{
            id: result.id,
            title: result.title,
            total_estate_value: netEstate,
            real_estate_value: 0,
            bank_accounts_value: 0,
            debts: debts,
            fees: funeral,
            net_estate_value: (r?.net_estate_value as number) || netEstate,
            heirs: [],
            distribution: [],
            legal_proof: result.legal_proof,
            dossier: result.dossier,
            client: result.client,
          }}
        />
      )}
    </div>
  );
}
