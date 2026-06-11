"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserPlus, FolderPlus, FileCheck } from "lucide-react";

const STEPS = [
  { icon: UserPlus, titleKey: "howStep1Title", descKey: "howStep1Desc", num: "01" },
  { icon: FolderPlus, titleKey: "howStep2Title", descKey: "howStep2Desc", num: "02" },
  { icon: FileCheck, titleKey: "howStep3Title", descKey: "howStep3Desc", num: "03" },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("landing");

  return (
    <section id="how-it-works" className="border-b border-brand-gray/30 bg-[#fafafa] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-brand-navy">{t("howItWorksTitle")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-brand-slate">{t("howItWorksSubtitle")}</p>

        <div className="relative mt-16 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div
            className="absolute top-12 hidden h-0.5 bg-brand-gray/50 lg:block lg:left-[16.67%] lg:right-[16.67%]"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-accent/30 bg-white shadow-sm">
                <step.icon className="h-9 w-9 text-brand-accent" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-brand-accent">{step.num}</span>
              <h3 className="mt-2 text-lg font-semibold text-brand-navy">{t(step.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
