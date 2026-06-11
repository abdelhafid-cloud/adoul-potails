"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/services/api";
import { registerFields, type RegisterFieldName, type RegisterFormInputName } from "@/lib/register-fields";
import { cityLabel, fetchMoroccanCities, type MoroccanCity } from "@/lib/moroccan-cities";
import { cn } from "@/lib/utils";

function createRegisterSchema(validCodes: Set<string>) {
  return z
    .object({
      owner_first_name: z.string().min(2),
      owner_last_name: z.string().min(2),
      cin: z
        .string()
        .trim()
        .transform((v) => v.toUpperCase())
        .pipe(
          z
            .string()
            .min(5, "CIN invalide / رقم البطاقة غير صالح")
            .max(20)
            .regex(/^[A-Z0-9]+$/, "Format CIN invalide (ex. AB123456) / تنسيق غير صالح"),
        ),
      phone: z.string().min(10),
      email: z.string().email(),
      city: z.string().min(1, "Choisissez une ville"),
      professional_number: z.string().min(3),
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine((d) => validCodes.has(d.city), {
      message: "Ville invalide / مدينة غير صالحة",
      path: ["city"],
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: "Les mots de passe ne correspondent pas / كلمتا المرور غير متطابقتين",
      path: ["confirmPassword"],
    });
}

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

function BilingualLabel({ field }: { field: RegisterFieldName }) {
  const label = registerFields.labels[field];
  return (
    <div className="mb-1.5">
      <label htmlFor={field} className="block text-sm font-medium text-brand-navy">
        {label.fr}
      </label>
      <span dir="rtl" lang="ar" className="block text-xs text-brand-slate">
        {label.ar}
      </span>
    </div>
  );
}

function FormField({
  field,
  register,
  error,
  type = "text",
  className,
  cities,
  citiesLoading,
}: {
  field: RegisterFormInputName;
  register: ReturnType<typeof useForm<RegisterFormData>>["register"];
  error?: string;
  type?: string;
  className?: string;
  cities: MoroccanCity[];
  citiesLoading: boolean;
}) {
  const placeholder = registerFields.placeholders[field as keyof typeof registerFields.placeholders];
  const isArabicFriendly = ["owner_first_name", "owner_last_name"].includes(field);

  if (field === "city") {
    return (
      <div className={className}>
        <BilingualLabel field="city" />
        <select
          id="city"
          disabled={citiesLoading}
          className="flex h-11 w-full rounded-xl border border-brand-gray/50 bg-white px-3 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:opacity-60"
          defaultValue=""
          {...register("city")}
        >
          <option value="" disabled>
            {citiesLoading
              ? "Chargement... / جاري التحميل..."
              : `${placeholder?.fr} / ${placeholder?.ar}`}
          </option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {cityLabel(c)}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <BilingualLabel field={field} />
      <Input
        id={field}
        type={type}
        dir={isArabicFriendly ? "auto" : undefined}
        placeholder={placeholder ? `${placeholder.fr}` : undefined}
        className="border-brand-gray/50 focus-visible:ring-brand-accent"
        {...register(field)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ProfileImageField({
  previewUrl,
  onImageChange,
  fileError,
}: {
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
  fileError?: string;
}) {
  return (
    <div className="flex flex-col items-center border-b border-brand-gray/25 pb-8">
      <div className="text-center">
        <BilingualLabel field="profile_image" />
      </div>
      <div className="mt-3 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand-gray/40 bg-brand-blue-50">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-12 w-12 text-brand-blue/60" />
        )}
      </div>
      <div className="mt-4 w-full max-w-sm text-center">
        <input
          id="profile_image"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={(e) => onImageChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-brand-slate file:me-3 file:rounded-lg file:border file:border-brand-gray/50 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-brand-blue-50"
        />
        <p className="mt-2 text-xs text-brand-slate">
          JPG, PNG ou WEBP — max 5 Mo / بحد أقصى 5 ميغابايت
        </p>
        {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
      </div>
    </div>
  );
}

function fieldType(field: RegisterFormInputName) {
  if (field === "email") return "email";
  if (field === "password" || field === "confirmPassword") return "password";
  return "text";
}

export default function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (file: File | null) => {
    setImageError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file && file.size > 5 * 1024 * 1024) {
      setImageError("Image trop volumineuse (max 5 Mo) / الصورة كبيرة جداً");
      setProfileImage(null);
      setPreviewUrl(null);
      return;
    }
    setProfileImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["moroccan-cities"],
    queryFn: fetchMoroccanCities,
    staleTime: 1000 * 60 * 60,
  });

  const cityCodes = useMemo(() => new Set(cities.map((c) => c.code)), [cities]);
  const schema = useMemo(() => createRegisterSchema(cityCodes), [cityCodes]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");
    try {
      const { confirmPassword, ...payload } = data;
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }
      const res = await api.post("/auth/register", formData);
      setSuccess(res.data.message);
      if (res.data.email_sent) {
        setTimeout(() => router.push(`/${locale}/login`), 4000);
      } else if (res.data.verification_token) {
        const verifyPath = `/${locale}/verify-email?token=${res.data.verification_token}`;
        setSuccess(
          `${res.data.message} Lien de secours (dev) : ${verifyPath}`,
        );
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { fr: "Essai gratuit", ar: "تجربة مجانية" },
    { fr: "Conforme droit marocain", ar: "متوافق مع التشريع المغربي" },
    { fr: "Support FR / AR", ar: "دعم بالفرنسية والعربية" },
  ];

  return (
    <AuthShell locale={locale}>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(260px,340px)_1fr] lg:gap-14">
        <div>
          <span className="inline-block rounded-full border border-brand-gray/50 bg-[#f7f7f7] px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-brand-slate uppercase">
            {t("registerBadge")}
          </span>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-brand-navy lg:text-4xl">
            {t("registerTitle")}
          </h1>
          <p dir="rtl" lang="ar" className="mt-3 text-xl font-bold text-brand-navy">
            {t("registerTitleAr")}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brand-slate">{t("registerSubtitle")}</p>
          <p dir="rtl" lang="ar" className="mt-1 text-sm leading-relaxed text-brand-slate">
            {t("registerSubtitleAr")}
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

        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-brand-gray/30 bg-white p-6 shadow-sm sm:p-8"
          >
            <ProfileImageField
              previewUrl={previewUrl}
              onImageChange={handleImageChange}
              fileError={imageError}
            />

            <div className="mt-8 space-y-8">
              {registerFields.sections.map((section) => (
                <div key={section.id}>
                  <div className="mb-5 flex items-baseline justify-between border-b border-brand-gray/25 pb-3">
                    <h2 className="text-sm font-semibold text-brand-accent">{section.titleFr}</h2>
                    <p dir="rtl" lang="ar" className="text-sm font-semibold text-brand-accent">
                      {section.titleAr}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                    {section.fields.map(({ name, span, type }) => {
                      const field = name as RegisterFormInputName;
                      return (
                        <FormField
                          key={field}
                          field={field}
                          register={register}
                          error={errors[field]?.message}
                          type={type === "city" ? "select" : fieldType(field)}
                          className={cn(span === 2 && "sm:col-span-2")}
                          cities={cities}
                          citiesLoading={citiesLoading}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-slate">
                {t("hasAccount")}{" "}
                <Link href={`/${locale}/login`} className="font-medium text-brand-accent hover:underline">
                  {t("loginButton")}
                </Link>
              </p>
              <Button
                type="submit"
                disabled={loading || citiesLoading}
                className="h-12 rounded-full bg-brand-accent px-8 text-white hover:bg-brand-700 sm:min-w-[220px]"
              >
                {loading || citiesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t("registerButton")}
                    <span className="mx-2 opacity-70">/</span>
                    <span dir="rtl" lang="ar">{t("registerButtonAr")}</span>
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
