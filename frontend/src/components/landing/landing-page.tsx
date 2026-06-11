"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Calculator, FolderOpen, Bot, ScanLine, FileText,
  Clock, ShieldCheck, Layers, TrendingUp, ChevronDown,
} from "lucide-react";
import { LandingHeader } from "./header";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { useState } from "react";

export function LandingPage({ locale }: { locale: string }) {
  const t = useTranslations("landing");

  const features = [
    { icon: Calculator, title: t("featureInheritance"), desc: t("featureInheritanceDesc") },
    { icon: FolderOpen, title: t("featureDossiers"), desc: t("featureDossiersDesc") },
    { icon: Bot, title: t("featureAI"), desc: t("featureAIDesc") },
    { icon: ScanLine, title: t("featureOCR"), desc: t("featureOCRDesc") },
    { icon: FileText, title: t("featurePDF"), desc: t("featurePDFDesc") },
  ];

  const advantages = [
    { icon: Clock, title: t("advantageTime"), desc: t("advantageTimeDesc") },
    { icon: ShieldCheck, title: t("advantageErrors"), desc: t("advantageErrorsDesc") },
    { icon: Layers, title: t("advantageCentral"), desc: t("advantageCentralDesc") },
    { icon: TrendingUp, title: t("advantageProductivity"), desc: t("advantageProductivityDesc") },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader locale={locale} />
      <HeroSection locale={locale} />
      <HowItWorksSection />

      {/* Features */}
      <section id="features" className="border-b border-brand-gray/30 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">{t("featuresTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-brand-slate">
            Des outils conçus pour simplifier votre quotidien d&apos;adoul
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-brand-gray/40 bg-white p-8 transition hover:border-brand-accent/40 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-accent">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-brand-navy">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-slate">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section id="advantages" className="border-b border-brand-gray/30 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">{t("advantagesTitle")}</h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.title} className="text-center">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-brand-slate p-4 text-white">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-brand-navy">{a.title}</h3>
                <p className="mt-2 text-sm text-brand-slate">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-brand-gray/30 bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-brand-navy">{t("faqTitle")}</h2>
          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-brand-navy">{t("contactTitle")}</h2>
          <p className="mt-4 text-brand-slate">{t("contactSubtitle")}</p>
          <div className="mt-8 space-y-2 text-brand-slate">
            <p>{t("contactEmail")}</p>
            <p>{t("contactPhone")}</p>
          </div>
          <Link href={`/${locale}/register`} className="mt-8 inline-block">
            <Button size="lg" className="bg-brand-accent text-white hover:bg-brand-700">
              {t("ctaStart")}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-gray/40 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-brand-gray">
          © {new Date().getFullYear()} Adoul AI. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-brand-gray/40 bg-white">
      <button
        className="flex w-full items-center justify-between p-6 text-start font-medium text-brand-navy"
        onClick={() => setOpen(!open)}
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-brand-accent transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-brand-gray/30 px-6 pb-6 pt-4 text-sm leading-relaxed text-brand-slate">
          {answer}
        </div>
      )}
    </div>
  );
}
