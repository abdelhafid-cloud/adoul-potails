"use client";

import { Suspense } from "react";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { WasiyyahWorkflow } from "@/components/dashboard/wasiyyah-workflow";
import { dashboardLabels } from "@/lib/dashboard-labels";

export default function WasiyyahPage() {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center">
          <BilingualText label={dashboardLabels.common.loading} className="justify-center" />
        </p>
      }
    >
      <WasiyyahWorkflow />
    </Suspense>
  );
}
