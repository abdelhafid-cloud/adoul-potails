"""
Vérification juridique détaillée — chaque héritier avec règle, justification et référence.
École Maliki / Moudawana marocaine.
"""
from __future__ import annotations

from typing import Any

from app.constants.heir_types import heir_label_ar, heir_label_fr, normalize_heir_type
from app.services.faraid_engine import FaraidContext

STATUS_LABELS = {
    "inherits": {"fr": "Hérite", "ar": "يرث"},
    "blocked": {"fr": "Exclu (hajb)", "ar": "محجوب"},
    "pending": {"fr": "En attente", "ar": "معلق"},
}

# Règles détaillées par motif ou par type d'héritier
_VERIFICATION_RULES: dict[str, dict[str, str]] = {
    "blocked_by_father_asaba": {
        "rule_fr": "Hajb (حجب) — exclusion par l'ascendant masculin proche (الأب)",
        "rule_ar": "حجب — الحجب بالأب في العصبة",
        "justification_fr": (
            "Le petit-fils du fils (ابن الابن) et la petite-fille du fils (بنت الابن) "
            "sont عصبة بالغير : ils héritent du reste en l'absence de fils. "
            "Toutefois, la présence du père vivant le rend prioritaire dans la chaîne "
            "des عصبات : il prend le السدس (fard) puis le reste (asaba), "
            "ce qui exclut les petits-enfants du fils (حجب بالأب)."
        ),
        "justification_ar": (
            "ابن الابن وبنت الابن من العصبة بالغير، يرثان الباقي عند انعداد الابن. "
            "لكن وجود الأب الحي يقدّمه في سلسلة العصبات فيأخذ السدس ثم الباقي "
            "فيحجب أبناء الابن (الحجب بالأب)."
        ),
        "reference_fr": (
            "Sourate An-Nisa (4:11) — ordre des عصبات ; "
            "Moudawana art. 344-370 ; doctrine malikite (ابن عاصم — الرحبية)."
        ),
        "reference_ar": (
            "سورة النساء (4:11) — ترتيب العصبات؛ "
            "مدونة الأسرة المواد 344-370؛ المذهب المالكي."
        ),
        "blocking_heir_fr": "Père (الأب)",
        "blocking_heir_ar": "الأب",
    },
    "blocked_by_son": {
        "rule_fr": "Hajb (حجب) — exclusion par le fils (الابن)",
        "rule_ar": "حجب — الحجب بالابن",
        "justification_fr": (
            "Le fils est عصبة أولى : sa présence exclut tout descendant de rang inférieur "
            "(petit-fils du fils, arrière-petit-fils, etc.) du fait de la proximité du degré (حجب نقصان)."
        ),
        "justification_ar": (
            "الابن عصبة أولى: وجوده يحجب كل من هو دونه من الفرع الذكري "
            "(ابن الابن ومن دونه) لقرب الدرجة."
        ),
        "reference_fr": "Sourate An-Nisa (4:11) — « يوصيكم الله في أولادكم » ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة المواد 344 وما يليها.",
        "blocking_heir_fr": "Fils (الابن)",
        "blocking_heir_ar": "الابن",
    },
    "blocked_by_awl": {
        "rule_fr": "Absence de reste après العول — pas de part asaba",
        "rule_ar": "انعداد الباقي بعد العول — لا حصة للعصبة",
        "justification_fr": (
            "Les parts fixes (فرض) des autres héritiers, après correction par العول, "
            "épuisent l'intégralité de la succession. Il ne reste aucun reste (باقي) "
            "à distribuer aux عصبات."
        ),
        "justification_ar": (
            "فروض الورثة الآخرين بعد تصحيح العول استوعبت كامل التركة. "
            "لا يبقى باقٍ يُوزَّع على العصبات."
        ),
        "reference_fr": "Doctrine des الفرائض — règle de العول ; Moudawana art. 344+.",
        "reference_ar": "علم الفرائض — قاعدة العول؛ مدونة الأسرة.",
        "blocking_heir_fr": "Répartition intégrale par les فروض (العول)",
        "blocking_heir_ar": "استيعاب التركة بالفروض بعد العول",
    },
    "inherits_asaba_son_line": {
        "rule_fr": "عصبة بالغير — petit-fils du fils en l'absence de fils et de père",
        "rule_ar": "عصبة بالغير — ابن الابن عند انعداد الابن والأب",
        "justification_fr": (
            "En l'absence de fils et de père, le petit-fils du fils (ابن الابن) "
            "prend la place du fils dans la عصبة et hérite du reste après les فروض, "
            "avec le principe « للذكر مثل حظ الأنثيين »."
        ),
        "justification_ar": (
            "عند انعداد الابن والأب، يقوم ابن الابن مقام الابن في العصبة "
            "ويأخذ الباقي بعد الفروض « للذكر مثل حظ الأنثيين »."
        ),
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344-370 ; Maliki.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة؛ المذهب المالكي.",
    },
    "inherits_fard": {
        "rule_fr": "Part fixe (فرض) — part coranique",
        "rule_ar": "فرض — نصيب مقدر شرعاً",
        "justification_fr": "Héritier à part fixe selon le Coran et le barème malikite.",
        "justification_ar": "وارث بفرض مقدر في القرآن والجدول المالكي.",
        "reference_fr": "Sourate An-Nisa (4:11-12, 4:176) ; Moudawana Livre IV.",
        "reference_ar": "سورة النساء؛ مدونة الأسرة الكتاب الرابع.",
    },
    "inherits_asaba": {
        "rule_fr": "عصبة / تعصيب — part du reste",
        "rule_ar": "عصبة — الباقي بالتعصيب",
        "justification_fr": "Héritier residuaire recevant le reste de la succession après les فروض.",
        "justification_ar": "وارث بالتعصيب يأخذ الباقي بعد أصحاب الفروض.",
        "reference_fr": "Sourate An-Nisa (4:11, 4:176) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء؛ مدونة الأسرة.",
    },
}

