"""Security helpers for hashing and JWT handling."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import ExpiredSignatureError, JWTError, jwt
from werkzeug.security import check_password_hash, generate_password_hash

from ..config import settings
from ..models.schemas import TokenPayload


def hash_password(plain_password: str) -> str:
    return generate_password_hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, plain_password)


def _create_token(subject: str, role: str, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def create_access_token(subject: str, role: str) -> str:
    return _create_token(subject, role, timedelta(minutes=settings.access_token_exp_minutes))


def create_refresh_token(subject: str, role: str) -> str:
    return _create_token(subject, role, timedelta(days=settings.refresh_token_exp_days))


def decode_token(token: str) -> TokenPayload:
    try:
        payload: dict[str, Any] = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return TokenPayload(**payload)
    except ExpiredSignatureError as exc:
        raise ValueError("Token has expired") from exc
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

