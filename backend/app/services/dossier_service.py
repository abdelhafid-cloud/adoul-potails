from app.models import Dossier


class DossierService:
    @staticmethod
    def mark_completed_on_pdf_export(dossier: Dossier | None) -> bool:
        """Passe le dossier en « terminé » après export PDF réussi."""
        if not dossier:
            return False
        if dossier.status in (
            Dossier.STATUS_DRAFT,
            Dossier.STATUS_IN_PROGRESS,
            Dossier.STATUS_PENDING,
        ):
            dossier.status = Dossier.STATUS_COMPLETED
            return True
        return False
