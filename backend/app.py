from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth_bp
from routes.booking import booking_bp
from routes.mechanic import mechanic_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")
    app.register_blueprint(mechanic_bp, url_prefix="/api/mechanic")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
