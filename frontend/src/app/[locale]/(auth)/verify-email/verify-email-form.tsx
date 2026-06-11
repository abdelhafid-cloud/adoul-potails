"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/services/api";

export default function VerifyEmailForm({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide.");
      return;
    }

    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email vérifié avec succès.");
      })
      .catch((err) => {
        setStatus("error");
        const msg = err?.response?.data?.message;
        setMessage(msg || "Impossible de vérifier votre email.");
      });
  }, [token]);

  return (
    <AuthShell locale={locale}>
      <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-gray/30 bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-accent" />
            <p className="mt-4 text-brand-slate">Vérification en cours...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="mt-4 text-xl font-semibold text-brand-navy">Compte activé</h1>
            <p className="mt-2 text-sm text-brand-slate">{message}</p>
            <Link href={`/${locale}/login`} className="mt-6 inline-block">
              <Button className="bg-brand-accent text-white hover:bg-brand-700">
                Se connecter
              </Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold text-brand-navy">Échec de la vérification</h1>
            <p className="mt-2 text-sm text-brand-slate">{message}</p>
            <Link href={`/${locale}/register`} className="mt-6 inline-block">
              <Button variant="outline" className="border-brand-slate text-brand-slate">
                Retour à l&apos;inscription
              </Button>
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
