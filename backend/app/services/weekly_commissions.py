"""Weekly team commission calculation and processing."""

from datetime import datetime, timedelta
from typing import List
from ..database.session import db_session
from ..services.compensation import create_transaction


def process_weekly_team_commissions() -> dict:
    """Process pending team commissions from the queue.
    
    This function should be called weekly (Monday 4-7 PM) to:
    1. Aggregate commissions for each user
    2. Create compensation transactions
    3. Update wallet balances
    4. Mark queue items as processed
    
    Returns:
        dict with processing statistics
    """
    stats = {
        "users_processed": 0,
        "total_commissions": 0.0,
        "transactions_created": 0,
    }
    
    with db_session() as conn:
        # Get all pending commissions grouped by user
        pending_commissions = conn.execute(
            """
            SELECT 
                user_id,
                SUM(commission_amount) as total_commission,
                SUM(sales_units) as total_sales_units,
                COUNT(*) as commission_count
            FROM team_commission_queue
            WHERE status = 'pending'
            GROUP BY user_id
            """
        ).fetchall()
        
        for row in pending_commissions:
            user_id = row["user_id"]
            total_commission = row["total_commission"]
            total_sales_units = row["total_sales_units"]
            commission_count = row["commission_count"]
            
            if total_commission > 0:
                # Create compensation transaction
                create_transaction(
                    user_id=user_id,
                    transaction_type="team_commission",
                    amount=total_commission,
                    description=f"Weekly team commission: {total_sales_units} units, {commission_count} commission(s)",
                    reference_id=None,
                )
                
                # Mark all queue items for this user as processed
                conn.execute(
                    """
                    UPDATE team_commission_queue
                    SET status = 'processed', processed_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND status = 'pending'
                    """,
                    (user_id,)
                )
                
                stats["users_processed"] += 1
                stats["total_commissions"] += total_commission
                stats["transactions_created"] += 1
    
    return stats


def get_pending_commissions_count() -> int:
    """Get count of pending commission queue items."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT COUNT(*) as count FROM team_commission_queue WHERE status = 'pending'"
        ).fetchone()
        return row["count"] if row else 0


def get_user_pending_commission(user_id: int) -> float:
    """Get total pending commission amount for a user."""
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT SUM(commission_amount) as total
            FROM team_commission_queue
            WHERE user_id = ? AND status = 'pending'
            """,
            (user_id,)
        ).fetchone()
        return row["total"] if row and row["total"] else 0.0

