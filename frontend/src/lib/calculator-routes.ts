/** Route du calculateur selon le type de dossier. */
export const DOSSIER_CALCULATOR_ROUTES: Record<string, string> = {
  heritage: "/dashboard/inheritance",
  property_share: "/dashboard/property-share",
  sale: "/dashboard/calculate/sale",
  donation: "/dashboard/calculate/donation",
  procuration: "/dashboard/calculate/procuration",
  marriage: "/dashboard/calculate/marriage",
  other: "/dashboard/calculate/other",
};

export function getWasiyyahHref(locale: string, dossierId: string, netEstate?: number): string {
  const base = `/${locale}/dashboard/wasiyyah?dossier_id=${dossierId}`;
  if (netEstate != null && netEstate > 0) {
    return `${base}&net_estate=${netEstate}`;
  }
  return base;
}

export function getCalculatorHref(locale: string, dossierType: string, dossierId: string): string | null {
  const path = DOSSIER_CALCULATOR_ROUTES[dossierType];
  if (!path) return null;
  return `/${locale}${path}?dossier_id=${dossierId}`;
}

export const ACT_CALC_TYPES = ["sale", "donation", "procuration", "marriage", "other"] as const;
export type ActCalcType = (typeof ACT_CALC_TYPES)[number];

export function isActCalcType(type: string): type is ActCalcType {
  return ACT_CALC_TYPES.includes(type as ActCalcType);
}
