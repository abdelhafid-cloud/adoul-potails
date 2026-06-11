import { Suspense } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { ActCalculatorWorkflow } from "@/components/dashboard/act-calculator-workflow";
import { isActCalcType, type ActCalcType } from "@/lib/calculator-routes";
import { dashboardLabels } from "@/lib/dashboard-labels";

export default async function ActCalculatePage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  if (!isActCalcType(type)) notFound();

  return (
    <Suspense
      fallback={
        <p className="py-12 text-center">
          <BilingualText label={dashboardLabels.common.loading} className="justify-center" />
        </p>
      }
    >
      <ActCalculatorWorkflow actType={type as ActCalcType} />
    </Suspense>
  );
}
