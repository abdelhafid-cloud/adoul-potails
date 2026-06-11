from flask import send_from_directory, current_app, abort
from flask_restx import Namespace, Resource

uploads_ns = Namespace("uploads", description="Fichiers téléversés")


@uploads_ns.route("/<path:filepath>")
class ServeUpload(Resource):
    def get(self, filepath: str):
        if ".." in filepath or filepath.startswith("/"):
            abort(404)
        directory = current_app.config["UPLOAD_FOLDER"]
        return send_from_directory(directory, filepath)
