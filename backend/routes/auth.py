from flask import Blueprint, request, jsonify
from database import db
from models import User, is_valid_phone, create_user_with_hashed_password
import random
import uuid

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Store OTPs temporarily in memory for testing
otp_store = {}

@auth_bp.route("/request_otp", methods=["POST"])
@auth_bp.route("/request-otp", methods=["POST"])
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    if not phone:
        return jsonify({"message": "Phone number required"}), 400
    if not is_valid_phone(phone):
        return jsonify({"message": "Phone number must be 10 digits"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[phone] = otp
    print("OTP for", phone, "is", otp)
    return jsonify({"message": "OTP sent successfully", "otp": otp})

@auth_bp.route("/verify_otp", methods=["POST"])
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    otp = str(data.get("otp", "")).strip()

    if otp_store.get(phone) != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = create_user_with_hashed_password(phone)
        db.session.add(user)

    token = str(uuid.uuid4())
    user.auth_token = token
    db.session.commit()
    otp_store.pop(phone, None)

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


@auth_bp.route("/users_table", methods=["GET"])
def users_table():
    users = User.query.all()
    return jsonify(
        {
            "users": [
                {
                    "id": user.id,
                    "phone": user.phone,
                }
                for user in users
            ]
        }
    )
