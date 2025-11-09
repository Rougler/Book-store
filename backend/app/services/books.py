"""Book related database operations."""

from collections.abc import Sequence
from datetime import datetime
from sqlite3 import Row

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import Book, BookCreate, BookUpdate


def _book_from_row(row: Row) -> Book:
    created_at = row["created_at"]
    if isinstance(created_at, str):
        try:
            # Try parsing ISO format
            if "T" in created_at:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            else:
                # SQLite format: YYYY-MM-DD HH:MM:SS
                created_at = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
        except (ValueError, AttributeError):
            # Fallback to current time if parsing fails
            created_at = datetime.now()
    elif not isinstance(created_at, datetime):
        try:
            created_at = datetime.fromisoformat(str(created_at))
        except (ValueError, AttributeError):
            created_at = datetime.now()
    
    # sqlite3.Row doesn't have .get() method, use try/except or check keys
    def get_row_value(key: str, default=None):
        try:
            return row[key] if key in row.keys() else default
        except (KeyError, IndexError):
            return default
    
    return Book(
        id=row["id"],
        title=row["title"],
        author=row["author"],
        price=float(row["price"]) if row["price"] is not None else 0.0,
        image_url=get_row_value("image_url"),
        description=get_row_value("description"),
        category=get_row_value("category") or "",
        content_url=get_row_value("content_url"),
        is_featured=bool(get_row_value("is_featured", False)),
        is_active=bool(get_row_value("is_active", True)),
        created_at=created_at,
    )


def list_books() -> list[Book]:
    try:
        with db_session() as conn:
            rows = conn.execute("SELECT * FROM books ORDER BY created_at DESC").fetchall()
        return [_book_from_row(row) for row in rows]
    except Exception as e:
        # Log error and return empty list instead of crashing
        print(f"Error fetching books: {e}")
        return []


def get_book(book_id: int) -> Book:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return _book_from_row(row)


def create_book(payload: BookCreate) -> Book:
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO books (title, author, price, image_url, description, category, content_url, is_featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.title,
                payload.author,
                payload.price,
                payload.image_url,
                payload.description,
                payload.category,
                payload.content_url,
                payload.is_featured,
            ),
        )
        book_id = cursor.lastrowid
    return get_book(book_id)


def update_book(book_id: int, payload: BookUpdate) -> Book:
    existing = get_book(book_id)
    update_data = payload.dict(exclude_unset=True)
    if not update_data:
        return existing

    fields = ", ".join(f"{key} = ?" for key in update_data.keys())
    values: Sequence[object] = list(update_data.values()) + [book_id]

    with db_session() as conn:
        conn.execute(f"UPDATE books SET {fields} WHERE id = ?", values)

    return get_book(book_id)


def delete_book(book_id: int) -> None:
    get_book(book_id)
    with db_session() as conn:
        conn.execute("DELETE FROM books WHERE id = ?", (book_id,))

