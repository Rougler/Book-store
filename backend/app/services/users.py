"""User persistence helpers."""

import uuid
from typing import Optional

from fastapi import HTTPException, status

from ..core.security import hash_password, verify_password
from ..database.session import db_session
from ..models.schemas import AuthCredentials, UserCreate, UserProfile, UserPublic


def _row_to_user(row) -> UserPublic:
    # Helper to safely get column value (for new columns that might not exist in old databases)
    # sqlite3.Row supports 'in' operator and dictionary-style access
    def safe_get(key: str, default=0):
        try:
            # Check if key exists in row
            if key in row.keys():
                return row[key]
            return default
        except (KeyError, TypeError, AttributeError):
            return default
    
    return UserPublic(
        id=row["id"],
        full_name=row["full_name"],
        email=row["email"],
        referral_code=row["referral_code"],
        role=row["role"],
        rank=row["rank"],
        total_earnings=row["total_earnings"],
        wallet_balance=row["wallet_balance"],
        team_size=row["team_size"],
        direct_referrals=row["direct_referrals"],
        total_sales_count=safe_get("total_sales_count", 0),
        team_sales_count=safe_get("team_sales_count", 0),
        insurance_amount=safe_get("insurance_amount", 0),
        bio=row["bio"],
        profile_image_url=row["profile_image_url"],
        achievements=row["achievements"],
        created_at=row["created_at"],
    )


def _row_to_user_profile(row) -> UserProfile:
    user = _row_to_user(row)
    return UserProfile(
        **user.dict(),
        kyc_verified=row["kyc_verified"],
        otp_verified=row["otp_verified"],
    )


def get_user_by_email(email: str) -> UserPublic | None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row:
        return _row_to_user(row)
    return None


def get_user_profile_by_email(email: str) -> UserProfile | None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row:
        return _row_to_user_profile(row)
    return None


def get_user_row_by_email(email: str):
    with db_session() as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()


def get_user_by_id(user_id: int) -> UserPublic | None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row:
        return _row_to_user(row)
    return None


def get_user_profile_by_id(user_id: int) -> UserProfile | None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row:
        return _row_to_user_profile(row)
    return None


def get_user_by_referral_code(referral_code: str) -> UserPublic | None:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM users WHERE referral_code = ?", (referral_code,)).fetchone()
    if row:
        return _row_to_user(row)
    return None


def generate_referral_code() -> str:
    """Generate a unique referral code."""
    while True:
        code = str(uuid.uuid4())[:8].upper()
        if not get_user_by_referral_code(code):
            return code


def create_user(payload: UserCreate) -> UserPublic:
    if get_user_row_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    # Handle referral logic
    referrer_id = None
    if payload.referrer_code:
        referrer = get_user_by_referral_code(payload.referrer_code)
        if not referrer:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid referral code")
        referrer_id = referrer.id

    referral_code = generate_referral_code()

    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (
                full_name, email, password_hash, phone, aadhaar, pan,
                bank_name, branch_state, ifsc_code, account_number,
                referral_code, referrer_id, role, rank
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'partner', 'starter')
            """,
            (
                payload.full_name,
                payload.email,
                hash_password(payload.password),
                payload.phone,
                payload.aadhaar,
                payload.pan,
                payload.bank_name,
                payload.branch_state,
                payload.ifsc_code,
                payload.account_number,
                referral_code,
                referrer_id,
            ),
        )
        user_id = cursor.lastrowid

        # Update referrer's team size and direct referrals
        if referrer_id:
            cursor.execute(
                """
                UPDATE users
                SET team_size = team_size + 1,
                    direct_referrals = direct_referrals + 1
                WHERE id = ?
                """,
                (referrer_id,)
            )

    created = get_user_by_id(user_id)
    assert created is not None
    return created


def authenticate_user(credentials: AuthCredentials) -> UserPublic:
    row = get_user_row_by_email(credentials.email)
    if not row or not verify_password(credentials.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _row_to_user(row)


def update_user_profile(user_id: int, updates: dict) -> UserProfile:
    """Update user profile information."""
    fields = ", ".join(f"{key} = ?" for key in updates.keys())
    values = list(updates.values()) + [user_id]

    with db_session() as conn:
        conn.execute(f"UPDATE users SET {fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)

    updated = get_user_profile_by_id(user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


def submit_kyc(user_id: int, aadhaar: str, pan: str, document_front_url: str, document_back_url: str) -> None:
    """Submit KYC documents for verification."""
    with db_session() as conn:
        # In a real implementation, this would trigger document verification
        # For now, we'll just mark as submitted
        conn.execute(
            """
            UPDATE users
            SET aadhaar = ?, pan = ?, kyc_verified = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (aadhaar, pan, user_id)
        )


def verify_otp(user_id: int, otp_code: str) -> bool:
    """Verify OTP code for user."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT otp_code, otp_expires_at FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

        if not row or row["otp_code"] != otp_code:
            return False

        # Check if OTP is expired
        from datetime import datetime
        if datetime.fromisoformat(row["otp_expires_at"]) < datetime.now():
            return False

        # Mark as verified
        conn.execute(
            """
            UPDATE users
            SET otp_verified = 1, otp_code = NULL, otp_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (user_id,)
        )
        return True


def send_otp(user_id: int, phone: str) -> str:
    """Send OTP to user's phone (simplified implementation)."""
    import random
    otp_code = str(random.randint(100000, 999999))

    from datetime import datetime, timedelta
    expires_at = datetime.now() + timedelta(minutes=10)

    with db_session() as conn:
        conn.execute(
            """
            UPDATE users
            SET phone = ?, otp_code = ?, otp_expires_at = ?, otp_verified = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (phone, otp_code, expires_at.isoformat(), user_id)
        )

    # In real implementation, send SMS here
    print(f"OTP for {phone}: {otp_code}")  # For development only
    return otp_code


def update_user_rank(user_id: int, new_rank: str) -> None:
    """Update user's rank."""
    with db_session() as conn:
        conn.execute(
            "UPDATE users SET rank = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_rank, user_id)
        )

