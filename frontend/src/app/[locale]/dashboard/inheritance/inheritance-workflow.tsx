"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, ArrowRight, Info, ArrowLeft, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { EstateCalculatorSheet, type EstateValues } from "@/components/dashboard/estate-calculator-sheet";
import { HeirPersonFields } from "@/components/dashboard/heir-person-fields";
import { InheritanceCalculationsTable } from "@/components/dashboard/inheritance-calculations-table";
import { InheritanceResultView } from "@/components/dashboard/inheritance-result-view";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { HEIR_TYPE_GROUPS, heirTypeLabel, normalizeHeirType, syncHeirPersons } from "@/lib/heir-types";
import { formatCurrency, cn } from "@/lib/utils";
import type { Dossier, HeirInput, InheritanceCalculation, PaginatedResponse } from "@/types";

const L = dashboardLabels.pages.inheritance;
const E = dashboardLabels.estate;
const STEPS = [
  { id: 1, label: L.stepDossier },
  { id: 2, label: L.stepEstate },
  { id: 3, label: L.stepHeirs },
] as const;

const estateFields = [
  { key: "total_estate_value" as const, label: E.totalEstate },
  { key: "real_estate_value" as const, label: E.realEstate },
  { key: "bank_accounts_value" as const, label: E.bankAccounts },
  { key: "debts" as const, label: E.debts },
  { key: "fees" as const, label: E.fees },
];

type PageMode = "list" | "create" | "detail";

