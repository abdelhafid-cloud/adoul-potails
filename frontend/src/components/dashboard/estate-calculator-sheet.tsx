"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Calculator, ArrowDownToLine, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { formatCurrency, cn } from "@/lib/utils";

const L = dashboardLabels.pages.inheritance.estateCalculator;

export type EstateLineCategory =
  | "real_estate"
  | "bank"
  | "vehicle"
  | "business"
  | "gold_jewelry"
  | "furniture"
  | "other_asset"
  | "debt"
  | "fee";

export type EstateLine = {
  id: string;
  description: string;
  category: EstateLineCategory;
  quantity: number;
  unitValue: number;
};

export type EstateValues = {
  total_estate_value: number;
  real_estate_value: number;
  bank_accounts_value: number;
  debts: number;
  fees: number;
};

const ASSET_CATEGORIES: EstateLineCategory[] = [
  "real_estate",
  "bank",
  "vehicle",
  "business",
  "gold_jewelry",
  "furniture",
  "other_asset",
];

const CATEGORY_OPTIONS: EstateLineCategory[] = [...ASSET_CATEGORIES, "debt", "fee"];

function newLine(category: EstateLineCategory = "real_estate"): EstateLine {
  return {
    id: crypto.randomUUID(),
    description: "",
    category,
    quantity: 1,
    unitValue: 0,
  };
}

function lineAmount(line: EstateLine): number {
  return Math.max(0, (line.quantity || 0) * (line.unitValue || 0));
}

type Props = {
  onApply: (values: Partial<EstateValues>) => void;
  currentTotal?: number;
};

