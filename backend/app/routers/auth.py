"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_current_user
from ..core.security import create_access_token, create_refresh_token, decode_token
from ..models.schemas import (
    AuthCredentials,
    AuthResponse,
    OTPSendRequest,
    OTPVerifyRequest,
    RefreshTokenRequest,
    TokenPair,
    UserCreate,
    UserProfile,
    UserPublic,
)
from ..services.users import (
    authenticate_user,
    create_user,
    get_user_by_id,
    get_user_profile_by_id,
    send_otp,
    verify_otp,
)


router = APIRouter()


@router.post("/register", response_model=UserProfile, status_code=201)
def register_user(payload: UserCreate) -> UserProfile:
    user = create_user(payload)
    return get_user_profile_by_id(user.id)


@router.post("/login", response_model=AuthResponse)
def login_user(payload: AuthCredentials) -> AuthResponse:
    user = authenticate_user(payload)
    profile = get_user_profile_by_id(user.id)
    tokens = TokenPair(
        access_token=create_access_token(str(user.id), "user"),
        refresh_token=create_refresh_token(str(user.id), "user"),
    )
    return AuthResponse(user=profile, tokens=tokens)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshTokenRequest) -> TokenPair:
    try:
        token_payload = decode_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user = get_user_by_id(int(token_payload.sub))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    return TokenPair(
        access_token=create_access_token(str(user.id), token_payload.role),
        refresh_token=create_refresh_token(str(user.id), token_payload.role),
    )


@router.post("/otp/send")
def send_otp_code(payload: OTPSendRequest) -> dict:
    """Send OTP to phone number."""
    # In a real implementation, validate phone number format
    otp_code = send_otp(0, payload.phone)  # User ID 0 for anonymous sending
    return {"message": "OTP sent successfully", "otp": otp_code}  # Remove otp in production


@router.post("/otp/verify")
def verify_otp_code(payload: OTPVerifyRequest, current_user: UserPublic = Depends(get_current_user)) -> dict:
    """Verify OTP code."""
    if verify_otp(current_user.id, payload.otp):
        return {"message": "OTP verified successfully"}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")


@router.get("/me", response_model=UserProfile)
def read_current_user(current_user: UserPublic = Depends(get_current_user)) -> UserProfile:
    return get_user_profile_by_id(current_user.id)

