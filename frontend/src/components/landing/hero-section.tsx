"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/lib/hero-content";

interface HeroSectionProps {
  locale: string;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeroSection({ locale }: HeroSectionProps) {
  const { card } = heroContent;

  return (
    <section className="overflow-hidden border-b border-brand-gray/30 bg-white pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-start"
        >
          <span className="inline-block rounded-full border border-brand-gray/50 bg-[#f7f7f7] px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] text-brand-slate uppercase">
            {heroContent.badge}
          </span>

          <p dir="rtl" lang="ar" className="mt-6 text-lg font-medium text-brand-slate md:text-xl">
            {heroContent.taglineAr}
          </p>

          <h1 className="mt-4 font-serif text-4xl leading-[1.15] font-normal text-brand-navy md:text-5xl lg:text-[3.25rem]">
            {heroContent.headlineFr}
          </h1>

          <p dir="rtl" lang="ar" className="mt-5 text-2xl leading-snug font-bold text-brand-navy md:text-3xl">
            {heroContent.headlineAr}
          </p>

          <div className="mt-8 space-y-3">
            <p className="max-w-xl text-base leading-relaxed text-brand-slate md:text-[17px]">
              {heroContent.descriptionFr}
            </p>
            <p dir="rtl" lang="ar" className="max-w-xl text-base leading-relaxed text-brand-slate md:text-[17px]">
              {heroContent.descriptionAr}
            </p>
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href={`/${locale}/register`}>
              <Button size="lg" className="h-12 rounded-full bg-brand-accent px-6 text-white hover:bg-brand-700">
                <span>{heroContent.ctaPrimary.fr}</span>
                <span className="mx-2 opacity-60">/</span>
                <span dir="rtl" lang="ar">{heroContent.ctaPrimary.ar}</span>
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-brand-slate underline-offset-4 transition hover:text-brand-navy hover:underline"
            >
              {heroContent.ctaSecondary.fr}
              <span className="mx-1.5 text-brand-gray">/</span>
              <span dir="rtl" lang="ar">{heroContent.ctaSecondary.ar}</span>
            </button>
          </div>

          <ul className="mt-10 space-y-3">
            {heroContent.highlights.map((item) => (
              <li key={item.fr} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent/15">
                  <Check className="h-3 w-3 text-brand-accent" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-brand-slate">
                  {item.fr}
                  <span className="mx-2 text-brand-gray">/</span>
                  <span dir="rtl" lang="ar">{item.ar}</span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-accent/25 via-brand-accent/10 to-transparent blur-2xl"
          />

          <div className="relative overflow-hidden rounded-2xl border border-brand-gray/30 bg-white shadow-[0_24px_60px_-12px_rgba(45,49,66,0.18)]">
            <div className="border-b border-brand-gray/20 px-8 py-8">
              <p className="text-5xl font-bold tracking-tight text-brand-navy">{card.stat}</p>
              <p className="mt-1 text-sm text-brand-slate">{card.statLabel}</p>
              <p dir="rtl" lang="ar" className="text-xs text-brand-gray">{card.statLabelAr}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-brand-gray/20 p-4">
              {card.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-brand-gray/25 bg-[#fafafa] px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-wider text-brand-gray">{metric.label}</p>
                  <p className="mt-1 text-xl font-bold text-brand-navy">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-brand-navy px-8 py-7 text-white">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-accent">{card.assistantTitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{card.assistantDescFr}</p>
              <p dir="rtl" lang="ar" className="mt-3 text-sm leading-relaxed text-white/70">
                {card.assistantDescAr}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
