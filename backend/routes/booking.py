from flask import Blueprint, request, jsonify
from database import db
from models import FuelBooking, validate_booking_payload
from utils.auth import token_required
from utils.plate_ocr import extract_plate_text
import random

booking_bp = Blueprint("booking", __name__)

# Temporary in-memory store for per-user OTP and pending booking payload.
# Structure: { user_id: { "otp": "123456", "payload": {...} } }
PENDING_BOOKING_OTPS = {}


def serialize_booking(doc: FuelBooking) -> dict:
    return {
        "id": str(doc.id),
        "fuelType": doc.fuel_type,
        "quantity": doc.quantity,
        "address": doc.address,
        "imageData": doc.image_data,
        "status": doc.status,
        "createdAt": doc.created_at.isoformat() + "Z",
    }


@booking_bp.post("/verify")
@token_required
def verify_booking(user):
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("imageData")
    if not image_data:
        return jsonify({"error": "Vehicle image required."}), 400

    is_valid, err = validate_booking_payload(payload)
    if not is_valid:
        return jsonify({"error": err}), 400

    # Step 1: OCR number plate extraction and vehicle verification.
    detected_text = extract_plate_text(image_data)
    if detected_text is None:
        return jsonify({"error": "No number plate detected in image."}), 400

    registered_vehicle_number = str(getattr(user, "vehicle_number", "")).replace(" ", "").upper()
    if registered_vehicle_number not in detected_text:
        return jsonify({"error": "Vehicle number does not match registered vehicle."}), 400

    # Generate and store OTP with pending booking details for confirmation step.
    otp = f"{random.randint(0, 999999):06d}"
    PENDING_BOOKING_OTPS[user.id] = {
        "otp": otp,
        "payload": {
            "fuelType": payload["fuelType"],
            "quantity": float(payload["quantity"]),
            "address": payload["address"].strip(),
            "imageData": payload["imageData"],
        },
    }

    return jsonify({"message": "OTP sent for booking confirmation.", "otp": otp}), 200


@booking_bp.post("/confirm")
@token_required
def confirm_booking(user):
    data = request.get_json(silent=True) or {}
    otp = str(data.get("otp", "")).strip()
    if not otp:
        return jsonify({"error": "OTP is required."}), 400

    pending = PENDING_BOOKING_OTPS.get(user.id)
    if not pending or pending.get("otp") != otp:
        return jsonify({"error": "Invalid OTP."}), 400

    payload = pending["payload"]

    # Step 2: OTP matched, create booking and clear temporary OTP state.
    booking = FuelBooking(
        user_id=user.id,
        fuel_type=payload["fuelType"],
        quantity=float(payload["quantity"]),
        address=payload["address"].strip(),
        image_data=payload["imageData"],
        status="Pending",
    )

    db.session.add(booking)
    db.session.commit()
    PENDING_BOOKING_OTPS.pop(user.id, None)

    return jsonify({"message": "Fuel booking created", "booking": serialize_booking(booking)}), 201


@booking_bp.get("/my")
@token_required
def my_bookings(user):
    rows = FuelBooking.query.filter_by(user_id=user.id).order_by(FuelBooking.created_at.desc()).all()
    return jsonify({"bookings": [serialize_booking(row) for row in rows]})
