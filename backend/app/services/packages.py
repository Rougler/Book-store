"""Package service logic."""

from ..database.session import db_session
from ..models.schemas import Package


def _row_to_package(row) -> Package:
    import json
    
    # Parse features JSON string
    features = []
    if row["features"]:
        try:
            features = json.loads(row["features"])
        except (json.JSONDecodeError, TypeError):
            features = []
    
    return Package(
        id=row["id"],
        name=row["name"],
        price=row["price"],
        description=row["description"],
        features=features,
        is_active=bool(row["is_active"]),
        created_at=row["created_at"],
    )


def list_packages(active_only: bool = True) -> list[Package]:
    """Get all packages."""
    with db_session() as conn:
        if active_only:
            rows = conn.execute(
                "SELECT * FROM packages WHERE is_active = 1 ORDER BY price ASC"
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM packages ORDER BY price ASC"
            ).fetchall()
    
    return [_row_to_package(row) for row in rows]


def get_package(package_id: int) -> Package | None:
    """Get a specific package by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM packages WHERE id = ?", (package_id,)
        ).fetchone()
    
    if row:
        return _row_to_package(row)
    return None