_TYPE_INHERIT_RULES: dict[str, dict[str, str]] = {
    "husband": {
        "rule_fr": "فرض — Époux : 1/4 avec descendance, 1/2 sans",
        "rule_ar": "فرض — الزوج: الربع مع فرع وارث، النصف بدونه",
        "reference_fr": "Sourate An-Nisa (4:12) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:12)؛ مدونة الأسرة.",
    },
    "wife": {
        "rule_fr": "فرض — Épouse : 1/8 avec descendance, 1/4 sans",
        "rule_ar": "فرض — الزوجة: الثمن مع فرع وارث، الربع بدونه",
        "reference_fr": "Sourate An-Nisa (4:12) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:12)؛ مدونة الأسرة.",
    },
    "father": {
        "rule_fr": "فرض + عصبة — Père : 1/6 puis reste",
        "rule_ar": "فرض وعصبة — الأب: السدس ثم الباقي",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344-370.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة.",
    },
    "mother": {
        "rule_fr": "فرض — Mère : 1/3 ou 1/6 selon présence de frères/descendance",
        "rule_ar": "فرض — الأم: الثلث أو السدس حسب الإخوة والفرع",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة.",
    },
    "daughter": {
        "rule_fr": "فرض + عصبة — Fille(s) : 1/2 ou 2/3 puis reste si fils",
        "rule_ar": "فرض وعصبة — البنت: النصف أو الثلثان",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة.",
    },
    "son": {
        "rule_fr": "عصبة — Fils : reste avec ratio 2:1",
        "rule_ar": "عصبة — الابن: الباقي للذكر مثل حظ الأنثيين",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344+.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة.",
    },
    "grandson_from_son": {
        "rule_fr": "عصبة بالغير — ابن الابن (substitution du fils)",
        "rule_ar": "عصبة بالغير — ابن الابن (يقوم مقام الابن)",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344-370 ; Maliki.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة؛ المذهب المالكي.",
    },
    "granddaughter_from_son": {
        "rule_fr": "عصبة بالغير — بنت الابن (avec ابن الابن, ratio 2:1)",
        "rule_ar": "عصبة بالغير — بنت الابن مع ابن الابن",
        "reference_fr": "Sourate An-Nisa (4:11) ; Moudawana art. 344-370 ; Maliki.",
        "reference_ar": "سورة النساء (4:11)؛ مدونة الأسرة؛ المذهب المالكي.",
    },
}


def _reason_key_from_detail(detail: dict, ctx: FaraidContext, meta: dict) -> str | None:
    """Retrouve la clé de motif d'exclusion à partir du détail."""
    reason_fr = (detail.get("reason_fr") or "").lower()
    t = detail.get("type", "")
    if "père" in reason_fr or "الأب" in (detail.get("reason_ar") or ""):
        return "blocked_by_father_asaba"
    if "fils" in reason_fr and "petit" not in reason_fr:
        return "blocked_by_son"
    if t in ("grandson_from_son", "granddaughter_from_son"):
        if ctx.has_father:
            return "blocked_by_father_asaba"
        if ctx.has_son:
            return "blocked_by_son"
        if meta.get("has_awl") and detail.get("status") == "blocked":
            return "blocked_by_awl"
    return None


