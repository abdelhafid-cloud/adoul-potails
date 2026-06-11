"use client";

import { ComingSoonPanel } from "@/components/dashboard/coming-soon-panel";
import { dashboardLabels } from "@/lib/dashboard-labels";

export default function AssistantPage() {
  return <ComingSoonPanel title={dashboardLabels.pages.assistant.title} />;
}
