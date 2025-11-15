"""Order endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..core.dependencies import get_current_user, get_optional_user
from ..models.schemas import BookOrderCreate, BookOrderDetail, OrderCreate, OrderDetail, OrderSummary, UserPublic
from ..services.book_orders import create_book_order, get_book_order_detail
from ..services.orders import create_package_order, get_order_detail, list_user_orders, update_order_status


router = APIRouter()


@router.post("/", response_model=OrderDetail, status_code=201)
def place_order(payload: OrderCreate, current_user: UserPublic = Depends(get_current_user)) -> OrderDetail:
    return create_package_order(current_user.id, payload)


@router.post("/books", response_model=BookOrderDetail, status_code=201)
def place_book_order(payload: BookOrderCreate) -> BookOrderDetail:
    """Create a book order (no authentication required for guest checkout)."""
    return create_book_order(payload)


@router.get("/books/{order_id}", response_model=BookOrderDetail)
def get_book_order(order_id: int) -> BookOrderDetail:
    """Get book order details by order ID."""
    return get_book_order_detail(order_id)


@router.get("/", response_model=list[OrderSummary])
def my_orders(current_user: UserPublic = Depends(get_current_user)) -> list[OrderSummary]:
    return list_user_orders(current_user.id)


@router.get("/{order_id}", response_model=OrderDetail)
def my_order_detail(order_id: int, current_user: UserPublic = Depends(get_current_user)) -> OrderDetail:
    order = get_order_detail(order_id)
    if order.user_id != current_user.id and order.email != current_user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return order


@router.patch("/{order_id}/status", response_model=OrderDetail)
def update_my_order_status(
    order_id: int,
    new_status: str = Query(default="paid", description="New order status"),
    current_user: UserPublic = Depends(get_current_user)
) -> OrderDetail:
    """Update order status (for testing - allows marking orders as paid)."""
    order = get_order_detail(order_id)
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    
    return update_order_status(order_id, new_status)

