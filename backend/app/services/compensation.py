"""Compensation and earnings management."""

from typing import List

from ..database.session import db_session
from ..models.schemas import CompensationSummary, CompensationTransaction
from ..services.users import get_user_by_id


def _row_to_transaction(row) -> CompensationTransaction:
    return CompensationTransaction(
        id=row["id"],
        user_id=row["user_id"],
        type=row["type"],
        amount=row["amount"],
        description=row["description"],
        reference_id=row["reference_id"],
        status=row["status"],
        created_at=row["created_at"],
        processed_at=row["processed_at"],
    )


def create_transaction(
    user_id: int,
    transaction_type: str,
    amount: float,
    description: str,
    reference_id: int | None = None,
) -> CompensationTransaction:
    """Create a new compensation transaction."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO compensation_transactions (user_id, type, amount, description, reference_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, transaction_type, amount, description, reference_id),
        )
        transaction_id = cursor.lastrowid

        # Update user's wallet balance for approved transactions
        if transaction_type in ["direct_referral", "team_commission", "rank_bonus"]:
            cursor.execute(
                """
                UPDATE users
                SET wallet_balance = wallet_balance + ?, total_earnings = total_earnings + ?
                WHERE id = ?
                """,
                (amount, amount, user_id),
            )

    return get_transaction_by_id(transaction_id)


def get_transaction_by_id(transaction_id: int) -> CompensationTransaction:
    """Get a specific transaction by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM compensation_transactions WHERE id = ?",
            (transaction_id,)
        ).fetchone()

    if not row:
        raise ValueError("Transaction not found")

    return _row_to_transaction(row)


