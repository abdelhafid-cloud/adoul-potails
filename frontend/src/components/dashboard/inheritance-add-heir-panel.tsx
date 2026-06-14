"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { HeirPersonFields } from "@/components/dashboard/heir-person-fields";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { buildInheritanceRecalcPayload } from "@/lib/inheritance-recalc";
import { HEIR_TYPE_GROUPS, heirTypeLabel, normalizeHeirType, syncHeirPersons } from "@/lib/heir-types";
import { cn } from "@/lib/utils";
import type { HeirInput, InheritanceCalculation } from "@/types";

const L = dashboardLabels.pages.inheritance;

interface Props {
  calculation: InheritanceCalculation;
  locale: string;
}

export function InheritanceAddHeirPanel({ calculation, locale }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [extraHeirs, setExtraHeirs] = useState<HeirInput[]>([]);
  const [error, setError] = useState("");

  const selectClass =
    "flex h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  const addHeir = () => {
    const base = { type: "other", count: 1 };
    setExtraHeirs([...extraHeirs, { ...base, persons: syncHeirPersons(base) }]);
  };

  const patchHeir = (index: number, patch: Partial<HeirInput>) => {
    const updated = [...extraHeirs];
    const next = { ...updated[index], ...patch };
    updated[index] = { ...next, persons: syncHeirPersons(next) };
    setExtraHeirs(updated);
  };

  const removeHeir = (index: number) => {
    setExtraHeirs(extraHeirs.filter((_, i) => i !== index));
  };

  const recalcMutation = useMutation({
    mutationFn: async () => {
      const allHeirs = [
        ...(calculation.heirs ?? []),
        ...extraHeirs.map((h) => ({ ...h, persons: syncHeirPersons(h) })),
      ];
      const res = await api.post(
        "/inheritance/calculate",
        buildInheritanceRecalcPayload(calculation, allHeirs),
      );
      return res.data as InheritanceCalculation;
    },
    onSuccess: (data) => {
      setError("");
      setExtraHeirs([]);
      queryClient.invalidateQueries({ queryKey: ["inheritance-calculations"] });
      router.replace(`/${locale}/dashboard/inheritance?calc_id=${data.id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Erreur lors du recalcul.");
    },
  });

  const currentCount = calculation.heirs?.length ?? 0;

  return (
    <Card className="border-dashed border-brand-accent/40 bg-brand-blue-50/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-brand-accent" />
          <BilingualCardTitle label={L.addForgottenHeir} />
        </CardTitle>
        <BilingualText label={L.addForgottenHeirHint} size="xs" className="text-brand-slate" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-brand-slate">
          {L.currentHeirs.fr}: <span className="font-semibold text-brand-navy">{currentCount}</span>
          <span className="mx-2">/</span>
          <span dir="rtl">{L.currentHeirs.ar}: {currentCount}</span>
        </p>

        {extraHeirs.map((heir, i) => (
          <div key={i} className="rounded-xl border border-brand-gray/25 bg-white p-3">
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
                const updated = [...extraHeirs];
                updated[i] = next;
                setExtraHeirs(updated);
              }}
              selectClass={selectClass}
            />
          </div>
        ))}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addHeir}
          className="border-brand-accent text-brand-accent"
        >
          <Plus className="h-4 w-4" />
          <span className="ms-1 text-xs">{L.addHeir.fr} / {L.addHeir.ar}</span>
        </Button>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {extraHeirs.length > 0 && (
          <Button
            onClick={() => recalcMutation.mutate()}
            disabled={recalcMutation.isPending || !calculation.dossier_id}
            className="btn-dashboard-blue w-full bg-brand-accent text-white hover:bg-brand-700"
          >
            <RefreshCw className={cn("h-4 w-4", recalcMutation.isPending && "animate-spin")} />
            <span className="ms-2 text-xs">
              {L.recalculate.fr} / {L.recalculate.ar}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
