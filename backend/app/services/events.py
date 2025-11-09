"""Event management service."""

from typing import List

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import Event, EventRegistration


def _row_to_event(row) -> Event:
    return Event(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        event_type=row["event_type"],
        start_date=row["start_date"],
        end_date=row["end_date"],
        location=row["location"],
        max_participants=row["max_participants"],
        is_active=row["is_active"],
        created_at=row["created_at"],
    )


def _row_to_registration(row) -> EventRegistration:
    return EventRegistration(
        id=row["id"],
        user_id=row["user_id"],
        event_id=row["event_id"],
        registered_at=row["registered_at"],
        attended=row["attended"],
    )


def get_events(active_only: bool = True) -> List[Event]:
    """Get all events."""
    query = "SELECT * FROM events"
    params = ()

    if active_only:
        query += " WHERE is_active = 1"

    query += " ORDER BY start_date ASC"

    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()

    return [_row_to_event(row) for row in rows]


def get_event(event_id: int) -> Event:
    """Get a specific event by ID."""
    with db_session() as conn:
        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    return _row_to_event(row)


def get_upcoming_events(limit: int = 10) -> List[Event]:
    """Get upcoming events."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT * FROM events
            WHERE is_active = 1 AND start_date > CURRENT_TIMESTAMP
            ORDER BY start_date ASC
            LIMIT ?
            """,
            (limit,)
        ).fetchall()

    return [_row_to_event(row) for row in rows]


def register_for_event(user_id: int, event_id: int) -> EventRegistration:
    """Register a user for an event."""
    # Check if event exists and is active
    event = get_event(event_id)
    if not event.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is not active")

    # Check if user is already registered
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?",
            (user_id, event_id)
        ).fetchone()

        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already registered for this event")

        # Check capacity
        if event.max_participants:
            registration_count = conn.execute(
                "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?",
                (event_id,)
            ).fetchone()["count"]

            if registration_count >= event.max_participants:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is full")

        # Register user
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)",
            (user_id, event_id),
        )
        registration_id = cursor.lastrowid

    return get_event_registration(registration_id)


def get_event_registration(registration_id: int) -> EventRegistration:
    """Get event registration by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM event_registrations WHERE id = ?",
            (registration_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

    return _row_to_registration(row)


def get_user_event_registrations(user_id: int) -> List[EventRegistration]:
    """Get all event registrations for a user."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT er.*, e.title, e.start_date, e.location
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            WHERE er.user_id = ?
            ORDER BY e.start_date ASC
            """,
            (user_id,)
        ).fetchall()

    return [_row_to_registration(row) for row in rows]


def mark_attendance(registration_id: int, attended: bool) -> EventRegistration:
    """Mark attendance for an event registration."""
    with db_session() as conn:
        conn.execute(
            "UPDATE event_registrations SET attended = ? WHERE id = ?",
            (attended, registration_id),
        )

    return get_event_registration(registration_id)


def get_event_registrations(event_id: int) -> List[EventRegistration]:
    """Get all registrations for an event."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT er.*, u.full_name, u.email
            FROM event_registrations er
            JOIN users u ON er.user_id = u.id
            WHERE er.event_id = ?
            ORDER BY er.registered_at ASC
            """,
            (event_id,)
        ).fetchall()

    return [_row_to_registration(row) for row in rows]
