import type { Bilingual } from "@/lib/dashboard-labels";

export type HeirTypeId =
  | "husband" | "wife"
  | "father" | "mother" | "paternal_grandfather" | "paternal_grandmother" | "maternal_grandmother"
  | "son" | "daughter"
  | "grandson_from_son" | "granddaughter_from_son" | "grandson_from_daughter" | "granddaughter_from_daughter"
  | "full_brother" | "full_sister"
  | "consanguine_brother" | "consanguine_sister"
  | "uterine_brother" | "uterine_sister"
  | "full_paternal_uncle" | "consanguine_paternal_uncle"
  | "full_paternal_aunt" | "consanguine_paternal_aunt"
  | "maternal_uncle" | "maternal_aunt"
  | "son_full_brother" | "son_consanguine_brother"
  | "son_full_paternal_uncle" | "son_consanguine_paternal_uncle" | "son_son_paternal_uncle"
  | "daughter_full_paternal_uncle" | "daughter_consanguine_paternal_uncle"
  | "son_maternal_uncle" | "daughter_maternal_uncle"
  | "fetus" | "missing_person" | "other"
  // legacy (normalisés côté backend)
  | "paternal_uncle" | "paternal_aunt" | "son_paternal_uncle" | "daughter_paternal_uncle";

export const HEIR_TYPE_LABELS: Record<string, Bilingual> = {
  husband: { fr: "Époux", ar: "الزوج" },
  wife: { fr: "Épouse", ar: "الزوجة" },
  father: { fr: "Père", ar: "الأب" },
  mother: { fr: "Mère", ar: "الأم" },
  paternal_grandfather: { fr: "Grand-père paternel", ar: "الجد لأب" },
  paternal_grandmother: { fr: "Grand-mère paternelle", ar: "الجدة لأب" },
  maternal_grandmother: { fr: "Grand-mère maternelle", ar: "الجدة لأم" },
  son: { fr: "Fils", ar: "الابن" },
  daughter: { fr: "Fille", ar: "البنت" },
  grandson_from_son: { fr: "Petit-fils (fils du fils)", ar: "ابن الابن" },
  granddaughter_from_son: { fr: "Petite-fille (fille du fils)", ar: "بنت الابن" },
  grandson_from_daughter: { fr: "Petit-fils (fils de la fille)", ar: "ابن البنت" },
  granddaughter_from_daughter: { fr: "Petite-fille (fille de la fille)", ar: "بنت البنت" },
  full_brother: { fr: "Frère germain", ar: "الأخ الشقيق" },
  full_sister: { fr: "Sœur germaine", ar: "الأخت الشقيقة" },
  consanguine_brother: { fr: "Frère consanguin (même père)", ar: "الأخ لأب" },
  consanguine_sister: { fr: "Sœur consanguine", ar: "الأخت لأب" },
  uterine_brother: { fr: "Frère utérin", ar: "الأخ لأم" },
  uterine_sister: { fr: "Sœur utérine", ar: "الأخت لأم" },
  full_paternal_uncle: { fr: "Oncle paternel germain", ar: "العم الشقيق" },
  consanguine_paternal_uncle: { fr: "Oncle paternel consanguin", ar: "العم لأب" },
  full_paternal_aunt: { fr: "Tante paternelle germaine", ar: "العمة الشقيقة" },
  consanguine_paternal_aunt: { fr: "Tante paternelle consanguine", ar: "العمة لأب" },
  maternal_uncle: { fr: "Oncle maternel", ar: "الخال" },
  maternal_aunt: { fr: "Tante maternelle", ar: "الخالة" },
  son_full_brother: { fr: "Neveu (fils du frère germain)", ar: "ابن الأخ الشقيق" },
  son_consanguine_brother: { fr: "Neveu (fils du frère consanguin)", ar: "ابن الأخ لأب" },
  son_full_paternal_uncle: { fr: "Cousin paternel germain", ar: "ابن العم الشقيق" },
  son_consanguine_paternal_uncle: { fr: "Cousin paternel consanguin", ar: "ابن العم لأب" },
  son_son_paternal_uncle: { fr: "Cousin au 2e degré paternel", ar: "ابن ابن العم" },
  daughter_full_paternal_uncle: { fr: "Cousine paternelle germaine", ar: "بنت العم الشقيقة" },
  daughter_consanguine_paternal_uncle: { fr: "Cousine paternelle consanguine", ar: "بنت العم لأب" },
  son_maternal_uncle: { fr: "Cousin maternel (fils du خال)", ar: "ابن الخال" },
  daughter_maternal_uncle: { fr: "Cousine maternelle (fille du خال)", ar: "بنت الخال" },
  fetus: { fr: "Fœtus / enfant à naître", ar: "الحمل" },
  missing_person: { fr: "Personne disparue", ar: "المفقود" },
  other: { fr: "Autre héritier", ar: "وارث آخر" },
  // legacy
  paternal_uncle: { fr: "Oncle paternel germain", ar: "العم الشقيق" },
  paternal_aunt: { fr: "Tante paternelle germaine", ar: "العمة الشقيقة" },
  son_paternal_uncle: { fr: "Cousin paternel germain", ar: "ابن العم الشقيق" },
  daughter_paternal_uncle: { fr: "Cousine paternelle germaine", ar: "بنت العم الشقيقة" },
};

