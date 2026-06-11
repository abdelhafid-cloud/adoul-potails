"""Barèmes et références indicatifs — droit marocain (Moudawana, CGI, dahir des adouls)."""

from __future__ import annotations

from decimal import Decimal

# Droits d'enregistrement — vente immobilière (CGI / pratique ANCFCC)
SALE_REGISTRATION_RATES = {
    "habitation": Decimal("0.04"),
    "commercial": Decimal("0.05"),
    "terrain_nu": Decimal("0.05"),
    "agricole": Decimal("0.04"),
}

# Conservation foncière (indicatif)
CONSERVATION_RATE = Decimal("0.015")

# TPI — taux normal (CGI art. 91 et suiv.)
TPI_RATE = Decimal("0.20")

# Donations — mutation à titre gratuit (barème indicatif CGI / pratique)
DONATION_REGISTRATION_RATES = {
    "spouse": Decimal("0.025"),
    "child": Decimal("0.025"),
    "grandchild": Decimal("0.025"),
    "parent": Decimal("0.025"),
    "sibling": Decimal("0.05"),
    "collateral": Decimal("0.06"),
    "other": Decimal("0.06"),
}

# Honoraires adoul indicatifs (dahir des adouls 1-57-223 — ordre de grandeur)
ADOUL_FEE_MIN_SALE = Decimal("2000")
ADOUL_FEE_RATE_SALE = Decimal("0.01")
ADOUL_FEE_MIN_DONATION = Decimal("1500")
ADOUL_FEE_RATE_DONATION = Decimal("0.005")
ADOUL_FEE_MARRIAGE_BASE = Decimal("800")
ADOUL_FEE_MARRIAGE_RATE = Decimal("0.005")

PROCURATION_BASE_FEES = {
    "general": Decimal("400"),
    "special": Decimal("600"),
    "sale": Decimal("900"),
    "purchase": Decimal("900"),
    "succession": Decimal("1200"),
    "representation": Decimal("500"),
}

MARRIAGE_REGISTRATION = Decimal("350")
PROCURATION_STAMP = Decimal("200")

LEGAL_REFS = {
    "wasiyyah": {
        "quran_fr": "Sourate Al-Baqara (2:180-182) — الوصية لا تتجاوز الثلث لغير الوارث",
        "quran_ar": "سورة البقرة (2:180-182)",
        "moudawana_fr": "Moudawana — art. 328 à 334 (dispositions testamentaires)",
        "moudawana_ar": "مدونة الأسرة — المواد 328 إلى 334",
    },
    "marriage": {
        "moudawana_fr": "Moudawana — Livre II : mariage, sadaq (mahr) art. 49 et suiv.",
        "moudawana_ar": "مدونة الأسرة — الكتاب الثاني: الزواج والصداق (م.49 وما يليها)",
        "dahir_fr": "Dahir n° 1-57-223 relatif au statut des adouls",
        "dahir_ar": "الظهير 1-57-223 المتعلق بمهنة العدول",
    },
    "donation": {
        "moudawana_fr": "Moudawana — Livre III : donations (hiba) art. 336 à 362",
        "moudawana_ar": "مدونة الأسرة — الكتاب الثالث: الهبة (م.336 إلى 362)",
        "cgi_fr": "CGI — droits de mutation à titre gratuit (enregistrement)",
        "cgi_ar": "المدونة العامة للضرائب — رسوم التسجيل على الهبات",
    },
    "sale": {
        "cgi_fr": "CGI — TPI (art. 91-92), droits d'enregistrement, conservation foncière",
        "cgi_ar": "المدونة العامة للضرائب — الضريبة على الأرباح العقارية والتسجيل",
        "ancfcc_fr": "ANCFCC — formalités de publicité foncière",
        "ancfcc_ar": "الوكالة الوطنية للمحافظة العقارية والمسح",
    },
    "procuration": {
        "dahir_fr": "Dahir 1-57-223 — actes de procuration (وكالة) devant adoul",
        "dahir_ar": "الظهير 1-57-223 — محاضر الوكالة أمام العدول",
        "civil_fr": "Code des obligations et contrats — mandat (وكالة)",
        "civil_ar": "قانون الالتزامات والعقود — الوكالة",
    },
}


def tpi_abatement_pct(years_held: int) -> Decimal:
    """Abattement linéaire CGI : 10 %/an à partir de la 5e année (plafond 100 %)."""
    if years_held < 5:
        return Decimal("0")
    return min(Decimal(str((years_held - 4) * 10)), Decimal("100"))


def adoul_fees_sale(price: Decimal) -> Decimal:
    return max(price * ADOUL_FEE_RATE_SALE, ADOUL_FEE_MIN_SALE)


def adoul_fees_donation(value: Decimal) -> Decimal:
    return max(value * ADOUL_FEE_RATE_DONATION, ADOUL_FEE_MIN_DONATION)


def adoul_fees_marriage(total_mahr: Decimal, is_additional_marriage: bool = False) -> Decimal:
    base = adoul_fees_marriage_base(total_mahr)
    if is_additional_marriage:
        base += Decimal("400")
    return base


def adoul_fees_marriage_base(total_mahr: Decimal) -> Decimal:
    return max(ADOUL_FEE_MARRIAGE_BASE + total_mahr * ADOUL_FEE_MARRIAGE_RATE, Decimal("1200"))


def procuration_adoul_fee(proc_type: str, duration_years: int, property_value: Decimal = Decimal("0")) -> Decimal:
    base = PROCURATION_BASE_FEES.get(proc_type, Decimal("400"))
    if proc_type in ("sale", "purchase") and property_value > 0:
        base += min(property_value * Decimal("0.002"), Decimal("3000"))
    duration_extra = max(0, duration_years - 1) * Decimal("150")
    return base + duration_extra
