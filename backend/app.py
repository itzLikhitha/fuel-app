import os
from flask import Flask
from flask import jsonify
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth_bp
from routes.booking import booking_bp
from routes.mechanic import mechanic_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*"}})
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(mechanic_bp)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})
