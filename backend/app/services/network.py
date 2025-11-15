"""Network traversal utilities for single-leg compensation plan."""

from typing import List, Optional
from ..database.session import db_session
from ..services.users import get_user_by_id


def get_total_team_sales(user_id: int) -> int:
    """Get total cumulative team sales (in units) for a user."""
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT COALESCE(team_sales_count, 0) as total
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()
    
    return row["total"] if row else 0


def get_direct_sales_count(user_id: int) -> int:
    """Get direct sales count (in units) for a user."""
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT COALESCE(total_sales_count, 0) as total
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()
    
    return row["total"] if row else 0


def get_total_sales(user_id: int) -> int:
    """Get total sales (direct + team) in units."""
    direct = get_direct_sales_count(user_id)
    team = get_total_team_sales(user_id)
    return direct + team


def get_upline_chain(user_id: int, max_levels: int = 10000) -> List[int]:
    """Get the upline chain (referrer chain) for a user.
    
    Returns list of user IDs from direct referrer up to root, up to max_levels deep.
    """
    upline_chain = []
    current_user_id = user_id
    level = 0
    
    while current_user_id and level < max_levels:
        # Get referrer_id directly from database
        with db_session() as conn:
            row = conn.execute(
                "SELECT referrer_id FROM users WHERE id = ?",
                (current_user_id,)
            ).fetchone()
        
        if not row or not row["referrer_id"]:
            break
        
        referrer_id = row["referrer_id"]
        if referrer_id in upline_chain:  # Prevent infinite loops
            break
        
        upline_chain.append(referrer_id)
        current_user_id = referrer_id
        level += 1
    
    return upline_chain


def update_user_sales_count(user_id: int, sales_units: int) -> None:
    """Update user's direct sales count."""
    with db_session() as conn:
        conn.execute(
            """
            UPDATE users
            SET total_sales_count = COALESCE(total_sales_count, 0) + ?,
                last_sale_date = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (sales_units, user_id)
        )


def propagate_sales_to_upline(buyer_id: int, sales_units: int) -> None:
    """Propagate sales units up the referral chain.
    
    Updates team_sales_count for all upline members.
    """
    upline_chain = get_upline_chain(buyer_id)
    
    with db_session() as conn:
        for referrer_id in upline_chain:
            conn.execute(
                """
                UPDATE users
                SET team_sales_count = COALESCE(team_sales_count, 0) + ?
                WHERE id = ?
                """,
                (sales_units, referrer_id)
            )


def calculate_tiered_commission_rate(total_team_sales: int) -> float:
    """Calculate commission rate based on tiered structure.
    
    Args:
        total_team_sales: Total cumulative team sales in units
        
    Returns:
        Commission rate as decimal (e.g., 0.02 for 2%)
    """
    if total_team_sales <= 1000:
        return 0.02  # 2%
    elif total_team_sales <= 10000:
        return 0.01  # 1%
    else:
        return 0.001  # 0.1%