def get_user_transactions(user_id: int, limit: int = 50) -> List[CompensationTransaction]:
    """Get user's compensation transactions."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM compensation_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()

    return [_row_to_transaction(row) for row in rows]


def get_compensation_summary(user_id: int) -> CompensationSummary:
    """Get comprehensive compensation summary for a user."""
    with db_session() as conn:
        # Get wallet balance and total earnings from user table
        user_row = conn.execute(
            "SELECT wallet_balance, total_earnings FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

        if not user_row:
            raise ValueError("User not found")

        # Calculate different types of earnings
        earnings_rows = conn.execute(
            """
            SELECT type, SUM(amount) as total
            FROM compensation_transactions
            WHERE user_id = ? AND status = 'approved'
            GROUP BY type
            """,
            (user_id,)
        ).fetchall()

        earnings_by_type = {row["type"]: row["total"] for row in earnings_rows}

        # Calculate pending payouts
        pending_row = conn.execute(
            """
            SELECT SUM(amount) as pending
            FROM compensation_transactions
            WHERE user_id = ? AND status = 'pending' AND type = 'payout'
            """,
            (user_id,)
        ).fetchone()

    # Get pending weekly commissions
    from .weekly_commissions import get_user_pending_commission
    pending_weekly = get_user_pending_commission(user_id)
    
    return CompensationSummary(
        total_earnings=user_row["total_earnings"],
        wallet_balance=user_row["wallet_balance"],
        pending_payouts=pending_row["pending"] or 0,
        direct_referral_bonus=earnings_by_type.get("direct_referral", 0),
        team_commission=earnings_by_type.get("team_commission", 0),
        rank_bonuses=earnings_by_type.get("rank_bonus", 0),
        pending_weekly_commissions=pending_weekly,
    )


def process_direct_referral_bonus(referrer_id: int, new_user_id: int, package_amount: float) -> None:
    """Process direct referral bonus (20% of package amount)."""
    bonus_amount = package_amount * 0.20

    create_transaction(
        user_id=referrer_id,
        transaction_type="direct_referral",
        amount=bonus_amount,
        description=f"Direct referral bonus for new partner #{new_user_id}",
        reference_id=new_user_id,
    )


def queue_team_commission_for_sale(buyer_id: int, sales_units: int, order_id: int, package_amount: float) -> None:
    """Queue team commissions for weekly calculation.
    
    This function traverses the upline network and queues commission calculations
    based on tiered rates (2%, 1%, 0.1%) for weekly processing.
    """
    from datetime import datetime, timedelta
    from .network import get_upline_chain, get_total_team_sales, calculate_tiered_commission_rate
    
    # Get all upline members
    upline_chain = get_upline_chain(buyer_id, max_levels=10000)
    
    # Calculate period for weekly commission
    now = datetime.now()
    period_start = now - timedelta(days=7)
    period_end = now
    
    # Standard package price (₹5,000 per unit as per requirements)
    PACKAGE_PRICE_PER_UNIT = 5000.0
    
    with db_session() as conn:
        for level, referrer_id in enumerate(upline_chain, start=1):
            # Get total team sales for this referrer
            total_team_sales = get_total_team_sales(referrer_id)
            
            # Calculate tiered commission rate
            commission_rate = calculate_tiered_commission_rate(total_team_sales)
            
            # Calculate commission amount
            # Commission is based on sales units * package price * rate
            commission_amount = sales_units * PACKAGE_PRICE_PER_UNIT * commission_rate
            
            if commission_amount > 0:
                # Queue commission for weekly processing
                conn.execute(
                    """
                    INSERT INTO team_commission_queue 
                    (user_id, sales_units, commission_amount, level, order_id, 
                     calculation_period_start, calculation_period_end, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
                    """,
                    (
                        referrer_id,
                        sales_units,
                        commission_amount,
                        level,
                        order_id,
                        period_start.isoformat(),
                        period_end.isoformat(),
                    )
                )


def process_team_commissions(user_id: int, level: int, package_amount: float) -> None:
    """Legacy function - kept for backward compatibility.
    
    This is now replaced by queue_team_commission_for_sale() which properly
    implements the tiered commission structure.
    """
    # This function is deprecated but kept for compatibility
    # New implementation uses queue_team_commission_for_sale()
    pass


def check_and_award_rank_bonuses(user_id: int) -> None:
    """Check user's eligibility for rank bonuses and award if qualified.
    
    Ranks are based on total sales (direct + team) in units, not revenue.
    """
    from .network import get_total_sales
    
    user = get_user_by_id(user_id)
    if not user:
        return

    # Get total sales in units (direct + team)
    total_sales_units = get_total_sales(user_id)

    rank_requirements = {
        "achiever": {"sales_units": 100, "bonus": 10000, "insurance": 0},
        "leader": {"sales_units": 1000, "bonus": 100000, "insurance": 100000},
        "pro_leader": {"sales_units": 10000, "bonus": 1000000, "insurance": 1000000},
        "champion": {"sales_units": 100000, "bonus": 10000000, "insurance": 10000000},
        "legend": {"sales_units": 1000000, "bonus": 100000000, "insurance": 100000000},
    }

    # Check each rank in order
    rank_order = ["achiever", "leader", "pro_leader", "champion", "legend"]
    current_rank_index = rank_order.index(user.rank) if user.rank in rank_order else -1

    for rank in rank_order:
        requirements = rank_requirements[rank]
        
        # Only check ranks that are higher than current rank
        rank_index = rank_order.index(rank)
        if rank_index <= current_rank_index:
            continue
        
        # Check if user qualifies for this rank
        if total_sales_units >= requirements["sales_units"]:
            # Award rank bonus
            bonus_amount = requirements["bonus"]
            insurance_amount = requirements["insurance"]
            
            if bonus_amount > 0:
                create_transaction(
                    user_id=user_id,
                    transaction_type="rank_bonus",
                    amount=bonus_amount,
                    description=f"Rank advancement bonus - {rank}",
                    reference_id=None,
                )

                # Update user rank
                from .users import update_user_rank
                update_user_rank(user_id, rank)
                
                # Assign insurance benefit if applicable
                if insurance_amount > 0:
                    assign_insurance_benefit(user_id, rank, insurance_amount)
                
                # Only award one rank at a time
                break


def assign_insurance_benefit(user_id: int, rank: str, insurance_amount: float) -> None:
    """Assign insurance benefit to user upon rank upgrade."""
    with db_session() as conn:
        # Update user's insurance amount
        conn.execute(
            """
            UPDATE users
            SET insurance_amount = ?
            WHERE id = ?
            """,
            (insurance_amount, user_id)
        )
        
        # Record insurance benefit assignment
        conn.execute(
            """
            INSERT INTO insurance_benefits (user_id, rank, insurance_amount, status)
            VALUES (?, ?, ?, 'active')
            """,
            (user_id, rank, insurance_amount)
        )


def process_payout_request(user_id: int, amount: float) -> CompensationTransaction:
    """Process a payout request with minimum withdrawal validation.
    
    Minimum withdrawal:
    - Weekly payout: ₹5,000
    - Wallet withdrawal: ₹1,000
    """
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")

    if amount > user.wallet_balance:
        raise ValueError("Insufficient wallet balance")
    
    # Minimum withdrawal validation
    MIN_WALLET_WITHDRAWAL = 1000.0
    MIN_WEEKLY_PAYOUT = 5000.0
    
    # For now, we'll use wallet minimum (can be enhanced to distinguish weekly vs wallet)
    if amount < MIN_WALLET_WITHDRAWAL:
        raise ValueError(f"Minimum withdrawal amount is ₹{MIN_WALLET_WITHDRAWAL}")

    # Create payout transaction
    transaction = create_transaction(
        user_id=user_id,
        transaction_type="payout",
        amount=-amount,  # Negative to represent outgoing
        description=f"Payout request - ₹{amount}",
        reference_id=None,
    )

    # Deduct from wallet (in approved status, this would be handled differently)
    with db_session() as conn:
        conn.execute(
            "UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?",
            (amount, user_id),
        )

    return transaction


def approve_payout(transaction_id: int) -> None:
    """Approve a payout transaction."""
    with db_session() as conn:
        conn.execute(
            """
            UPDATE compensation_transactions
            SET status = 'approved', processed_at = CURRENT_TIMESTAMP
            WHERE id = ? AND type = 'payout'
            """,
            (transaction_id,)
        )


def reject_payout(transaction_id: int) -> None:
    """Reject a payout transaction and refund to wallet."""
    with db_session() as conn:
        # Get transaction details
        transaction = conn.execute(
            "SELECT user_id, amount FROM compensation_transactions WHERE id = ? AND type = 'payout'",
            (transaction_id,)
        ).fetchone()

        if transaction:
            # Refund amount to wallet
            conn.execute(
                "UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?",
                (transaction["amount"], transaction["user_id"])  # amount is negative, so subtract negative = add
            )

            # Mark transaction as cancelled
            conn.execute(
                """
                UPDATE compensation_transactions
                SET status = 'cancelled', processed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (transaction_id,)
            )
