"""Support ticket management."""

from typing import List

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import SupportTicket


def _row_to_ticket(row) -> SupportTicket:
    return SupportTicket(
        id=row["id"],
        user_id=row["user_id"],
        subject=row["subject"],
        message=row["message"],
        status=row["status"],
        priority=row["priority"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        resolved_at=row["resolved_at"],
    )


def create_support_ticket(user_id: int, subject: str, message: str, priority: str = "medium") -> SupportTicket:
    """Create a new support ticket."""
    valid_priorities = ["low", "medium", "high", "urgent"]
    if priority not in valid_priorities:
        priority = "medium"

    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO support_tickets (user_id, subject, message, priority)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, subject, message, priority),
        )
        ticket_id = cursor.lastrowid

    return get_support_ticket(ticket_id)


def get_support_ticket(ticket_id: int) -> SupportTicket:
    """Get a support ticket by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM support_tickets WHERE id = ?",
            (ticket_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found")

    return _row_to_ticket(row)


def get_user_support_tickets(user_id: int) -> List[SupportTicket]:
    """Get all support tickets for a user."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        ).fetchall()

    return [_row_to_ticket(row) for row in rows]


def get_all_support_tickets(status_filter: str | None = None) -> List[SupportTicket]:
    """Get all support tickets (admin only)."""
    query = "SELECT * FROM support_tickets"
    params = ()

    if status_filter:
        query += " WHERE status = ?"
        params = (status_filter,)

    query += " ORDER BY created_at DESC"

    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()

    return [_row_to_ticket(row) for row in rows]


def update_ticket_status(ticket_id: int, status: str) -> SupportTicket:
    """Update support ticket status."""
    valid_statuses = ["open", "in_progress", "resolved", "closed"]
    if status not in valid_statuses:
        raise ValueError("Invalid status")

    update_data = {"status": status}
    if status in ["resolved", "closed"]:
        update_data["resolved_at"] = "CURRENT_TIMESTAMP"

    fields = ", ".join(f"{key} = ?" for key in update_data.keys())
    values = list(update_data.values()) + [ticket_id]

    with db_session() as conn:
        conn.execute(f"UPDATE support_tickets SET {fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)

    return get_support_ticket(ticket_id)


def add_ticket_response(ticket_id: int, response: str, responder_id: int) -> None:
    """Add a response to a support ticket."""
    # In a real implementation, you'd have a separate responses table
    # For now, we'll just update the ticket status and add a note
    with db_session() as conn:
        # Get current ticket
        ticket = get_support_ticket(ticket_id)

        # Update with response (simplified - in reality, store responses separately)
        updated_message = f"{ticket.message}\n\n--- Response ---\n{response}"

        conn.execute(
            """
            UPDATE support_tickets
            SET message = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (updated_message, ticket_id),
        )


def get_ticket_statistics() -> dict:
    """Get support ticket statistics."""
    with db_session() as conn:
        stats = conn.execute(
            """
            SELECT
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
                COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets,
                AVG(CASE WHEN resolved_at IS NOT NULL THEN
                    JULIANDAY(resolved_at) - JULIANDAY(created_at)
                END) * 24 as avg_resolution_hours
            FROM support_tickets
            """
        ).fetchone()

    return {
        "total_tickets": stats["total_tickets"],
        "open_tickets": stats["open_tickets"],
        "in_progress_tickets": stats["in_progress_tickets"],
        "urgent_tickets": stats["urgent_tickets"],
        "avg_resolution_hours": stats["avg_resolution_hours"] or 0,
    }
