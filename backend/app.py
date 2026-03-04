import os
from flask import Flask
from flask import jsonify
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth_bp
from routes.booking import booking_bp
from routes.mechanic import mechanic_bp
from flask_cors import CORS
CORS(app)

app = Flask(__name__)
app.config.from_object(Config)

# Comma-separated list of allowed origins, e.g.
# FRONTEND_ORIGINS=https://my-app.vercel.app,https://my-preview.vercel.app
origins_env = os.getenv("FRONTEND_ORIGINS", "").strip()
if origins_env:
    allowed_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]
else:
    frontend_domain = os.getenv("FRONTEND_URL", "http://localhost:3000")
    allowed_origins = [frontend_domain]

CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=False,
)
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(mechanic_bp)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})
