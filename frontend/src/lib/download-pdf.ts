import { api } from "@/services/api";
import type { QueryClient } from "@tanstack/react-query";

/** Rafraîchit les listes / détail dossier après export PDF. */
export function invalidateDossierQueries(queryClient: QueryClient, dossierId?: string | null) {
  if (dossierId) {
    queryClient.invalidateQueries({ queryKey: ["dossier", dossierId] });
  }
  queryClient.invalidateQueries({ queryKey: ["dossiers"] });
  queryClient.invalidateQueries({ queryKey: ["dossiers-heritage"] });
  queryClient.invalidateQueries({ queryKey: ["dossiers-property"] });
  queryClient.invalidateQueries({ queryKey: ["dossiers-act"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/** Télécharge un PDF depuis l'API avec gestion d'erreurs. */
export async function downloadPdf(
  apiPath: string,
  filename: string,
  options?: { onSuccess?: () => void },
): Promise<void> {
  const res = await api.get(apiPath, { responseType: "blob" });
  const blob = res.data as Blob;

  if (blob.type?.includes("json") || blob.type?.includes("text")) {
    const text = await blob.text();
    try {
      const err = JSON.parse(text) as { message?: string };
      throw new Error(err.message || "Impossible de générer le PDF.");
    } catch (e) {
      if (e instanceof Error && e.message !== "Impossible de générer le PDF.") throw e;
      throw new Error(text.slice(0, 200) || "Impossible de générer le PDF.");
    }
  }

  if (blob.size < 500) {
    throw new Error("Le fichier PDF reçu est vide ou invalide.");
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
  options?.onSuccess?.();
}

/** Chemin PDF selon le type de calcul enregistré dans le dossier. */
export function pdfPathForCalculation(type: string, id: string): string | null {
  switch (type) {
    case "inheritance":
      return `/inheritance/${id}/pdf`;
    case "property_share":
      return `/property-shares/${id}/pdf`;
    case "sale":
    case "donation":
    case "procuration":
    case "marriage":
    case "wasiyyah":
    case "other":
      return `/act-calculations/${id}/pdf`;
    default:
      return null;
  }
}

export function pdfFilenameForCalculation(type: string, id: string): string {
  return `${type}_${id}.pdf`;
}
