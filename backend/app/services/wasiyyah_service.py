"""Calcul wasiyyah (وصية) — Moudawana & école malikite (max 1/3, hors héritier sauf consentement)."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.constants.moroccan_act_fees import LEGAL_REFS


def _round(v: Decimal) -> float:
    return float(v.quantize(Decimal("0.01")))


def calculate_wasiyyah(data: dict) -> dict[str, Any]:
    gross_net = Decimal(str(data.get("net_estate_value", 0)))
    debts = Decimal(str(data.get("debts_before_wasiyyah", 0) or 0))
    funeral = Decimal(str(data.get("funeral_expenses", 0) or 0))
    requested = Decimal(str(data.get("wasiyyah_amount", 0)))
    legatee_name = (data.get("legatee_name") or "").strip()
    legatee_name_ar = (data.get("legatee_name_ar") or "").strip()
    legatee_is_heir = bool(data.get("legatee_is_heir", False))
    heirs_consent = bool(data.get("heirs_consent", False))
    wasiyyah_kind = data.get("wasiyyah_kind", "cash")

    if gross_net <= 0:
        raise ValueError("Le patrimoine net doit être supérieur à zéro.")

    deductions = min(debts + funeral, gross_net)
    net = gross_net - deductions
    if net <= 0:
        raise ValueError(
            "Après dettes et frais funéraires, il ne reste rien pour la wasiyyah."
        )

    max_wasiyyah = (net / Decimal("3")).quantize(Decimal("0.01"))
    exceeds_max = requested > max_wasiyyah

    if legatee_is_heir and not heirs_consent:
        applied = Decimal("0")
        valid = False
        status_fr = (
            "Non valide — الوصية للوارث : la Moudawana et le fiqh maliki exigent "
            "l'accord unanime des autres héritiers (art. 330 et suiv.)."
        )
        status_ar = (
            "غير صالحة — الوصية للوارث تتطلب إجماع باقي الورثة (م.330 وما يليها)."
        )
    elif exceeds_max:
        applied = max_wasiyyah
        valid = True
        status_fr = (
            f"Montant ramené au plafond du tiers (ثُلُثُكُمْ) : {_round(max_wasiyyah):,.2f} MAD"
        )
        status_ar = f"خُفِّض المبلغ إلى حد الثلث: {_round(max_wasiyyah):,.2f} درهم"
    else:
        applied = requested
        valid = True
        if legatee_is_heir and heirs_consent:
            status_fr = "Wasiyyah au profit d'un héritier — consentement des cohéritiers mentionné (à vérifier par l'adoul)."
            status_ar = "وصية للوارث — مع ذكر موافقة الورثة (يتحقق منها العدل)."
        else:
            status_fr = "Wasiyyah conforme au plafond du tiers pour non-héritier (Coran 2:180)."
            status_ar = "وصية مطابقة لحد الثلث لغير الوارث (البقرة 2:180)."

    remainder = net - applied
    kind_fr = {"cash": "En numéraire", "property": "Bien déterminé (عين معينة)"}.get(wasiyyah_kind, wasiyyah_kind)
    kind_ar = {"cash": "نقداً", "property": "عين معينة من التركة"}.get(wasiyyah_kind, wasiyyah_kind)

    results = {
        "gross_net_estate": _round(gross_net),
        "debts_before_wasiyyah": _round(debts),
        "funeral_expenses": _round(funeral),
        "net_estate_value": _round(net),
        "max_wasiyyah": _round(max_wasiyyah),
        "wasiyyah_amount_requested": _round(requested),
        "wasiyyah_amount_applied": _round(applied),
        "remainder_for_heirs": _round(remainder),
        "max_wasiyyah_pct": 33.33,
        "applied_pct": float((applied / net * 100).quantize(Decimal("0.01"))) if net else 0,
        "legatee_name": legatee_name,
        "legatee_name_ar": legatee_name_ar,
        "legatee_is_heir": legatee_is_heir,
        "heirs_consent": heirs_consent,
        "wasiyyah_kind": wasiyyah_kind,
        "is_valid": valid,
        "exceeds_max": exceeds_max,
        "status_fr": status_fr,
        "status_ar": status_ar,
        "lines": [
            {"label_fr": "Patrimoine net brut", "label_ar": "صافي التركة الإجمالي", "amount": _round(gross_net)},
            {"label_fr": "Dettes + frais funéraires", "label_ar": "الديون + مصاريف الدفن", "amount": _round(deductions)},
            {"label_fr": "Base wasiyyah (après dettes)", "label_ar": "أساس الوصية (بعد الديون)", "amount": _round(net)},
            {"label_fr": "Plafond wasiyyah (1/3)", "label_ar": "حد الوصية (الثلث)", "amount": _round(max_wasiyyah)},
            {"label_fr": "Montant wasiyyah retenu", "label_ar": "مبلغ الوصية المطبق", "amount": _round(applied)},
            {"label_fr": "Reste pour les héritiers (فرائض)", "label_ar": "الباقي للورثة (الفرائض)", "amount": _round(remainder)},
        ],
    }

    refs = LEGAL_REFS["wasiyyah"]
    legal_proof = {
        "summary": {
            "school_fr": "École malikite — wasiyyah (وصية) testamentaire",
            "school_ar": "المذهب المالكي — الوصية التبرعية",
            "law_fr": f"{refs['quran_fr']} — {refs['moudawana_fr']}",
            "law_ar": f"{refs['quran_ar']} — {refs['moudawana_ar']}",
            "ministry_fr": "Ordre des adouls du Maroc — acte authentique obligatoire",
            "ministry_ar": "هيئة العدول بالمغرب — محضر موثق واجب",
            "disclaimer_fr": (
                "La الوصية الواجبة (petits-enfants de la fille) et les legs en faveur d'organismes "
                "relèvent de règles spécifiques non couvertes ici. Vérification par l'adoul obligatoire."
            ),
            "disclaimer_ar": (
                "الوصية الواجبة وأحكام أخرى خاصة تستلزم مراجعة العدل. هذا الحساب إرشادي."
            ),
        },
        "steps": [
            {"step": "1", "title_fr": "Dettes et dépenses prioritaires", "title_ar": "الديون والمصاريف المقدمة",
             "detail_fr": f"Dettes {_round(debts):,.2f} + funéraires {_round(funeral):,.2f} MAD (avant le tiers)",
             "detail_ar": f"ديون {_round(debts):,.2f} + دفن {_round(funeral):,.2f} درهم"},
            {"step": "2", "title_fr": "Base nette", "title_ar": "الأساس الصافي",
             "detail_fr": f"{_round(net):,.2f} MAD", "detail_ar": f"{_round(net):,.2f} درهم"},
            {"step": "3", "title_fr": "Plafond légal (1/3)", "title_ar": "الحد الشرعي (الثلث)",
             "detail_fr": f"{_round(max_wasiyyah):,.2f} MAD — Nature : {kind_fr}",
             "detail_ar": f"{_round(max_wasiyyah):,.2f} درهم — {kind_ar}"},
            {"step": "4", "title_fr": "Légataire (الموصى له)", "title_ar": "الموصى له",
             "detail_fr": legatee_name or "—", "detail_ar": legatee_name_ar or legatee_name or "—"},
            {"step": "5", "title_fr": "Résultat", "title_ar": "النتيجة",
             "detail_fr": status_fr, "detail_ar": status_ar},
        ],
    }

    return {
        "results": results,
        "legal_proof": legal_proof,
        "total_amount": _round(applied),
        "inputs": data,
    }
