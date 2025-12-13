"""Package purchase and order service logic."""

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import OrderCreate, OrderDetail, OrderSummary
from ..services.compensation import (
    process_direct_referral_bonus,
    queue_team_commission_for_sale,
    check_and_award_rank_bonuses,
)
from ..services.network import (
    update_user_sales_count,
    propagate_sales_to_upline,
)
from ..services.users import get_user_by_id


def _row_to_order_summary(row) -> OrderSummary:
    # Safely get sales_units from row (handle both dict and sqlite3.Row)
    sales_units = 1
    try:
        if "sales_units" in row.keys():
            sales_units = row["sales_units"] or 1
    except (KeyError, AttributeError, TypeError):
        sales_units = 1
    
    return OrderSummary(
        id=row["id"],
        user_id=row["user_id"],
        package_name=row["package_name"],
        amount=row["amount"],
        status=row["status"],
        created_at=row["created_at"],
        paid_at=row["paid_at"],
        sales_units=sales_units,
        user_email=row["user_email"] if "user_email" in row.keys() else None,
        user_name=row["user_name"] if "user_name" in row.keys() else None,
    )


def _row_to_order_detail(row) -> OrderDetail:
    return OrderDetail(
        id=row["id"],
        user_id=row["user_id"],
        package_name=row["package_name"],
        amount=row["amount"],
        status=row["status"],
        created_at=row["created_at"],
        paid_at=row["paid_at"],
        payment_method=row["payment_method"],
        payment_reference=row["payment_reference"],
    )


def create_package_order(user_id: int, payload: OrderCreate) -> OrderDetail:
    """Create a package purchase order."""
    # Get package details
    with db_session() as conn:
        package_row = conn.execute(
            "SELECT name, price FROM packages WHERE id = ? AND is_active = 1",
            (payload.package_id,)
        ).fetchone()

    if not package_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")

    with db_session() as conn:
        cursor = conn.cursor()
        # Calculate sales units: 1 unit = ₹5,000 (as per requirements)
        # For variable-priced packages, normalize to units
        PACKAGE_PRICE_PER_UNIT = 5000.0
        sales_units = max(1, int(package_row["price"] / PACKAGE_PRICE_PER_UNIT))
        
        cursor.execute(
            """
            INSERT INTO orders (user_id, package_id, amount, payment_method, payment_reference, sales_units)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload.package_id,
                package_row["price"],
                payload.payment_method,
                payload.payment_reference,
                sales_units,
            ),
        )
        order_id = cursor.lastrowid

    # Process compensation (this would normally happen after payment confirmation)
    _process_compensation_for_order(user_id, payload.package_id, package_row["price"], order_id, sales_units)

    return get_order_detail(order_id)


def _process_compensation_for_order(
    user_id: int, package_id: int, amount: float, order_id: int, sales_units: int
) -> None:
    """Process compensation for package purchase.
    
    This function:
    1. Updates sales counts (direct and team)
    2. Processes direct referral bonus (instant)
    3. Queues team commissions for weekly calculation
    4. Checks and awards rank bonuses
    """
    user = get_user_by_id(user_id)
    if not user:
        return

    # Update user's direct sales count
    update_user_sales_count(user_id, sales_units)
    
    # Propagate sales to upline (update team_sales_count for all upline members)
    propagate_sales_to_upline(user_id, sales_units)

    # Process direct referral bonus (instant - 20% of package amount)
    # Get referrer_id from database (not in UserPublic model)
    with db_session() as conn:
        user_row = conn.execute(
            "SELECT referrer_id FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
    
    if user_row and user_row["referrer_id"]:
        process_direct_referral_bonus(user_row["referrer_id"], user_id, amount)

    # Queue team commissions for weekly calculation
    # This traverses the entire upline network and queues commissions
    queue_team_commission_for_sale(user_id, sales_units, order_id, amount)

    # Check and award rank bonuses (if user qualifies for new rank)
    check_and_award_rank_bonuses(user_id)


def list_user_orders(user_id: int) -> list[OrderSummary]:
    """Get orders for a specific user."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT o.*, p.name as package_name, u.email as user_email, u.full_name as user_name
            FROM orders o
            JOIN packages p ON o.package_id = p.id
            JOIN users u ON o.user_id = u.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            """,
            (user_id,)
        ).fetchall()

    return [_row_to_order_summary(row) for row in rows]


def list_all_orders() -> list[OrderSummary]:
    """Get all orders (admin only)."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT o.*, p.name as package_name, u.email as user_email, u.full_name as user_name
            FROM orders o
            JOIN packages p ON o.package_id = p.id
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            """,
        ).fetchall()

    return [_row_to_order_summary(row) for row in rows]


def get_order_detail(order_id: int) -> OrderDetail:
    """Get detailed order information."""
    with db_session() as conn:
        row = conn.execute(
            """
            SELECT o.*, p.name as package_name
            FROM orders o
            JOIN packages p ON o.package_id = p.id
            WHERE o.id = ?
            """,
            (order_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return _row_to_order_detail(row)


def update_order_status(order_id: int, status: str) -> OrderDetail:
    """Update order status."""
    valid_statuses = ["pending", "paid", "failed", "refunded"]

    if status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")

    with db_session() as conn:
        if status == "paid":
            conn.execute(
                """
                UPDATE orders
                SET status = ?, paid_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (status, order_id),
            )
        else:
            conn.execute(
                "UPDATE orders SET status = ? WHERE id = ?",
                (status, order_id),
            )

    return get_order_detail(order_id)

