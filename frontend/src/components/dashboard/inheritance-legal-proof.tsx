"use client";

import { BookOpen, Scale, Building2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { heirTypeLabel } from "@/lib/heir-types";
import { HeirStatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { InheritanceCalculation, LegalBasis, LegalProof, LegalVerificationEntry } from "@/types";
import { cn } from "@/lib/utils";

const L = dashboardLabels.pages.inheritance;

function LegalBasisBlock({ basis }: { basis: LegalBasis }) {
  const rows = [
    { key: "category", fr: basis.category_fr, ar: basis.category_ar },
    { key: "share", fr: basis.share_fr, ar: basis.share_ar },
    { key: "quran", fr: basis.quran_fr, ar: basis.quran_ar },
    { key: "maliki", fr: basis.maliki_fr, ar: basis.maliki_ar },
    { key: "moudawana", fr: basis.moudawana_fr, ar: basis.moudawana_ar },
  ].filter((r) => r.fr || r.ar);

  return (
    <div className="space-y-2 rounded-lg bg-brand-50/60 p-3 text-sm">
      {basis.applied_share && (
        <p className="font-medium text-brand-blue">
          {L.appliedShare.fr}: {basis.applied_share} — {L.appliedShare.ar}: {basis.applied_share}
        </p>
      )}
      {rows.map((row) => (
        <div key={row.key} className="border-s-2 border-brand-blue/40 ps-3">
          <p className="text-brand-navy">{row.fr}</p>
          <p className="text-brand-slate" dir="rtl">{row.ar}</p>
        </div>
      ))}
    </div>
  );
}

function HeirProofCard({
  type,
  name,
  nameAr,
  amount,
  percentage,
  status,
  reasonFr,
  reasonAr,
  legalBasis,
}: {
  type: string;
  name?: string;
  nameAr?: string;
  amount?: number;
  percentage?: number;
  status?: string;
  reasonFr?: string | null;
  reasonAr?: string | null;
  legalBasis?: LegalBasis;
}) {
  const [open, setOpen] = useState(false);
  const lbl = heirTypeLabel(type);
  const displayName = name || `${lbl.fr} / ${lbl.ar}`;
  const blocked = status === "blocked";
  const pending = status === "pending";

  return (
    <div className={cn(
      "rounded-xl border bg-white",
      blocked ? "border-amber-200/80" : pending ? "border-pink-200/80" : "border-brand-gray/30",
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-start hover:bg-brand-50/50"
      >
        <div>
          <p className="font-medium text-brand-navy">{displayName}</p>
          {nameAr && <p className="text-xs text-brand-slate" dir="rtl">{nameAr}</p>}
          <p className={cn("text-xs", blocked ? "text-amber-800" : pending ? "text-pink-800" : "text-brand-slate")}>
            {blocked || pending ? (
              <HeirStatusBadge status={blocked ? "blocked" : "pending"} />
            ) : (
              <span>{percentage?.toFixed(2)}% — {amount != null ? formatCurrency(amount) : "—"}</span>
            )}
          </p>
          {(blocked || pending) && reasonFr && (
            <p className={cn("mt-1 text-xs", blocked ? "text-amber-900" : "text-pink-900")}>
              {reasonFr}
              {reasonAr && <span className="block" dir="rtl">{reasonAr}</span>}
            </p>
          )}
          {!blocked && !pending && (
            <div className="mt-1">
              <HeirStatusBadge status="inherits" />
            </div>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-brand-slate" /> : <ChevronDown className="h-4 w-4 text-brand-slate" />}
      </button>
      {open && legalBasis && (
        <div className="border-t border-brand-gray/20 p-4 pt-0">
          <LegalBasisBlock basis={legalBasis} />
        </div>
      )}
    </div>
  );
}

function LegalVerificationCard({ entry }: { entry: LegalVerificationEntry }) {
  const [open, setOpen] = useState(false);
  const blocked = entry.status === "blocked";
  const pending = entry.status === "pending";

  return (
    <div className={cn(
      "rounded-xl border bg-white",
      blocked ? "border-amber-200/80" : pending ? "border-pink-200/80" : "border-emerald-200/60",
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-start hover:bg-brand-50/50"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-brand-navy">{entry.name}</p>
          {entry.name_ar && <p className="text-xs text-brand-slate" dir="rtl">{entry.name_ar}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <HeirStatusBadge status={blocked ? "blocked" : pending ? "pending" : "inherits"} />
            <span className="text-xs text-brand-slate">
              {entry.status_label_fr} / {entry.status_label_ar}
            </span>
            {entry.status === "inherits" && entry.share_applied && (
              <span className="text-xs font-medium text-emerald-800">{entry.share_applied}</span>
            )}
          </div>
          {entry.rule_applied_fr && (
            <p className="mt-1 text-xs text-brand-navy/80 line-clamp-2">{entry.rule_applied_fr}</p>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-brand-slate" /> : <ChevronDown className="h-4 w-4 shrink-0 text-brand-slate" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-brand-gray/20 p-4 text-sm">
          {entry.rule_applied_fr && (
            <div>
              <BilingualText label={L.ruleApplied} size="xs" className="mb-1 font-medium" />
              <p className="text-brand-navy">{entry.rule_applied_fr}</p>
              <p className="text-brand-slate" dir="rtl">{entry.rule_applied_ar}</p>
            </div>
          )}
          {entry.justification_fr && (
            <div>
              <BilingualText label={L.justification} size="xs" className="mb-1 font-medium" />
              <p className="text-brand-slate">{entry.justification_fr}</p>
              <p className="text-brand-slate/90" dir="rtl">{entry.justification_ar}</p>
            </div>
          )}
          {entry.blocking_heir_fr && (
            <div>
              <BilingualText label={L.blockingHeir} size="xs" className="mb-1 font-medium" />
              <p className="text-amber-900">{entry.blocking_heir_fr}</p>
              <p className="text-amber-800" dir="rtl">{entry.blocking_heir_ar}</p>
            </div>
          )}
          {entry.legal_reference_fr && (
            <div className="rounded-lg bg-brand-50/60 p-3">
              <BilingualText label={L.legalReference} size="xs" className="mb-1 font-medium" />
              <p className="text-brand-navy">{entry.legal_reference_fr}</p>
              <p className="text-brand-slate" dir="rtl">{entry.legal_reference_ar}</p>
            </div>
          )}
          {entry.note_fr && (
            <p className="text-xs text-violet-800">{entry.note_fr} — <span dir="rtl">{entry.note_ar}</span></p>
          )}
        </div>
      )}
    </div>
  );
}

export function InheritanceLegalProof({ calculation }: { calculation: InheritanceCalculation }) {
  const proof: LegalProof | undefined = calculation.legal_proof;
  if (!proof) return null;

  const summary = proof.summary || {};
  const verification = calculation.legal_verification || proof.legal_verification || [];

  return (
    <div className="space-y-4">
      <Card className="border-brand-blue/20 bg-gradient-to-br from-white to-brand-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand-blue" />
            <BilingualCardTitle label={L.legalProof} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {summary.school_fr && (
              <div className="flex gap-3 rounded-lg border border-brand-gray/20 p-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-sm font-medium text-brand-navy">{summary.school_fr}</p>
                  <p className="text-xs text-brand-slate" dir="rtl">{summary.school_ar}</p>
                </div>
              </div>
            )}
            {summary.law_fr && (
              <div className="flex gap-3 rounded-lg border border-brand-gray/20 p-3">
                <Scale className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-sm font-medium text-brand-navy">{summary.law_fr}</p>
                  <p className="text-xs text-brand-slate" dir="rtl">{summary.law_ar}</p>
                </div>
              </div>
            )}
            {summary.ministry_fr && (
              <div className="flex gap-3 rounded-lg border border-brand-gray/20 p-3 sm:col-span-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <div>
                  <p className="text-sm font-medium text-brand-navy">{summary.ministry_fr}</p>
                  <p className="text-xs text-brand-slate" dir="rtl">{summary.ministry_ar}</p>
                </div>
              </div>
            )}
          </div>

          {summary.disclaimer_fr && (
            <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{summary.disclaimer_fr}</p>
                <p dir="rtl" className="mt-1 text-amber-800">{summary.disclaimer_ar}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(proof.calculation_meta?.has_awl || proof.calculation_meta?.has_radd || (calculation.adjustments && calculation.adjustments.length > 0)) && (
        <Card className="border-violet-200/80">
          <CardHeader>
            <CardTitle><BilingualCardTitle label={proof.calculation_meta?.has_awl ? L.awlApplied : L.raddApplied} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(calculation.adjustments || proof.adjustments || []).map((adj, i) => (
              <div key={i} className="rounded-lg bg-violet-50/60 p-3 text-sm">
                <p className="font-medium text-brand-navy">{adj.title_fr}</p>
                <p className="text-xs text-brand-slate" dir="rtl">{adj.title_ar}</p>
                <p className="mt-1 text-brand-slate">{adj.detail_fr}</p>
                {adj.detail_ar && <p className="text-xs text-brand-slate/80" dir="rtl">{adj.detail_ar}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {proof.steps && proof.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.calculationSteps} /></CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-s-2 border-brand-blue/30 ps-6">
              {proof.steps.map((step) => (
                <li key={step.step} className="relative">
                  <span className="absolute -start-[1.85rem] flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                    {step.step}
                  </span>
                  <p className="font-medium text-brand-navy">{step.title_fr}</p>
                  <p className="text-xs text-brand-slate" dir="rtl">{step.title_ar}</p>
                  <p className="mt-1 text-sm text-brand-slate">{step.detail_fr}</p>
                  {step.detail_ar && (
                    <p className="text-xs text-brand-slate/80" dir="rtl">{step.detail_ar}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {verification.length > 0 && (
        <Card className="border-brand-blue/30">
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.legalVerification} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {verification.map((entry, i) => (
              <LegalVerificationCard key={`${entry.type}-${i}`} entry={entry} />
            ))}
          </CardContent>
        </Card>
      )}

      {((proof.excluded_heirs && proof.excluded_heirs.length > 0) || (calculation.excluded_heirs && calculation.excluded_heirs.length > 0)) && (
        <Card className="border-amber-200/80">
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.excludedHeirs} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(proof.excluded_heirs || calculation.excluded_heirs || []).map((hp, i) => (
              <HeirProofCard
                key={`ex-${hp.type}-${i}`}
                type={hp.type || "other"}
                name={hp.name}
                nameAr={hp.name_ar}
                status={hp.status as "blocked" | "pending"}
                reasonFr={hp.reason_fr}
                reasonAr={hp.reason_ar}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {proof.heir_proofs && proof.heir_proofs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.finalDistribution} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proof.heir_proofs.filter((hp) => hp.status === "inherits").map((hp, i) => (
              <HeirProofCard
                key={`${hp.type}-${i}`}
                type={hp.type || "other"}
                name={hp.name}
                nameAr={hp.name_ar}
                amount={hp.amount}
                percentage={hp.percentage}
                status={hp.status}
                reasonFr={hp.reason_fr}
                reasonAr={hp.reason_ar}
                legalBasis={hp.legal_basis}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {calculation.dossier && (
        <div className={cn("rounded-xl border border-brand-gray/30 p-4 text-sm")}>
          <BilingualText label={L.linkedDossier} size="xs" className="mb-2" />
          <p className="font-mono text-brand-blue">{calculation.dossier.number}</p>
          {calculation.dossier.title && <p className="text-brand-navy">{calculation.dossier.title}</p>}
          {calculation.client && (
            <p className="mt-1 text-brand-slate">
              {calculation.client.full_name}
              {calculation.client.cin ? ` — CIN: ${calculation.client.cin}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
