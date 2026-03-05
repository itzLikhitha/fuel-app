from flask import Blueprint, request, jsonify
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Store OTPs temporarily in memory for testing
otp_store = {}


@auth_bp.route("/request_otp", methods=["POST"])
@auth_bp.route("/request-otp", methods=["POST"])
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    if not phone:
        return jsonify({"success": False, "error": "Phone number required"}), 400

    otp = "123456"
    otp_store[phone] = otp
    print("OTP for", phone, "is", otp)

    return jsonify({
        "message": "OTP sent successfully",
        "otp": otp
    })


@auth_bp.route("/verify_otp", methods=["POST"])
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    otp = str(data.get("otp", "")).strip()

    if otp_store.get(phone) != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    return jsonify({
        "token": "demo-token"
    })


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
