"""Book order service logic."""

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import BookOrderCreate, BookOrderDetail, BookOrderItem
from ..services.books import get_book


def create_book_order(payload: BookOrderCreate) -> BookOrderDetail:
    """Create a book order."""
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    # Validate all books exist and calculate total
    total_amount = 0.0
    order_items = []

    for item in payload.items:
        book = get_book(item.book_id)
        if not book.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book '{book.title}' is not available",
            )
        item_total = book.price * item.quantity
        total_amount += item_total
        order_items.append((book, item.quantity, book.price))

    # Create order
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO book_orders (
                email, first_name, last_name, address, city, state, zip_code, country, phone, total_amount, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            """,
            (
                payload.email,
                payload.first_name,
                payload.last_name,
                payload.address,
                payload.city,
                payload.state,
                payload.zip_code,
                payload.country,
                payload.phone,
                total_amount,
            ),
        )
        order_id = cursor.lastrowid

        # Create order items
        for book, quantity, price in order_items:
            cursor.execute(
                """
                INSERT INTO book_order_items (order_id, book_id, quantity, price)
                VALUES (?, ?, ?, ?)
                """,
                (order_id, book.id, quantity, price),
            )

    return get_book_order_detail(order_id)


def get_book_order_detail(order_id: int) -> BookOrderDetail:
    """Get detailed book order information."""
    with db_session() as conn:
        # Get order
        order_row = conn.execute(
            """
            SELECT * FROM book_orders WHERE id = ?
            """,
            (order_id,),
        ).fetchone()

        if not order_row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # Get order items
        item_rows = conn.execute(
            """
            SELECT 
                boi.*,
                b.title as book_title
            FROM book_order_items boi
            JOIN books b ON boi.book_id = b.id
            WHERE boi.order_id = ?
            ORDER BY boi.id
            """,
            (order_id,),
        ).fetchall()

    items = [
        BookOrderItem(
            id=row["id"],
            order_id=row["order_id"],
            book_id=row["book_id"],
            book_title=row["book_title"],
            quantity=row["quantity"],
            price=row["price"],
        )
        for row in item_rows
    ]

    return BookOrderDetail(
        id=order_row["id"],
        email=order_row["email"],
        first_name=order_row["first_name"],
        last_name=order_row["last_name"],
        address=order_row["address"],
        city=order_row["city"],
        state=order_row["state"],
        zip_code=order_row["zip_code"],
        country=order_row["country"],
        phone=order_row["phone"],
        total_amount=order_row["total_amount"],
        status=order_row["status"],
        created_at=order_row["created_at"],
        items=items,
    )