export const HEIR_TYPE_GROUPS: Array<{
  key: string;
  label: Bilingual;
  types: string[];
}> = [
  {
    key: "spousal",
    label: { fr: "Conjugal (الزوجية)", ar: "الزوجية" },
    types: ["husband", "wife"],
  },
  {
    key: "ascendants",
    label: { fr: "Ascendants (الأصول)", ar: "الأصول" },
    types: ["father", "mother", "paternal_grandfather", "paternal_grandmother", "maternal_grandmother"],
  },
  {
    key: "descendants",
    label: { fr: "Descendants (الفروع)", ar: "الفروع" },
    types: [
      "son", "daughter",
      "grandson_from_son", "granddaughter_from_son",
      "grandson_from_daughter", "granddaughter_from_daughter",
    ],
  },
  {
    key: "full_siblings",
    label: { fr: "Frères et sœurs germains", ar: "الإخوة والأخوات الأشقاء" },
    types: ["full_brother", "full_sister"],
  },
  {
    key: "consanguine_siblings",
    label: { fr: "Frères et sœurs consanguins (l'ab)", ar: "الإخوة والأخوات لأب" },
    types: ["consanguine_brother", "consanguine_sister"],
  },
  {
    key: "uterine_siblings",
    label: { fr: "Frères et sœurs utérins (l'um)", ar: "الإخوة والأخوات لأم" },
    types: ["uterine_brother", "uterine_sister"],
  },
  {
    key: "nephews",
    label: { fr: "Neveux (fils des frères)", ar: "أبناء الإخوة" },
    types: ["son_full_brother", "son_consanguine_brother"],
  },
  {
    key: "paternal_uncles",
    label: { fr: "Oncles et tantes paternels (الأعمام)", ar: "الأعمام والعمات" },
    types: [
      "full_paternal_uncle",
      "consanguine_paternal_uncle",
      "full_paternal_aunt",
      "consanguine_paternal_aunt",
    ],
  },
  {
    key: "cousins",
    label: { fr: "Cousins et cousines paternels", ar: "أبناء العم" },
    types: [
      "son_full_paternal_uncle",
      "son_consanguine_paternal_uncle",
      "son_son_paternal_uncle",
      "daughter_full_paternal_uncle",
      "daughter_consanguine_paternal_uncle",
    ],
  },
  {
    key: "maternal_uncles",
    label: { fr: "Oncles/tantes maternels et cousins (الأخوال)", ar: "الأخوال والخالات" },
    types: ["maternal_uncle", "maternal_aunt", "son_maternal_uncle", "daughter_maternal_uncle"],
  },
  {
    key: "special",
    label: { fr: "Cas spéciaux", ar: "حالات خاصة" },
    types: ["fetus", "missing_person", "other"],
  },
];

export const ALL_HEIR_TYPES: string[] = HEIR_TYPE_GROUPS.flatMap((g) => g.types);

export const INHERITANCE_TERMS: Record<string, Bilingual> = {
  heir: { fr: "Héritier", ar: "الوارث" },
  excludedHeir: { fr: "Héritier exclu (محجوب)", ar: "المحجوب" },
  pendingHeir: { fr: "Part en attente", ar: "حصة معلقة" },
  succession: { fr: "Succession", ar: "التركة" },
  wasiyyah: { fr: "Legs (testament)", ar: "الوصية" },
  debt: { fr: "Dette", ar: "الدين" },
  share: { fr: "Part successorale", ar: "النصيب الشرعي" },
  calculation: { fr: "Calcul de l'héritage", ar: "حساب الميراث" },
  distribution: { fr: "Répartition de l'héritage", ar: "قسمة التركة" },
  deceased: { fr: "Personne décédée", ar: "المتوفى" },
  cousin: { fr: "Cousin / cousine", ar: "ابن العم / ابن الخال" },
};

const LEGACY_MAP: Record<string, string> = {
  brother: "full_brother",
  sister: "full_sister",
  paternal_uncle: "full_paternal_uncle",
  paternal_aunt: "full_paternal_aunt",
  son_paternal_uncle: "son_full_paternal_uncle",
  daughter_paternal_uncle: "daughter_full_paternal_uncle",
  cousin_paternal: "son_full_paternal_uncle",
  paternal_cousin: "son_full_paternal_uncle",
  cousin_paternal_female: "daughter_full_paternal_uncle",
  cousin_paternal_second: "son_son_paternal_uncle",
  cousin_maternal: "son_maternal_uncle",
  cousin_maternal_female: "daughter_maternal_uncle",
};

