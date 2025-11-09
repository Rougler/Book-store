"""Package purchase and order service logic."""

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import OrderCreate, OrderDetail, OrderSummary
from ..services.compensation import process_direct_referral_bonus, process_team_commissions
from ..services.users import get_user_by_id


def _row_to_order_summary(row) -> OrderSummary:
    return OrderSummary(
        id=row["id"],
        user_id=row["user_id"],
        package_name=row["package_name"],
        amount=row["amount"],
        status=row["status"],
        created_at=row["created_at"],
        paid_at=row["paid_at"],
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
        cursor.execute(
            """
            INSERT INTO orders (user_id, package_id, amount, payment_method, payment_reference)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload.package_id,
                package_row["price"],
                payload.payment_method,
                payload.payment_reference,
            ),
        )
        order_id = cursor.lastrowid

    # Process compensation (this would normally happen after payment confirmation)
    _process_compensation_for_order(user_id, payload.package_id, package_row["price"])

    return get_order_detail(order_id)


def _process_compensation_for_order(user_id: int, package_id: int, amount: float) -> None:
    """Process compensation for package purchase."""
    user = get_user_by_id(user_id)
    if not user:
        return

    # Process direct referral bonus
    if user.referrer_id:
        process_direct_referral_bonus(user.referrer_id, user_id, amount)

    # Process team commissions (simplified - would need proper network traversal)
    # In a real implementation, this would traverse up the referral tree
    # For now, just process a simple commission
    process_team_commissions(user_id, 1, amount)


def list_user_orders(user_id: int) -> list[OrderSummary]:
    """Get orders for a specific user."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT o.*, p.name as package_name
            FROM orders o
            JOIN packages p ON o.package_id = p.id
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
            SELECT o.*, p.name as package_name
            FROM orders o
            JOIN packages p ON o.package_id = p.id
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

