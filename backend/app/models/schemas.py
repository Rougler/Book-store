"""Pydantic schemas for API contracts."""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# User Management
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    phone: Optional[str] = None
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    bank_name: Optional[str] = None
    branch_state: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_number: Optional[str] = None
    referrer_code: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserPublic(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    referral_code: Optional[str] = None
    role: str
    rank: str
    total_earnings: float
    wallet_balance: float
    team_size: int
    direct_referrals: int
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    achievements: Optional[str] = None
    created_at: datetime


class UserProfile(UserPublic):
    kyc_verified: bool
    otp_verified: bool


# Authentication
class AuthCredentials(BaseModel):
    email: EmailStr
    password: str


class AdminCredentials(BaseModel):
    username: str
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    user: UserPublic
    tokens: TokenPair


# OTP and KYC
class OTPSendRequest(BaseModel):
    phone: str


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str


class KYCSubmitRequest(BaseModel):
    aadhaar: str
    pan: str
    document_front_url: str
    document_back_url: str


# Packages and Orders
class PackageBase(BaseModel):
    name: str
    price: float = Field(ge=0)
    description: Optional[str] = None
    features: List[str] = []


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    description: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None


class Package(PackageBase):
    id: int
    is_active: bool
    created_at: datetime


class OrderCreate(BaseModel):
    package_id: int
    payment_method: str
    payment_reference: Optional[str] = None


class OrderSummary(BaseModel):
    id: int
    user_id: int
    package_name: str
    amount: float
    status: str
    created_at: datetime
    paid_at: Optional[datetime] = None


class OrderDetail(OrderSummary):
    payment_method: str
    payment_reference: Optional[str] = None


# Learning Content
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    level: str = "beginner"
    price: float = Field(default=0, ge=0)
    image_url: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class Course(CourseBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None


class LessonCreate(LessonBase):
    course_id: int
    order_index: int


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class Lesson(LessonBase):
    id: int
    course_id: int
    order_index: int
    is_active: bool
    created_at: datetime


class CourseProgress(BaseModel):
    course_id: int
    completed_lessons: List[int]
    current_lesson_id: Optional[int] = None
    progress_percentage: float = 0
    is_completed: bool = False
    certificate_issued: bool = False
    started_at: datetime
    completed_at: Optional[datetime] = None


class UserCourseProgress(CourseProgress):
    id: int
    user_id: int


# Books
class BookBase(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    category: str
    price: float = Field(default=0, ge=0)
    image_url: Optional[str] = None
    content_url: Optional[str] = None
    is_featured: bool = False


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    content_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class Book(BookBase):
    id: int
    is_active: bool
    created_at: datetime


# Book Orders
class BookOrderItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(ge=1)


class BookOrderCreate(BaseModel):
    email: str
    first_name: str
    last_name: Optional[str] = None
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: Optional[str] = None
    items: list[BookOrderItemCreate]


class BookOrderItem(BaseModel):
    id: int
    order_id: int
    book_id: int
    book_title: str
    quantity: int
    price: float


class BookOrderDetail(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: Optional[str] = None
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    items: list[BookOrderItem]


class BookProgress(BaseModel):
    book_id: int
    current_page: int = 0
    total_pages: Optional[int] = None
    is_completed: bool = False
    started_at: datetime
    completed_at: Optional[datetime] = None


class UserBookProgress(BookProgress):
    id: int
    user_id: int


# Compensation System
class CompensationTransaction(BaseModel):
    id: int
    user_id: int
    type: str  # direct_referral, team_commission, rank_bonus, payout
    amount: float
    description: str
    reference_id: Optional[int] = None
    status: str  # pending, approved, paid, cancelled
    created_at: datetime
    processed_at: Optional[datetime] = None


class CompensationSummary(BaseModel):
    total_earnings: float
    wallet_balance: float
    pending_payouts: float
    direct_referral_bonus: float
    team_commission: float
    rank_bonuses: float


# Events and Community
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str  # training, seminar, webinar, ama
    start_date: datetime
    end_date: Optional[datetime] = None
    location: str
    max_participants: Optional[int] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    max_participants: Optional[int] = None
    is_active: Optional[bool] = None


class Event(EventBase):
    id: int
    is_active: bool
    created_at: datetime


class EventRegistration(BaseModel):
    id: int
    user_id: int
    event_id: int
    registered_at: datetime
    attended: bool = False


# Support and Notifications
class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    priority: str = "medium"


class SupportTicket(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None


class Notification(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime


# Analytics and Dashboard
class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_orders: int
    total_revenue: float
    total_compensation_paid: float
    popular_courses: List[dict]
    recent_orders: List[OrderSummary]
    top_performers: List[dict]


class UserDashboard(BaseModel):
    profile: UserProfile
    compensation: CompensationSummary
    recent_transactions: List[CompensationTransaction]
    enrolled_courses: List[CourseProgress]
    upcoming_events: List[Event]
    unread_notifications: int


# Admin Management
class AdminUser(BaseModel):
    id: int
    username: str
    role: str
    created_at: datetime

