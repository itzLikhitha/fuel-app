from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

# Store OTPs temporarily in memory for testing
otp_store = {}

@auth_bp.route("/api/auth/request_otp", methods=["POST"])
def request_otp():
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return jsonify({"success": False, "message": "Phone number required"}), 400

    otp = "123456"  # fixed OTP for testing
    otp_store[phone] = otp
    print(f"[SIMULATED OTP] Phone: {phone}, OTP: {otp}")  # console log
    return jsonify({"success": True, "message": "OTP sent successfully (simulated)"})

@auth_bp.route("/api/auth/verify_otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    phone = data.get("phone")
    otp = data.get("otp")
    if otp_store.get(phone) == otp:
        return jsonify({"success": True, "message": "OTP verified successfully"})
    return jsonify({"success": False, "message": "Invalid OTP"}), 400