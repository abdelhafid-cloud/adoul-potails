"""Tests du moteur الفرائض."""
from decimal import Decimal

import pytest

from app.services.faraid_engine import FaraidEngine
from app.services.inheritance_service import InheritanceService


def _pct(distribution: list[dict], heir_type: str) -> float:
    return sum(d["percentage"] for d in distribution if d["type"] == heir_type)


def _total_pct(distribution: list[dict]) -> float:
    return round(sum(d["percentage"] for d in distribution), 2)


def _detail_total(distribution: list[dict], heir_details: list[dict]) -> tuple[float, float]:
    dist_total = round(sum(d["amount"] for d in distribution), 2)
    detail_total = round(
        sum(d["amount"] for d in heir_details if d.get("status") == "inherits"), 2
    )
    return dist_total, detail_total


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

  def test_heir_details_always_match_distribution_total(self):
      """Invariant : détail par héritier = tableau de distribution (tous cas)."""
      cases = [
          [
              {"type": "wife", "count": 2},
              {"type": "father", "count": 1},
              {"type": "mother", "count": 1},
              {"type": "son", "count": 3},
          ],
          [
              {"type": "wife", "count": 1, "persons": [{"name": "ep1"}]},
              {"type": "wife", "count": 1, "persons": [{"name": "ep2"}]},
              {"type": "son", "count": 2},
          ],
          [
              {"type": "husband", "count": 1},
              {"type": "mother", "count": 1},
              {"type": "father", "count": 1},
              {"type": "son", "count": 1},
          ],
          [
              {"type": "wife", "count": 1},
              {"type": "mother", "count": 1},
              {"type": "father", "count": 1},
              {"type": "daughter", "count": 2},
          ],
      ]
      net = Decimal("7750000")
      for heirs in cases:
          r = FaraidEngine.compute(heirs, net)
          dist_total, detail_total = _detail_total(r["distribution"], r["heir_details"])
          assert dist_total == pytest.approx(float(net), rel=0.001)
          assert detail_total == pytest.approx(float(net), rel=0.001)
          assert dist_total == pytest.approx(detail_total, rel=0.001)
          inheriting = [d for d in r["heir_details"] if d["status"] == "inherits"]
          assert round(sum(d["percentage"] for d in inheriting), 2) == 100.0

  def test_two_wives_with_sons_heir_details_match_distribution(self):
      """2 épouses + père + mère + 3 fils : chaque épouse = 1/16 (6,25 %), total 100 %."""
      heirs = [
          {
              "type": "wife", "count": 2,
              "persons": [{"name": "ep1"}, {"name": "ep2"}],
          },
          {"type": "father", "count": 1, "persons": [{"name": "per1"}]},
          {"type": "mother", "count": 1, "persons": [{"name": "mer1"}]},
          {
              "type": "son", "count": 3,
              "persons": [{"name": "fil1"}, {"name": "fil2"}, {"name": "fil3"}],
          },
      ]
      net = Decimal("7750000")
      r = FaraidEngine.compute(heirs, net)
      wives_dist = [d for d in r["distribution"] if d["type"] == "wife"]
      wives_detail = [d for d in r["heir_details"] if d["type"] == "wife" and d["status"] == "inherits"]
      assert len(wives_dist) == 2
      assert len(wives_detail) == 2
      for d in wives_dist:
          assert d["percentage"] == pytest.approx(6.25, abs=0.05)
      for d in wives_detail:
          assert d["percentage"] == pytest.approx(6.25, abs=0.05)
          assert d["amount"] == pytest.approx(484375.0, abs=1.0)
      total_detail = sum(d["amount"] for d in r["heir_details"] if d["status"] == "inherits")
      assert total_detail == pytest.approx(float(net), rel=0.001)
      assert round(sum(d["percentage"] for d in r["heir_details"] if d["status"] == "inherits"), 2) == 100.0

  def test_two_wives_separate_entries(self):
      heirs = [
          {"type": "wife", "count": 1, "persons": [{"name": "ep1"}]},
          {"type": "wife", "count": 1, "persons": [{"name": "ep2"}]},
          {"type": "son", "count": 1},
      ]
      r = FaraidEngine.compute(heirs, Decimal("800000"))
      wives_detail = [d for d in r["heir_details"] if d["type"] == "wife" and d["status"] == "inherits"]
      assert len(wives_detail) == 2
      for d in wives_detail:
          assert d["percentage"] == pytest.approx(6.25, abs=0.05)

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
      assert result["faraid_base"] == 200000
      assert result["wasiyyah"] is None
      assert len(result["distribution"]) >= 2
      assert "legal_proof" in result
      assert "excluded_heirs" in result

  def test_service_with_wasiyyah_deducts_before_faraid(self):
      data = {
          "total_estate_value": 300000,
          "has_wasiyyah": True,
          "wasiyyah_amount": 50000,
          "legatee_name": "Ami du défunt",
          "heirs": [
              {"type": "wife", "count": 1},
              {"type": "son", "count": 1},
          ],
      }
      result = InheritanceService.calculate(data)
      assert result["net_estate_value"] == 300000
      assert result["wasiyyah"]["wasiyyah_amount_applied"] == 50000
      assert result["faraid_base"] == 250000
      assert result["legal_proof"]["faraid_base"] == 250000
      total_distributed = sum(d["amount"] for d in result["distribution"])
      assert total_distributed == pytest.approx(250000, rel=0.01)

  def test_service_wasiyyah_without_explicit_flag(self):
      data = {
          "total_estate_value": 300000,
          "wasiyyah_amount": 30000,
          "heirs": [{"type": "son", "count": 1}],
      }
      result = InheritanceService.calculate(data)
      assert result["wasiyyah"]["wasiyyah_amount_applied"] == 30000
      assert result["faraid_base"] == 270000

  def test_service_wasiyyah_capped_at_third(self):
      data = {
          "total_estate_value": 300000,
          "has_wasiyyah": True,
          "wasiyyah_amount": 200000,
          "legatee_name": "Association",
          "heirs": [{"type": "son", "count": 2}],
      }
      result = InheritanceService.calculate(data)
      assert result["wasiyyah"]["wasiyyah_amount_applied"] == 100000
      assert result["faraid_base"] == 200000