def build_legal_verification(
    heirs: list[dict],
    heir_details: list[dict],
    calculation_meta: dict | None = None,
    adjustments: list[dict] | None = None,
) -> list[dict[str, Any]]:
    """Construit la fiche de vérification juridique pour chaque héritier déclaré."""
    ctx = FaraidContext.from_heirs(heirs)
    meta = calculation_meta or {}
    verification: list[dict[str, Any]] = []

    for detail in heir_details:
        t = normalize_heir_type(detail.get("type", "other"))
        status = detail.get("status", "inherits")
        labels = STATUS_LABELS.get(status, STATUS_LABELS["inherits"])
        type_rules = _TYPE_INHERIT_RULES.get(t, {})

        entry: dict[str, Any] = {
            "type": t,
            "name": detail.get("name") or heir_label_fr(t),
            "name_ar": detail.get("name_ar") or heir_label_ar(t),
            "status": status,
            "status_label_fr": labels["fr"],
            "status_label_ar": labels["ar"],
            "amount": detail.get("amount"),
            "percentage": detail.get("percentage"),
            "share_applied": (
                f"{detail.get('percentage', 0):.4f}%"
                if detail.get("percentage") else None
            ),
        }

        if status == "inherits":
            is_asaba = detail.get("legal_basis", {}).get("category_fr", "").startswith("Residuaire")
            if t in ("grandson_from_son", "granddaughter_from_son"):
                rule = _VERIFICATION_RULES["inherits_asaba_son_line"]
            elif is_asaba or t in ("son", "father"):
                rule = _VERIFICATION_RULES["inherits_asaba"]
            else:
                rule = _VERIFICATION_RULES["inherits_fard"]

            entry["rule_applied_fr"] = type_rules.get("rule_fr") or rule["rule_fr"]
            entry["rule_applied_ar"] = type_rules.get("rule_ar") or rule["rule_ar"]
            entry["justification_fr"] = rule["justification_fr"]
            entry["justification_ar"] = rule["justification_ar"]
            entry["legal_reference_fr"] = type_rules.get("reference_fr") or rule["reference_fr"]
            entry["legal_reference_ar"] = type_rules.get("reference_ar") or rule["reference_ar"]

            if meta.get("has_awl"):
                entry["note_fr"] = "Parts corrigées par العول (augmentation du dénominateur)."
                entry["note_ar"] = "تم تصحيح الحصص بالعول."
            if meta.get("has_radd"):
                entry["note_fr"] = "Surplus redistribué par الرد."
                entry["note_ar"] = "تم توزيع الفائض بالرد."

        elif status == "blocked":
            reason_key = _reason_key_from_detail(detail, ctx, meta)
            if not reason_key and t in ("grandson_from_son", "granddaughter_from_son"):
                reason_key = (
                    "blocked_by_father_asaba" if ctx.has_father
                    else "blocked_by_son" if ctx.has_son
                    else "blocked_by_awl" if meta.get("has_awl")
                    else "blocked_by_father_asaba"
                )
            rule = _VERIFICATION_RULES.get(reason_key or "", {})

            entry["rule_applied_fr"] = rule.get("rule_fr") or detail.get("reason_fr", "")
            entry["rule_applied_ar"] = rule.get("rule_ar") or detail.get("reason_ar", "")
            entry["justification_fr"] = rule.get("justification_fr") or detail.get("reason_fr", "")
            entry["justification_ar"] = rule.get("justification_ar") or detail.get("reason_ar", "")
            entry["legal_reference_fr"] = rule.get("reference_fr", "Moudawana art. 344+ ; Maliki.")
            entry["legal_reference_ar"] = rule.get("reference_ar", "مدونة الأسرة؛ المذهب المالكي.")
            if rule.get("blocking_heir_fr"):
                entry["blocking_heir_fr"] = rule["blocking_heir_fr"]
                entry["blocking_heir_ar"] = rule.get("blocking_heir_ar", "")

        else:  # pending
            entry["rule_applied_fr"] = "Cas spécial — statut en attente"
            entry["rule_applied_ar"] = "حالة خاصة — معلق"
            entry["justification_fr"] = detail.get("reason_fr", "")
            entry["justification_ar"] = detail.get("reason_ar", "")
            entry["legal_reference_fr"] = "Moudawana — procédure judiciaire ou naissance requise."
            entry["legal_reference_ar"] = "مدونة الأسرة — إجراء قضائي أو ولادة."

        verification.append(entry)

    return verification
