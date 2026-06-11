"""Calculs des frais et droits — vente, donation, procuration, mariage (droit marocain)."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.constants.moroccan_act_fees import (
    CONSERVATION_RATE,
    DONATION_REGISTRATION_RATES,
    LEGAL_REFS,
    MARRIAGE_REGISTRATION,
    PROCURATION_STAMP,
    SALE_REGISTRATION_RATES,
    TPI_RATE,
    adoul_fees_donation,
    adoul_fees_marriage,
    adoul_fees_sale,
    procuration_adoul_fee,
    tpi_abatement_pct,
)


def _round(v: Decimal) -> float:
    return float(v.quantize(Decimal("0.01")))


def _legal_summary(act_type: str) -> dict[str, str]:
    refs = LEGAL_REFS.get(act_type, {})
    base = {
        "school_fr": "École malikite — cadre juridique marocain",
        "school_ar": "المذهب المالكي — الإطار القانوني المغربي",
        "law_fr": refs.get("moudawana_fr") or refs.get("cgi_fr") or refs.get("dahir_fr", "Moudawana & CGI"),
        "law_ar": refs.get("moudawana_ar") or refs.get("cgi_ar") or refs.get("dahir_ar", "مدونة الأسرة والضرائب"),
        "ministry_fr": "Ministère de la Justice — DGI — ANCFCC (selon acte)",
        "ministry_ar": "وزارة العدل — المديرية العامة للضرائب — الوكالة العقارية",
        "disclaimer_fr": (
            "Estimation indicative selon barèmes CGI, Moudawana et dahir des adouls. "
            "L'acte authentique relève de l'adoul compétent."
        ),
        "disclaimer_ar": "تقدير إرشادي وفق المدونة والظهير. العقد النهائي مسؤولية العدل المختص.",
    }
    if act_type == "sale" and refs.get("ancfcc_fr"):
        base["law_fr"] += f" — {refs['ancfcc_fr']}"
        base["law_ar"] += f" — {refs['ancfcc_ar']}"
    return base


def calculate_sale(data: dict) -> dict[str, Any]:
    price = Decimal(str(data.get("sale_price", 0)))
    property_kind = data.get("property_kind", "habitation")
    purchase_price = Decimal(str(data.get("purchase_price", 0)))
    acquisition_fees = Decimal(str(data.get("acquisition_fees", 0)))
    years_held = int(data.get("years_held", 0) or 0)
    is_primary_residence = bool(data.get("is_primary_residence", False))

    manual_gain = data.get("capital_gain")
    if manual_gain is not None and str(manual_gain).strip() != "" and purchase_price <= 0:
        profit = Decimal(str(manual_gain))
    else:
        profit = price - purchase_price - acquisition_fees
    if profit < 0:
        profit = Decimal("0")

    # CGI art. 92 — résidence principale occupée ≥ 6 ans : exonération totale TPI
    tpi_exempt_primary = is_primary_residence and years_held >= 6
    abatement_pct = tpi_abatement_pct(years_held)
    taxable_gain = profit * (Decimal("1") - abatement_pct / Decimal("100"))
    if tpi_exempt_primary:
        tpi = Decimal("0")
        tpi_reason_fr = "Exonération TPI — résidence principale, occupation continue ≥ 6 ans (CGI)"
        tpi_reason_ar = "إعفاء من الضريبة — سكن رئيسي، إشغال متواصل ≥ 6 سنوات"
    elif abatement_pct >= Decimal("100"):
        tpi = Decimal("0")
        tpi_reason_fr = f"Exonération TPI — abattement 100 % (détention ≥ 14 ans, CGI art. 92)"
        tpi_reason_ar = "إعفاء — نسبة الإعفاء 100% (حيازة ≥ 14 سنة)"
    else:
        tpi = taxable_gain * TPI_RATE
        if abatement_pct > 0:
            tpi_reason_fr = (
                f"Plus-value {_round(profit):,.2f} MAD — abattement {float(abatement_pct)} % "
                f"→ base {_round(taxable_gain):,.2f} × 20 %"
            )
            tpi_reason_ar = (
                f"ربح {_round(profit):,.2f} درهم — إعفاء {float(abatement_pct)}% "
                f"→ أساس {_round(taxable_gain):,.2f} × 20%"
            )
        else:
            tpi_reason_fr = f"Plus-value {_round(profit):,.2f} MAD × 20 % (TPI)"
            tpi_reason_ar = f"ربح عقاري {_round(profit):,.2f} درهم × 20%"

    reg_rate = SALE_REGISTRATION_RATES.get(property_kind, Decimal("0.05"))
    registration = price * reg_rate
    conservation = price * CONSERVATION_RATE
    adoul_fees = adoul_fees_sale(price)
    formalities = Decimal("500")
    total = registration + conservation + adoul_fees + tpi + formalities

    kind_fr = {
        "habitation": "Habitation",
        "commercial": "Commercial",
        "terrain_nu": "Terrain nu",
        "agricole": "Agricole",
    }
    kind_ar = {
        "habitation": "سكن",
        "commercial": "تجاري",
        "terrain_nu": "أرض عارية",
        "agricole": "فلاحي",
    }

    results = {
        "sale_price": _round(price),
        "purchase_price": _round(purchase_price),
        "acquisition_fees": _round(acquisition_fees),
        "years_held": years_held,
        "is_primary_residence": is_primary_residence,
        "property_kind": property_kind,
        "capital_gain": _round(profit),
        "tpi_abatement_pct": float(abatement_pct),
        "tpi_taxable_gain": _round(taxable_gain),
        "tpi_exempt": tpi_exempt_primary or abatement_pct >= Decimal("100"),
        "registration_fees": _round(registration),
        "registration_rate_pct": float(reg_rate * 100),
        "conservation_fees": _round(conservation),
        "adoul_fees": _round(adoul_fees),
        "formalities_fees": _round(formalities),
        "tpi": _round(tpi),
        "total_fees": _round(total),
        "lines": [
            {"label_fr": "Droits d'enregistrement", "label_ar": "رسوم التسجيل", "amount": _round(registration)},
            {"label_fr": "Conservation foncière (ANCFCC)", "label_ar": "المحافظة العقارية", "amount": _round(conservation)},
            {"label_fr": "Honoraires adoul", "label_ar": "أتعاب العدل", "amount": _round(adoul_fees)},
            {"label_fr": "Formalités / timbre", "label_ar": "المصاريف الإدارية والطابع", "amount": _round(formalities)},
            {"label_fr": "TPI (plus-value)", "label_ar": "الضريبة على الأرباح العقارية", "amount": _round(tpi)},
        ],
    }
    legal_proof = {
        "summary": _legal_summary("sale"),
        "steps": [
            {"step": "1", "title_fr": "Prix de vente", "title_ar": "ثمن البيع",
             "detail_fr": f"{_round(price):,.2f} MAD — {kind_fr.get(property_kind, property_kind)}",
             "detail_ar": f"{_round(price):,.2f} درهم — {kind_ar.get(property_kind, property_kind)}"},
            {"step": "2", "title_fr": "Acquisition + frais", "title_ar": "الشراء والمصاريف",
             "detail_fr": f"{_round(purchase_price + acquisition_fees):,.2f} MAD — {years_held} an(s) de détention",
             "detail_ar": f"{_round(purchase_price + acquisition_fees):,.2f} درهم — {years_held} سنة حيازة"},
            {"step": "3", "title_fr": "Plus-value", "title_ar": "الربح العقاري",
             "detail_fr": f"{_round(profit):,.2f} MAD", "detail_ar": f"{_round(profit):,.2f} درهم"},
            {"step": "4", "title_fr": "TPI (CGI art. 91-92)", "title_ar": "الضريبة على الأرباح العقارية",
             "detail_fr": tpi_reason_fr, "detail_ar": tpi_reason_ar},
            {"step": "5", "title_fr": "Total frais estimés", "title_ar": "إجمالي الرسوم",
             "detail_fr": f"{_round(total):,.2f} MAD", "detail_ar": f"{_round(total):,.2f} درهم"},
        ],
    }
    return {"results": results, "legal_proof": legal_proof, "total_amount": _round(total)}


def calculate_donation(data: dict) -> dict[str, Any]:
    value = Decimal(str(data.get("donation_value", 0)))
    relationship = data.get("relationship", "child")
    asset_kind = data.get("asset_kind", "immovable")
    is_immovable = asset_kind == "immovable" or bool(data.get("is_immovable", True))

    rate = DONATION_REGISTRATION_RATES.get(relationship, Decimal("0.06"))
    registration = value * rate
    conservation = value * CONSERVATION_RATE if is_immovable else Decimal("0")
    adoul_fees = adoul_fees_donation(value)
    total = registration + conservation + adoul_fees

    rel_fr = {
        "spouse": "Conjoint(e)",
        "child": "Enfant (descendant)",
        "grandchild": "Petit-enfant",
        "parent": "Parent (ascendant)",
        "sibling": "Frère / Sœur",
        "collateral": "Collatéral",
        "other": "Sans lien de parenté",
    }
    rel_ar = {
        "spouse": "الزوج/الزوجة",
        "child": "الابن/الابنة",
        "grandchild": "الحفيد/الحفيدة",
        "parent": "الأب/الأم",
        "sibling": "الأخ/الأخت",
        "collateral": "قرابة جانبية",
        "other": "بلا قرابة",
    }
    asset_fr = {"immovable": "Bien immobilier (عقار)", "movable": "Bien mobilier (منقول)"}
    asset_ar = {"immovable": "عقار", "movable": "منقول"}

    results = {
        "donation_value": _round(value),
        "relationship": relationship,
        "asset_kind": asset_kind,
        "is_immovable": is_immovable,
        "registration_rate_pct": float(rate * 100),
        "registration_fees": _round(registration),
        "conservation_fees": _round(conservation),
        "adoul_fees": _round(adoul_fees),
        "total_fees": _round(total),
        "lines": [
            {"label_fr": "Droits d'enregistrement (hiba)", "label_ar": "رسوم تسجيل الهبة", "amount": _round(registration)},
            *(
                [{"label_fr": "Conservation foncière", "label_ar": "المحافظة العقارية", "amount": _round(conservation)}]
                if is_immovable
                else []
            ),
            {"label_fr": "Honoraires adoul", "label_ar": "أتعاب العدل", "amount": _round(adoul_fees)},
        ],
    }
    refs = LEGAL_REFS["donation"]
    legal_proof = {
        "summary": _legal_summary("donation"),
        "steps": [
            {"step": "1", "title_fr": "Valeur du bien", "title_ar": "قيمة العين الموهوبة",
             "detail_fr": f"{_round(value):,.2f} MAD — {asset_fr.get(asset_kind, asset_kind)}",
             "detail_ar": f"{_round(value):,.2f} درهم — {asset_ar.get(asset_kind, asset_kind)}"},
            {"step": "2", "title_fr": "Lien de parenté", "title_ar": "صلة القرابة",
             "detail_fr": rel_fr.get(relationship, relationship),
             "detail_ar": rel_ar.get(relationship, relationship)},
            {"step": "3", "title_fr": "Moudawana — Livre III", "title_ar": "مدونة الأسرة — الكتاب الثالث",
             "detail_fr": f"{refs['moudawana_fr']} — acceptation, capacité, réserve héréditaire à vérifier",
             "detail_ar": f"{refs['moudawana_ar']} — القبول والأهلية والاحتياطي الفرائضي"},
            {"step": "4", "title_fr": "Enregistrement", "title_ar": "التسجيل",
             "detail_fr": f"Taux {float(rate * 100)} % — {refs['cgi_fr']}",
             "detail_ar": f"نسبة {float(rate * 100)}% — {refs['cgi_ar']}"},
        ],
    }
    return {"results": results, "legal_proof": legal_proof, "total_amount": _round(total)}


def calculate_procuration(data: dict) -> dict[str, Any]:
    proc_type = data.get("procuration_type", "general")
    duration_years = int(data.get("duration_years", 1) or 1)
    property_value = Decimal(str(data.get("property_value", 0) or 0))
    is_revocable = data.get("is_revocable", True)

    adoul_fees = procuration_adoul_fee(proc_type, duration_years, property_value)
    registration = PROCURATION_STAMP
    total = adoul_fees + registration

    type_fr = {
        "general": "Générale (وكالة عامة)",
        "special": "Spéciale (وكالة خاصة)",
        "sale": "Vente immobilière",
        "purchase": "Achat immobilier",
        "succession": "Règlement succession / تركة",
        "representation": "Représentation judiciaire",
    }
    type_ar = {
        "general": "وكالة عامة",
        "special": "وكالة خاصة",
        "sale": "بيع عقار",
        "purchase": "شراء عقار",
        "succession": "تسوية تركة",
        "representation": "تمثيل قضائي",
    }

    duration_warning_fr = ""
    duration_warning_ar = ""
    if duration_years > 5:
        duration_warning_fr = "Durée > 5 ans : vérifier limites du mandat (Code des obligations art. 945 et suiv.)"
        duration_warning_ar = "مدة تتجاوز 5 سنوات: مراجعة حدود الوكالة"

    results = {
        "procuration_type": proc_type,
        "duration_years": duration_years,
        "property_value": _round(property_value),
        "is_revocable": is_revocable,
        "adoul_fees": _round(adoul_fees),
        "registration_fees": _round(registration),
        "total_fees": _round(total),
        "duration_warning_fr": duration_warning_fr,
        "duration_warning_ar": duration_warning_ar,
        "lines": [
            {"label_fr": "Honoraires adoul", "label_ar": "أتعاب العدل", "amount": _round(adoul_fees)},
            {"label_fr": "Timbre / frais administratifs", "label_ar": "الطابع والمصاريف الإدارية", "amount": _round(registration)},
        ],
    }
    refs = LEGAL_REFS["procuration"]
    legal_proof = {
        "summary": _legal_summary("procuration"),
        "steps": [
            {"step": "1", "title_fr": "Type de procuration", "title_ar": "نوع الوكالة",
             "detail_fr": type_fr.get(proc_type, proc_type),
             "detail_ar": type_ar.get(proc_type, proc_type)},
            {"step": "2", "title_fr": "Durée", "title_ar": "المدة",
             "detail_fr": f"{duration_years} an(s)" + (f" — {duration_warning_fr}" if duration_warning_fr else ""),
             "detail_ar": f"{duration_years} سنة" + (f" — {duration_warning_ar}" if duration_warning_ar else "")},
            {"step": "3", "title_fr": "Référence légale", "title_ar": "المرجع القانوني",
             "detail_fr": f"{refs['dahir_fr']} — {refs['civil_fr']}",
             "detail_ar": f"{refs['dahir_ar']} — {refs['civil_ar']}"},
        ],
    }
    return {"results": results, "legal_proof": legal_proof, "total_amount": _round(total)}


def calculate_marriage(data: dict) -> dict[str, Any]:
    # mahr_immediate alias de mahr_prompt (rétrocompatibilité)
    mahr_immediate = Decimal(
        str(data.get("mahr_immediate", data.get("mahr_prompt", 0)) or 0)
    )
    mahr_deferred = Decimal(str(data.get("mahr_deferred", 0) or 0))
    gold_grams = Decimal(str(data.get("gold_grams", 0) or 0))
    gold_price_per_gram = Decimal(str(data.get("gold_price_per_gram", 0) or 0))
    furniture_value = Decimal(str(data.get("furniture_value", 0) or 0))
    marriage_order = data.get("marriage_order", "first")
    is_additional = marriage_order == "additional"

    gold_value = gold_grams * gold_price_per_gram
    total_mahr = mahr_immediate + mahr_deferred + gold_value + furniture_value

    adoul_fees = adoul_fees_marriage(total_mahr, is_additional_marriage=is_additional)
    registration = MARRIAGE_REGISTRATION
    total = adoul_fees + registration

    order_fr = {"first": "Premier mariage", "additional": "Mariage supplémentaire (polygamie — art. 41-47 Moudawana)"}
    order_ar = {"first": "زواج أول", "additional": "زواج إضافي (تعدد — م.41-47 مدونة الأسرة)"}

    results = {
        "mahr_immediate": _round(mahr_immediate),
        "mahr_prompt": _round(mahr_immediate),
        "mahr_deferred": _round(mahr_deferred),
        "gold_grams": float(gold_grams),
        "gold_price_per_gram": _round(gold_price_per_gram),
        "gold_value": _round(gold_value),
        "furniture_value": _round(furniture_value),
        "marriage_order": marriage_order,
        "total_mahr": _round(total_mahr),
        "adoul_fees": _round(adoul_fees),
        "registration_fees": _round(registration),
        "total_fees": _round(total),
        "lines": [
            {"label_fr": "Sadaq (mahr) — total", "label_ar": "الصداق — الإجمالي", "amount": _round(total_mahr)},
            {"label_fr": "Honoraires adoul", "label_ar": "أتعاب العدل", "amount": _round(adoul_fees)},
            {"label_fr": "Frais d'enregistrement acte", "label_ar": "رسوم تسجيل عقد الزواج", "amount": _round(registration)},
        ],
    }
    refs = LEGAL_REFS["marriage"]
    legal_proof = {
        "summary": _legal_summary("marriage"),
        "steps": [
            {"step": "1", "title_fr": "Sadaq immédiat (الحال / المعجل)", "title_ar": "الصداق الحال (المعجل)",
             "detail_fr": f"{_round(mahr_immediate):,.2f} MAD — versé à la conclusion du contrat",
             "detail_ar": f"{_round(mahr_immediate):,.2f} درهم — يُؤدى عند العقد"},
            {"step": "2", "title_fr": "Sadaq différé (المؤجل)", "title_ar": "الصداق المؤجل",
             "detail_fr": f"{_round(mahr_deferred):,.2f} MAD", "detail_ar": f"{_round(mahr_deferred):,.2f} درهم"},
            {"step": "3", "title_fr": "Or et mobilier du foyer", "title_ar": "الذهب والأثاث",
             "detail_fr": f"Or {float(gold_grams)} g + mobilier {_round(furniture_value):,.2f} MAD",
             "detail_ar": f"ذهب {float(gold_grams)} غ + أثاث {_round(furniture_value):,.2f} درهم"},
            {"step": "4", "title_fr": "Nature du mariage", "title_ar": "نوع الزواج",
             "detail_fr": order_fr.get(marriage_order, marriage_order),
             "detail_ar": order_ar.get(marriage_order, marriage_order)},
            {"step": "5", "title_fr": "Références", "title_ar": "المراجع",
             "detail_fr": f"{refs['moudawana_fr']} — {refs['dahir_fr']}",
             "detail_ar": f"{refs['moudawana_ar']} — {refs['dahir_ar']}"},
        ],
    }
    return {"results": results, "legal_proof": legal_proof, "total_amount": _round(total)}


def calculate_other(data: dict) -> dict[str, Any]:
    base_amount = Decimal(str(data.get("base_amount", 0)))
    fee_rate = Decimal(str(data.get("fee_rate", 0))) / Decimal("100")
    fixed_fee = Decimal(str(data.get("fixed_fee", 0)))
    computed = base_amount * fee_rate + fixed_fee

    results = {
        "base_amount": _round(base_amount),
        "fee_rate_pct": float(fee_rate * 100),
        "fixed_fee": _round(fixed_fee),
        "total_fees": _round(computed),
        "description": data.get("description", ""),
        "lines": [
            {"label_fr": "Montant de base", "label_ar": "المبلغ الأساس", "amount": _round(base_amount)},
            {"label_fr": "Frais calculés", "label_ar": "الرسوم المحسوبة", "amount": _round(computed)},
        ],
    }
    legal_proof = {
        "summary": _legal_summary("other"),
        "steps": [
            {"step": "1", "title_fr": "Calcul personnalisé", "title_ar": "حساب مخصص",
             "detail_fr": data.get("description", "Acte divers"),
             "detail_ar": data.get("description_ar", "acte divers")},
        ],
    }
    return {"results": results, "legal_proof": legal_proof, "total_amount": _round(computed)}


from app.services.wasiyyah_service import calculate_wasiyyah as _calculate_wasiyyah


def calculate_wasiyyah(data: dict) -> dict[str, Any]:
    return _calculate_wasiyyah(data)


CALCULATORS = {
    "sale": calculate_sale,
    "donation": calculate_donation,
    "procuration": calculate_procuration,
    "marriage": calculate_marriage,
    "wasiyyah": calculate_wasiyyah,
    "other": calculate_other,
}


class ActCalculationService:
    @staticmethod
    def calculate(act_type: str, data: dict) -> dict[str, Any]:
        fn = CALCULATORS.get(act_type)
        if not fn:
            raise ValueError(f"Type de calcul inconnu: {act_type}")
        payload = fn(data)
        return {"type": act_type, "inputs": data, **payload}
