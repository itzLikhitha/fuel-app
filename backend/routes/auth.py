from flask import Blueprint, request, jsonify
from models import User
import random

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Store OTPs temporarily in memory for testing
otp_store = {}

@auth_bp.route("/request_otp", methods=["POST"])
@auth_bp.route("/request-otp", methods=["POST"])
def request_otp():
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return jsonify({"success": False, "message": "Phone number required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[phone] = otp
    print(f"[SIMULATED OTP] Phone: {phone}, OTP: {otp}")  # console log
    return jsonify({"success": True, "message": "OTP sent successfully (simulated)"})

@auth_bp.route("/verify_otp", methods=["POST"])
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    phone = data.get("phone")
    otp = data.get("otp")
    if otp_store.get(phone) == otp:
        return jsonify({"success": True, "message": "OTP verified successfully"})
    return jsonify({"success": False, "message": "Invalid OTP"}), 400


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
