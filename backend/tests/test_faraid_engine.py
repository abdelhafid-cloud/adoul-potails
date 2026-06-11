"""Tests du moteur الفرائض."""
from decimal import Decimal

import pytest

from app.services.faraid_engine import FaraidEngine
from app.services.inheritance_service import InheritanceService


def _pct(distribution: list[dict], heir_type: str) -> float:
    return sum(d["percentage"] for d in distribution if d["type"] == heir_type)


def _total_pct(distribution: list[dict]) -> float:
    return round(sum(d["percentage"] for d in distribution), 2)


class TestFaraidEngine:
  def test_husband_mother_father_son(self):
      heirs = [
          {"type": "husband", "count": 1},
          {"type": "mother", "count": 1},
          {"type": "father", "count": 1},
          {"type": "son", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("120000"))
      assert _total_pct(r["distribution"]) == 100.0
      assert _pct(r["distribution"], "husband") == pytest.approx(25.0, abs=0.1)
      assert _pct(r["distribution"], "mother") == pytest.approx(16.666, abs=0.2)
      assert _pct(r["distribution"], "father") == pytest.approx(16.666, abs=0.2)

  def test_awl_wife_two_daughters_mother_father(self):
      """Cas classique العول : زوجة + أم + أب + بنتين = 27/24."""
      heirs = [
          {"type": "wife", "count": 1},
          {"type": "mother", "count": 1},
          {"type": "father", "count": 1},
          {"type": "daughter", "count": 2},
      ]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert r["calculation_meta"]["has_awl"] is True
      assert _total_pct(r["distribution"]) == 100.0

  def test_radd_husband_one_daughter(self):
      """الرد : زوج + بنت واحدة — الباقي للبنت."""
      heirs = [
          {"type": "husband", "count": 1},
          {"type": "daughter", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert r["calculation_meta"]["has_radd"] is True
      assert _total_pct(r["distribution"]) == 100.0
      assert _pct(r["distribution"], "daughter") > 50.0

  def test_full_sister_alone_with_radd(self):
      """Sœur seule : 1/2 fard + الرد du reste = 100 %."""
      heirs = [{"type": "full_sister", "count": 1}]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert r["calculation_meta"]["has_radd"] is True
      assert _pct(r["distribution"], "full_sister") == pytest.approx(100.0, abs=0.1)

  def test_mother_reduced_with_siblings(self):
      heirs = [
          {"type": "mother", "count": 1},
          {"type": "full_brother", "count": 2},
      ]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert _pct(r["distribution"], "mother") == pytest.approx(16.666, abs=0.2)

  def test_father_asaba_without_descendants(self):
      heirs = [
          {"type": "father", "count": 1},
          {"type": "mother", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert _pct(r["distribution"], "father") == pytest.approx(66.666, abs=0.2)
      assert _pct(r["distribution"], "mother") == pytest.approx(33.333, abs=0.2)

  def test_grandson_blocked_by_father(self):
      """Cas adoul : époux + père + mère + 2 filles + petits-enfants du fils."""
      heirs = [
          {"type": "husband", "count": 1},
          {"type": "father", "count": 1},
          {"type": "mother", "count": 1},
          {"type": "daughter", "count": 2},
          {"type": "grandson_from_son", "count": 1},
          {"type": "granddaughter_from_son", "count": 2},
      ]
      from app.services.inheritance_verification import build_legal_verification
      r = FaraidEngine.compute(heirs, Decimal("1000000"))
      blocked = [d for d in r["heir_details"] if d["type"] in ("grandson_from_son", "granddaughter_from_son")]
      assert all(d["status"] == "blocked" for d in blocked)
      assert all("père" in (d.get("reason_fr") or "").lower() or "الأب" in (d.get("reason_ar") or "") for d in blocked)
      verif = build_legal_verification(heirs, r["heir_details"], r["calculation_meta"])
      gs_verif = next(v for v in verif if v["type"] == "grandson_from_son")
      assert gs_verif["status"] == "blocked"
      assert "الأب" in gs_verif.get("blocking_heir_ar", "") or "père" in gs_verif.get("blocking_heir_fr", "").lower()
      assert r["calculation_meta"]["has_awl"] is True

  def test_full_paternal_uncle_blocks_consanguine(self):
      heirs = [
          {"type": "full_paternal_uncle", "count": 1},
          {"type": "consanguine_paternal_uncle", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      assert _pct(r["distribution"], "full_paternal_uncle") == pytest.approx(100.0, abs=0.1)
      blocked = [d for d in r["heir_details"] if d["type"] == "consanguine_paternal_uncle"]
      assert blocked and blocked[0]["status"] == "blocked"

  def test_full_cousin_blocks_consanguine_cousin(self):
      heirs = [
          {"type": "son_full_paternal_uncle", "count": 2},
          {"type": "son_consanguine_paternal_uncle", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("900000"))
      inheriting = [d for d in r["heir_details"] if d["type"] == "son_full_paternal_uncle"]
      assert len(inheriting) == 2
      assert all(d["status"] == "inherits" for d in inheriting)
      assert sum(d["percentage"] for d in inheriting) == pytest.approx(100.0, abs=0.2)
      cons = [d for d in r["heir_details"] if d["type"] == "son_consanguine_paternal_uncle"]
      assert cons[0]["status"] == "blocked"

  def test_two_full_nephews_equal_share(self):
      heirs = [{"type": "son_full_brother", "count": 2}]
      r = FaraidEngine.compute(heirs, Decimal("100000"))
      nephews = [d for d in r["heir_details"] if d["type"] == "son_full_brother"]
      assert len(nephews) == 2
      assert nephews[0]["percentage"] == pytest.approx(50.0, abs=0.1)
      assert nephews[1]["percentage"] == pytest.approx(50.0, abs=0.1)

  def test_legacy_paternal_uncle_alias(self):
      from app.constants.heir_types import normalize_heir_type
      assert normalize_heir_type("paternal_uncle") == "full_paternal_uncle"
      assert normalize_heir_type("son_paternal_uncle") == "son_full_paternal_uncle"

  def test_service_integration(self):
      data = {
          "total_estate_value": 200000,
          "heirs": [
              {"type": "wife", "count": 1},
              {"type": "son", "count": 2},
          ],
      }
      result = InheritanceService.calculate(data)
      assert result["net_estate_value"] == 200000
      assert len(result["distribution"]) >= 2
      assert "legal_proof" in result
      assert "excluded_heirs" in result
