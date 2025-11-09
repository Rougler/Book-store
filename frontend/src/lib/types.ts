// User Management
export type UserCreate = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  aadhaar?: string;
  pan?: string;
  referrer_code?: string;
};

export type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  referral_code?: string | null;
  role: string;
  rank: string;
  total_earnings: number;
  wallet_balance: number;
  team_size: number;
  direct_referrals: number;
  bio?: string | null;
  profile_image_url?: string | null;
  achievements?: string | null;
  kyc_verified: boolean;
  otp_verified: boolean;
  created_at: string;
};

export type UserPublic = {
  id: number;
  full_name: string;
  email: string;
  referral_code?: string | null;
  role: string;
  rank: string;
  total_earnings: number;
  wallet_balance: number;
  team_size: number;
  direct_referrals: number;
  bio?: string | null;
  profile_image_url?: string | null;
  achievements?: string | null;
  created_at: string;
};

// Authentication
export type Tokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: UserProfile;
  tokens: Tokens;
};

export type Credentials = {
  email: string;
  password: string;
};

export type AdminCredentials = {
  username: string;
  password: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type OTPSendRequest = {
  phone: string;
};

export type OTPVerifyRequest = {
  phone: string;
  otp: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
  aadhaar?: string;
  pan?: string;
  bank_name?: string;
  branch_state?: string;
  ifsc_code?: string;
  account_number?: string;
  referrer_code?: string;
  terms: boolean;
};

// Packages and Orders
export type Package = {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
};

export type OrderCreate = {
  package_id: number;
  payment_method: string;
  payment_reference?: string;
};

export type OrderSummary = {
  id: number;
  user_id: number;
  package_name: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string | null;
};

export type OrderDetail = OrderSummary & {
  payment_method: string;
  payment_reference?: string | null;
};

// Learning Content
export type Course = {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  level: string;
  price: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: number;
  course_id: number;
  title: string;
  content?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

export type CourseProgress = {
  course_id: number;
  completed_lessons: number[];
  current_lesson_id?: number | null;
  progress_percentage: number;
  is_completed: boolean;
  certificate_issued: boolean;
  started_at: string;
  completed_at?: string | null;
};

export type UserCourseProgress = CourseProgress & {
  id: number;
  user_id: number;
};

// Books
export type Book = {
  id: number;
  title: string;
  author: string;
  description?: string | null;
  category: string;
  price: number;
  image_url?: string | null;
  content_url?: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type BookProgress = {
  book_id: number;
  current_page: number;
  total_pages?: number | null;
  is_completed: boolean;
  started_at: string;
  completed_at?: string | null;
};

export type UserBookProgress = BookProgress & {
  id: number;
  user_id: number;
};

// Cart
export type CartItem = {
  book: Book;
  quantity: number;
};

// Book Orders
export type BookOrderCreate = {
  email: string;
  first_name: string;
  last_name?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
  items: Array<{ book_id: number; quantity: number }>;
};

export type BookOrderItem = {
  id: number;
  order_id: number;
  book_id: number;
  book_title: string;
  quantity: number;
  price: number;
};

export type BookOrderDetail = {
  id: number;
  email: string;
  first_name: string;
  last_name?: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  items: BookOrderItem[];
};

// Compensation System
export type CompensationTransaction = {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  reference_id?: number | null;
  status: string;
  created_at: string;
  processed_at?: string | null;
};

export type CompensationSummary = {
  total_earnings: number;
  wallet_balance: number;
  pending_payouts: number;
  direct_referral_bonus: number;
  team_commission: number;
  rank_bonuses: number;
};

// Events and Community
export type Event = {
  id: number;
  title: string;
  description?: string | null;
  event_type: string;
  start_date: string;
  end_date?: string | null;
  location: string;
  max_participants?: number | null;
  is_active: boolean;
  created_at: string;
};

export type EventRegistration = {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  attended: boolean;
};

// Support
export type SupportTicketCreate = {
  subject: string;
  message: string;
  priority?: string;
};

export type SupportTicket = {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
};

// Dashboard
export type UserDashboard = {
  profile: UserProfile;
  compensation: CompensationSummary;
  recent_transactions: CompensationTransaction[];
  enrolled_courses: CourseProgress[];
  upcoming_events: Event[];
  unread_notifications: number;
};

// Admin
export type AdminUser = {
  id: number;
  username: string;
  role: string;
  created_at: string;
};

export type DashboardStats = {
  total_users: number;
  active_users: number;
  total_orders: number;
  total_revenue: number;
  total_compensation_paid: number;
  popular_courses: Record<string, any>[];
  recent_orders: OrderSummary[];
  top_performers: Record<string, any>[];
};

