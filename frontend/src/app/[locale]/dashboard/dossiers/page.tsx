"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { DossierStatusBadge, DossierTypeBadge } from "@/components/dashboard/status-badge";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import type { Client, Dossier, PaginatedResponse } from "@/types";

const DOSSIER_TYPES = ["heritage", "sale", "donation", "procuration", "marriage", "property_share", "other"] as const;
const L = dashboardLabels.pages.dossiers;
const F = dashboardLabels.fields;
const C = dashboardLabels.common;

export default function DossiersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "heritage", client_id: "", status: "draft" });

  const { data: dossiers, isLoading } = useQuery<PaginatedResponse<Dossier>>({
    queryKey: ["dossiers"],
    queryFn: async () => (await api.get("/dossiers")).data,
  });

  const { data: clients } = useQuery<PaginatedResponse<Client>>({
    queryKey: ["clients-list"],
    queryFn: async () => (await api.get("/clients", { params: { per_page: 100 } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post("/dossiers", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossiers"] });
      setShowForm(false);
      setForm({ title: "", type: "heritage", client_id: "", status: "draft" });
    },
  });

  const selectClass =
    "mt-1 flex h-10 w-full rounded-lg border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BilingualHeading label={L.title} />
        <Button
          onClick={() => setShowForm(true)}
          className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          <span className="ms-2">{L.addDossier.fr} / {L.addDossier.ar}</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle><BilingualCardTitle label={L.addDossier} /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <BilingualLabel label={F.client} />
              <select
                className={selectClass}
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              >
                <option value="">--</option>
                {clients?.items.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <BilingualLabel label={F.type} />
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {DOSSIER_TYPES.map((type) => {
                  const lbl = dashboardLabels.dossierTypes[type];
                  return (
                    <option key={type} value={type}>
                      {lbl.fr} / {lbl.ar}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <BilingualLabel label={F.title} htmlFor="title" />
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-brand-gray/50 focus-visible:ring-brand-accent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.client_id}
                className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700"
              >
                {C.save.fr} / {C.save.ar}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-brand-slate text-brand-slate">
                {C.cancel.fr} / {C.cancel.ar}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gray/30 bg-[#fafafa]">
                <th className="px-4 py-3 text-start"><BilingualText label={F.number} size="xs" /></th>
                <th className="px-4 py-3 text-start"><BilingualText label={F.client} size="xs" /></th>
                <th className="px-4 py-3 text-start"><BilingualText label={F.type} size="xs" /></th>
                <th className="px-4 py-3 text-start"><BilingualText label={F.status} size="xs" /></th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center"><BilingualText label={C.loading} /></td></tr>
              ) : (
                dossiers?.items.map((d) => {
                  return (
                    <tr key={d.id} className="border-b border-brand-gray/20 hover:bg-brand-blue-50/30">
                      <td className="px-4 py-3 font-mono text-brand-blue">{d.number}</td>
                      <td className="px-4 py-3 text-brand-navy">{d.client_name}</td>
                      <td className="px-4 py-3">
                        <DossierTypeBadge type={d.type} />
                      </td>
                      <td className="px-4 py-3">
                        <DossierStatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/${locale}/dashboard/dossiers/${d.id}`}
                          className="inline-flex text-brand-blue hover:text-brand-blue-700"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
