"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, FolderOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { InheritanceLegalProof } from "@/components/dashboard/inheritance-legal-proof";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency } from "@/lib/utils";
import { downloadPdf, invalidateDossierQueries } from "@/lib/download-pdf";
import type { ActCalcType } from "@/lib/calculator-routes";
import type { ActCalculation, Dossier, PaginatedResponse } from "@/types";

const C = dashboardLabels.pages.actCalc.common;

type ResultLine = { label_fr: string; label_ar: string; amount: number };

export function ActCalculatorWorkflow({ actType }: { actType: ActCalcType }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "fr";
  const queryClient = useQueryClient();

  const labels = dashboardLabels.pages.actCalc[actType];
  const dossierTypeFilter = actType === "other" ? undefined : actType;

  const [dossierId, setDossierId] = useState(searchParams.get("dossier_id") || "");
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string | number | boolean>>(getDefaultForm(actType));
  const [result, setResult] = useState<ActCalculation | null>(null);
  const [pdfError, setPdfError] = useState("");

  const { data: dossiers } = useQuery<PaginatedResponse<Dossier>>({
    queryKey: ["dossiers-act", actType],
    queryFn: async () =>
      (await api.get("/dossiers", {
        params: { per_page: 100, ...(dossierTypeFilter ? { type: dossierTypeFilter } : {}) },
      })).data,
  });

  const selectedDossier = dossiers?.items.find((d) => d.id === dossierId);

  const calcMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/act-calculations/calculate", {
        type: actType,
        dossier_id: dossierId,
        title: selectedDossier?.title || labels.title.fr,
        ...form,
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

  const lines = (result?.results?.lines as ResultLine[] | undefined) || [];
  const marriageTotalMahr = actType === "marriage" && result?.results
    ? (result.results as { total_mahr?: number }).total_mahr
    : undefined;
  const saleResults = actType === "sale" && result?.results
    ? (result.results as { capital_gain?: number; tpi_exempt?: boolean; tpi_abatement_pct?: number })
    : undefined;

  return (
    <div className="space-y-6">
      <BilingualHeading label={labels.title} />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle><BilingualCardTitle label={C.selectDossier} /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select className={selectClass} value={dossierId} onChange={(e) => setDossierId(e.target.value)}>
            <option value="">--</option>
            {dossiers?.items.map((d) => (
              <option key={d.id} value={d.id}>
                {d.number} — {d.client_name}
              </option>
            ))}
          </select>
          {!dossiers?.items.length && (
            <p className="text-sm text-brand-slate">
              <Button variant="link" className="h-auto p-0 text-brand-accent" onClick={() => router.push(`/${locale}/dashboard/dossiers`)}>
                Créer un dossier → / إنشاء ملف
              </Button>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={labels.title} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderFields(actType, form, setForm, selectClass)}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <Button
              disabled={!dossierId || calcMutation.isPending}
              onClick={() => calcMutation.mutate()}
              className="w-full bg-brand-accent text-white hover:bg-brand-700"
            >
              {C.calculate.fr} / {C.calculate.ar}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle><BilingualCardTitle label={C.totalFees} /></CardTitle>
            {result && (
              <Button
                size="sm"
                variant="outline"
                className="border-brand-slate text-brand-slate"
                onClick={async () => {
                  setPdfError("");
                  try {
                    await downloadPdf(`/act-calculations/${result.id}/pdf`, `${actType}_${result.id}.pdf`, {
                      onSuccess: () =>
                        invalidateDossierQueries(queryClient, result.dossier_id || dossierId),
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
            {result ? (
              <>
                {marriageTotalMahr !== undefined && (
                  <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                    <BilingualText label={dashboardLabels.pages.actCalc.marriage.totalMahr} size="xs" className="mb-1" />
                    <p className="text-2xl font-bold text-rose-700">{formatCurrency(marriageTotalMahr)}</p>
                  </div>
                )}
                {saleResults !== undefined && (
                  <p className="mb-3 text-sm text-brand-slate">
                    Plus-value : <strong>{formatCurrency(saleResults.capital_gain ?? 0)}</strong>
                    {saleResults.tpi_exempt && (
                      <span className="ms-2 text-green-700">(TPI exonéré)</span>
                    )}
                    {!saleResults.tpi_exempt && (saleResults.tpi_abatement_pct ?? 0) > 0 && (
                      <span className="ms-2 text-blue-700">
                        (abattement {saleResults.tpi_abatement_pct}%)
                      </span>
                    )}
                  </p>
                )}
                <p className="mb-4 text-3xl font-bold text-brand-accent">{formatCurrency(result.total_amount)}</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-gray/30">
                      <th className="py-2 text-start"><BilingualText label={C.line} size="xs" /></th>
                      <th className="py-2 text-end"><BilingualText label={dashboardLabels.pages.inheritance.amountColumn} size="xs" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i} className="border-b border-brand-gray/20">
                        <td className="py-2">{line.label_fr} / {line.label_ar}</td>
                        <td className="py-2 text-end">{formatCurrency(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.dossier_id && (
                  <Button asChild variant="outline" className="mt-4 border-brand-accent text-brand-accent">
                    <Link href={`/${locale}/dashboard/dossiers/${result.dossier_id}`}>
                      <FolderOpen className="h-4 w-4" />
                      <span className="ms-1">{dashboardLabels.pages.inheritance.viewDossier.fr}</span>
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-brand-slate">{C.selectDossier.fr} / {C.selectDossier.ar}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {pdfError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pdfError}</div>
      )}

      {result?.legal_proof && (
        <InheritanceLegalProof
          calculation={{
            id: result.id,
            title: result.title,
            total_estate_value: 0,
            real_estate_value: 0,
            bank_accounts_value: 0,
            debts: 0,
            fees: 0,
            net_estate_value: result.total_amount,
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

function getDefaultForm(actType: ActCalcType): Record<string, string | number | boolean> {
  switch (actType) {
    case "sale":
      return {
        sale_price: 0,
        purchase_price: 0,
        acquisition_fees: 0,
        years_held: 0,
        is_primary_residence: false,
        property_kind: "habitation",
        capital_gain: "",
      };
    case "donation":
      return { donation_value: 0, relationship: "child", asset_kind: "immovable" };
    case "procuration":
      return { procuration_type: "general", duration_years: 1, property_value: 0 };
    case "marriage":
      return {
        mahr_immediate: 0,
        mahr_deferred: 0,
        gold_grams: 0,
        gold_price_per_gram: 0,
        furniture_value: 0,
        marriage_order: "first",
      };
    case "other":
      return { base_amount: 0, fee_rate: 0, fixed_fee: 0, description: "" };
  }
}

function renderFields(
  actType: ActCalcType,
  form: Record<string, string | number | boolean>,
  setForm: (f: Record<string, string | number | boolean>) => void,
  selectClass: string,
) {
  const L = dashboardLabels.pages.actCalc[actType];
  const num = (key: string, label: { fr: string; ar: string }) => (
    <div key={key}>
      <BilingualLabel label={label} />
      <Input
        type="number"
        value={form[key] === "" ? "" : String(form[key] ?? "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })}
        className="border-brand-gray/50"
      />
    </div>
  );

  if (actType === "sale") {
    const S = L as typeof dashboardLabels.pages.actCalc.sale;
    return (
      <>
        {num("sale_price", S.salePrice)}
        {num("purchase_price", S.purchasePrice)}
        {num("acquisition_fees", S.acquisitionFees)}
        {num("years_held", S.yearsHeld)}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
          <input
            type="checkbox"
            checked={!!form.is_primary_residence}
            onChange={(e) => setForm({ ...form, is_primary_residence: e.target.checked })}
            className="h-4 w-4"
          />
          <BilingualText label={S.primaryResidence} size="sm" />
        </label>
        <div>
          <BilingualLabel label={S.propertyKind} />
          <select
            className={selectClass}
            value={String(form.property_kind)}
            onChange={(e) => setForm({ ...form, property_kind: e.target.value })}
          >
            <option value="habitation">{S.habitation.fr} / {S.habitation.ar}</option>
            <option value="commercial">{S.commercial.fr} / {S.commercial.ar}</option>
            <option value="terrain_nu">{S.terrainNu.fr} / {S.terrainNu.ar}</option>
            <option value="agricole">{S.agricole.fr} / {S.agricole.ar}</option>
          </select>
        </div>
        {num("capital_gain", S.capitalGain)}
      </>
    );
  }

  if (actType === "donation") {
    const D = L as typeof dashboardLabels.pages.actCalc.donation;
    return (
      <>
        {num("donation_value", D.value)}
        <div>
          <BilingualLabel label={D.assetKind} />
          <select
            className={selectClass}
            value={String(form.asset_kind)}
            onChange={(e) => setForm({ ...form, asset_kind: e.target.value })}
          >
            <option value="immovable">{D.immovable.fr} / {D.immovable.ar}</option>
            <option value="movable">{D.movable.fr} / {D.movable.ar}</option>
          </select>
        </div>
        <div>
          <BilingualLabel label={D.relationship} />
          <select
            className={selectClass}
            value={String(form.relationship)}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          >
            <option value="spouse">{D.relSpouse.fr} / {D.relSpouse.ar}</option>
            <option value="child">{D.relChild.fr} / {D.relChild.ar}</option>
            <option value="grandchild">{D.relGrandchild.fr} / {D.relGrandchild.ar}</option>
            <option value="parent">{D.relParent.fr} / {D.relParent.ar}</option>
            <option value="sibling">{D.relSibling.fr} / {D.relSibling.ar}</option>
            <option value="collateral">{D.relCollateral.fr} / {D.relCollateral.ar}</option>
            <option value="other">{D.relOther.fr} / {D.relOther.ar}</option>
          </select>
        </div>
      </>
    );
  }

  if (actType === "procuration") {
    const P = L as typeof dashboardLabels.pages.actCalc.procuration;
    return (
      <>
        <div>
          <BilingualLabel label={P.type} />
          <select
            className={selectClass}
            value={String(form.procuration_type)}
            onChange={(e) => setForm({ ...form, procuration_type: e.target.value })}
          >
            <option value="general">{P.typeGeneral.fr} / {P.typeGeneral.ar}</option>
            <option value="special">{P.typeSpecial.fr} / {P.typeSpecial.ar}</option>
            <option value="sale">{P.typeSale.fr} / {P.typeSale.ar}</option>
            <option value="purchase">{P.typePurchase.fr} / {P.typePurchase.ar}</option>
            <option value="succession">{P.typeSuccession.fr} / {P.typeSuccession.ar}</option>
            <option value="representation">{P.typeRepresentation.fr} / {P.typeRepresentation.ar}</option>
          </select>
        </div>
        {num("duration_years", P.duration)}
        {(form.procuration_type === "sale" || form.procuration_type === "purchase") &&
          num("property_value", P.propertyValue)}
      </>
    );
  }

  if (actType === "marriage") {
    const M = L as typeof dashboardLabels.pages.actCalc.marriage;
    return (
      <>
        {num("mahr_immediate", M.mahrImmediate)}
        {num("mahr_deferred", M.mahrDeferred)}
        {num("gold_grams", M.goldGrams)}
        {num("gold_price_per_gram", M.goldPrice)}
        {num("furniture_value", M.furniture)}
        <div>
          <BilingualLabel label={M.marriageOrder} />
          <select
            className={selectClass}
            value={String(form.marriage_order)}
            onChange={(e) => setForm({ ...form, marriage_order: e.target.value })}
          >
            <option value="first">{M.firstMarriage.fr} / {M.firstMarriage.ar}</option>
            <option value="additional">{M.additionalMarriage.fr} / {M.additionalMarriage.ar}</option>
          </select>
        </div>
      </>
    );
  }

  const O = L as typeof dashboardLabels.pages.actCalc.other;
  return (
    <>
      {num("base_amount", O.baseAmount)}
      {num("fee_rate", O.feeRate)}
      {num("fixed_fee", O.fixedFee)}
      <div>
        <BilingualLabel label={O.description} />
        <Input
          value={String(form.description || "")}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border-brand-gray/50"
        />
      </div>
    </>
  );
}
