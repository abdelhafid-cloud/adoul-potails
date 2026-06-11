import { cn } from "@/lib/utils";
import type { Bilingual } from "@/lib/dashboard-labels";

export function BilingualText({
  label,
  className,
  size = "sm",
}: {
  label: Bilingual;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizes = {
    xs: { fr: "text-xs", ar: "text-[10px]" },
    sm: { fr: "text-sm", ar: "text-xs" },
    md: { fr: "text-base", ar: "text-sm" },
    lg: { fr: "text-lg", ar: "text-base" },
  };

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span className={cn("text-brand-navy", sizes[size].fr)}>{label.fr}</span>
      <span className="text-brand-gray">/</span>
      <span dir="rtl" lang="ar" className={cn("text-brand-slate", sizes[size].ar)}>
        {label.ar}
      </span>
    </span>
  );
}

export function BilingualHeading({
  label,
  subtitle,
  className,
}: {
  label: Bilingual;
  subtitle?: Bilingual;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1 className="font-serif text-2xl font-normal text-brand-navy md:text-3xl">
        {label.fr}
      </h1>
      <p dir="rtl" lang="ar" className="mt-1 text-lg font-semibold text-brand-slate">
        {label.ar}
      </p>
      {subtitle && (
        <p className="mt-2 text-sm text-brand-slate">
          {subtitle.fr}
          <span className="mx-2 text-brand-gray">·</span>
          <span dir="rtl" lang="ar">{subtitle.ar}</span>
        </p>
      )}
    </div>
  );
}

export function BilingualLabel({
  label,
  htmlFor,
  className,
}: {
  label: Bilingual;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-brand-navy">
        {label.fr}
      </label>
      <span dir="rtl" lang="ar" className="block text-xs text-brand-slate">
        {label.ar}
      </span>
    </div>
  );
}

export function BilingualCardTitle({ label }: { label: Bilingual }) {
  return (
    <div>
      <p className="text-base font-semibold text-brand-navy">{label.fr}</p>
      <p dir="rtl" lang="ar" className="text-xs text-brand-slate">
        {label.ar}
      </p>
    </div>
  );
}
