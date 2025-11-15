"""Compensation and earnings endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_current_user
from ..models.schemas import CompensationSummary, CompensationTransaction, UserPublic
from ..services.compensation import (
    get_compensation_summary,
    get_user_transactions,
    process_payout_request,
)
from ..services.weekly_commissions import get_user_pending_commission

router = APIRouter()


@router.get("/summary", response_model=CompensationSummary)
def get_my_compensation_summary(current_user: UserPublic = Depends(get_current_user)) -> CompensationSummary:
    """Get comprehensive compensation summary for current user."""
    summary = get_compensation_summary(current_user.id)
    
    # Add pending weekly commissions
    pending_commissions = get_user_pending_commission(current_user.id)
    
    # Convert to dict, add pending_weekly_commissions, and return
    summary_dict = summary.dict()
    summary_dict["pending_weekly_commissions"] = pending_commissions
    
    return CompensationSummary(**summary_dict)


@router.get("/transactions", response_model=list[CompensationTransaction])
def get_my_transactions(
    limit: int = 50,
    current_user: UserPublic = Depends(get_current_user)
) -> list[CompensationTransaction]:
    """Get compensation transactions for current user."""
    return get_user_transactions(current_user.id, limit)


@router.post("/payout", response_model=CompensationTransaction)
def request_payout(
    amount: float,
    current_user: UserPublic = Depends(get_current_user)
) -> CompensationTransaction:
    """Request a payout from wallet balance."""
    try:
        return process_payout_request(current_user.id, amount)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

