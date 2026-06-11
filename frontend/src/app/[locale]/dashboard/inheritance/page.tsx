import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import InheritanceWorkflow from "./inheritance-workflow";

export default async function InheritancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <p className="py-12 text-center">
          <BilingualText label={dashboardLabels.common.loading} className="justify-center" />
        </p>
      }
    >
      <InheritanceWorkflow />
    </Suspense>
  );
}
