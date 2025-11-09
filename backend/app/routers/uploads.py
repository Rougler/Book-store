"""File upload endpoints."""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from ..config import settings
from ..core.dependencies import get_current_admin

router = APIRouter()

# Create upload directories
BASE_DIR = settings.database_path.parent
UPLOAD_DIR = BASE_DIR / "uploads"
IMAGES_DIR = UPLOAD_DIR / "images"
PDFS_DIR = UPLOAD_DIR / "pdfs"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)
PDFS_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
ALLOWED_PDF_TYPES = {"application/pdf"}


def get_file_extension(content_type: str) -> str:
    """Get file extension from content type."""
    mapping = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
    }
    return mapping.get(content_type, "")


@router.post("/image", status_code=201)
async def upload_image(file: UploadFile = File(...), _: str = Depends(get_current_admin)) -> dict[str, str]:
    """Upload an image file."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    # Generate unique filename
    file_extension = get_file_extension(file.content_type)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = IMAGES_DIR / unique_filename

    # Save file
    try:
        content = await file.read()
        file_path.write_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file: {str(e)}")

    # Return URL path (relative to API base)
    url_path = f"/api/uploads/images/{unique_filename}"
    return {"url": url_path}


@router.post("/pdf", status_code=201)
async def upload_pdf(file: UploadFile = File(...), _: str = Depends(get_current_admin)) -> dict[str, str]:
    """Upload a PDF file."""
    if file.content_type not in ALLOWED_PDF_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_PDF_TYPES)}",
        )

    # Generate unique filename
    file_extension = get_file_extension(file.content_type)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = PDFS_DIR / unique_filename

    # Save file
    try:
        content = await file.read()
        file_path.write_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file: {str(e)}")

    # Return URL path (relative to API base)
    url_path = f"/api/uploads/pdfs/{unique_filename}"
    return {"url": url_path}


@router.get("/images/{filename}")
async def get_image(filename: str) -> FileResponse:
    """Serve uploaded image files."""
    file_path = IMAGES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)


@router.get("/pdfs/{filename}")
async def get_pdf(filename: str) -> FileResponse:
    """Serve uploaded PDF files."""
    file_path = PDFS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path, media_type="application/pdf")

