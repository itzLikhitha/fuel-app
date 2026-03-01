from functools import wraps
from flask import request, jsonify
from models import User


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ", 1)[1]
        user = User.query.filter_by(auth_token=token).first()
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401

        return fn(user, *args, **kwargs)

    return wrapper
