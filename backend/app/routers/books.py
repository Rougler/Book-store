"""Public book endpoints."""

from fastapi import APIRouter

from ..models.schemas import Book
from ..services.books import get_book, get_similar_books, list_books


router = APIRouter()


@router.get("/", response_model=list[Book])
def get_books() -> list[Book]:
    return list_books()


@router.get("/{book_id}", response_model=Book)
def get_book_detail(book_id: int) -> Book:
    return get_book(book_id)


@router.get("/{book_id}/similar", response_model=list[Book])
def get_similar_books_endpoint(book_id: int) -> list[Book]:
    return get_similar_books(book_id)

