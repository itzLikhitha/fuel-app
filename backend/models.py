import re
import secrets
from datetime import datetime
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

PHONE_REGEX = re.compile(r"^\d{10}$")
ALLOWED_FUEL_TYPES = {"Petrol", "Diesel", "CNG", "EV Charge"}


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(10), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    otp_code = db.Column(db.String(6), nullable=True)
    otp_expires_at = db.Column(db.DateTime, nullable=True)
    auth_token = db.Column(db.String(64), unique=True, nullable=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = db.relationship("FuelBooking", backref="user", lazy=True, cascade="all, delete-orphan")
    mechanic_requests = db.relationship(
        "MechanicRequest", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, raw_password: str):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)


class FuelBooking(db.Model):
    __tablename__ = "fuel_bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    fuel_type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    address = db.Column(db.Text, nullable=False)
    image_data = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Pending")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class MechanicRequest(db.Model):
    __tablename__ = "mechanic_requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    vehicle_type = db.Column(db.String(50), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    location = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Requested")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


def is_valid_phone(phone: str) -> bool:
    return bool(PHONE_REGEX.match(phone or ""))


def create_user_with_hashed_password(phone: str, password: str | None = None) -> User:
    user = User(phone=phone)
    user.set_password(password or secrets.token_urlsafe(16))
    return user


def validate_booking_payload(payload: dict) -> tuple[bool, str]:
    fuel_type = payload.get("fuelType", "")
    quantity = payload.get("quantity")
    address = payload.get("address", "")
    image_data = payload.get("imageData", "")

    if fuel_type not in ALLOWED_FUEL_TYPES:
        return False, "Invalid fuel type"
    if not isinstance(quantity, (int, float)) or quantity <= 0:
        return False, "Quantity must be a positive number"
    if not address.strip():
        return False, "Address is required"
    if not image_data.startswith("data:image/"):
        return False, "Captured image is required"
    return True, ""


def validate_mechanic_payload(payload: dict) -> tuple[bool, str]:
    vehicle_type = payload.get("vehicleType", "")
    issue_description = payload.get("issueDescription", "")
    location = payload.get("location", "")

    if not vehicle_type.strip():
        return False, "Vehicle type is required"
    if not issue_description.strip():
        return False, "Issue description is required"
    if not location.strip():
        return False, "Location is required"
    return True, ""
