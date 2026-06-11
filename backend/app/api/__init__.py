from flask_restx import Api
from app.api.auth import auth_ns
from app.api.clients import clients_ns
from app.api.dossiers import dossiers_ns
from app.api.inheritance import inheritance_ns
from app.api.property_shares import property_ns
from app.api.ai import ai_ns, ocr_ns
from app.api.act_calculations import act_ns
from app.api.dashboard import dashboard_ns, admin_ns
from app.api.uploads import uploads_ns

api = Api(
    title="Adoul AI API",
    version="1.0",
    description="API REST pour la plateforme Adoul AI",
    doc="/docs",
    prefix="/api/v1",
)

api.add_namespace(auth_ns, path="/auth")
api.add_namespace(clients_ns, path="/clients")
api.add_namespace(dossiers_ns, path="/dossiers")
api.add_namespace(inheritance_ns, path="/inheritance")
api.add_namespace(property_ns, path="/property-shares")
api.add_namespace(act_ns, path="/act-calculations")
api.add_namespace(ai_ns, path="/ai")
api.add_namespace(ocr_ns, path="/ocr")
api.add_namespace(dashboard_ns, path="/dashboard")
api.add_namespace(admin_ns, path="/admin")
api.add_namespace(uploads_ns, path="/uploads")