export function normalizeHeirType(type: string): string {
  return LEGACY_MAP[type] ?? type;
}

export function heirTypeLabel(type: string): Bilingual {
  const canonical = normalizeHeirType(type);
  return HEIR_TYPE_LABELS[canonical] ?? { fr: type, ar: type };
}

export type HeirGender = "male" | "female";

const MALE_HEIR_TYPES = new Set([
  "husband", "father", "paternal_grandfather",
  "son", "grandson_from_son", "grandson_from_daughter",
  "full_brother", "brother", "consanguine_brother", "uterine_brother",
  "full_paternal_uncle", "consanguine_paternal_uncle", "maternal_uncle",
  "son_full_brother", "son_consanguine_brother",
  "son_full_paternal_uncle", "son_consanguine_paternal_uncle", "son_son_paternal_uncle",
  "son_maternal_uncle",
]);

const FEMALE_HEIR_TYPES = new Set([
  "wife", "mother", "paternal_grandmother", "maternal_grandmother",
  "daughter", "granddaughter_from_son", "granddaughter_from_daughter",
  "full_sister", "sister", "consanguine_sister", "uterine_sister",
  "full_paternal_aunt", "consanguine_paternal_aunt", "maternal_aunt",
  "daughter_full_paternal_uncle", "daughter_consanguine_paternal_uncle",
  "daughter_maternal_uncle",
]);

export function heirTypeGender(type: string): HeirGender | undefined {
  const t = normalizeHeirType(type);
  if (FEMALE_HEIR_TYPES.has(t)) return "female";
  if (MALE_HEIR_TYPES.has(t)) return "male";
  return undefined;
}

export function syncHeirPersons(heir: {
  type: string;
  count?: number;
  name?: string;
  name_ar?: string;
  gender?: HeirGender;
  persons?: Array<{ name?: string; name_ar?: string; gender?: HeirGender }>;
}): Array<{ name: string; name_ar: string; gender: HeirGender }> {
  const count = Math.max(1, heir.count || 1);
  const defaultGender = heirTypeGender(heir.type) || heir.gender || "male";
  const existing = heir.persons || [];
  const persons: Array<{ name: string; name_ar: string; gender: HeirGender }> = [];
  for (let i = 0; i < count; i++) {
    persons.push({
      name: existing[i]?.name ?? (count === 1 ? heir.name ?? "" : ""),
      name_ar: existing[i]?.name_ar ?? (count === 1 ? heir.name_ar ?? "" : ""),
      gender: existing[i]?.gender ?? defaultGender,
    });
  }
  return persons;
}

export const HEIR_CHART_COLORS: Record<string, string> = {
  husband: "#1d4ed8",
  wife: "#2563eb",
  father: "#1e3a5f",
  mother: "#4f46e5",
  paternal_grandfather: "#312e81",
  paternal_grandmother: "#6366f1",
  maternal_grandmother: "#818cf8",
  son: "#0369a1",
  daughter: "#7c3aed",
  grandson_from_son: "#0284c7",
  granddaughter_from_son: "#8b5cf6",
  grandson_from_daughter: "#0ea5e9",
  granddaughter_from_daughter: "#a78bfa",
  full_brother: "#475569",
  full_sister: "#64748b",
  consanguine_brother: "#57534e",
  consanguine_sister: "#78716c",
  uterine_brother: "#0d9488",
  uterine_sister: "#14b8a6",
  full_paternal_uncle: "#b45309",
  consanguine_paternal_uncle: "#d97706",
  full_paternal_aunt: "#f59e0b",
  consanguine_paternal_aunt: "#fbbf24",
  maternal_uncle: "#c2410c",
  maternal_aunt: "#ea580c",
  son_full_brother: "#334155",
  son_consanguine_brother: "#44403c",
  son_full_paternal_uncle: "#92400e",
  son_consanguine_paternal_uncle: "#a16207",
  son_son_paternal_uncle: "#854d0e",
  daughter_full_paternal_uncle: "#b45309",
  daughter_consanguine_paternal_uncle: "#d97706",
  son_maternal_uncle: "#c2410c",
  daughter_maternal_uncle: "#ea580c",
  fetus: "#ec4899",
  missing_person: "#f59e0b",
  other: "#94a3b8",
  brother: "#475569",
  sister: "#64748b",
  paternal_uncle: "#b45309",
  paternal_aunt: "#f59e0b",
  son_paternal_uncle: "#92400e",
  daughter_paternal_uncle: "#b45309",
};
