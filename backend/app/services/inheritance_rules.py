"""Raisons d'exclusion (hajb) et libellés héritiers."""

from app.constants.heir_types import (
    heir_display_name,
    heir_display_name_ar,
    heir_label_ar,
    heir_label_fr,
    normalize_heir_type,
)

EXCLUSION_REASONS: dict[str, dict[str, str]] = {
    "blocked_by_son": {
        "reason_fr": "Exclu (hajb) — présence de fils (عصبة أولى)",
        "reason_ar": "محجوب — وجود ابن (عصبة أولى)",
    },
    "blocked_by_father": {
        "reason_fr": "Exclu (hajb) — présence du père",
        "reason_ar": "محجوب — وجود الأب",
    },
    "blocked_by_father_asaba": {
        "reason_fr": "Exclu (hajb بالأب) — le père est عصبة أقرب ; ابن الابن/bنت الابن محجوبان",
        "reason_ar": "محجوب بالأب — الأب عصبة أقرب؛ ابن الابن وبنت الابن محجوبان",
    },
    "blocked_by_awl": {
        "reason_fr": "Exclu — العول : les فروض épuisent la succession, aucun reste pour l'asaba",
        "reason_ar": "محجوب — العول: الفروض استوعبت التركة ولا باقي للعصبة",
    },
    "blocked_by_full_brother": {
        "reason_fr": "Exclu (hajb) — présence de frère germain héritier",
        "reason_ar": "محجوب — وجود أخ شقيق وارث",
    },
    "blocked_by_grandfather": {
        "reason_fr": "Exclu (hajb) — présence du grand-père paternel",
        "reason_ar": "محجوب — وجود الجد لأب",
    },
    "blocked_by_mother": {
        "reason_fr": "Exclu (hajb) — présence de la mère",
        "reason_ar": "محجوب — وجود الأم",
    },
    "uterine_blocked": {
        "reason_fr": "Exclu (hajb) — frères/sœurs utérins : présence de fils ou père",
        "reason_ar": "محجوب — الإخوة لأم: وجود ابن أو أب",
    },
    "asaba_blocked": {
        "reason_fr": "Exclu (hajb) — héritiers prioritaires (عصبة أقرب)",
        "reason_ar": "محجوب — ورثة أولى (عصبة أقرب)",
    },
    "residual_no_share": {
        "reason_fr": "Aucune part résiduelle — autres héritiers prioritaires",
        "reason_ar": "لا حصة — أولوية لورثة آخرين",
    },
    "fetus_pending": {
        "reason_fr": "Part en attente — enfant à naître (الحمل) — répartition après naissance",
        "reason_ar": "حصة معلقة — الحمل — تُحدد بعد الولادة",
    },
    "missing_pending": {
        "reason_fr": "Part en attente — personne disparue (المفقود) — selon décision judiciaire",
        "reason_ar": "حصة معلقة — المفقود — حسب الحكم القضائي",
    },
    "custom_required": {
        "reason_fr": "Part personnalisée requise — saisir une part manuelle",
        "reason_ar": "حصة مخصصة مطلوبة — أدخل النصيب يدوياً",
    },
    # Rétrocompatibilité
    "brother_blocked_by_son": {
        "reason_fr": "Exclu (hajb) — présence de fils (asaba prioritaire)",
        "reason_ar": "محجوب — وجود ابن (عصبة أولى)",
    },
    "brother_blocked_by_father": {
        "reason_fr": "Exclu (hajb) — présence du père",
        "reason_ar": "محجوب — وجود الأب",
    },
    "sister_blocked_by_brother": {
        "reason_fr": "Exclue (hajb) — présence de frère héritier",
        "reason_ar": "محجوبة — وجود أخ وارث",
    },
    "daughter_line_blocked": {
        "reason_fr": "Non héritier en عصبة — descendants de la fille (règle Maliki : pas de part automatique)",
        "reason_ar": "لا يرثون بالتعصيب — أبناء البنت (لا حصة تلقائية وفق المذهب المالكي)",
    },
    "cousin_female_blocked": {
        "reason_fr": "Exclue — les femmes ne sont pas عصبة dans la chaîne des cousins (Maliki)",
        "reason_ar": "محجوبة — الإناث ليست عصبة في سلسلة أبناء العم والخال (مالكي)",
    },
    "maternal_cousin_blocked": {
        "reason_fr": "Exclu — ابن الخال / بنت الخال : l'oncle maternel (الخال) est prioritaire en عصبة",
        "reason_ar": "محجوب — ابن الخال وبنت الخال: الخال أولى في العصبة من أبنائه (مالكي)",
    },
    "blocked_by_full_relative": {
        "reason_fr": "Exclu (hajb) — héritier germain (أشق) prioritaire du même rang",
        "reason_ar": "محجوب — الوارث الأشق أولى من نفس الدرجة",
    },
    "blocked_by_full_paternal_uncle": {
        "reason_fr": "Exclu (hajb) — oncle paternel germain (عم شقيق) prioritaire",
        "reason_ar": "محجوب — العم الشقيق أولى",
    },
    "blocked_by_full_nephew_uncle": {
        "reason_fr": "Exclu (hajb) — cousin paternel germain (ابن العم الشقيق) prioritaire",
        "reason_ar": "محجوب — ابن العم الشقيق أولى",
    },
}

GROUP_FARD_TYPES = frozenset({"wife", "husband"})

# Rétrocompat exports — libellés dynamiques depuis le registre
from app.constants.heir_types import HEIR_TYPE_REGISTRY as _REGISTRY

HEIR_TYPE_LABEL_FR = {tid: heir_label_fr(tid) for tid in _REGISTRY}
HEIR_TYPE_LABEL_AR = {tid: heir_label_ar(tid) for tid in _REGISTRY}
HEIR_TYPE_LABEL_FR.update({"brother": heir_label_fr("full_brother"), "sister": heir_label_fr("full_sister")})
HEIR_TYPE_LABEL_AR.update({"brother": heir_label_ar("full_brother"), "sister": heir_label_ar("full_sister")})

__all__ = [
    "EXCLUSION_REASONS",
    "GROUP_FARD_TYPES",
    "HEIR_TYPE_LABEL_FR",
    "HEIR_TYPE_LABEL_AR",
    "heir_display_name",
    "heir_display_name_ar",
    "normalize_heir_type",
]
