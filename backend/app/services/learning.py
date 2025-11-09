"""Learning content management."""

from typing import List

from fastapi import HTTPException, status

from ..database.session import db_session
from ..models.schemas import (
    Book,
    BookProgress,
    Course,
    CourseProgress,
    Lesson,
    UserBookProgress,
    UserCourseProgress,
)


def _row_to_course(row) -> Course:
    return Course(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        category=row["category"],
        level=row["level"],
        price=row["price"],
        image_url=row["image_url"],
        is_active=row["is_active"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def _row_to_lesson(row) -> Lesson:
    return Lesson(
        id=row["id"],
        course_id=row["course_id"],
        title=row["title"],
        content=row["content"],
        video_url=row["video_url"],
        duration_minutes=row["duration_minutes"],
        order_index=row["order_index"],
        is_active=row["is_active"],
        created_at=row["created_at"],
    )


def _row_to_book(row) -> Book:
    return Book(
        id=row["id"],
        title=row["title"],
        author=row["author"],
        description=row["description"],
        category=row["category"],
        price=row["price"],
        image_url=row["image_url"],
        content_url=row["content_url"],
        is_featured=row["is_featured"],
        is_active=row["is_active"],
        created_at=row["created_at"],
    )


def _row_to_course_progress(row) -> UserCourseProgress:
    import json
    completed_lessons = json.loads(row["completed_lessons"]) if row["completed_lessons"] else []

    return UserCourseProgress(
        id=row["id"],
        user_id=row["user_id"],
        course_id=row["course_id"],
        completed_lessons=completed_lessons,
        current_lesson_id=row["current_lesson_id"],
        progress_percentage=row["progress_percentage"],
        is_completed=row["is_completed"],
        certificate_issued=row["certificate_issued"],
        started_at=row["started_at"],
        completed_at=row["completed_at"],
    )


def _row_to_book_progress(row) -> UserBookProgress:
    return UserBookProgress(
        id=row["id"],
        user_id=row["user_id"],
        book_id=row["book_id"],
        current_page=row["current_page"],
        total_pages=row["total_pages"],
        is_completed=row["is_completed"],
        started_at=row["started_at"],
        completed_at=row["completed_at"],
    )


# Course Management
def get_courses(active_only: bool = True) -> List[Course]:
    """Get all courses."""
    query = "SELECT * FROM courses"
    params = ()

    if active_only:
        query += " WHERE is_active = 1"

    query += " ORDER BY created_at DESC"

    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()

    return [_row_to_course(row) for row in rows]


def get_course(course_id: int) -> Course:
    """Get a specific course by ID."""
    with db_session() as conn:
        row = conn.execute("SELECT * FROM courses WHERE id = ?", (course_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    return _row_to_course(row)


def get_course_lessons(course_id: int) -> List[Lesson]:
    """Get all lessons for a course."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM lessons WHERE course_id = ? AND is_active = 1 ORDER BY order_index",
            (course_id,)
        ).fetchall()

    return [_row_to_lesson(row) for row in rows]


def get_featured_books() -> List[Book]:
    """Get featured books."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM books WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC"
        ).fetchall()

    return [_row_to_book(row) for row in rows]


def get_books(category: str | None = None) -> List[Book]:
    """Get all books, optionally filtered by category."""
    query = "SELECT * FROM books WHERE is_active = 1"
    params = ()

    if category:
        query += " AND category = ?"
        params = (category,)

    query += " ORDER BY created_at DESC"

    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()

    return [_row_to_book(row) for row in rows]


def get_book(book_id: int) -> Book:
    """Get a specific book by ID."""
    with db_session() as conn:
        row = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    return _row_to_book(row)


# Course Progress Management
def enroll_in_course(user_id: int, course_id: int) -> UserCourseProgress:
    """Enroll user in a course."""
    # Check if already enrolled
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM user_course_progress WHERE user_id = ? AND course_id = ?",
            (user_id, course_id)
        ).fetchone()

        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled in this course")

        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO user_course_progress (user_id, course_id, completed_lessons, progress_percentage)
            VALUES (?, ?, '[]', 0)
            """,
            (user_id, course_id),
        )
        progress_id = cursor.lastrowid

    return get_user_course_progress(progress_id)


def get_user_course_progress(progress_id: int) -> UserCourseProgress:
    """Get course progress by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM user_course_progress WHERE id = ?",
            (progress_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course progress not found")

    return _row_to_course_progress(row)


def get_user_course_progress_by_course(user_id: int, course_id: int) -> UserCourseProgress | None:
    """Get user's progress for a specific course."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM user_course_progress WHERE user_id = ? AND course_id = ?",
            (user_id, course_id)
        ).fetchone()

    if row:
        return _row_to_course_progress(row)
    return None


def get_user_enrolled_courses(user_id: int) -> List[UserCourseProgress]:
    """Get all courses a user is enrolled in."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM user_course_progress WHERE user_id = ? ORDER BY started_at DESC",
            (user_id,)
        ).fetchall()

    return [_row_to_course_progress(row) for row in rows]


def update_course_progress(
    user_id: int,
    course_id: int,
    completed_lesson_id: int | None = None,
    current_lesson_id: int | None = None,
) -> UserCourseProgress:
    """Update user's course progress."""
    progress = get_user_course_progress_by_course(user_id, course_id)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled in this course")

    updates = {}

    if completed_lesson_id:
        import json
        completed_lessons = progress.completed_lessons
        if completed_lesson_id not in completed_lessons:
            completed_lessons.append(completed_lesson_id)
            updates["completed_lessons"] = json.dumps(completed_lessons)

            # Calculate progress percentage
            total_lessons = len(get_course_lessons(course_id))
            if total_lessons > 0:
                updates["progress_percentage"] = (len(completed_lessons) / total_lessons) * 100

                if len(completed_lessons) == total_lessons:
                    updates["is_completed"] = True
                    updates["completed_at"] = "CURRENT_TIMESTAMP"

    if current_lesson_id:
        updates["current_lesson_id"] = current_lesson_id

    if updates:
        fields = ", ".join(f"{key} = ?" for key in updates.keys())
        values = list(updates.values()) + [progress.id]

        with db_session() as conn:
            conn.execute(f"UPDATE user_course_progress SET {fields} WHERE id = ?", values)

    return get_user_course_progress(progress.id)


def issue_certificate(user_id: int, course_id: int) -> None:
    """Issue certificate for completed course."""
    progress = get_user_course_progress_by_course(user_id, course_id)
    if not progress or not progress.is_completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course not completed")

    with db_session() as conn:
        conn.execute(
            "UPDATE user_course_progress SET certificate_issued = 1 WHERE id = ?",
            (progress.id,)
        )


# Book Progress Management
def start_reading_book(user_id: int, book_id: int) -> UserBookProgress:
    """Start reading a book."""
    # Check if already started
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM user_book_progress WHERE user_id = ? AND book_id = ?",
            (user_id, book_id)
        ).fetchone()

        if existing:
            return get_user_book_progress(existing["id"])

        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_book_progress (user_id, book_id) VALUES (?, ?)",
            (user_id, book_id),
        )
        progress_id = cursor.lastrowid

    return get_user_book_progress(progress_id)


