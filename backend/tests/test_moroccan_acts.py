"""Tests calculateurs d'actes — barèmes marocains."""

from decimal import Decimal

import pytest

from app.constants.moroccan_act_fees import tpi_abatement_pct
from app.services.act_calculation_service import (
    calculate_donation,
    calculate_marriage,
    calculate_procuration,
    calculate_sale,
)
from app.services.wasiyyah_service import calculate_wasiyyah


def test_tpi_abatement_progressive():
    assert tpi_abatement_pct(4) == Decimal("0")
    assert tpi_abatement_pct(5) == Decimal("10")
    assert tpi_abatement_pct(10) == Decimal("60")
    assert tpi_abatement_pct(14) == Decimal("100")


def test_wasiyyah_max_third():
    r = calculate_wasiyyah({
        "net_estate_value": 300_000,
        "wasiyyah_amount": 150_000,
        "legatee_is_heir": False,
    })
    assert r["results"]["max_wasiyyah"] == 100_000.0
    assert r["results"]["wasiyyah_amount_applied"] == 100_000.0


def test_wasiyyah_heir_without_consent_blocked():
    r = calculate_wasiyyah({
        "net_estate_value": 300_000,
        "wasiyyah_amount": 50_000,
        "legatee_is_heir": True,
        "heirs_consent": False,
    })
    assert r["results"]["wasiyyah_amount_applied"] == 0.0
    assert r["results"]["is_valid"] is False


def test_wasiyyah_debts_deducted():
    r = calculate_wasiyyah({
        "net_estate_value": 300_000,
        "debts_before_wasiyyah": 30_000,
        "funeral_expenses": 20_000,
        "wasiyyah_amount": 100_000,
        "legatee_is_heir": False,
    })
    assert r["results"]["net_estate_value"] == 250_000.0
    assert r["results"]["max_wasiyyah"] == pytest.approx(83333.33, rel=0.01)


def test_sale_primary_residence_exempt():
    r = calculate_sale({
        "sale_price": 1_000_000,
        "purchase_price": 400_000,
        "years_held": 6,
        "is_primary_residence": True,
        "property_kind": "habitation",
    })
    assert r["results"]["tpi"] == 0.0
    assert r["results"]["tpi_exempt"] is True


def test_donation_immovable_includes_conservation():
    r = calculate_donation({
        "donation_value": 500_000,
        "relationship": "child",
        "asset_kind": "immovable",
    })
    assert r["results"]["conservation_fees"] > 0
    assert r["results"]["registration_rate_pct"] == 2.5


def test_marriage_mahr_labels_fixed():
    r = calculate_marriage({
        "mahr_immediate": 10_000,
        "mahr_deferred": 20_000,
        "marriage_order": "first",
    })
    assert r["results"]["total_mahr"] == 30_000.0
    assert r["results"]["mahr_prompt"] == 10_000.0


def test_procuration_sale_with_property_value():
    r = calculate_procuration({
        "procuration_type": "sale",
        "duration_years": 2,
        "property_value": 800_000,
    })
    assert r["results"]["adoul_fees"] > 900