export default function InheritanceWorkflow() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "fr";
  const queryClient = useQueryClient();

  const calcIdParam = searchParams.get("calc_id");
  const dossierIdParam = searchParams.get("dossier_id") || "";

  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [step, setStep] = useState(1);
  const [dossierId, setDossierId] = useState(dossierIdParam);
  const [estate, setEstate] = useState({
    total_estate_value: 0, real_estate_value: 0, bank_accounts_value: 0, debts: 0, fees: 0,
  });
  const [deceased, setDeceased] = useState({
    deceased_name: "",
    deceased_name_ar: "",
    deceased_cin: "",
    deceased_death_date: "",
    deceased_death_place: "",
    deceased_gender: "male",
  });
  const [heirs, setHeirs] = useState<HeirInput[]>(() => [
    { type: "wife", count: 1, persons: syncHeirPersons({ type: "wife", count: 1 }) },
    { type: "son", count: 2, persons: syncHeirPersons({ type: "son", count: 2 }) },
  ]);
  const [error, setError] = useState("");
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (calcIdParam) setPageMode("detail");
    else if (searchParams.get("new") === "1" || dossierIdParam) setPageMode("create");
    else setPageMode("list");
  }, [calcIdParam, searchParams, dossierIdParam]);

  useEffect(() => {
    if (dossierIdParam) setDossierId(dossierIdParam);
  }, [dossierIdParam]);

  const { data: dossiers } = useQuery<PaginatedResponse<Dossier>>({
    queryKey: ["dossiers-heritage"],
    queryFn: async () => (await api.get("/dossiers", { params: { per_page: 100, type: "heritage" } })).data,
  });

  const { data: savedCalculation, isLoading: loadingCalculation } = useQuery<InheritanceCalculation>({
    queryKey: ["inheritance", calcIdParam],
    queryFn: async () => (await api.get(`/inheritance/${calcIdParam}`)).data,
    enabled: pageMode === "detail" && !!calcIdParam,
  });

  const selectedDossier = dossiers?.items.find((d) => d.id === dossierId);

  const calcMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/inheritance/calculate", {
        title: selectedDossier?.title || "Calcul d'héritage",
        dossier_id: dossierId,
        ...estate,
        ...deceased,
        heirs: heirs.map((h) => ({ ...h, persons: syncHeirPersons(h) })),
      });
      return res.data as InheritanceCalculation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inheritance-calculations"] });
      setError("");
      setStep(1);
      router.replace(`/${locale}/dashboard/inheritance?calc_id=${data.id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Erreur lors du calcul.");
    },
  });

  const patchHeir = (index: number, patch: Partial<HeirInput>) => {
    const updated = [...heirs];
    const next = { ...updated[index], ...patch };
    updated[index] = { ...next, persons: syncHeirPersons(next) };
    setHeirs(updated);
  };

  const addHeir = () => {
    const base = { type: "other", count: 1 };
    setHeirs([...heirs, { ...base, persons: syncHeirPersons(base) }]);
  };
  const removeHeir = (i: number) => setHeirs(heirs.filter((_, idx) => idx !== i));

  const applyFromCalculator = (values: Partial<EstateValues>) => {
    setEstate((prev) => ({ ...prev, ...values }));
    const keys = new Set(Object.keys(values));
    setAppliedFields(keys);
    window.setTimeout(() => setAppliedFields(new Set()), 1500);
  };

  const selectClass =
    "flex h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  const goToList = () => router.replace(`/${locale}/dashboard/inheritance`);
  const goToCreate = () => router.replace(`/${locale}/dashboard/inheritance?new=1`);
  const goToDetail = (id: string) => router.replace(`/${locale}/dashboard/inheritance?calc_id=${id}`);

  const canProceedFromDossier = !!dossierId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <BilingualHeading label={L.title} />
          <BilingualText label={L.subtitle} size="sm" className="mt-1 text-brand-slate" />
        </div>
        {pageMode === "detail" && (
          <Button variant="outline" onClick={goToList} className="border-brand-slate text-brand-slate">
            <ArrowLeft className="h-4 w-4" />
            <span className="ms-2 text-xs">{L.backToList.fr} / {L.backToList.ar}</span>
          </Button>
        )}
      </div>

      {pageMode !== "detail" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToList}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors",
              pageMode === "list"
                ? "border border-blue-200 bg-brand-blue-50 text-brand-blue shadow-sm"
                : "border border-brand-gray/30 bg-white text-brand-slate hover:bg-brand-blue-50/50",
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span>{L.tabList.fr} / {L.tabList.ar}</span>
          </button>
          <button
            type="button"
            onClick={goToCreate}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors",
              pageMode === "create"
                ? "border border-blue-200 bg-brand-blue-50 text-brand-blue shadow-sm"
                : "border border-brand-gray/30 bg-white text-brand-slate hover:bg-brand-blue-50/50",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{L.tabNew.fr} / {L.tabNew.ar}</span>
          </button>
        </div>
      )}

      {error && pageMode === "create" && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {pageMode === "list" && (
        <InheritanceCalculationsTable
          locale={locale}
          onSelect={goToDetail}
          onNew={goToCreate}
          dossierIdFilter={dossierIdParam || undefined}
        />
      )}

      {pageMode === "detail" && (
        loadingCalculation ? (
          <p className="py-12 text-center text-brand-slate">
            {dashboardLabels.common.loading.fr} / {dashboardLabels.common.loading.ar}
          </p>
        ) : savedCalculation ? (
          <InheritanceResultView calculation={savedCalculation} locale={locale} />
        ) : (
          <p className="py-12 text-center text-brand-slate">
            {L.emptyResult.fr} / {L.emptyResult.ar}
          </p>
        )
      )}

      {pageMode === "create" && (
        <>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => s.id <= step && setStep(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors",
                  step === s.id
                    ? "border border-blue-200 bg-brand-blue-50 text-brand-blue shadow-sm"
                    : step > s.id
                      ? "border border-blue-100 bg-white text-brand-blue"
                      : "bg-brand-gray/20 text-brand-slate",
                )}
              >
                {step > s.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{s.id}</span>}
                <span>{s.label.fr} / {s.label.ar}</span>
              </button>
            ))}
          </div>

          {step === 1 && (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle><BilingualCardTitle label={L.stepDossier} /></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BilingualText label={L.selectDossierHint} size="sm" className="text-brand-slate" />
                <div>
                  <BilingualLabel label={L.selectDossier} />
                  <select
                    className={selectClass}
                    value={dossierId}
                    onChange={(e) => setDossierId(e.target.value)}
                  >
                    <option value="">--</option>
                    {dossiers?.items.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.number} — {d.client_name} {d.title ? `(${d.title})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {!dossiers?.items.length && (
                  <p className="text-sm text-brand-slate">
                    {L.noDossier.fr} / {L.noDossier.ar}
                    <Button
                      variant="link"
                      className="ms-2 h-auto p-0 text-brand-accent"
                      onClick={() => router.push(`/${locale}/dashboard/dossiers`)}
                    >
                      →
                    </Button>
                  </p>
                )}
                {selectedDossier && (
                  <div className="rounded-xl border border-blue-100 bg-brand-blue-50/50 p-4">
                    <p className="font-mono text-brand-blue">{selectedDossier.number}</p>
                    <p className="font-medium text-brand-navy">{selectedDossier.client_name}</p>
                    {selectedDossier.title && <p className="text-sm text-brand-slate">{selectedDossier.title}</p>}
                  </div>
                )}
                <Button
                  disabled={!canProceedFromDossier}
                  onClick={() => setStep(2)}
                  className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700"
                >
                  {L.stepEstate.fr} / {L.stepEstate.ar}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div className="grid gap-6 xl:grid-cols-5">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle><BilingualCardTitle label={L.stepEstate} /></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                    <p className="text-sm leading-relaxed text-brand-slate">
                      {L.estateHint.fr}
                      <span className="mx-2 text-brand-gray">/</span>
                      <span dir="rtl" lang="ar">{L.estateHint.ar}</span>
                    </p>
                  </div>
                  {estateFields.map(({ key, label }) => (
                    <div key={key}>
                      <BilingualLabel label={label} />
                      <Input
                        type="number"
                        value={estate[key] || ""}
                        onChange={(e) => setEstate({ ...estate, [key]: parseFloat(e.target.value) || 0 })}
                        className={cn(
                          "border-brand-gray/50 focus-visible:ring-brand-accent transition-colors",
                          appliedFields.has(key) && "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200",
                        )}
                      />
                    </div>
                  ))}
                  <div className="rounded-xl border border-brand-gray/20 bg-[#fafafa] p-3">
                    <BilingualText label={E.netEstate} size="xs" className="mb-1" />
                    <p className="font-mono text-lg font-semibold text-brand-accent">
                      {formatCurrency(Math.max(0, estate.total_estate_value - estate.debts - estate.fees))}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-xl border border-brand-gray/25 bg-white p-4">
                    <BilingualText label={L.deceasedSection} size="sm" className="font-medium text-brand-navy" />
                    <div>
                      <BilingualLabel label={L.deceasedName} />
                      <Input
                        value={deceased.deceased_name}
                        onChange={(e) => setDeceased({ ...deceased, deceased_name: e.target.value })}
                        className="border-brand-gray/50"
                      />
                    </div>
                    <div>
                      <BilingualLabel label={L.deceasedNameAr} />
                      <Input
                        dir="rtl"
                        value={deceased.deceased_name_ar}
                        onChange={(e) => setDeceased({ ...deceased, deceased_name_ar: e.target.value })}
                        className="border-brand-gray/50"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <BilingualLabel label={L.deceasedCin} />
                        <Input
                          value={deceased.deceased_cin}
                          onChange={(e) => setDeceased({ ...deceased, deceased_cin: e.target.value })}
                          className="border-brand-gray/50"
                        />
                      </div>
                      <div>
                        <BilingualLabel label={L.deceasedGender} />
                        <select
                          className={selectClass}
                          value={deceased.deceased_gender}
                          onChange={(e) => setDeceased({ ...deceased, deceased_gender: e.target.value })}
                        >
                          <option value="male">{L.deceasedGenderMale.fr} / {L.deceasedGenderMale.ar}</option>
                          <option value="female">{L.deceasedGenderFemale.fr} / {L.deceasedGenderFemale.ar}</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <BilingualLabel label={L.deceasedDeathDate} />
                        <Input
                          type="date"
                          value={deceased.deceased_death_date}
                          onChange={(e) => setDeceased({ ...deceased, deceased_death_date: e.target.value })}
                          className="border-brand-gray/50"
                        />
                      </div>
                      <div>
                        <BilingualLabel label={L.deceasedDeathPlace} />
                        <Input
                          value={deceased.deceased_death_place}
                          onChange={(e) => setDeceased({ ...deceased, deceased_death_place: e.target.value })}
                          className="border-brand-gray/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="border-brand-slate text-brand-slate">
                      ←
                    </Button>
                    <Button onClick={() => setStep(3)} className="btn-dashboard-blue flex-1 bg-brand-accent text-white hover:bg-brand-700">
                      {L.stepHeirs.fr} / {L.stepHeirs.ar}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="xl:col-span-3">
                <EstateCalculatorSheet onApply={applyFromCalculator} currentTotal={estate.total_estate_value} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <details className="group">
                <summary className="cursor-pointer list-none rounded-xl border border-brand-gray/25 bg-[#fafafa] px-4 py-3 text-sm font-medium text-brand-navy hover:bg-brand-blue-50/40">
                  <BilingualText label={L.estateCalculator.title} size="sm" />
                  <span className="ms-2 text-xs text-brand-slate">(cliquer pour ouvrir / انقر للفتح)</span>
                </summary>
                <div className="mt-4">
                  <EstateCalculatorSheet onApply={applyFromCalculator} currentTotal={estate.total_estate_value} />
                </div>
              </details>

              <Card>
                <CardHeader>
                  <CardTitle><BilingualCardTitle label={L.stepHeirs} /></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BilingualText label={L.heirsIdentityHint} size="sm" className="text-brand-slate" />
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <BilingualLabel label={E.heirs} />
                      <Button size="sm" variant="outline" onClick={addHeir} className="border-brand-slate text-brand-slate">
                        <Plus className="h-4 w-4" />
                        <span className="ms-1 text-xs">{L.addHeir.fr} / {L.addHeir.ar}</span>
                      </Button>
                    </div>
                    {heirs.map((heir, i) => (
                      <div key={i} className="mb-4 rounded-xl border border-brand-gray/25 bg-white p-3">
                        <div className="flex gap-2">
                          <select
                            className={cn(selectClass, "flex-1")}
                            value={normalizeHeirType(heir.type)}
                            onChange={(e) => patchHeir(i, { type: e.target.value })}
                          >
                            {HEIR_TYPE_GROUPS.map((group) => (
                              <optgroup key={group.key} label={`${group.label.fr} / ${group.label.ar}`}>
                                {group.types.map((type) => {
                                  const lbl = heirTypeLabel(type);
                                  return (
                                    <option key={type} value={type}>
                                      {lbl.fr} / {lbl.ar}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={1}
                            value={heir.count || 1}
                            onChange={(e) => patchHeir(i, { count: parseInt(e.target.value) || 1 })}
                            className="w-20 border-brand-gray/50"
                          />
                          <Button size="icon" variant="ghost" onClick={() => removeHeir(i)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <HeirPersonFields
                          heir={heir}
                          onChange={(next) => {
                            const updated = [...heirs];
                            updated[i] = next;
                            setHeirs(updated);
                          }}
                          selectClass={selectClass}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="border-brand-slate text-brand-slate">
                      ←
                    </Button>
                    <Button
                      onClick={() => calcMutation.mutate()}
                      disabled={calcMutation.isPending}
                      className="btn-dashboard-blue flex-1 bg-brand-accent text-white hover:bg-brand-700"
                    >
                      {L.calculate.fr} / {L.calculate.ar}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