def get_user_book_progress(progress_id: int) -> UserBookProgress:
    """Get book progress by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM user_book_progress WHERE id = ?",
            (progress_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book progress not found")

    return _row_to_book_progress(row)


def get_user_book_progress_by_book(user_id: int, book_id: int) -> UserBookProgress | None:
    """Get user's progress for a specific book."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM user_book_progress WHERE user_id = ? AND book_id = ?",
            (user_id, book_id)
        ).fetchone()

    if row:
        return _row_to_book_progress(row)
    return None


def update_book_progress(
    user_id: int,
    book_id: int,
    current_page: int,
    total_pages: int | None = None,
) -> UserBookProgress:
    """Update user's book reading progress."""
    progress = get_user_book_progress_by_book(user_id, book_id)
    if not progress:
        progress = start_reading_book(user_id, book_id)

    updates = {"current_page": current_page}

    if total_pages:
        updates["total_pages"] = total_pages

    # Check if completed
    if total_pages and current_page >= total_pages:
        updates["is_completed"] = True
        updates["completed_at"] = "CURRENT_TIMESTAMP"

    fields = ", ".join(f"{key} = ?" for key in updates.keys())
    values = list(updates.values()) + [progress.id]

    with db_session() as conn:
        conn.execute(f"UPDATE user_book_progress SET {fields} WHERE id = ?", values)

    return get_user_book_progress(progress.id)


def get_user_reading_books(user_id: int) -> List[UserBookProgress]:
    """Get all books a user is reading."""
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM user_book_progress WHERE user_id = ? ORDER BY started_at DESC",
            (user_id,)
        ).fetchall()

    return [_row_to_book_progress(row) for row in rows]
