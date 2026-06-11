"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualHeading, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import type { Client, PaginatedResponse } from "@/types";

const L = dashboardLabels.pages.clients;
const F = dashboardLabels.fields;
const C = dashboardLabels.common;

const formFields = [
  { key: "first_name" as const, label: F.firstName },
  { key: "last_name" as const, label: F.lastName },
  { key: "cin" as const, label: F.cin },
  { key: "phone" as const, label: F.phone },
  { key: "email" as const, label: F.email },
  { key: "profession" as const, label: F.profession },
];

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({
    first_name: "", last_name: "", cin: "", phone: "", email: "", address: "", profession: "", notes: "",
  });
  const [saveError, setSaveError] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Client>>({
    queryKey: ["clients", search],
    queryFn: async () => {
      const res = await api.get("/clients", { params: { search, per_page: 50 } });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      if (editing) return api.put(`/clients/${editing.id}`, payload);
      return api.post("/clients", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSaveError("");
      resetForm();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setSaveError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const resetForm = () => {
    setForm({ first_name: "", last_name: "", cin: "", phone: "", email: "", address: "", profession: "", notes: "" });
    setEditing(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditing(null);
    setSaveError("");
    setForm({ first_name: "", last_name: "", cin: "", phone: "", email: "", address: "", profession: "", notes: "" });
    setShowForm(true);
  };

  const startEdit = (client: Client) => {
    setEditing(client);
    setForm({
      first_name: client.first_name,
      last_name: client.last_name,
      cin: client.cin,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      profession: client.profession || "",
      notes: client.notes || "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BilingualHeading label={L.title} />
        <Button
          onClick={openAddForm}
          className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          <span className="ms-2">{L.addClient.fr} / {L.addClient.ar}</span>
        </Button>
      </div>

      {saveError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray" />
        <Input
          placeholder={`${C.search.fr} / ${C.search.ar}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-brand-gray/50 ps-10 focus-visible:ring-brand-accent"
        />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              <BilingualCardTitle label={editing ? L.editClient : L.addClient} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {formFields.map(({ key, label }) => (
                <div key={key}>
                  <BilingualLabel label={label} htmlFor={key} />
                  <Input
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="border-brand-gray/50 focus-visible:ring-brand-accent"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <BilingualLabel label={F.address} htmlFor="address" />
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="border-brand-gray/50 focus-visible:ring-brand-accent"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending || !form.first_name.trim() || !form.last_name.trim() || !form.cin.trim()}
                className="btn-dashboard-blue bg-brand-accent text-white hover:bg-brand-700"
              >
                {C.save.fr} / {C.save.ar}
              </Button>
              <Button variant="outline" onClick={resetForm} className="border-brand-slate text-brand-slate">
                {C.cancel.fr} / {C.cancel.ar}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray/30 bg-[#fafafa]">
                  <th className="px-4 py-3 text-start font-medium text-brand-navy">
                    <BilingualText label={F.lastName} size="xs" />
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-brand-navy">
                    <BilingualText label={F.firstName} size="xs" />
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-brand-navy">
                    <BilingualText label={F.cin} size="xs" />
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-brand-navy">
                    <BilingualText label={F.phone} size="xs" />
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-brand-navy">
                    <BilingualText label={C.actions} size="xs" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <BilingualText label={C.loading} />
                    </td>
                  </tr>
                ) : !data?.items.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <BilingualText label={C.noResults} />
                    </td>
                  </tr>
                ) : (
                  data.items.map((client) => (
                    <tr key={client.id} className="border-b border-brand-gray/20">
                      <td className="px-4 py-3 text-brand-navy">{client.last_name}</td>
                      <td className="px-4 py-3 text-brand-navy">{client.first_name}</td>
                      <td className="px-4 py-3 text-brand-slate">{client.cin}</td>
                      <td className="px-4 py-3 text-brand-slate">{client.phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(client)}>
                            <Pencil className="h-4 w-4 text-brand-slate" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(client.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
