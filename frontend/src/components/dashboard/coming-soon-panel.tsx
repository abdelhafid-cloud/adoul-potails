import { Clock } from "lucide-react";
import { BilingualHeading, BilingualText } from "@/components/dashboard/bilingual-text";
import { dashboardLabels } from "@/lib/dashboard-labels";
import type { Bilingual } from "@/lib/dashboard-labels";

export function ComingSoonPanel({
  title,
  description,
}: {
  title: Bilingual;
  description?: Bilingual;
}) {
  const desc = description ?? dashboardLabels.common.comingSoonDescription;

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-brand-gray/30 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gray/10">
          <Clock className="h-8 w-8 text-brand-gray" />
        </div>
        <BilingualHeading label={title} />
        <p className="mt-4 text-sm text-brand-slate">
          <BilingualText label={desc} size="sm" />
        </p>
        <span className="mt-6 inline-block rounded-full bg-brand-gray/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-slate">
          <BilingualText label={dashboardLabels.common.comingSoon} size="xs" />
        </span>
      </div>
    </div>
  );
}
