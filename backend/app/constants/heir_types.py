"""Registre des types d'héritiers — libellés FR/AR et profils de calcul (Moudawana / Maliki)."""

from __future__ import annotations

from typing import TypedDict


class HeirTypeDef(TypedDict):
    fr: str
    ar: str
    category: str
    calc_profile: str
    legacy_aliases: list[str]


# Profils de calcul :
# - fard_wife, fard_husband, fard_father, fard_mother
# - residual_male, residual_female (ratio 2:1)
# - fard_sixth (1/6 partagé entre le groupe)
# - fard_third_uterine (1/3 partagé entre frères/sœurs utérins)
# - residual_asaba (عصبة — reste, bloqué par héritiers prioritaires)
# - status_only (حمل، مفقود — sans part automatique)
# - custom

HEIR_TYPE_REGISTRY: dict[str, HeirTypeDef] = {
    # الزوجية
    "husband": {
        "fr": "Époux",
        "ar": "الزوج",
        "category": "spousal",
        "calc_profile": "fard_husband",
        "legacy_aliases": [],
    },
    "wife": {
        "fr": "Épouse",
        "ar": "الزوجة",
        "category": "spousal",
        "calc_profile": "fard_wife",
        "legacy_aliases": [],
    },
    # الأصول
    "father": {
        "fr": "Père",
        "ar": "الأب",
        "category": "ascendants",
        "calc_profile": "fard_father",
        "legacy_aliases": [],
    },
    "mother": {
        "fr": "Mère",
        "ar": "الأم",
        "category": "ascendants",
        "calc_profile": "fard_mother",
        "legacy_aliases": [],
    },
    "paternal_grandfather": {
        "fr": "Grand-père paternel",
        "ar": "الجد لأب",
        "category": "ascendants",
        "calc_profile": "fard_father",
        "legacy_aliases": [],
    },
    "paternal_grandmother": {
        "fr": "Grand-mère paternelle",
        "ar": "الجدة لأب",
        "category": "ascendants",
        "calc_profile": "fard_sixth",
        "legacy_aliases": [],
    },
    "maternal_grandmother": {
        "fr": "Grand-mère maternelle",
        "ar": "الجدة لأم",
        "category": "ascendants",
        "calc_profile": "fard_sixth",
        "legacy_aliases": [],
    },
    # الفروع
    "son": {
        "fr": "Fils",
        "ar": "الابن",
        "category": "descendants",
        "calc_profile": "residual_male",
        "legacy_aliases": [],
    },
    "daughter": {
        "fr": "Fille",
        "ar": "البنت",
        "category": "descendants",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    "grandson_from_son": {
        "fr": "Petit-fils (fils du fils)",
        "ar": "ابن الابن",
        "category": "descendants",
        "calc_profile": "residual_male",
        "legacy_aliases": [],
    },
    "granddaughter_from_son": {
        "fr": "Petite-fille (fille du fils)",
        "ar": "بنت الابن",
        "category": "descendants",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    "grandson_from_daughter": {
        "fr": "Petit-fils (fils de la fille)",
        "ar": "ابن البنت",
        "category": "descendants",
        "calc_profile": "residual_male",
        "legacy_aliases": [],
    },
    "granddaughter_from_daughter": {
        "fr": "Petite-fille (fille de la fille)",
        "ar": "بنت البنت",
        "category": "descendants",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    # الإخوة والأخوات الأشقاء
    "full_brother": {
        "fr": "Frère germain",
        "ar": "الأخ الشقيق",
        "category": "full_siblings",
        "calc_profile": "residual_male",
        "legacy_aliases": ["brother"],
    },
    "full_sister": {
        "fr": "Sœur germaine",
        "ar": "الأخت الشقيقة",
        "category": "full_siblings",
        "calc_profile": "residual_female",
        "legacy_aliases": ["sister"],
    },
    # لأب
    "consanguine_brother": {
        "fr": "Frère consanguin (même père)",
        "ar": "الأخ لأب",
        "category": "consanguine_siblings",
        "calc_profile": "residual_male",
        "legacy_aliases": [],
    },
    "consanguine_sister": {
        "fr": "Sœur consanguine",
        "ar": "الأخت لأب",
        "category": "consanguine_siblings",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    # لأم
    "uterine_brother": {
        "fr": "Frère utérin",
        "ar": "الأخ لأم",
        "category": "uterine_siblings",
        "calc_profile": "fard_third_uterine",
        "legacy_aliases": [],
    },
    "uterine_sister": {
        "fr": "Sœur utérine",
        "ar": "الأخت لأم",
        "category": "uterine_siblings",
        "calc_profile": "fard_third_uterine",
        "legacy_aliases": [],
    },
    # الأعمام والعمات — germains / consanguins
    "full_paternal_uncle": {
        "fr": "Oncle paternel germain",
        "ar": "العم الشقيق",
        "category": "paternal_uncles",
        "calc_profile": "residual_asaba",
        "legacy_aliases": ["paternal_uncle"],
    },
    "consanguine_paternal_uncle": {
        "fr": "Oncle paternel consanguin",
        "ar": "العم لأب",
        "category": "paternal_uncles",
        "calc_profile": "residual_asaba",
        "legacy_aliases": [],
    },
    "full_paternal_aunt": {
        "fr": "Tante paternelle germaine",
        "ar": "العمة الشقيقة",
        "category": "paternal_uncles",
        "calc_profile": "residual_female",
        "legacy_aliases": ["paternal_aunt"],
    },
    "consanguine_paternal_aunt": {
        "fr": "Tante paternelle consanguine",
        "ar": "العمة لأب",
        "category": "paternal_uncles",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    # الأخوال والخالات
    "maternal_uncle": {
        "fr": "Oncle maternel",
        "ar": "الخال",
        "category": "maternal_uncles",
        "calc_profile": "residual_asaba",
        "legacy_aliases": [],
    },
    "maternal_aunt": {
        "fr": "Tante maternelle",
        "ar": "الخالة",
        "category": "maternal_uncles",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    # أبناء الإخوة
    "son_full_brother": {
        "fr": "Fils du frère germain",
        "ar": "ابن الأخ الشقيق",
        "category": "nephews",
        "calc_profile": "residual_asaba",
        "legacy_aliases": [],
    },
    "son_consanguine_brother": {
        "fr": "Fils du frère consanguin",
        "ar": "ابن الأخ لأب",
        "category": "nephews",
        "calc_profile": "residual_asaba",
        "legacy_aliases": [],
    },
    # أبناء الأعمام — germains / consanguins
    "son_full_paternal_uncle": {
        "fr": "Cousin paternel germain (fils de l'oncle germain)",
        "ar": "ابن العم الشقيق",
        "category": "cousins",
        "calc_profile": "residual_asaba",
        "legacy_aliases": ["son_paternal_uncle", "cousin_paternal", "paternal_cousin"],
    },
    "son_consanguine_paternal_uncle": {
        "fr": "Cousin paternel consanguin (fils de l'oncle consanguin)",
        "ar": "ابن العم لأب",
        "category": "cousins",
        "calc_profile": "residual_asaba",
        "legacy_aliases": [],
    },
    "son_son_paternal_uncle": {
        "fr": "Cousin au 2e degré paternel (ابن ابن العم)",
        "ar": "ابن ابن العم",
        "category": "cousins",
        "calc_profile": "residual_asaba",
        "legacy_aliases": ["cousin_paternal_second"],
    },
    "daughter_full_paternal_uncle": {
        "fr": "Cousine paternelle germaine (بنت العم الشقيق)",
        "ar": "بنت العم الشقيقة",
        "category": "cousins",
        "calc_profile": "residual_female",
        "legacy_aliases": ["daughter_paternal_uncle", "cousin_paternal_female"],
    },
    "daughter_consanguine_paternal_uncle": {
        "fr": "Cousine paternelle consanguine (بنت العم لأب)",
        "ar": "بنت العم لأب",
        "category": "cousins",
        "calc_profile": "residual_female",
        "legacy_aliases": [],
    },
    "son_maternal_uncle": {
        "fr": "Cousin germain maternel (fils de l'oncle maternel)",
        "ar": "ابن الخال",
        "category": "cousins",
        "calc_profile": "residual_asaba",
        "legacy_aliases": ["cousin_maternal"],
    },
    "daughter_maternal_uncle": {
        "fr": "Cousine germaine maternelle (fille de l'oncle maternel)",
        "ar": "بنت الخال",
        "category": "cousins",
        "calc_profile": "residual_female",
        "legacy_aliases": ["cousin_maternal_female"],
    },
    # Cas spéciaux
    "fetus": {
        "fr": "Fœtus / enfant à naître",
        "ar": "الحمل",
        "category": "special",
        "calc_profile": "status_only",
        "legacy_aliases": [],
    },
    "missing_person": {
        "fr": "Personne disparue",
        "ar": "المفقود",
        "category": "special",
        "calc_profile": "status_only",
        "legacy_aliases": [],
    },
    "other": {
        "fr": "Autre héritier",
        "ar": "وارث آخر",
        "category": "special",
        "calc_profile": "custom",
        "legacy_aliases": [],
    },
}

# Alias legacy → type canonique
_LEGACY_ALIAS_MAP: dict[str, str] = {}
for _tid, _def in HEIR_TYPE_REGISTRY.items():
    for _alias in _def["legacy_aliases"]:
        _LEGACY_ALIAS_MAP[_alias] = _tid

# Rétrocompatibilité : brother/sister sans préfixe
_LEGACY_ALIAS_MAP.setdefault("brother", "full_brother")
_LEGACY_ALIAS_MAP.setdefault("sister", "full_sister")

HEIR_CATEGORIES: dict[str, dict[str, str]] = {
    "spousal": {"fr": "Conjugal", "ar": "الزوجية"},
    "ascendants": {"fr": "Ascendants", "ar": "الأصول"},
    "descendants": {"fr": "Descendants", "ar": "الفروع"},
    "full_siblings": {"fr": "Frères et sœurs germains", "ar": "الإخوة والأخوات الأشقاء"},
    "consanguine_siblings": {"fr": "Frères et sœurs consanguins (l'ab)", "ar": "الإخوة والأخوات لأب"},
    "uterine_siblings": {"fr": "Frères et sœurs utérins (l'um)", "ar": "الإخوة والأخوات لأم"},
    "paternal_uncles": {"fr": "Oncles et tantes paternels", "ar": "الأعمام والعمات"},
    "maternal_uncles": {"fr": "Oncles et tantes maternels", "ar": "الأخوال والخالات"},
    "nephews": {"fr": "Fils des frères", "ar": "أبناء الإخوة"},
    "nephews_uncles": {"fr": "Fils des oncles", "ar": "أبناء الأعمام"},
    "cousins": {"fr": "Cousins et cousines", "ar": "أبناء العم والخال"},
    "special": {"fr": "Cas spéciaux", "ar": "حالات خاصة"},
}

FR_WIFE_ORDINALS = {1: "1ère", 2: "2e", 3: "3e", 4: "4e"}
AR_WIFE_ORDINALS = {1: "الأولى", 2: "الثانية", 3: "الثالثة", 4: "الرابعة"}

DESCENDANT_TYPES = frozenset({
    "son", "daughter",
    "grandson_from_son", "granddaughter_from_son",
    "grandson_from_daughter", "granddaughter_from_daughter",
})

RESIDUAL_MALE_TYPES = frozenset({
    t for t, d in HEIR_TYPE_REGISTRY.items()
    if d["calc_profile"] in ("residual_male", "residual_asaba")
})

RESIDUAL_FEMALE_TYPES = frozenset({
    t for t, d in HEIR_TYPE_REGISTRY.items()
    if d["calc_profile"] == "residual_female"
})

UTERINE_TYPES = frozenset({"uterine_brother", "uterine_sister"})

GROUP_FARD_TYPES = frozenset({"wife", "husband"})


def normalize_heir_type(heir_type: str) -> str:
    return _LEGACY_ALIAS_MAP.get(heir_type, heir_type)


FEMALE_HEIR_TYPES = frozenset({
    "wife", "mother", "paternal_grandmother", "maternal_grandmother",
    "daughter", "granddaughter_from_son", "granddaughter_from_daughter",
    "full_sister", "sister", "consanguine_sister", "uterine_sister",
    "full_paternal_aunt", "consanguine_paternal_aunt", "maternal_aunt",
    "daughter_full_paternal_uncle", "daughter_consanguine_paternal_uncle",
    "daughter_maternal_uncle",
})

MALE_HEIR_TYPES = frozenset({
    "husband", "father", "paternal_grandfather",
    "son", "grandson_from_son", "grandson_from_daughter",
    "full_brother", "brother", "consanguine_brother", "uterine_brother",
    "full_paternal_uncle", "consanguine_paternal_uncle", "maternal_uncle",
    "son_full_brother", "son_consanguine_brother",
    "son_full_paternal_uncle", "son_consanguine_paternal_uncle", "son_son_paternal_uncle",
    "son_maternal_uncle",
})


def heir_gender(heir_type: str) -> str | None:
    canonical = normalize_heir_type(heir_type)
    if canonical in FEMALE_HEIR_TYPES:
        return "female"
    if canonical in MALE_HEIR_TYPES:
        return "male"
    return None


def gender_label_fr(gender: str | None) -> str:
    return {"male": "Homme", "female": "Femme"}.get(gender or "", "—")


def gender_label_ar(gender: str | None) -> str:
    return {"male": "ذكر", "female": "أنثى"}.get(gender or "", "—")


def heir_label_fr(heir_type: str) -> str:
    canonical = normalize_heir_type(heir_type)
    return HEIR_TYPE_REGISTRY.get(canonical, HEIR_TYPE_REGISTRY["other"])["fr"]


def heir_label_ar(heir_type: str) -> str:
    canonical = normalize_heir_type(heir_type)
    return HEIR_TYPE_REGISTRY.get(canonical, HEIR_TYPE_REGISTRY["other"])["ar"]


def heir_display_name(heir_type: str, index: int, count: int, custom_name: str | None = None) -> str:
    if custom_name:
        return custom_name
    canonical = normalize_heir_type(heir_type)
    label = heir_label_fr(canonical)
    if canonical == "wife" and count > 1:
        ord_fr = FR_WIFE_ORDINALS.get(index, str(index))
        return f"Épouse {ord_fr}"
    if count > 1:
        return f"{label} {index}/{count}"
    return label


def heir_display_name_ar(heir_type: str, index: int, count: int) -> str:
    canonical = normalize_heir_type(heir_type)
    if canonical == "wife" and count > 1:
        ord_ar = AR_WIFE_ORDINALS.get(index, str(index))
        return f"الزوجة {ord_ar}"
    label = heir_label_ar(canonical)
    if count > 1:
        return f"{label} ({index}/{count})"
    return label


def all_heir_types_by_category() -> list[tuple[str, dict[str, str], list[str]]]:
    grouped: dict[str, list[str]] = {cat: [] for cat in HEIR_CATEGORIES}
    for tid, defn in HEIR_TYPE_REGISTRY.items():
        grouped[defn["category"]].append(tid)
    return [
        (cat, HEIR_CATEGORIES[cat], grouped[cat])
        for cat in HEIR_CATEGORIES
        if grouped[cat]
    ]