export function EstateCalculatorSheet({ onApply, currentTotal }: Props) {
  const [lines, setLines] = useState<EstateLine[]>([
    newLine("real_estate"),
    newLine("bank"),
  ]);

  const totals = useMemo(() => {
    let realEstate = 0;
    let bank = 0;
    let otherAssets = 0;
    let debts = 0;
    let fees = 0;

    for (const line of lines) {
      const amt = lineAmount(line);
      switch (line.category) {
        case "real_estate":
          realEstate += amt;
          break;
        case "bank":
          bank += amt;
          break;
        case "debt":
          debts += amt;
          break;
        case "fee":
          fees += amt;
          break;
        default:
          otherAssets += amt;
      }
    }

    const assetsTotal = realEstate + bank + otherAssets;
    const netPreview = assetsTotal - debts - fees;

    return { realEstate, bank, otherAssets, assetsTotal, debts, fees, netPreview };
  }, [lines]);

  const updateLine = (id: string, patch: Partial<EstateLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  };

  const addLine = (category?: EstateLineCategory) => {
    setLines((prev) => [...prev, newLine(category)]);
  };

  const inputClass = "h-9 border-brand-gray/50 text-sm";

  return (
    <Card className="border-brand-gray/30 shadow-sm">
      <CardHeader className="border-b border-brand-gray/20 bg-[#fafafa] pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-brand-navy">
              <Calculator className="h-5 w-5 text-brand-blue" />
              <BilingualCardTitle label={L.title} />
            </CardTitle>
            <p className="mt-1 text-xs text-brand-slate">
              {L.subtitle.fr} / <span dir="rtl">{L.subtitle.ar}</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addLine()}
            className="border-brand-slate text-brand-slate"
          >
            <Plus className="h-4 w-4" />
            <span className="ms-1 text-xs">{L.addLine.fr}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-brand-gray/25 bg-brand-blue-50/40 text-xs text-brand-navy">
                <th className="w-8 px-2 py-2.5 text-center">#</th>
                <th className="px-2 py-2.5 text-start"><BilingualText label={L.colDescription} size="xs" /></th>
                <th className="w-36 px-2 py-2.5 text-start"><BilingualText label={L.colCategory} size="xs" /></th>
                <th className="w-16 px-2 py-2.5 text-end"><BilingualText label={L.colQty} size="xs" /></th>
                <th className="w-28 px-2 py-2.5 text-end"><BilingualText label={L.colUnit} size="xs" /></th>
                <th className="w-28 px-2 py-2.5 text-end"><BilingualText label={L.colAmount} size="xs" /></th>
                <th className="w-10 px-1 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const amt = lineAmount(line);
                const isDeduction = line.category === "debt" || line.category === "fee";
                return (
                  <tr
                    key={line.id}
                    className={cn(
                      "border-b border-brand-gray/15 transition-colors hover:bg-brand-blue-50/20",
                      isDeduction && "bg-red-50/30",
                    )}
                  >
                    <td className="px-2 py-1.5 text-center text-xs text-brand-gray">{idx + 1}</td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(line.id, { description: e.target.value })}
                        placeholder={L.descriptionPlaceholder.fr}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        className={cn(inputClass, "w-full rounded-lg border bg-white px-2")}
                        value={line.category}
                        onChange={(e) => updateLine(line.id, { category: e.target.value as EstateLineCategory })}
                      >
                        {CATEGORY_OPTIONS.map((cat) => {
                          const lbl = L.categories[cat];
                          return (
                            <option key={cat} value={cat}>
                              {lbl.fr}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={line.quantity || ""}
                        onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className={cn(inputClass, "text-end font-mono")}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={line.unitValue || ""}
                        onChange={(e) => updateLine(line.id, { unitValue: parseFloat(e.target.value) || 0 })}
                        className={cn(inputClass, "text-end font-mono")}
                      />
                    </td>
                    <td className={cn(
                      "px-2 py-1.5 text-end font-mono font-medium",
                      isDeduction ? "text-red-700" : "text-brand-navy",
                    )}>
                      {isDeduction ? "−" : ""}{formatCurrency(amt)}
                    </td>
                    <td className="px-1 py-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Récapitulatif */}
        <div className="border-t border-brand-gray/25 bg-[#fafafa] p-4">
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <SummaryRow label={L.subtotalRealEstate} value={totals.realEstate} />
            <SummaryRow label={L.subtotalBank} value={totals.bank} />
            {totals.otherAssets > 0 && (
              <SummaryRow label={L.subtotalOther} value={totals.otherAssets} />
            )}
            {totals.debts > 0 && (
              <SummaryRow label={L.subtotalDebts} value={totals.debts} negative />
            )}
            {totals.fees > 0 && (
              <SummaryRow label={L.subtotalFees} value={totals.fees} negative />
            )}
          </div>

          <div className="mb-4 rounded-xl border-2 border-brand-blue/30 bg-brand-blue-50/50 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <BilingualText label={L.grandTotal} size="xs" className="mb-1 text-brand-blue" />
                <p className="font-mono text-2xl font-bold text-brand-navy">
                  {formatCurrency(totals.assetsTotal)}
                </p>
              </div>
              <div className="text-end">
                <BilingualText label={L.netPreview} size="xs" className="mb-1 justify-end text-brand-slate" />
                <p className="font-mono text-lg font-semibold text-brand-accent">
                  {formatCurrency(totals.netPreview)}
                </p>
              </div>
            </div>
            {currentTotal != null && currentTotal > 0 && currentTotal !== totals.assetsTotal && (
              <p className="mt-2 text-xs text-amber-700">
                {L.currentField.fr}: {formatCurrency(currentTotal)} — {L.willUpdate.fr}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-brand-accent text-white hover:bg-brand-700"
              onClick={() => onApply({ total_estate_value: totals.assetsTotal })}
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span className="ms-1 text-xs">{L.applyTotal.fr} / {L.applyTotal.ar}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-brand-accent text-brand-accent"
              onClick={() =>
                onApply({
                  total_estate_value: totals.assetsTotal,
                  real_estate_value: totals.realEstate,
                  bank_accounts_value: totals.bank,
                })
              }
            >
              <Split className="h-4 w-4" />
              <span className="ms-1 text-xs">{L.applySplit.fr} / {L.applySplit.ar}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-brand-navy text-brand-navy"
              onClick={() =>
                onApply({
                  total_estate_value: totals.assetsTotal,
                  real_estate_value: totals.realEstate,
                  bank_accounts_value: totals.bank,
                  debts: totals.debts,
                  fees: totals.fees,
                })
              }
            >
              <Calculator className="h-4 w-4" />
              <span className="ms-1 text-xs">{L.applyAll.fr} / {L.applyAll.ar}</span>
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => addLine("debt")}>
              + {L.addDebt.fr}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-700" onClick={() => addLine("fee")}>
              + {L.addFee.fr}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  negative,
}: {
  label: { fr: string; ar: string };
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-gray/20 bg-white px-3 py-2">
      <BilingualLabel label={label} className="mb-0 text-xs" />
      <span className={cn("font-mono text-sm font-medium", negative ? "text-red-700" : "text-brand-navy")}>
        {negative ? "−" : ""}{formatCurrency(value)}
      </span>
    </div>
  );
}
