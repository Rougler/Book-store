"""Admin-specific endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.dependencies import get_current_admin
from ..core.security import create_access_token, create_refresh_token
from ..models.schemas import (
    AdminCredentials,
    Book,
    BookCreate,
    BookUpdate,
    OrderDetail,
    OrderSummary,
    TokenPair,
)
from ..services import admin as admin_service
from ..services.books import create_book, delete_book, get_book, list_books, update_book
from ..services.orders import get_order_detail, list_all_orders


router = APIRouter()


@router.post("/login", response_model=TokenPair)
def admin_login(payload: AdminCredentials) -> TokenPair:
    username = admin_service.authenticate_admin(payload)
    return TokenPair(
        access_token=create_access_token(username, "admin"),
        refresh_token=create_refresh_token(username, "admin"),
    )


@router.get("/books", response_model=list[Book])
def admin_books(_: str = Depends(get_current_admin)) -> list[Book]:
    return list_books()


@router.post("/books", response_model=Book, status_code=201)
def admin_create_book(payload: BookCreate, _: str = Depends(get_current_admin)) -> Book:
    return create_book(payload)


@router.put("/books/{book_id}", response_model=Book)
def admin_update_book(book_id: int, payload: BookUpdate, _: str = Depends(get_current_admin)) -> Book:
    return update_book(book_id, payload)


@router.delete("/books/{book_id}", status_code=204)
def admin_delete_book(book_id: int, _: str = Depends(get_current_admin)) -> None:
    delete_book(book_id)


@router.get("/orders", response_model=list[OrderSummary])
def admin_orders(_: str = Depends(get_current_admin)) -> list[OrderSummary]:
    return list_all_orders()


@router.get("/orders/{order_id}", response_model=OrderDetail)
def admin_order_detail(order_id: int, _: str = Depends(get_current_admin)) -> OrderDetail:
    return get_order_detail(order_id)

