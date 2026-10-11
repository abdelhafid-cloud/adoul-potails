"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/services/api";
import { useAuthStore, useAuth } from "@/store/auth-store";
import { registerFields } from "@/lib/register-fields";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

function BilingualLabel({
  htmlFor,
  fr,
  ar,
}: {
  htmlFor: string;
  fr: string;
  ar: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-brand-navy">
        {fr}
      </label>
      <span dir="rtl" lang="ar" className="block text-xs text-brand-slate">
        {ar}
      </span>
    </div>
  );
}

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isReady, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isReady, isAuthenticated, locale, router]);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setSuccess("Votre email est confirmé. Vous pouvez vous connecter.");
      setError("");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token);
      router.push(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSuccess("");
      setError(msg || "Erreur de connexion");
      if (msg?.toLowerCase().includes("vérifier votre email")) {
        setPendingEmail(data.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = pendingEmail || emailValue;
    if (!email) {
      setError("Saisissez votre email pour renvoyer le lien de vérification.");
      return;
    }
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      setSuccess("Un nouvel email de confirmation a été envoyé. Vérifiez votre boîte de réception.");
      setError("");
    } catch {
      setError("Impossible d'envoyer l'email de vérification.");
    } finally {
      setResendLoading(false);
    }
  };

  const needsVerification = error.toLowerCase().includes("vérifier votre email");

  const highlights = [
    { fr: "Accès sécurisé à votre espace", ar: "وصول آمن إلى مساحتك" },
    { fr: "Gestion dossiers & héritage", ar: "إدارة الملفات والميراث" },
    { fr: "Actes, wasiyyah et rapports PDF", ar: "العقود والوصية وتقارير PDF" },
  ];

  return (
    <AuthShell locale={locale}>
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(260px,340px)_1fr] lg:gap-14">
        {/* Panneau gauche */}
        <div>
          <span className="inline-block rounded-full border border-brand-gray/50 bg-[#f7f7f7] px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand-slate uppercase">
            Connexion
          </span>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-brand-navy lg:text-4xl">
            {t("loginTitle")}
          </h1>
          <p dir="rtl" lang="ar" className="mt-3 text-xl font-bold text-brand-navy">
            تسجيل الدخول
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brand-slate">{t("loginSubtitle")}</p>
          <p dir="rtl" lang="ar" className="mt-1 text-sm leading-relaxed text-brand-slate">
            الوصول إلى مساحة Adoul AI
          </p>
          <ul className="mt-8 hidden space-y-3 lg:block">
            {highlights.map((h) => (
              <li key={h.fr} className="flex items-start gap-2 text-sm text-brand-slate">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>
                  {h.fr} <span className="text-brand-gray">/</span>{" "}
                  <span dir="rtl" lang="ar">{h.ar}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulaire */}
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-brand-gray/30 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 border-b border-brand-gray/25 pb-4">
              <h2 className="text-sm font-semibold text-brand-navy">Identifiants</h2>
              <p dir="rtl" lang="ar" className="text-xs text-brand-slate">
                بيانات الدخول
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <BilingualLabel
                  htmlFor="email"
                  fr={registerFields.labels.email.fr}
                  ar={registerFields.labels.email.ar}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@exemple.ma"
                  className="border-brand-gray/50 focus-visible:ring-brand-accent"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <BilingualLabel
                  htmlFor="password"
                  fr={registerFields.labels.password.fr}
                  ar={registerFields.labels.password.ar}
                />
                <Input
                  id="password"
                  type="password"
                  className="border-brand-gray/50 focus-visible:ring-brand-accent"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4 text-end">
              <Link
                href={`/${locale}/login`}
                className="text-xs text-brand-slate hover:text-brand-accent hover:underline"
              >
                {t("forgotPassword")} / نسيت كلمة المرور؟
              </Link>
            </div>

            {success && (
              <p className="mt-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </p>
            )}

            {error && (
              <div className="mt-5 space-y-2">
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
                {needsVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm font-medium text-brand-accent hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? "Envoi..." : "Renvoyer l'email de vérification"}
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-slate">
                {t("noAccount")}{" "}
                <Link
                  href={`/${locale}/register`}
                  className="font-medium text-brand-accent hover:underline"
                >
                  {t("registerButton")}
                </Link>
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-full bg-brand-accent px-8 text-white hover:bg-brand-700 sm:min-w-[200px]"
              >
                {loading ? "..." : (
                  <>
                    {t("loginButton")}
                    <span className="mx-2 opacity-70">/</span>
                    <span dir="rtl" lang="ar">دخول</span>
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthShell>
  );
}
