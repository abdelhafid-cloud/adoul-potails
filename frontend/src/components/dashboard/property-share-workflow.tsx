"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Download, Building2, Users, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency, cn } from "@/lib/utils";
import { downloadPdf, invalidateDossierQueries } from "@/lib/download-pdf";
import type { Dossier, PaginatedResponse } from "@/types";

const L = dashboardLabels.pages.propertyShare;

type PropertyType = keyof typeof L.propertyTypes;

type PropertyItem = {
  id: string;
  name: string;
  type: PropertyType;
  value: number;
  surface_m2?: number;
};

type HeirItem = {
  id: string;
  name: string;
  share_percentage?: number;
};

type DistributionRow = {
  name: string;
  share_percentage: number;
  amount: number;
  balance?: number;
  properties_assigned?: Array<{ name?: string; type?: string; value?: number; surface_m2?: number }>;
};

type SoulteRow = {
  from: string;
  property: string;
  amount: number;
  type: "pay" | "receive";
};

const PROPERTY_TYPES = Object.keys(L.propertyTypes) as PropertyType[];

const selectClass =
  "flex h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

export function PropertyShareWorkflow() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [dossierId, setDossierId] = useState(searchParams.get("dossier_id") || "");
  const [customShares, setCustomShares] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([
    { id: "1", name: "Appartement Casablanca", type: "apartment", value: 500000, surface_m2: 85 },
  ]);
  const [heirs, setHeirs] = useState<HeirItem[]>([
    { id: "1", name: "Héritier 1" },
    { id: "2", name: "Héritier 2" },
  ]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");

  const { data: dossiers } = useQuery<PaginatedResponse<Dossier>>({
    queryKey: ["dossiers-property"],
    queryFn: async () =>
      (await api.get("/dossiers", { params: { per_page: 100, type: "property_share" } })).data,
  });

  const totalValue = useMemo(
    () => properties.reduce((s, p) => s + (p.value || 0), 0),
    [properties],
  );

  const shareSum = useMemo(() => {
    if (!customShares) return 100;
    return heirs.reduce((s, h) => s + (h.share_percentage ?? 0), 0);
  }, [customShares, heirs]);

  const shareSumValid = !customShares || Math.abs(shareSum - 100) < 0.06;

  const calcMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: "Partage immobilier",
        dossier_id: dossierId,
        properties: properties.map(({ id, name, type, value, surface_m2 }) => ({
          id, name, type, value, surface_m2,
        })),
        heirs: heirs.map(({ id, name, share_percentage }) => ({
          id,
          name,
          share_percentage: customShares ? share_percentage : undefined,
        })),
        total_value: totalValue,
      };
      const res = await api.post("/property-shares/calculate", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data);
      setError("");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Erreur de calcul");
    },
  });

  const applyEqualShares = () => {
    const pct = Math.round((100 / heirs.length) * 100) / 100;
    const remainder = Math.round((100 - pct * heirs.length) * 100) / 100;
    setHeirs(heirs.map((h, i) => ({
      ...h,
      share_percentage: i === 0 ? pct + remainder : pct,
    })));
    setCustomShares(true);
  };

  const typeLabel = (type?: string) => {
    if (!type) return "";
    const t = L.propertyTypes[type as PropertyType];
    return t ? `${t.fr}` : type;
  };

  return (
    <div className="space-y-6">
      <BilingualHeading label={L.title} subtitle={L.subtitle} />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-brand-gray/30 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-brand-blue-50 p-2 text-brand-blue">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-brand-slate"><BilingualText label={L.totalValue} size="xs" /></p>
              <p className="text-lg font-bold text-brand-navy">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-gray/30 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-brand-slate"><BilingualText label={L.properties} size="xs" /></p>
              <p className="text-lg font-bold text-brand-navy">{properties.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-gray/30 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-brand-slate"><BilingualText label={L.heirs} size="xs" /></p>
              <p className="text-lg font-bold text-brand-navy">{heirs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-brand-gray/30 shadow-sm">
        <CardHeader>
          <CardTitle><BilingualCardTitle label={L.selectDossier} /></CardTitle>
        </CardHeader>
        <CardContent>
          <BilingualText label={L.selectDossierHint} size="sm" className="mb-3 text-brand-slate" />
          <select className={selectClass} value={dossierId} onChange={(e) => setDossierId(e.target.value)}>
            <option value="">--</option>
            {dossiers?.items.map((d) => (
              <option key={d.id} value={d.id}>{d.number} — {d.client_name}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Biens */}
        <Card className="border-brand-gray/30 shadow-sm">
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.properties} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {properties.map((p, i) => (
              <div key={p.id} className="space-y-2 rounded-xl border border-brand-gray/20 bg-[#fafafa] p-3">
                <Input
                  placeholder={L.propertyName.fr}
                  value={p.name}
                  onChange={(e) => {
                    const updated = [...properties];
                    updated[i] = { ...p, name: e.target.value };
                    setProperties(updated);
                  }}
                  className="border-brand-gray/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className={selectClass}
                    value={p.type}
                    onChange={(e) => {
                      const updated = [...properties];
                      updated[i] = { ...p, type: e.target.value as PropertyType };
                      setProperties(updated);
                    }}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{L.propertyTypes[t].fr}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder={L.surface.fr}
                    value={p.surface_m2 ?? ""}
                    onChange={(e) => {
                      const updated = [...properties];
                      updated[i] = { ...p, surface_m2: parseFloat(e.target.value) || undefined };
                      setProperties(updated);
                    }}
                    className="border-brand-gray/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={L.propertyValue.fr}
                    value={p.value || ""}
                    onChange={(e) => {
                      const updated = [...properties];
                      updated[i] = { ...p, value: parseFloat(e.target.value) || 0 };
                      setProperties(updated);
                    }}
                    className="border-brand-gray/50"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setProperties(properties.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setProperties([
                  ...properties,
                  { id: String(Date.now()), name: "", type: "apartment", value: 0 },
                ])
              }
              className="border-brand-slate text-brand-slate"
            >
              <Plus className="h-4 w-4" />
              <span className="ms-1">{L.addProperty.fr}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Héritiers */}
        <Card className="border-brand-gray/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle><BilingualCardTitle label={L.heirs} /></CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={!customShares ? "default" : "outline"}
                className={cn(!customShares && "bg-brand-accent text-white")}
                onClick={() => setCustomShares(false)}
              >
                <BilingualText label={L.equalShares} size="xs" />
              </Button>
              <Button
                size="sm"
                variant={customShares ? "default" : "outline"}
                className={cn(customShares && "bg-brand-accent text-white")}
                onClick={() => { setCustomShares(true); applyEqualShares(); }}
              >
                <BilingualText label={L.customShares} size="xs" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {heirs.map((h, i) => (
              <div key={h.id} className="flex gap-2">
                <Input
                  placeholder="Nom / الاسم"
                  value={h.name}
                  onChange={(e) => {
                    const updated = [...heirs];
                    updated[i] = { ...h, name: e.target.value };
                    setHeirs(updated);
                  }}
                  className="flex-1 border-brand-gray/50"
                />
                {customShares && (
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={h.share_percentage ?? ""}
                      onChange={(e) => {
                        const updated = [...heirs];
                        updated[i] = { ...h, share_percentage: parseFloat(e.target.value) || 0 };
                        setHeirs(updated);
                      }}
                      className="border-brand-gray/50 pe-6"
                    />
                    <span className="absolute end-2 top-1/2 -translate-y-1/2 text-xs text-brand-gray">%</span>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={heirs.length <= 1}
                  onClick={() => setHeirs(heirs.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHeirs([...heirs, { id: String(Date.now()), name: "" }])}
              className="border-brand-slate text-brand-slate"
            >
              <Plus className="h-4 w-4" />
              <span className="ms-1">{L.addHeir.fr}</span>
            </Button>

            {customShares && (
              <p className={cn(
                "text-xs font-medium",
                shareSumValid ? "text-emerald-600" : "text-red-600",
              )}>
                <BilingualText label={L.shareSum} size="xs" />: {shareSum.toFixed(2)} %
                {!shareSumValid && (
                  <span className="ms-2">— <BilingualText label={L.shareSumError} size="xs" /></span>
                )}
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button
              onClick={() => calcMutation.mutate()}
              disabled={!dossierId || calcMutation.isPending || !shareSumValid || totalValue <= 0}
              className="mt-2 w-full bg-brand-accent text-white hover:bg-brand-700"
            >
              <Scale className="me-2 h-4 w-4" />
              {L.calculate.fr} / {L.calculate.ar}
            </Button>
          </CardContent>
        </Card>
      </div>

      {pdfError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pdfError}</div>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="border-brand-gray/30 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle><BilingualCardTitle label={L.result} /></CardTitle>
              {typeof result.id === "string" && result.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-brand-slate text-brand-slate"
                  onClick={async () => {
                    setPdfError("");
                    try {
                      await downloadPdf(
                        `/property-shares/${result.id}/pdf`,
                        `partage_${result.id}.pdf`,
                        {
                          onSuccess: () =>
                            invalidateDossierQueries(
                              queryClient,
                              (result.dossier_id as string | undefined) || dossierId,
                            ),
                        },
                      );
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
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gray/30 bg-[#fafafa]">
                    <th className="px-3 py-2 text-start"><BilingualText label={L.heir} size="xs" /></th>
                    <th className="px-3 py-2 text-end"><BilingualText label={L.share} size="xs" /></th>
                    <th className="px-3 py-2 text-end"><BilingualText label={L.amount} size="xs" /></th>
                    <th className="px-3 py-2 text-end"><BilingualText label={L.balance} size="xs" /></th>
                  </tr>
                </thead>
                <tbody>
                  {((result.distribution as DistributionRow[]) || []).map((d, i) => (
                    <tr key={i} className="border-b border-brand-gray/20">
                      <td className="px-3 py-2 font-medium text-brand-navy">{d.name}</td>
                      <td className="px-3 py-2 text-end text-brand-slate">{d.share_percentage.toFixed(2)} %</td>
                      <td className="px-3 py-2 text-end text-brand-slate">{formatCurrency(d.amount)}</td>
                      <td className={cn(
                        "px-3 py-2 text-end font-medium",
                        (d.balance ?? 0) > 0 ? "text-emerald-600" : (d.balance ?? 0) < 0 ? "text-red-600" : "text-brand-slate",
                      )}>
                        {(d.balance ?? 0) > 0 ? "+" : ""}{formatCurrency(d.balance ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Biens attribués par héritier */}
          <Card className="border-brand-gray/30 shadow-sm">
            <CardHeader>
              <CardTitle><BilingualCardTitle label={L.assignedProperties} /></CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {((result.distribution as DistributionRow[]) || []).map((d, i) => (
                <div key={i} className="rounded-xl border border-brand-gray/20 bg-[#fafafa] p-4">
                  <p className="mb-2 font-semibold text-brand-navy">{d.name}</p>
                  {(d.properties_assigned?.length ?? 0) > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {d.properties_assigned!.map((prop, j) => (
                        <li key={j} className="flex justify-between gap-2 text-brand-slate">
                          <span>
                            {prop.name}
                            {prop.type && (
                              <span className="ms-1 text-xs text-brand-gray">({typeLabel(prop.type)})</span>
                            )}
                          </span>
                          <span className="shrink-0 font-medium">{formatCurrency(prop.value ?? 0)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-brand-gray"><BilingualText label={L.noAssignment} size="xs" /></p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Soultes */}
          {((result.soultes as SoulteRow[]) || []).length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
              <CardHeader>
                <CardTitle><BilingualCardTitle label={L.soultes} /></CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200/60">
                      <th className="py-2 text-start"><BilingualText label={L.heir} size="xs" /></th>
                      <th className="py-2 text-start"><BilingualText label={L.propertyName} size="xs" /></th>
                      <th className="py-2 text-center">Type</th>
                      <th className="py-2 text-end"><BilingualText label={L.amount} size="xs" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {((result.soultes as SoulteRow[]) || []).map((s, i) => (
                      <tr key={i} className="border-b border-amber-100">
                        <td className="py-2 text-brand-navy">{s.from}</td>
                        <td className="py-2 text-brand-slate">{s.property}</td>
                        <td className="py-2 text-center">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            s.type === "receive" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
                          )}>
                            {s.type === "receive" ? L.receive.fr : L.pay.fr}
                          </span>
                        </td>
                        <td className="py-2 text-end font-medium text-brand-navy">
                          {formatCurrency(s.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
