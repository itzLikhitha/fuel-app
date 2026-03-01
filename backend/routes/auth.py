from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import db
from models import User, is_valid_phone, create_user_with_hashed_password
from utils.otp import generate_otp
import uuid

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    password = data.get("password")

    if not is_valid_phone(phone):
        return jsonify({"error": "Phone number must be 10 digits"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = create_user_with_hashed_password(phone, str(password) if password else None)
        db.session.add(user)

    # If client sends password in future, keep it hashed and updatable without route changes.
    if isinstance(password, str) and password.strip():
        user.set_password(password.strip())

    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    user.otp_code = otp
    user.otp_expires_at = expires_at
    user.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(
        {
            "message": "OTP generated successfully",
            "otp": otp,
            "expiresAt": expires_at.isoformat() + "Z",
        }
    )


@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    otp = str(data.get("otp", "")).strip()

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.otp_code != otp:
        return jsonify({"error": "Invalid OTP"}), 401

    if not user.otp_expires_at or user.otp_expires_at < datetime.utcnow():
        return jsonify({"error": "OTP expired"}), 401

    token = str(uuid.uuid4())
    user.auth_token = token
    user.otp_code = None
    user.otp_expires_at = None
    user.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(
        {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user.id),
                "phone": user.phone,
            },
        }
    )
