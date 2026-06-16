"""
Moteur الفرائض — école Maliki / Moudawana marocaine.

Phases : analyse → fard → hajb implicite → asaba → 'awl → radd → détails.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from typing import Any

from app.constants.heir_types import (
    DESCENDANT_TYPES,
    GROUP_FARD_TYPES,
    HEIR_TYPE_REGISTRY,
    UTERINE_TYPES,
    gender_label_ar,
    gender_label_fr,
    heir_gender,
    normalize_heir_type,
)

DIRECT_CHILD_TYPES = frozenset({"son", "daughter"})
FULL_SIBLING_TYPES = frozenset({"full_brother", "brother", "full_sister", "sister"})
CONSANGUINE_TYPES = frozenset({"consanguine_brother", "consanguine_sister"})
SON_LINE_DESC = frozenset({"grandson_from_son", "granddaughter_from_son"})
DAUGHTER_LINE_DESC = frozenset({"grandson_from_daughter", "granddaughter_from_daughter"})
from app.services.inheritance_legal import legal_basis_for_heir
from app.services.inheritance_rules import EXCLUSION_REASONS, heir_display_name, heir_display_name_ar

DIRECT_SON = frozenset({"son"})
DIRECT_DAUGHTER = frozenset({"daughter"})
MALE_DESC_FROM_SON = frozenset({"son", "grandson_from_son"})
FEMALE_DESC_FROM_SON = frozenset({"daughter", "granddaughter_from_son"})
FULL_BROTHER = frozenset({"full_brother", "brother"})
FULL_SISTER = frozenset({"full_sister", "sister"})
CONSANGUINE_BROTHER = frozenset({"consanguine_brother"})
CONSANGUINE_SISTER = frozenset({"consanguine_sister"})
FULL_PATERNAL_UNCLE = frozenset({"full_paternal_uncle"})
FULL_PATERNAL_AUNT = frozenset({"full_paternal_aunt"})
CONSANGUINE_PATERNAL_UNCLE = frozenset({"consanguine_paternal_uncle"})
CONSANGUINE_PATERNAL_AUNT = frozenset({"consanguine_paternal_aunt"})
SON_FULL_BROTHER = frozenset({"son_full_brother"})
SON_CONSANGUINE_BROTHER = frozenset({"son_consanguine_brother"})
SON_FULL_PATERNAL_UNCLE = frozenset({"son_full_paternal_uncle"})
SON_CONSANGUINE_PATERNAL_UNCLE = frozenset({"son_consanguine_paternal_uncle"})
SON_SON_PATERNAL_UNCLE = frozenset({"son_son_paternal_uncle"})
COUSIN_PATERNAL_FEMALE = frozenset({
    "daughter_full_paternal_uncle", "daughter_consanguine_paternal_uncle",
})
COUSIN_MATERNAL = frozenset({"son_maternal_uncle", "daughter_maternal_uncle"})


def _count(heirs: list[dict], types: frozenset[str]) -> int:
    return sum(int(h.get("count", 1)) for h in heirs if h.get("type") in types)


def _normalize(heirs: list[dict]) -> list[dict]:
    return [{**h, "type": normalize_heir_type(h.get("type", "other"))} for h in heirs]


def _money(net: Decimal, frac: Fraction) -> float:
    return float((net * Decimal(frac.numerator) / Decimal(frac.denominator)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    ))


def _pct(frac: Fraction) -> float:
    return round(float(frac) * 100, 4)


@dataclass
class ShareSlot:
    heir_type: str
    name: str
    count: int
    fraction: Fraction = Fraction(0)
    is_fard: bool = True
    is_asaba: bool = False
    blocked: bool = False
    block_reason: str | None = None
    custom: bool = False


@dataclass
class FaraidContext:
    heirs: list[dict]
    has_son: bool = False
    has_daughter: bool = False
    has_male_descendant: bool = False
    has_descendant: bool = False
    has_father: bool = False
    has_mother: bool = False
    has_husband: bool = False
    has_wife: bool = False
    wife_count: int = 0
    has_grandfather: bool = False
    full_brothers: int = 0
    full_sisters: int = 0
    consanguine_brothers: int = 0
    consanguine_sisters: int = 0
    uterine_siblings: int = 0
    sibling_count_for_mother: int = 0
    full_paternal_uncles: int = 0
    full_paternal_aunts: int = 0
    consanguine_paternal_uncles: int = 0
    consanguine_paternal_aunts: int = 0
    son_full_paternal_uncles: int = 0
    son_consanguine_paternal_uncles: int = 0

    @classmethod
    def from_heirs(cls, heirs: list[dict]) -> FaraidContext:
        ctx = cls(heirs=heirs)
        ctx.has_son = _count(heirs, DIRECT_SON) > 0
        ctx.has_daughter = _count(heirs, DIRECT_DAUGHTER) > 0
        ctx.has_male_descendant = _count(heirs, MALE_DESC_FROM_SON) > 0
        ctx.has_descendant = _count(heirs, DESCENDANT_TYPES) > 0
        ctx.has_father = _count(heirs, frozenset({"father"})) > 0
        ctx.has_mother = _count(heirs, frozenset({"mother"})) > 0
        ctx.has_husband = _count(heirs, frozenset({"husband"})) > 0
        ctx.has_wife = _count(heirs, frozenset({"wife"})) > 0
        ctx.wife_count = _count(heirs, frozenset({"wife"}))
        ctx.has_grandfather = _count(heirs, frozenset({"paternal_grandfather"})) > 0
        ctx.full_brothers = _count(heirs, FULL_BROTHER)
        ctx.full_sisters = _count(heirs, FULL_SISTER)
        ctx.consanguine_brothers = _count(heirs, CONSANGUINE_BROTHER)
        ctx.consanguine_sisters = _count(heirs, CONSANGUINE_SISTER)
        ctx.uterine_siblings = _count(heirs, UTERINE_TYPES)
        ctx.sibling_count_for_mother = (
            ctx.full_brothers + ctx.full_sisters
            + ctx.consanguine_brothers + ctx.consanguine_sisters
        )
        ctx.full_paternal_uncles = _count(heirs, FULL_PATERNAL_UNCLE)
        ctx.full_paternal_aunts = _count(heirs, FULL_PATERNAL_AUNT)
        ctx.consanguine_paternal_uncles = _count(heirs, CONSANGUINE_PATERNAL_UNCLE)
        ctx.consanguine_paternal_aunts = _count(heirs, CONSANGUINE_PATERNAL_AUNT)
        ctx.son_full_paternal_uncles = _count(heirs, SON_FULL_PATERNAL_UNCLE)
        ctx.son_consanguine_paternal_uncles = _count(heirs, SON_CONSANGUINE_PATERNAL_UNCLE)
        return ctx


class FaraidEngine:
    @staticmethod
    def compute(heirs: list[dict], net_value: Decimal) -> dict[str, Any]:
        heirs = _normalize(heirs)
        if not heirs or net_value <= 0:
            return FaraidEngine._empty()

        ctx = FaraidContext.from_heirs(heirs)
        slots: list[ShareSlot] = []
        adjustments: list[dict[str, str]] = []

        # Parts personnalisées
        for h in heirs:
            if h.get("custom_share") is not None:
                frac = Fraction(str(h.get("custom_share"))).limit_denominator(10000)
                slots.append(ShareSlot(
                    heir_type=h["type"], name=h.get("name", h["type"]),
                    count=int(h.get("count", 1)), fraction=frac * int(h.get("count", 1)),
                    is_fard=False, custom=True,
                ))

        # --- FARD ---
        fard_slots = FaraidEngine._compute_fard(ctx, heirs)
        slots.extend(fard_slots)

        total_fard = sum(s.fraction for s in fard_slots)
        remaining = Fraction(1) - total_fard

        # --- ASABA (عصبة) ---
        asaba_slots, remaining = FaraidEngine._compute_asaba(ctx, heirs, remaining, fard_slots)
        slots.extend(asaba_slots)

        # Fusionner par type (sauf conjoints comptés individuellement)
        merged = FaraidEngine._merge_slots(slots)
        total = sum(s.fraction for s in merged if not s.blocked)

        # --- 'AWL (العول) ---
        if total > Fraction(1) + Fraction(1, 10000):
            factor = Fraction(1) / total
            for s in merged:
                if not s.blocked and s.fraction > 0:
                    s.fraction *= factor
            adjustments.append({
                "type": "awl",
                "title_fr": "Correction des parts — 'Awl (العول)",
                "title_ar": "تصحيح الحصص — العول",
                "detail_fr": (
                    f"La somme des parts ({_pct(total)} %) dépasse 100 %. "
                    "Réduction proportionnelle de toutes les parts (العول)."
                ),
                "detail_ar": (
                    f"مجموع الحصص ({_pct(total)} %) يتجاوز 100%. "
                    "تنقيص الحصص بالتناسب (العول)."
                ),
            })
            total = Fraction(1)

        # --- RADD (الرد) ---
        elif total < Fraction(1) - Fraction(1, 10000) and FaraidEngine._can_radd(merged):
            surplus = Fraction(1) - total
            radd_targets = [s for s in merged if s.is_fard and not s.blocked and s.fraction > 0
                            and s.heir_type not in ("husband", "wife")]
            radd_total = sum(s.fraction for s in radd_targets)
            if radd_total > 0:
                for s in radd_targets:
                    s.fraction += surplus * (s.fraction / radd_total)
                adjustments.append({
                    "type": "radd",
                    "title_fr": "Restitution — Radd (الرد)",
                    "title_ar": "الرد — إرجاع الباقي",
                    "detail_fr": (
                        f"Surplus de {_pct(surplus)} % redistribué aux héritiers à part fixe "
                        "(hors conjoint), selon le Maliki."
                    ),
                    "detail_ar": (
                        f"تم توزيع فائض {_pct(surplus)} % على أصحاب الفروض "
                        "(باستثناء الزوج/الزوجة) وفق المذهب المالكي."
                    ),
                })
                total = Fraction(1)

        calc_meta = {
            "total_shares_pct": _pct(total),
            "has_awl": any(a["type"] == "awl" for a in adjustments),
            "has_radd": any(a["type"] == "radd" for a in adjustments),
        }
        distribution, heir_details = FaraidEngine._build_output(
            merged, heirs, ctx, net_value, adjustments, calc_meta,
        )

        return {
            "distribution": distribution,
            "heir_details": heir_details,
            "adjustments": adjustments,
            "calculation_meta": calc_meta,
        }

    @staticmethod
    def _empty() -> dict:
        return {
            "distribution": [], "heir_details": [], "adjustments": [],
            "calculation_meta": {"total_shares_pct": 0, "has_awl": False, "has_radd": False},
        }

    @staticmethod
    def _compute_fard(ctx: FaraidContext, heirs: list[dict]) -> list[ShareSlot]:
        slots: list[ShareSlot] = []

        # Époux / épouse
        if ctx.has_husband:
            frac = Fraction(1, 4) if ctx.has_descendant else Fraction(1, 2)
            slots.append(ShareSlot("husband", "Époux", 1, frac))
        if ctx.has_wife:
            frac = Fraction(1, 8) if ctx.has_descendant else Fraction(1, 4)
            per_wife = frac / ctx.wife_count if ctx.wife_count else frac
            for i in range(ctx.wife_count):
                slots.append(ShareSlot("wife", f"Épouse {i + 1}", 1, per_wife))

        # Mère
        if ctx.has_mother:
            if ctx.has_descendant or ctx.sibling_count_for_mother >= 2:
                slots.append(ShareSlot("mother", "Mère", 1, Fraction(1, 6)))
            else:
                slots.append(ShareSlot("mother", "Mère", 1, Fraction(1, 3)))

        # Père (1/6 avec descendance)
        if ctx.has_father and ctx.has_descendant:
            slots.append(ShareSlot("father", "Père", 1, Fraction(1, 6)))

        # Grand-père paternel (1/6 avec descendance, si pas de père)
        if ctx.has_grandfather and not ctx.has_father and ctx.has_descendant:
            slots.append(ShareSlot("paternal_grandfather", "Grand-père paternel", 1, Fraction(1, 6)))

        # Grand-mères (1/6 partagé si pas bloquées)
        gm_slots = []
        if _count(heirs, frozenset({"maternal_grandmother"})) and not ctx.has_mother:
            gm_slots.append(ShareSlot("maternal_grandmother", "Grand-mère maternelle", 1, Fraction(1, 6)))
        if _count(heirs, frozenset({"paternal_grandmother"})) and not ctx.has_father:
            gm_slots.append(ShareSlot("paternal_grandmother", "Grand-mère paternelle", 1, Fraction(1, 6)))
        if len(gm_slots) == 2:
            for g in gm_slots:
                g.fraction = Fraction(1, 12)
        slots.extend(gm_slots)

        # Filles — fard
        daughters = _count(heirs, DIRECT_DAUGHTER)
        if daughters == 1 and not ctx.has_son:
            slots.append(ShareSlot("daughter", "Fille", 1, Fraction(1, 2)))
        elif daughters >= 2 and not ctx.has_son:
            slots.append(ShareSlot("daughter", "Filles", daughters, Fraction(2, 3)))

        # Sœur germaine — fard (pas de frère germain, pas de père/fils, pas de grand-père)
        if (ctx.full_sisters and not ctx.full_brothers and not ctx.has_father
                and not ctx.has_son and not ctx.has_male_descendant and not ctx.has_grandfather):
            if ctx.full_sisters == 1 and not ctx.has_daughter:
                slots.append(ShareSlot("full_sister", "Sœur germaine", 1, Fraction(1, 2)))
            elif ctx.full_sisters >= 2 and not ctx.has_daughter:
                slots.append(ShareSlot("full_sister", "Sœurs germaines", ctx.full_sisters, Fraction(2, 3)))
            elif ctx.has_daughter and ctx.full_sisters >= 1:
                # Sœur avec fille(s) : 1/6 complémentaire
                slots.append(ShareSlot("full_sister", "Sœur(s) germaine(s)", ctx.full_sisters, Fraction(1, 6)))

        # Sœur consanguine — fard
        if (ctx.consanguine_sisters and not ctx.consanguine_brothers
                and not ctx.full_brothers and not ctx.full_sisters
                and not ctx.has_father and not ctx.has_son and not ctx.has_male_descendant
                and not ctx.has_grandfather):
            if ctx.consanguine_sisters == 1 and not ctx.has_daughter:
                slots.append(ShareSlot("consanguine_sister", "Sœur consanguine", 1, Fraction(1, 2)))
            elif ctx.consanguine_sisters >= 2 and not ctx.has_daughter:
                slots.append(ShareSlot("consanguine_sister", "Sœurs consanguines", ctx.consanguine_sisters, Fraction(2, 3)))
            elif ctx.has_daughter and ctx.consanguine_sisters >= 1:
                slots.append(ShareSlot("consanguine_sister", "Sœur(s) consanguine(s)", ctx.consanguine_sisters, Fraction(1, 6)))

        # Frères/sœurs utérins — 1/3 partagé
        if (ctx.uterine_siblings and not ctx.has_son and not ctx.has_father
                and not ctx.has_male_descendant and not ctx.has_descendant):
            uterine_heirs = [h for h in heirs if h.get("type") in UTERINE_TYPES]
            total_u = sum(int(h.get("count", 1)) for h in uterine_heirs)
            third = Fraction(1, 3)
            for h in uterine_heirs:
                c = int(h.get("count", 1))
                slots.append(ShareSlot(
                    h["type"], h.get("name", h["type"]), c,
                    third * Fraction(c, total_u),
                ))

        return slots

    @staticmethod
    def _compute_asaba(
        ctx: FaraidContext,
        heirs: list[dict],
        remaining: Fraction,
        fard_slots: list[ShareSlot],
    ) -> tuple[list[ShareSlot], Fraction]:
        if remaining <= Fraction(0):
            return [], remaining
        slots: list[ShareSlot] = []

        # 1. Fils / filles — partage du reste (2:1)
        if ctx.has_son:
            slots = FaraidEngine._ratio_asaba(
                heirs, remaining,
                male_types=DIRECT_SON, female_types=DIRECT_DAUGHTER,
                male_units=_count(heirs, DIRECT_SON),
                female_units=_count(heirs, DIRECT_DAUGHTER),
            )
            if slots:
                return slots, Fraction(0)

        # 2. Petits-enfants du fils (si pas de fils)
        if ctx.has_male_descendant or _count(heirs, FEMALE_DESC_FROM_SON):
            male_units = _count(heirs, frozenset({"grandson_from_son"}))
            female_units = _count(heirs, frozenset({"granddaughter_from_son"}))
            if male_units or female_units:
                slots = FaraidEngine._ratio_asaba(
                    heirs, remaining,
                    male_types=frozenset({"grandson_from_son"}),
                    female_types=frozenset({"granddaughter_from_son"}),
                    male_units=male_units, female_units=female_units,
                )
                return slots, Fraction(0)

        # 3. Père residuaire (filles seules, ou sans descendance mâle)
        if ctx.has_father and remaining > Fraction(0):
            if not ctx.has_son and not ctx.has_male_descendant:
                slots.append(ShareSlot(
                    "father", "Père", 1, remaining, is_fard=False, is_asaba=True,
                ))
                return slots, Fraction(0)

        # 4. Grand-père residuaire (sans père ni descendance)
        if ctx.has_grandfather and not ctx.has_father and not ctx.has_descendant and remaining > 0:
            slots.append(ShareSlot(
                "paternal_grandfather", "Grand-père paternel", 1, remaining, is_asaba=True,
            ))
            return slots, Fraction(0)

        # 5. Frères/sœurs germains (عصبة — uniquement s'il y a un frère)
        if ctx.full_brothers and not ctx.has_son and not ctx.has_father and not ctx.has_grandfather:
            slots = FaraidEngine._ratio_asaba(
                heirs, remaining,
                male_types=FULL_BROTHER, female_types=FULL_SISTER,
                male_units=ctx.full_brothers, female_units=ctx.full_sisters,
            )
            return slots, Fraction(0)

        # 6. Frères/sœurs consanguins (عصبة — uniquement s'il y a un frère)
        if ctx.consanguine_brothers and not ctx.has_son and not ctx.has_father and not ctx.has_grandfather:
            if ctx.full_brothers == 0:
                slots = FaraidEngine._ratio_asaba(
                    heirs, remaining,
                    male_types=CONSANGUINE_BROTHER, female_types=CONSANGUINE_SISTER,
                    male_units=ctx.consanguine_brothers, female_units=ctx.consanguine_sisters,
                )
                return slots, Fraction(0)

        # 7. عصبة بعيدة — neveux, oncles, cousins (ordre malikite)
        if ctx.has_son or ctx.has_father or ctx.has_grandfather:
            return slots, remaining

        blocked_by_brothers = bool(ctx.full_brothers or ctx.consanguine_brothers)

        # 7a. أبناء الأخ الشقيق
        if not blocked_by_brothers and _count(heirs, SON_FULL_BROTHER) and remaining > 0:
            slots = FaraidEngine._distribute_equal_remaining(heirs, remaining, SON_FULL_BROTHER)
            return slots, Fraction(0)

        # 7b. أبناء الأخ لأب
        if (not blocked_by_brothers and not _count(heirs, SON_FULL_BROTHER)
                and _count(heirs, SON_CONSANGUINE_BROTHER) and remaining > 0):
            slots = FaraidEngine._distribute_equal_remaining(
                heirs, remaining, SON_CONSANGUINE_BROTHER,
            )
            return slots, Fraction(0)

        # 7c. الأعمام الأشقاء والعمات
        if not blocked_by_brothers and (ctx.full_paternal_uncles or ctx.full_paternal_aunts) and remaining > 0:
            slots = FaraidEngine._ratio_asaba(
                heirs, remaining,
                male_types=FULL_PATERNAL_UNCLE, female_types=FULL_PATERNAL_AUNT,
                male_units=ctx.full_paternal_uncles, female_units=ctx.full_paternal_aunts,
            )
            return slots, Fraction(0)

        # 7d. الأعمام لأب والعمات لأب
        if (not blocked_by_brothers and not ctx.full_paternal_uncles and not ctx.full_paternal_aunts
                and (ctx.consanguine_paternal_uncles or ctx.consanguine_paternal_aunts) and remaining > 0):
            slots = FaraidEngine._ratio_asaba(
                heirs, remaining,
                male_types=CONSANGUINE_PATERNAL_UNCLE, female_types=CONSANGUINE_PATERNAL_AUNT,
                male_units=ctx.consanguine_paternal_uncles,
                female_units=ctx.consanguine_paternal_aunts,
            )
            return slots, Fraction(0)

        has_living_uncle = (
            ctx.full_paternal_uncles or ctx.full_paternal_aunts
            or ctx.consanguine_paternal_uncles or ctx.consanguine_paternal_aunts
        )

        # 7e. أبناء العم الشقيق
        if not blocked_by_brothers and not has_living_uncle and ctx.son_full_paternal_uncles and remaining > 0:
            slots = FaraidEngine._distribute_equal_remaining(
                heirs, remaining, SON_FULL_PATERNAL_UNCLE,
            )
            return slots, Fraction(0)

        # 7f. أبناء العم لأب
        if (not blocked_by_brothers and not has_living_uncle
                and not ctx.son_full_paternal_uncles and ctx.son_consanguine_paternal_uncles
                and remaining > 0):
            slots = FaraidEngine._distribute_equal_remaining(
                heirs, remaining, SON_CONSANGUINE_PATERNAL_UNCLE,
            )
            return slots, Fraction(0)

        # 7g. ابن ابن العم
        if (not blocked_by_brothers and not has_living_uncle
                and not ctx.son_full_paternal_uncles and not ctx.son_consanguine_paternal_uncles
                and _count(heirs, SON_SON_PATERNAL_UNCLE) and remaining > 0):
            slots = FaraidEngine._distribute_equal_remaining(
                heirs, remaining, SON_SON_PATERNAL_UNCLE,
            )
            return slots, Fraction(0)

        # 7h. الخال
        if (not blocked_by_brothers and not has_living_uncle
                and not ctx.son_full_paternal_uncles and not ctx.son_consanguine_paternal_uncles
                and _count(heirs, frozenset({"maternal_uncle"})) and remaining > 0):
            slots = FaraidEngine._distribute_equal_remaining(
                heirs, remaining, frozenset({"maternal_uncle"}),
            )
            return slots, Fraction(0)

        return slots, remaining

    @staticmethod
    def _distribute_equal_remaining(
        heirs: list[dict], remaining: Fraction, types_set: frozenset[str],
    ) -> list[ShareSlot]:
        total_persons = _count(heirs, types_set)
        if total_persons <= 0:
            return []
        slots: list[ShareSlot] = []
        for h in heirs:
            t = h.get("type")
            if t not in types_set:
                continue
            c = int(h.get("count", 1))
            frac = remaining * Fraction(c) / Fraction(total_persons)
            slots.append(ShareSlot(
                t, h.get("name", t), c, frac, is_fard=False, is_asaba=True,
            ))
        return slots

    @staticmethod
    def _ratio_asaba(
        heirs: list[dict], remaining: Fraction,
        male_types: frozenset[str], female_types: frozenset[str],
        male_units: int, female_units: int,
    ) -> list[ShareSlot]:
        total_units = Fraction(male_units) + Fraction(female_units) * Fraction(1, 2)
        if total_units <= 0:
            return []
        slots: list[ShareSlot] = []
        for h in heirs:
            t = h.get("type")
            c = int(h.get("count", 1))
            if t in male_types:
                frac = remaining * Fraction(c) / total_units
                slots.append(ShareSlot(t, h.get("name", t), c, frac, is_fard=False, is_asaba=True))
            elif t in female_types:
                frac = remaining * Fraction(c) * Fraction(1, 2) / total_units
                slots.append(ShareSlot(t, h.get("name", t), c, frac, is_fard=False, is_asaba=True))
        return slots

    @staticmethod
    def _merge_slots(slots: list[ShareSlot]) -> list[ShareSlot]:
        by_key: dict[str, ShareSlot] = {}
        for s in slots:
            key = f"{s.heir_type}:{s.name}" if s.heir_type == "wife" else s.heir_type
            if key in by_key:
                by_key[key].fraction += s.fraction
            else:
                by_key[key] = ShareSlot(
                    s.heir_type, s.name, s.count, s.fraction,
                    s.is_fard, s.is_asaba, s.blocked, s.block_reason, s.custom,
                )
        return list(by_key.values())

    @staticmethod
    def _can_radd(merged: list[ShareSlot]) -> bool:
        return any(s.is_fard and s.fraction > 0 and s.heir_type not in ("husband", "wife") for s in merged)

    @staticmethod
    def _build_output(
        merged: list[ShareSlot],
        heirs: list[dict],
        ctx: FaraidContext,
        net: Decimal,
        adjustments: list[dict],
        calc_meta: dict,
    ) -> tuple[list[dict], list[dict]]:
        inheriting_types = {s.heir_type for s in merged if s.fraction > 0 and not s.blocked}
        distribution: list[dict] = []
        for s in merged:
            if s.fraction <= 0:
                continue
            distribution.append({
                "type": s.heir_type,
                "name": s.name,
                "count": s.count,
                "share_fraction": float(s.fraction),
                "total_share_fraction": float(s.fraction),
                "amount": _money(net, s.fraction),
                "percentage": _pct(s.fraction),
                "status": "inherits",
                "is_asaba": s.is_asaba,
                "legal_basis": legal_basis_for_heir(
                    s.heir_type, float(s.fraction), is_residual=s.is_asaba,
                ),
            })

        heir_details = FaraidEngine._build_heir_details(
            heirs, merged, ctx, net, inheriting_types, calc_meta,
        )
        return distribution, heir_details

    @staticmethod
    def _active_slots_by_type(merged: list[ShareSlot]) -> dict[str, list[ShareSlot]]:
        grouped: dict[str, list[ShareSlot]] = {}
        for s in merged:
            if s.fraction <= 0 or s.blocked:
                continue
            grouped.setdefault(s.heir_type, []).append(s)
        for slots in grouped.values():
            slots.sort(key=lambda s: s.name)
        return grouped

    @staticmethod
    def _uses_per_person_slots(slots: list[ShareSlot], total_persons: int) -> bool:
        """True when each merged slot already maps to one heir (e.g. multiple fard slots)."""
        return (
            total_persons > 0
            and len(slots) == total_persons
            and all(s.count == 1 for s in slots)
        )

    @staticmethod
    def _build_heir_details(
        heirs: list[dict],
        merged: list[ShareSlot],
        ctx: FaraidContext,
        net: Decimal,
        inheriting_types: set[str],
        calc_meta: dict | None = None,
    ) -> list[dict]:
        slots_by_type = FaraidEngine._active_slots_by_type(merged)
        total_persons_by_type: dict[str, int] = {}
        for h in heirs:
            t = h["type"]
            total_persons_by_type[t] = total_persons_by_type.get(t, 0) + int(h.get("count", 1))

        slot_cursor: dict[str, int] = {}
        details: list[dict] = []

        for h in heirs:
            t = h["type"]
            count = int(h.get("count", 1))
            profile = HEIR_TYPE_REGISTRY.get(t, {}).get("calc_profile", "custom")

            if profile == "status_only":
                reason = EXCLUSION_REASONS["fetus_pending" if t == "fetus" else "missing_pending"]
                for i in range(1, count + 1):
                    details.append(FaraidEngine._detail_row(
                        t, i, count, 0, 0, "pending", reason, h, slot_is_asaba=False,
                    ))
                continue

            type_slots = slots_by_type.get(t, [])
            total_persons = total_persons_by_type.get(t, 0)
            total_frac = sum(s.fraction for s in type_slots)

            if total_frac > 0 and FaraidEngine._uses_per_person_slots(type_slots, total_persons):
                cursor = slot_cursor.get(t, 0)
                for i in range(1, count + 1):
                    if cursor < len(type_slots):
                        per = type_slots[cursor].fraction
                        global_idx = cursor + 1
                        cursor += 1
                        details.append(FaraidEngine._detail_row(
                            t, global_idx, total_persons, _money(net, per), _pct(per),
                            "inherits", None, h, type_slots[cursor - 1].is_asaba,
                        ))
                    else:
                        global_idx = cursor + 1
                        cursor += 1
                        details.append(FaraidEngine._detail_row(
                            t, global_idx, total_persons, 0, 0, "blocked",
                            EXCLUSION_REASONS["residual_no_share"], h,
                        ))
                slot_cursor[t] = cursor
            elif total_frac > 0:
                persons_before = slot_cursor.get(t, 0)
                per = total_frac / total_persons if total_persons else total_frac
                is_asaba = type_slots[0].is_asaba if type_slots else False
                for i in range(1, count + 1):
                    global_idx = persons_before + i
                    details.append(FaraidEngine._detail_row(
                        t, global_idx, total_persons, _money(net, per), _pct(per),
                        "inherits", None, h, is_asaba,
                    ))
                slot_cursor[t] = persons_before + count
            else:
                reason_key = FaraidEngine._exclusion_reason(
                    t, ctx, inheriting_types, calc_meta or {},
                )
                reason = EXCLUSION_REASONS.get(reason_key, EXCLUSION_REASONS["residual_no_share"])
                persons_before = slot_cursor.get(t, 0)
                for i in range(1, count + 1):
                    global_idx = persons_before + i
                    details.append(FaraidEngine._detail_row(
                        t, global_idx, total_persons, 0, 0, "blocked", reason, h,
                    ))
                slot_cursor[t] = persons_before + count
        return details

    @staticmethod
    def _resolve_person(heir: dict, idx: int, count: int) -> dict[str, str | None]:
        persons = heir.get("persons") or []
        pi = idx - 1
        if persons and pi < len(persons):
            p = persons[pi]
            return {
                "name": (p.get("name") or "").strip() or None,
                "name_ar": (p.get("name_ar") or "").strip() or None,
                "gender": p.get("gender") or heir_gender(heir["type"]),
            }
        if count == 1:
            return {
                "name": (heir.get("name") or "").strip() or None,
                "name_ar": (heir.get("name_ar") or "").strip() or None,
                "gender": heir.get("gender") or heir_gender(heir["type"]),
            }
        return {"name": None, "name_ar": None, "gender": heir_gender(heir["type"])}

    @staticmethod
    def _detail_row(
        t: str, idx: int, count: int, amount: float, pct: float,
        status: str, reason: dict | None, heir: dict,
        slot_is_asaba: bool = False,
    ) -> dict:
        person = FaraidEngine._resolve_person(heir, idx, count)
        custom_name = person.get("name")
        custom_name_ar = person.get("name_ar")
        gender = person.get("gender")
        return {
            "type": t,
            "name": heir_display_name(t, idx, count, custom_name),
            "name_ar": custom_name_ar or heir_display_name_ar(t, idx, count),
            "gender": gender,
            "gender_fr": gender_label_fr(gender),
            "gender_ar": gender_label_ar(gender),
            "index": idx,
            "count_total": count,
            "amount": amount,
            "percentage": pct,
            "status": status,
            "reason_fr": reason["reason_fr"] if reason else None,
            "reason_ar": reason["reason_ar"] if reason else None,
            "legal_basis": legal_basis_for_heir(
                t, pct / 100 if pct else 0, is_residual=slot_is_asaba,
            ),
        }

    @staticmethod
    def _exclusion_reason(
        t: str, ctx: FaraidContext, inheriting: set[str], calc_meta: dict | None = None,
    ) -> str:
        meta = calc_meta or {}
        if t == "fetus":
            return "fetus_pending"
        if t == "missing_person":
            return "missing_pending"
        if t == "other":
            return "custom_required"
        if t in DAUGHTER_LINE_DESC:
            return "daughter_line_blocked"
        if t in SON_LINE_DESC:
            if ctx.has_son:
                return "blocked_by_son"
            if ctx.has_father:
                return "blocked_by_father_asaba"
            if meta.get("has_awl"):
                return "blocked_by_awl"
            return "residual_no_share"
        if t in DESCENDANT_TYPES and t not in DIRECT_CHILD_TYPES and ctx.has_son:
            return "blocked_by_son"
        if t in FULL_SIBLING_TYPES | CONSANGUINE_TYPES:
            if ctx.has_son:
                return "blocked_by_son"
            if ctx.has_father:
                return "blocked_by_father"
        if t in UTERINE_TYPES and (ctx.has_son or ctx.has_father or ctx.has_descendant):
            return "uterine_blocked"
        if t in COUSIN_PATERNAL_FEMALE:
            return "cousin_female_blocked"
        if t in COUSIN_MATERNAL:
            return "maternal_cousin_blocked"
        if t == "son_consanguine_brother" and "son_full_brother" in inheriting:
            return "blocked_by_full_relative"
        if t in CONSANGUINE_PATERNAL_UNCLE | CONSANGUINE_PATERNAL_AUNT:
            if ctx.full_paternal_uncles or ctx.full_paternal_aunts:
                return "blocked_by_full_paternal_uncle"
            return "asaba_blocked"
        if t == "son_consanguine_paternal_uncle":
            if "son_full_paternal_uncle" in inheriting or ctx.son_full_paternal_uncles:
                return "blocked_by_full_nephew_uncle"
            if ctx.full_paternal_uncles or ctx.full_paternal_aunts:
                return "blocked_by_full_paternal_uncle"
            return "asaba_blocked"
        if t in SON_FULL_PATERNAL_UNCLE | SON_SON_PATERNAL_UNCLE | SON_FULL_BROTHER:
            return "asaba_blocked"
        if t in FULL_PATERNAL_UNCLE | FULL_PATERNAL_AUNT | SON_CONSANGUINE_BROTHER:
            return "asaba_blocked"
        if t == "maternal_uncle":
            return "asaba_blocked"
        if t == "paternal_grandfather" and ctx.has_father:
            return "blocked_by_father"
        if t in ("maternal_grandmother", "paternal_grandmother") and ctx.has_mother:
            return "blocked_by_mother"
        if t == "full_sister" and ("full_brother" in inheriting or "brother" in inheriting):
            return "sister_blocked_by_brother"
        if t == "consanguine_sister" and "consanguine_brother" in inheriting:
            return "sister_blocked_by_brother"
        return "residual_no_share"
