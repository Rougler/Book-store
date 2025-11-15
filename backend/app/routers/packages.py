"""Package endpoints."""

from fastapi import APIRouter, HTTPException, status

from ..models.schemas import Package
from ..services.packages import get_package, list_packages


router = APIRouter()


@router.get("/", response_model=list[Package])
def get_packages(active_only: bool = True) -> list[Package]:
    """Get all active packages."""
    return list_packages(active_only=active_only)


@router.get("/{package_id}", response_model=Package)
def get_package_detail(package_id: int) -> Package:
    """Get package details by ID."""
    package = get_package(package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    return package

