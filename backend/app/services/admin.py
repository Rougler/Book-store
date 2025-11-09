"""Admin authentication helpers."""

from fastapi import HTTPException, status

from ..core.security import verify_password
from ..database.session import db_session
from ..models.schemas import AdminCredentials


def authenticate_admin(credentials: AdminCredentials) -> str:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM admins WHERE username = ?", (credentials.username,)).fetchone()

    if not row or not verify_password(credentials.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return row["username"]

