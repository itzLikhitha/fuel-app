from flask import Blueprint, request, jsonify
from database import db
from models import MechanicRequest, validate_mechanic_payload
from utils.auth import token_required

mechanic_bp = Blueprint("mechanic", __name__, url_prefix="/api/mechanic")


def serialize_request(doc: MechanicRequest) -> dict:
    return {
        "id": str(doc.id),
        "vehicleType": doc.vehicle_type,
        "issueDescription": doc.issue_description,
        "location": doc.location,
        "status": doc.status,
        "createdAt": doc.created_at.isoformat() + "Z",
    }


@mechanic_bp.post("/request")
@token_required
def create_mechanic_request(user):
    payload = request.get_json(silent=True) or {}
    is_valid, err = validate_mechanic_payload(payload)
    if not is_valid:
        return jsonify({"error": err}), 400

    mechanic_request = MechanicRequest(
        user_id=user.id,
        vehicle_type=payload["vehicleType"].strip(),
        issue_description=payload["issueDescription"].strip(),
        location=payload["location"].strip(),
        status="Requested",
    )

    db.session.add(mechanic_request)
    db.session.commit()

    return (
        jsonify({"message": "Mechanic request submitted", "request": serialize_request(mechanic_request)}),
        201,
    )


@mechanic_bp.get("/my")
@token_required
def my_mechanic_requests(user):
    rows = (
        MechanicRequest.query.filter_by(user_id=user.id)
        .order_by(MechanicRequest.created_at.desc())
        .all()
    )
    return jsonify({"requests": [serialize_request(row) for row in rows]})
