# 📘 Gyaan AUR Dhan

**Unlocking Potential Through the Power of Knowledge**

A comprehensive learning and wealth-building platform that combines education (Gyaan) with ethical entrepreneurship (Dhan) through a single-leg compensation plan.

## 🌟 Mission

To empower individuals with the right **Knowledge (Gyaan)** and **Wealth-Building Tools (Dhan)** for achieving **personal mastery**, **financial freedom**, and **leadership excellence** within a unified ecosystem.

## 🏗️ Architecture

This application has been refactored from a Flask-based bookstore to a modern full-stack application:

### Backend (FastAPI)
- **Location:** `backend/`
- **Language:** Python 3.9+
- **Framework:** FastAPI with SQLAlchemy-style database operations
- **Database:** SQLite with comprehensive schema for MLM operations
- **Authentication:** JWT tokens with role-based access control

### Frontend (Next.js)
- **Location:** `frontend/`
- **Language:** TypeScript
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with custom design system
- **State Management:** Zustand for client state, React Context for auth

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 18+ (for frontend)
- SQLite3 (comes with Python)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the FastAPI server:**
```bash
python main.py
```

The backend will be available at: http://localhost:8000
- API docs: http://localhost:8000/docs (Swagger UI)

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Run the Next.js development server:**
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## 🎯 Core Features

### 👤 User Management
- **Registration:** KYC-compliant signup with referral codes
- **Authentication:** JWT-based login with role management
- **OTP Verification:** Phone number verification system
- **KYC Process:** Document submission and verification

### 📚 Learning Platform (Gyaan Hub)
- **Courses:** Structured learning paths with video content
- **Books:** Digital library with reading progress tracking
- **Progress Tracking:** Completion certificates and badges
- **Learning Dashboard:** Personalized learning journey

### 💰 Compensation System (Dhan Hub)
- **Direct Referrals:** 20% instant bonus on package purchases
- **Team Commissions:** Multi-level passive income (0.1% to 2%)
- **Rank Advancement:** Achievement-based bonuses (₹10K to ₹10Cr)
- **Wallet System:** Real-time earnings tracking

### 👥 Community Features
- **Events:** Live webinars, seminars, and workshops
- **Leaderboards:** Performance-based recognition
- **Support System:** Integrated ticketing and help desk
- **Notifications:** In-app messaging and alerts

### 👑 Admin Panel
- **User Management:** Approve, suspend, and verify business partners
- **Content Management:** Courses, books, and learning materials
- **Compensation Config:** Edit rates, ranks, and bonus structures
- **Analytics Dashboard:** Revenue, user growth, and performance metrics

## 🗄️ Database Schema

### Core Tables
- **users** - Business partners with KYC and referral data
- **courses** - Learning content with lessons and progress
- **books** - Digital library with reading progress
- **packages** - Subscription tiers and pricing
- **orders** - Package purchases and payments
- **compensation_transactions** - Earnings and payouts
- **events** - Community gatherings and webinars
- **support_tickets** - Customer service interactions

### Key Relationships
- Users have hierarchical referral structure (parent-child)
- Courses contain multiple lessons with progress tracking
- Compensation calculated based on referral network depth
- Events support registration and attendance tracking

## 🔐 Default Credentials

### Admin Access
- **Username:** `admin`
- **Password:** `admin123`
- **URL:** http://localhost:3000/admin/login

### Demo User
- **Email:** `demo@gyaanurdhan.com`
- **Password:** `demo12345`
- **Referral Code:** `DEMO2024`

## 🎨 Design System

### Branding Colors
- **Gyaan (Knowledge):** Royal Blue (#1e40af)
- **Dhan (Wealth):** Gold (#eab308)
- **Neutral:** Slate grays for text and backgrounds

### UX Principles
- **Dashboard-Driven:** All features accessible from main hubs
- **Mobile-First:** Responsive design for all devices
- **Gamification:** Progress bars, badges, and achievement unlocks
- **Motivational Copy:** Empowering language throughout

## 🛠️ Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
The application auto-creates and migrates the database on startup. For development:
```bash
cd backend
rm bookstore.db  # Delete existing database
python main.py   # Recreates with fresh schema
```

## 📊 Compensation Plan

### Direct Referral Bonus
- **Rate:** 20% of package amount
- **Example:** ₹50,000 package = ₹10,000 instant bonus

### Team Commission Structure
| Level | Commission Rate | Description |
|-------|-----------------|-------------|
| 1-5   | 2%             | Close team members |
| 6-10  | 1%             | Extended network |
| 11-20 | 0.5%           | Broader community |
| 21+   | 0.1%           | Passive income |

### Rank Achievement Bonuses
| Rank          | Sales Volume | Bonus Amount |
|---------------|--------------|--------------|
| Achiever      | ₹100K       | ₹10,000     |
| Leader        | ₹1M         | ₹1L + Insurance |
| Pro Leader    | ₹10M        | ₹10L + Insurance |
| Champion      | ₹1B         | ₹1Cr + Insurance |
| Legend        | ₹10B        | ₹10Cr + Insurance |

## 🔒 Security Features

- **JWT Authentication:** Secure token-based auth
- **Role-Based Access:** User, Admin, and Super Admin roles
- **OTP Verification:** Phone number validation
- **KYC Compliance:** Document verification system
- **Data Encryption:** Password hashing and secure storage

## 🚀 Deployment

### Production Checklist
- [ ] Change default admin password
- [ ] Configure environment variables
- [ ] Set up proper database (PostgreSQL recommended)
- [ ] Enable HTTPS/SSL
- [ ] Configure payment gateways
- [ ] Set up file storage for KYC documents
- [ ] Configure email/SMS services

### Environment Variables
```bash
# Backend (.env in backend/)
DATABASE_URL=sqlite:///production.db
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=https://yourdomain.com

# Frontend (.env.local in frontend/)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Use the in-app support ticket system

---

**"When you change what you read, you change what you think. When you change what you think, you change how you live."**
— *Hrushikesh Mohapatro*

*Gyaan Brings Growth. Dhan Brings Freedom. Together, They Build Legacy.*

