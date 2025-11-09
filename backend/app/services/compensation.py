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

    return CompensationSummary(
        total_earnings=user_row["total_earnings"],
        wallet_balance=user_row["wallet_balance"],
        pending_payouts=pending_row["pending"] or 0,
        direct_referral_bonus=earnings_by_type.get("direct_referral", 0),
        team_commission=earnings_by_type.get("team_commission", 0),
        rank_bonuses=earnings_by_type.get("rank_bonus", 0),
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


def process_team_commissions(user_id: int, level: int, package_amount: float) -> None:
    """Process team commissions up to 10 levels (0.1% to 2%)."""
    # This is a simplified implementation
    # In a real MLM system, this would traverse the entire network tree
    commission_rate = min(0.002, max(0.001, level * 0.0001))  # 0.1% to 2%
    commission_amount = package_amount * commission_rate

    if commission_amount > 0:
        create_transaction(
            user_id=user_id,
            transaction_type="team_commission",
            amount=commission_amount,
            description=f"Level {level} team commission",
            reference_id=None,  # Would reference the original purchase
        )


def check_and_award_rank_bonuses(user_id: int) -> None:
    """Check user's eligibility for rank bonuses and award if qualified."""
    user = get_user_by_id(user_id)
    if not user:
        return

    rank_requirements = {
        "achiever": {"sales_volume": 100},
        "leader": {"sales_volume": 1000},
        "pro_leader": {"sales_volume": 10000},
        "champion": {"sales_volume": 100000},
        "legend": {"sales_volume": 1000000},
    }

    # This is a simplified check - in reality, you'd calculate total team sales volume
    # For now, we'll use direct referrals as a proxy
    total_sales = user.direct_referrals * 50000  # Assuming average package price

    for rank, requirements in rank_requirements.items():
        if total_sales >= requirements["sales_volume"] and user.rank != rank:
            # Award rank bonus
            bonuses = {
                "achiever": 10000,
                "leader": 100000,
                "pro_leader": 1000000,
                "champion": 10000000,
                "legend": 100000000,
            }

            bonus_amount = bonuses.get(rank, 0)
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


def process_payout_request(user_id: int, amount: float) -> CompensationTransaction:
    """Process a payout request."""
    user = get_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")

    if amount > user.wallet_balance:
        raise ValueError("Insufficient wallet balance")

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
