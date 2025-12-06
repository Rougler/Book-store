"""Payment processing endpoints."""

import hmac
import hashlib
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..config import settings
from ..database.session import db_session
from ..services.book_orders import get_book_order_detail

router = APIRouter()


class RazorpayOrderCreate(BaseModel):
    amount: int  # Amount in paise
    currency: str = "INR"
    receipt: str


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: int


@router.post("/create-order")
def create_razorpay_order(payload: RazorpayOrderCreate):
    """Create a Razorpay order for payment processing."""
    try:
        import razorpay
        
        # Check if Razorpay keys are configured
        if not settings.razorpay_key_id or settings.razorpay_key_id == "rzp_test_1DP5mmOlF5G5ag":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Razorpay Key ID not configured. Please set RAZORPAY_KEY_ID in your environment or config."
            )
        
        if not settings.razorpay_key_secret or settings.razorpay_key_secret == "YOUR_RAZORPAY_SECRET_KEY":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Razorpay Secret Key not configured. Please set RAZORPAY_KEY_SECRET in your environment or config."
            )
        
        # Initialize Razorpay client
        client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
        
        # Create order
        order_data = {
            "amount": payload.amount,
            "currency": payload.currency,
            "receipt": payload.receipt,
        }
        
        razorpay_order = client.order.create(data=order_data)
        
        return {
            "id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
        }
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay SDK not installed. Install with: pip install razorpay"
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Authentication failed" in error_msg or "authentication" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Razorpay authentication failed. Please check your Razorpay Key ID and Secret Key in the backend configuration."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {error_msg}"
        )


@router.post("/verify")
def verify_razorpay_payment(payload: RazorpayVerify):
    """Verify Razorpay payment signature and update order status."""
    try:
        import razorpay
        
        # Verify signature
        message = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.razorpay_key_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != payload.razorpay_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Update order status
        with db_session() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE book_orders 
                SET status = 'paid', 
                    payment_reference = ?,
                    paid_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (payload.razorpay_payment_id, payload.order_id)
            )
            conn.commit()
        
        return {"message": "Payment verified successfully", "order_id": payload.order_id}
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay SDK not installed"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

