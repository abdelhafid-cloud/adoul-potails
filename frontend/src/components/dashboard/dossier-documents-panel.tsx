"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilingualCardTitle, BilingualLabel, BilingualText } from "@/components/dashboard/bilingual-text";
import { api } from "@/services/api";
import { dashboardLabels } from "@/lib/dashboard-labels";
import type { DossierDocument } from "@/types";

const L = dashboardLabels.pages.dossiers;

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface Props {
  dossierId: string;
}

export function DossierDocumentsPanel({ dossierId }: Props) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docName, setDocName] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery<{ items: DossierDocument[] }>({
    queryKey: ["dossier-documents", dossierId],
    queryFn: async () => (await api.get(`/dossiers/${dossierId}/documents`)).data,
    enabled: !!dossierId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      if (docName.trim()) form.append("name", docName.trim());
      return (await api.post(`/dossiers/${dossierId}/documents`, form)).data as DossierDocument;
    },
    onSuccess: () => {
      setDocName("");
      if (fileRef.current) fileRef.current.value = "";
      setError("");
      queryClient.invalidateQueries({ queryKey: ["dossier-documents", dossierId] });
      queryClient.invalidateQueries({ queryKey: ["dossier", dossierId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Erreur lors du téléversement.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/dossiers/${dossierId}/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dossier-documents", dossierId] });
      queryClient.invalidateQueries({ queryKey: ["dossier", dossierId] });
    },
  });

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Sélectionnez un fichier.");
      return;
    }
    uploadMutation.mutate(file);
  };

  const documents = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle><BilingualCardTitle label={L.documents} /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BilingualText label={L.documentsHint} size="sm" className="text-brand-slate" />

        <div className="rounded-xl border border-dashed border-brand-gray/40 bg-[#fafafa] p-4 space-y-3">
          <div>
            <BilingualLabel label={L.documentName} />
            <Input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Ex. Acte de décès / شهادة الوفاة"
              className="border-brand-gray/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="max-w-xs border-brand-gray/50"
            />
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="bg-brand-accent text-white hover:bg-brand-700"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="ms-2 text-xs">{L.uploadDocument.fr} / {L.uploadDocument.ar}</span>
            </Button>
          </div>
          <p className="text-xs text-brand-slate">PDF, JPG, PNG — max 20 Mo</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <p className="text-sm text-brand-slate">{L.loadingDocuments.fr} / {L.loadingDocuments.ar}</p>
        ) : !documents.length ? (
          <p className="py-6 text-center text-sm text-brand-slate">
            {L.noDocuments.fr} / {L.noDocuments.ar}
          </p>
        ) : (
          <ul className="divide-y divide-brand-gray/20 rounded-xl border border-brand-gray/25">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="h-5 w-5 shrink-0 text-brand-blue" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-brand-navy">{doc.name}</p>
                  <p className="text-xs text-brand-slate">
                    {doc.file_type?.toUpperCase()} · {formatFileSize(doc.file_size)}
                    {doc.created_at && (
                      <> · {new Date(doc.created_at).toLocaleDateString("fr-MA")}</>
                    )}
                  </p>
                </div>
                {doc.file_url && (
                  <Button asChild size="icon" variant="ghost">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 text-brand-blue" />
                    </a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(doc.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
