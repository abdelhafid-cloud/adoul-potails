"""Références juridiques pour les calculs d'héritage — Moudawana & école Maliki."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.constants.heir_types import heir_label_fr, normalize_heir_type
from app.services.deceased_info import deceased_display_name, extract_deceased_info


def _frac_label(decimal_share: Decimal) -> str:
    mapping = {
        Decimal("0.125"): "1/8",
        Decimal("0.25"): "1/4",
        Decimal("0.333333"): "1/3",
        Decimal("0.166666"): "1/6",
        Decimal("0.5"): "1/2",
    }
    for k, v in mapping.items():
        if abs(decimal_share - k) < Decimal("0.001"):
            return v
    return f"{float(decimal_share * 100):.2f}%"


HEIR_LEGAL_BASIS: dict[str, dict[str, str]] = {
    "wife": {
        "category_fr": "Fard (part obligatoire)",
        "category_ar": "فرض",
        "share_fr": "1/8 avec descendance — 1/4 sans descendance",
        "share_ar": "الثمن مع فرع وارث — الربع بدون فرع وارث",
        "quran_fr": "Sourate An-Nisa (4:12) — part de l'épouse",
        "quran_ar": "سورة النساء (4:12) — نصيب الزوجة",
        "maliki_fr": "École malikite reconnue au Maroc : la veuve reçoit le huitième en présence d'enfants, le quart en leur absence.",
        "maliki_ar": "المذهب المالكي المعتمد بالمغرب: للزوجة الثمن مع وجود فرع وارث والربع بدونه.",
        "moudawana_fr": "Code de la famille (Moudawana) — Livre IV, succession, art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — الكتاب الرابع في الميراث، المواد 344 وما يليها.",
    },
    "husband": {
        "category_fr": "Fard (part obligatoire)",
        "category_ar": "فرض",
        "share_fr": "1/4 avec descendance — 1/2 sans descendance",
        "share_ar": "الربع مع فرع وارث — النصف بدون فرع وارث",
        "quran_fr": "Sourate An-Nisa (4:12) — part de l'époux",
        "quran_ar": "سورة النساء (4:12) — نصيب الزوج",
        "maliki_fr": "Le veuf prend la moitié sans descendance, le quart avec descendance (Maliki).",
        "maliki_ar": "للزوج النصف بلا فرع وارث والربع مع وجود فرع وارث (مالكي).",
        "moudawana_fr": "Moudawana — art. 344 et suivants, droit successoral marocain.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "father": {
        "category_fr": "Fard puis residuaire (asaba)",
        "category_ar": "فرض ثم عصبة",
        "share_fr": "1/6 en présence de descendance — residuaire du reste",
        "share_ar": "السدس مع فرع وارث — ثم العصبة في الباقي",
        "quran_fr": "Sourate An-Nisa (4:11) — part du père",
        "quran_ar": "سورة النساء (4:11) — نصيب الأب",
        "maliki_fr": "Le père a un sixième avec descendance puis peut hériter du reste en qualité d'asaba.",
        "maliki_ar": "للأب السدس مع فرع وارث ثم يكون عصبة في الباقي.",
        "moudawana_fr": "Moudawana — règles de dévolution successorale, art. 344-370.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 إلى 370.",
    },
    "mother": {
        "category_fr": "Fard (part obligatoire)",
        "category_ar": "فرض",
        "share_fr": "1/6 avec descendance — 1/3 sans descendance",
        "share_ar": "السدس مع فرع وارث — الثلث بدونه",
        "quran_fr": "Sourate An-Nisa (4:11) — part de la mère",
        "quran_ar": "سورة النساء (4:11) — نصيب الأم",
        "maliki_fr": "La mère reçoit un tiers sans descendance, un sixième avec descendance (Maliki).",
        "maliki_ar": "للأم الثلث بلا فرع وارث والسدس مع وجود فرع وارث.",
        "moudawana_fr": "Moudawana — art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "son": {
        "category_fr": "Residuaire (asaba)",
        "category_ar": "عصبة",
        "share_fr": "Part du reste — 2 parts pour le fils",
        "share_ar": "الباقي — للذكر مثل حظ الأنثيين",
        "quran_fr": "Sourate An-Nisa (4:11) — « pour le mâle une part égale à celle de deux femelles »",
        "quran_ar": "سورة النساء (4:11) — « للذكر مثل حظ الأنثيين »",
        "maliki_fr": "Les fils héritent du reste (tasib) avec ratio 2:1 fille (Maliki).",
        "maliki_ar": "الأبناء يستحقون الباقي بالتعصيب بنسبة 2:1 للأنثى.",
        "moudawana_fr": "Moudawana — art. 344 et suivants, règle du double pour le mâle.",
        "moudawana_ar": "مدونة الأسرة — قاعدة « للذكر مثل حظ الأنثيين ».",
    },
    "daughter": {
        "category_fr": "Residuaire (asaba)",
        "category_ar": "عصبة",
        "share_fr": "Part du reste — 1 part pour la fille",
        "share_ar": "الباقي — للأنثى نصف نصيب الذكر",
        "quran_fr": "Sourate An-Nisa (4:11)",
        "quran_ar": "سورة النساء (4:11)",
        "maliki_fr": "La fille reçoit la moitié de la part du fils sur le reste (Maliki).",
        "maliki_ar": "للبنت نصف نصيب الابن من الباقي.",
        "moudawana_fr": "Moudawana — art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "brother": {
        "category_fr": "Residuaire (asaba)",
        "category_ar": "عصبة",
        "share_fr": "Part du reste en absence de descendance directe",
        "share_ar": "الباقي عند انعداد الفرع الوارث",
        "quran_fr": "Sourate An-Nisa (4:176) — collatéraux",
        "quran_ar": "سورة النساء (4:176) — العصبة",
        "maliki_fr": "Frères germains en residuaire selon ordre de priorité (Maliki).",
        "maliki_ar": "الإخوة الأشقاء في التعصيب حسب الترتيب.",
        "moudawana_fr": "Moudawana — art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "sister": {
        "category_fr": "Residuaire (asaba)",
        "category_ar": "عصبة",
        "share_fr": "Part du reste — moitié de la part du frère",
        "share_ar": "الباقي — للأخت نصف نصيب الأخ",
        "quran_fr": "Sourate An-Nisa (4:176)",
        "quran_ar": "سورة النساء (4:176)",
        "maliki_fr": "La sœur reçoit la moitié de la part du frère sur le reste.",
        "maliki_ar": "للأخت نصف نصيب الأخ من الباقي.",
        "moudawana_fr": "Moudawana — art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "other": {
        "category_fr": "Part personnalisée",
        "category_ar": "حصة مخصصة",
        "share_fr": "Définie manuellement par l'adoul",
        "share_ar": "تحدد يدوياً",
        "quran_fr": "Cas particulier — vérification juridique requise",
        "quran_ar": "حالة خاصة — مراجعة فقهية مطلوبة",
        "maliki_fr": "Cas hors barème standard — validation par l'adoul recommandée.",
        "maliki_ar": "حالة خارج الجدول — يُنصح بمراجعة عدل مختص.",
        "moudawana_fr": "Moudawana — consultation des textes applicables.",
        "moudawana_ar": "مدونة الأسرة — مراجعة النصوص المعمول بها.",
    },
    "fetus": {
        "category_fr": "Cas spécial — الحمل",
        "category_ar": "حالة خاصة — الحمل",
        "share_fr": "Part en attente de naissance",
        "share_ar": "حصة معلقة إلى الولادة",
        "quran_fr": "Sourate An-Nisa — règles du fœtus héritier",
        "quran_ar": "سورة النساء — أحكام الحمل الوارث",
        "maliki_fr": "Le fœtus vivant à la mort du de cujus hérite s'il naît vivant (Maliki).",
        "maliki_ar": "الحمل إن ولد حياً يرث (مالكي).",
        "moudawana_fr": "Moudawana — art. 344 et suivants.",
        "moudawana_ar": "مدونة الأسرة — المواد 344 وما يليها.",
    },
    "missing_person": {
        "category_fr": "Cas spécial — المفقود",
        "category_ar": "حالة خاصة — المفقود",
        "share_fr": "Part réservée selon décision judiciaire",
        "share_ar": "حصة محجوزة حسب الحكم القضائي",
        "quran_fr": "Règles du absent / disparu en droit successoral",
        "quran_ar": "أحكام المفقود في الميراث",
        "maliki_fr": "Le disparu conserve sa part jusqu'à jugement (Maliki).",
        "maliki_ar": "للمفقود حصة محجوزة إلى البت في أمره (مالكي).",
        "moudawana_fr": "Moudawana — procédures judiciaires applicables.",
        "moudawana_ar": "مدونة الأسرة — الإجراءات القضائية المعمول بها.",
    },
}

# Types dérivés → base juridique proche
_LEGAL_BASIS_FALLBACK: dict[str, str] = {
    "full_brother": "brother",
    "full_sister": "sister",
    "consanguine_brother": "brother",
    "consanguine_sister": "sister",
    "uterine_brother": "brother",
    "uterine_sister": "sister",
    "grandson_from_son": "son",
    "granddaughter_from_son": "daughter",
    "grandson_from_daughter": "son",
    "granddaughter_from_daughter": "daughter",
    "paternal_grandfather": "father",
    "paternal_grandmother": "mother",
    "maternal_grandmother": "mother",
    "full_paternal_uncle": "brother",
    "consanguine_paternal_uncle": "brother",
    "full_paternal_aunt": "sister",
    "consanguine_paternal_aunt": "sister",
    "paternal_uncle": "brother",
    "paternal_aunt": "sister",
    "maternal_uncle": "brother",
    "maternal_aunt": "sister",
    "son_full_brother": "son",
    "son_consanguine_brother": "son",
    "son_full_paternal_uncle": "son",
    "son_consanguine_paternal_uncle": "son",
    "son_paternal_uncle": "son",
    "son_son_paternal_uncle": "son",
    "daughter_full_paternal_uncle": "sister",
    "daughter_consanguine_paternal_uncle": "sister",
    "daughter_paternal_uncle": "sister",
    "son_maternal_uncle": "brother",
    "daughter_maternal_uncle": "sister",
}


def build_calculation_steps(data: dict, net: Decimal, gross: Decimal) -> list[dict[str, str]]:
    debts = Decimal(str(data.get("debts", 0)))
    fees = Decimal(str(data.get("fees", 0)))
    heirs = data.get("heirs", [])
    heir_summary = ", ".join(
        f"{h.get('count', 1)}×{heir_label_fr(h.get('type', 'other'))}" for h in heirs
    ) or "—"

    return [
        {
            "step": "1",
            "title_fr": "Patrimoine brut",
            "title_ar": "إجمالي التركة",
            "detail_fr": f"Valeur totale déclarée : {float(gross):,.2f} MAD",
            "detail_ar": f"القيمة الإجمالية: {float(gross):,.2f} درهم",
        },
        {
            "step": "2",
            "title_fr": "Déductions",
            "title_ar": "الخصوم",
            "detail_fr": f"Dettes : {float(debts):,.2f} MAD — Frais : {float(fees):,.2f} MAD",
            "detail_ar": f"الديون: {float(debts):,.2f} — المصاريف: {float(fees):,.2f} درهم",
        },
        {
            "step": "3",
            "title_fr": "Patrimoine net (tarika)",
            "title_ar": "صافي التركة",
            "detail_fr": f"Base légale du partage : {float(net):,.2f} MAD",
            "detail_ar": f"أساس التوزيع الشرعي: {float(net):,.2f} درهم",
        },
        {
            "step": "4",
            "title_fr": "Héritiers identifiés",
            "title_ar": "تحديد الورثة",
            "detail_fr": f"Composition : {heir_summary}",
            "detail_ar": f"التركيب: {heir_summary}",
        },
        {
            "step": "5",
            "title_fr": "Parts fixes (fard) puis reste (asaba)",
            "title_ar": "الفرائض ثم العصبات",
            "detail_fr": "Application des parts coraniques puis répartition du reste selon le Maliki.",
            "detail_ar": "تطبيق الفروض الشرعية ثم توزيع الباقي وفق المذهب المالكي.",
        },
        {
            "step": "6",
            "title_fr": "Conformité Moudawana",
            "title_ar": "الامتثال للمدونة",
            "detail_fr": "Calcul conforme au Code de la famille marocain (Moudawana), Livre IV.",
            "detail_ar": "حساب مطابق لمدونة الأسرة المغربية، الكتاب الرابع.",
        },
    ]


def legal_basis_for_heir(
    heir_type: str,
    share_fraction: float,
    is_residual: bool = False,
) -> dict[str, str]:
    canonical = normalize_heir_type(heir_type)
    basis_key = _LEGAL_BASIS_FALLBACK.get(canonical, canonical)
    base = HEIR_LEGAL_BASIS.get(basis_key, HEIR_LEGAL_BASIS["other"]).copy()
    if is_residual:
        base["category_fr"] = "Residuaire (asaba / tasib)"
        base["category_ar"] = "عصبة / بالتعصيب"
    base["applied_share"] = _frac_label(Decimal(str(share_fraction)))
    return base


def build_legal_summary() -> dict[str, str]:
    return {
        "school_fr": "École malikite — reconnue par le Ministère de la Justice marocain",
        "school_ar": "المذهب المالكي — معتمد لدى وزارة العدل المغربية",
        "law_fr": "Code de la famille (Moudawana), Dahir n° 1-04-22 du 3 février 2004",
        "law_ar": "مدونة الأسرة، ظهير 1-04-22 بتاريخ 3 فبراير 2004",
        "ministry_fr": "Ministère de la Justice — Direction des affaires notariales et successoral",
        "ministry_ar": "وزارة العدل — الشؤون العدلية والميراث",
        "disclaimer_fr": "Ce calcul est une aide à la décision. L'acte définitif relève de la responsabilité de l'adoul.",
        "disclaimer_ar": "هذا الحساب مساعد. يبقى العقد النهائي مسؤولية العدل.",
    }


def build_legal_proof(
    data: dict,
    net: Decimal,
    gross: Decimal,
    distribution: list[dict],
    heir_details: list[dict] | None = None,
    adjustments: list[dict] | None = None,
    calculation_meta: dict | None = None,
    legal_verification: list[dict] | None = None,
) -> dict[str, Any]:
    proofs_source = heir_details if heir_details else distribution
    steps = build_calculation_steps(data, net, gross)
    if adjustments:
        for i, adj in enumerate(adjustments, start=len(steps) + 1):
            steps.append({
                "step": str(i),
                "title_fr": adj.get("title_fr", ""),
                "title_ar": adj.get("title_ar", ""),
                "detail_fr": adj.get("detail_fr", ""),
                "detail_ar": adj.get("detail_ar", ""),
            })

    inheriting = [d for d in proofs_source if d.get("status") == "inherits"]
    excluded = [d for d in proofs_source if d.get("status") in ("blocked", "pending")]
    deceased = extract_deceased_info(data)
    deceased_fr, deceased_ar = deceased_display_name(deceased)
    summary = build_legal_summary()

    return {
        "deceased": deceased,
        "summary": summary,
        "steps": steps,
        "calculation_meta": calculation_meta or {},
        "adjustments": adjustments or [],
        "excluded_heirs": [
            {
                "type": d.get("type"),
                "name": d.get("name"),
                "name_ar": d.get("name_ar"),
                "status": d.get("status"),
                "reason_fr": d.get("reason_fr"),
                "reason_ar": d.get("reason_ar"),
            }
            for d in excluded
        ],
        "heir_proofs": [
            {
                "type": d.get("type"),
                "name": d.get("name"),
                "name_ar": d.get("name_ar"),
                "amount": d.get("amount"),
                "percentage": d.get("percentage"),
                "status": d.get("status", "inherits"),
                "reason_fr": d.get("reason_fr"),
                "reason_ar": d.get("reason_ar"),
                "legal_basis": d.get(
                    "legal_basis",
                    legal_basis_for_heir(
                        d.get("type", "other"),
                        (d.get("percentage") or 0) / 100,
                    ),
                ),
            }
            for d in proofs_source
        ],
        "legal_verification": legal_verification or [],
        "report": {
            "deceased_fr": deceased_fr,
            "deceased_ar": deceased_ar,
            "deceased": deceased,
            "net_estate": float(net),
            "heirs_count": len(inheriting),
            "excluded_count": len(excluded),
            "has_awl": (calculation_meta or {}).get("has_awl", False),
            "has_radd": (calculation_meta or {}).get("has_radd", False),
            "school_fr": summary["school_fr"],
            "school_ar": summary["school_ar"],
        },
    }
