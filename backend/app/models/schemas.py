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
    total_sales_count: int = 0
    team_sales_count: int = 0
    insurance_amount: float = 0
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
    sales_units: int = 1


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
    payment_method: str = "cod"  # cod or upi
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
    pending_weekly_commissions: float = 0


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


# Site Content Management
class HeroSlide(BaseModel):
    title: str
    subtitle: str
    quote: str
    author: str
    designation: str
    gradient: str
    bgGradient: str
    accentColor: str
    image: str
    backgroundImage: str
    altText: str


class HeroStep(BaseModel):
    number: int
    title: str
    description: str
    icon: str
    color: str
    gradient: str


class GrowthStep(BaseModel):
    step: int
    title: str
    description: str
    icon: str
    delay: int


class HubCard(BaseModel):
    title: str
    description: str
    icon: str
    color: str
    href: str
    stats: Optional[str] = None


class StatItem(BaseModel):
    icon: str
    value: str
    label: str


class WhyChooseItem(BaseModel):
    icon: str
    title: str
    description: str


class Quote(BaseModel):
    text: str
    author: str
    role: str


class HowItWorksStep(BaseModel):
    step: int
    title: str
    description: str
    icon: str


class KeyFeature(BaseModel):
    icon: str
    title: str
    description: str


class HomepageContent(BaseModel):
    hero_slides: List[HeroSlide]
    hero_steps: List[HeroStep]
    growth_model: List[GrowthStep]
    platform_hubs: List[HubCard]
    stats: List[StatItem]
    why_choose_us: List[WhyChooseItem]
    core_quote: Quote
    how_it_works: List[HowItWorksStep]
    key_features: List[KeyFeature]
    # Section Titles and Subtitles
    growth_model_title: str = "Your Growth Journey"
    growth_model_subtitle: str = "Follow our proven 4-Step Growth Model to transform your life and achieve lasting success through knowledge and wealth creation"
    platform_hubs_title: str = "Explore Our Platform Hubs"
    platform_hubs_subtitle: str = "Three powerful zones designed to accelerate your journey to mastery and financial freedom through interconnected growth"
    why_choose_us_title: str = "Why Choose Gyaan AUR Dhan?"
    why_choose_us_subtitle: str = "Join thousands of learners and entrepreneurs building their future"
    how_it_works_title: str = "Your Journey to Success"
    how_it_works_subtitle: str = "Discover how our integrated platform combines learning and earning to accelerate your growth journey"
    key_features_title: str = "Powerful Tools for Success"
    key_features_subtitle: str = "Explore the comprehensive features designed to accelerate your learning and earning journey"
    success_stories_title: str = "Real People, Real Success"
    success_stories_subtitle: str = "Hear from our community members who transformed their lives through knowledge and entrepreneurship"


class ContentUpdate(BaseModel):
    section_key: str
    content: dict


