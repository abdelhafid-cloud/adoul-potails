"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquarePlus,
  Search,
  Trash2,
  Pencil,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import { cn } from "@/lib/utils";
import type { AIConversationSummary } from "@/types/assistant";

const L = dashboardLabels.pages.assistant;

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: (id: string) => void;
  locale: string;
}

export function AssistantConversationSidebar({
  activeId,
  onSelect,
  onNew,
  locale,
}: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data: conversations = [], isLoading } = useQuery<AIConversationSummary[]>({
    queryKey: ["ai-conversations"],
    queryFn: async () => (await api.get("/ai/conversations")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post("/ai/conversations", { title: L.newConversation.fr })).data,
    onSuccess: (conv: AIConversationSummary) => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      onNew(conv.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/ai/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-conversations"] }),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) =>
      api.patch(`/ai/conversations/${id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      setEditingId(null);
    },
  });

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
    || (c.preview ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-MA", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <aside className="flex h-full w-full flex-col border-e border-brand-gray/20 bg-[#f8fafc]">
      <div className="border-b border-brand-gray/20 bg-white p-4">
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="w-full justify-start gap-2 bg-brand-accent text-white hover:bg-brand-700"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="text-sm">{L.newConversation.fr} / {L.newConversation.ar}</span>
        </Button>
        <div className="relative mt-3">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${L.searchConversations.fr}…`}
            className="border-brand-gray/40 bg-[#fafafa] ps-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-brand-gray/15 px-4 py-2">
        <BookOpen className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-brand-slate">
          {L.ragBadge.fr} · <span dir="rtl">{L.ragBadge.ar}</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="px-3 py-6 text-center text-xs text-brand-slate">
            {dashboardLabels.common.loading.fr}
          </p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-brand-slate">
            {L.noConversations.fr} / {L.noConversations.ar}
          </p>
        )}
        {filtered.map((conv) => {
          const active = conv.id === activeId;
          const editing = editingId === conv.id;
          return (
            <div
              key={conv.id}
              className={cn(
                "group mb-1 rounded-xl border transition-colors",
                active
                  ? "border-brand-accent/30 bg-white shadow-sm"
                  : "border-transparent hover:border-brand-gray/25 hover:bg-white",
              )}
            >
              {editing ? (
                <div className="flex items-center gap-1 p-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8 text-xs"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => renameMutation.mutate({ id: conv.id, title: editTitle })}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className="w-full px-3 py-2.5 text-start"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium text-brand-navy">{conv.title}</p>
                    <span className="shrink-0 text-[10px] text-brand-slate">{formatDate(conv.updated_at)}</span>
                  </div>
                  {conv.preview && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-brand-slate">{conv.preview}</p>
                  )}
                </button>
              )}
              {!editing && (
                <div className="flex justify-end gap-1 px-2 pb-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded p-1 text-brand-slate hover:bg-brand-gray/20"
                    onClick={() => {
                      setEditingId(conv.id);
                      setEditTitle(conv.title);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (activeId === conv.id) onSelect("");
                      deleteMutation.mutate(conv.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
