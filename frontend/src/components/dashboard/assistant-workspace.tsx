"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { BilingualHeading } from "@/components/dashboard/bilingual-text";
import { AssistantConversationSidebar } from "@/components/dashboard/assistant-conversation-sidebar";
import { AssistantChatPanel } from "@/components/dashboard/assistant-chat-panel";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { cn } from "@/lib/utils";
import type { AssistantLang, AssistantStatus } from "@/types/assistant";

const L = dashboardLabels.pages.assistant;

export function AssistantWorkspace() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "fr";

  const convParam = searchParams.get("conv");
  const [activeId, setActiveId] = useState<string | null>(convParam);
  const [lang, setLang] = useState<AssistantLang>("fr");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: status } = useQuery<AssistantStatus>({
    queryKey: ["ai-status"],
    queryFn: async () => (await api.get("/ai/assistant/status")).data,
  });

  useEffect(() => {
    setActiveId(convParam);
  }, [convParam]);

  const selectConversation = (id: string) => {
    if (!id) {
      setActiveId(null);
      router.replace(`/${locale}/dashboard/assistant`);
      return;
    }
    setActiveId(id);
    router.replace(`/${locale}/dashboard/assistant?conv=${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[600px] flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4 px-1">
        <BilingualHeading label={L.title} subtitle={L.subtitle} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              lang === "fr" ? "bg-brand-accent text-white" : "border border-brand-gray/40 bg-white text-brand-slate",
            )}
          >
            Français
          </button>
          <button
            type="button"
            onClick={() => setLang("darija")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              lang === "darija" ? "bg-brand-accent text-white" : "border border-brand-gray/40 bg-white text-brand-slate",
            )}
          >
            Darija / الدارجة
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg border border-brand-gray/40 bg-white p-2 text-brand-slate hover:bg-brand-blue-50 lg:hidden"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-brand-gray/25 bg-white shadow-sm">
        <div
          className={cn(
            "shrink-0 transition-all duration-200",
            sidebarOpen ? "w-full max-w-[300px] lg:block" : "hidden lg:block lg:w-[300px]",
            !sidebarOpen && "lg:w-0 lg:overflow-hidden",
          )}
        >
          <AssistantConversationSidebar
            activeId={activeId}
            onSelect={selectConversation}
            onNew={selectConversation}
            locale={locale}
          />
        </div>
        <div className="min-w-0 flex-1 border-s border-brand-gray/20">
          <AssistantChatPanel
            conversationId={activeId}
            lang={lang}
            locale={locale}
            flowiseReady={!!status?.flowise_configured}
          />
        </div>
      </div>
    </div>
  );
}
