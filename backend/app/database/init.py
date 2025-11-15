"""Database initialisation routines."""

from sqlite3 import IntegrityError

from ..core.security import hash_password
from .migrations import run_all_migrations
from .session import db_session


CREATE_STATEMENTS = (
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        aadhaar TEXT,
        pan TEXT,
        bank_name TEXT,
        branch_state TEXT,
        ifsc_code TEXT,
        account_number TEXT,
        referral_code TEXT UNIQUE,
        referrer_id INTEGER,
        kyc_verified BOOLEAN DEFAULT FALSE,
        otp_verified BOOLEAN DEFAULT FALSE,
        otp_code TEXT,
        otp_expires_at TIMESTAMP,
        role TEXT DEFAULT 'partner', -- partner, mentor, leader, admin
        rank TEXT DEFAULT 'starter', -- starter, achiever, leader, pro_leader, champion, legend
        total_earnings REAL DEFAULT 0,
        wallet_balance REAL DEFAULT 0,
        team_size INTEGER DEFAULT 0,
        direct_referrals INTEGER DEFAULT 0,
        bio TEXT,
        profile_image_url TEXT,
        achievements TEXT, -- JSON string
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
        price REAL DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        video_url TEXT,
        duration_minutes INTEGER,
        order_index INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price REAL DEFAULT 0,
        image_url TEXT,
        content_url TEXT, -- PDF or e-book URL
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_course_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        completed_lessons TEXT, -- JSON array of lesson IDs
        current_lesson_id INTEGER,
        progress_percentage REAL DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        certificate_issued BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (current_lesson_id) REFERENCES lessons(id),
        UNIQUE(user_id, course_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_book_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER,
        is_completed BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id),
        UNIQUE(user_id, book_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS compensation_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- direct_referral, team_commission, rank_bonus, payout
        amount REAL NOT NULL,
        description TEXT,
        reference_id INTEGER, -- order_id, referral_id, etc.
        status TEXT DEFAULT 'pending', -- pending, approved, paid, cancelled
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        features TEXT, -- JSON array
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT,
        payment_reference TEXT,
        status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (package_id) REFERENCES packages(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS book_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        country TEXT NOT NULL,
        phone TEXT,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded, completed
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS book_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES book_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT, -- training, seminar, webinar, ama
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location TEXT, -- physical or virtual
        max_participants INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attended BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        UNIQUE(user_id, event_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
        priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin', -- admin, super_admin
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info', -- info, success, warning, error
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
)


def _migrate_users_table(cursor) -> None:
    """Add missing columns to users table if they don't exist."""
    # Get current table schema
    cursor.execute("PRAGMA table_info(users)")
    columns = {row[1] for row in cursor.fetchall()}  # row[1] is the column name
    
    # List of columns that should exist
    # Note: UNIQUE constraints can't be added via ALTER TABLE in SQLite
    required_columns = {
        'referral_code': 'TEXT',
        'referrer_id': 'INTEGER',
        'kyc_verified': 'BOOLEAN DEFAULT FALSE',
        'otp_verified': 'BOOLEAN DEFAULT FALSE',
        'otp_code': 'TEXT',
        'otp_expires_at': 'TIMESTAMP',
        'role': "TEXT DEFAULT 'partner'",
        'rank': "TEXT DEFAULT 'starter'",
        'total_earnings': 'REAL DEFAULT 0',
        'wallet_balance': 'REAL DEFAULT 0',
        'team_size': 'INTEGER DEFAULT 0',
        'direct_referrals': 'INTEGER DEFAULT 0',
        'bio': 'TEXT',
        'profile_image_url': 'TEXT',
        'achievements': 'TEXT',
        'created_at': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        'updated_at': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    }
    
    # Add missing columns
    for column_name, column_def in required_columns.items():
        if column_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_def}")
            except Exception:
                # Column might already exist or there's a constraint issue
                pass
    
    # Create unique index on referral_code (safe to run even if column already exists)
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)")
    except Exception:
        pass


def initialize_database() -> None:
    with db_session() as conn:
        cursor = conn.cursor()
        for statement in CREATE_STATEMENTS:
            cursor.execute(statement)
        
        # Run migration to add missing columns to existing tables
        _migrate_users_table(cursor)

    # Run migrations to add new fields
    run_all_migrations()

    with db_session() as conn:
        cursor = conn.cursor()
        # Create default admin if not exists
        admin_exists = cursor.execute(
            "SELECT id FROM admins WHERE username = ?", ("admin",)
        ).fetchone()
        if not admin_exists:
            cursor.execute(
                "INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)",
                ("admin", hash_password("admin123"), "super_admin"),
            )

        # Create default packages if not exists
        package_count = cursor.execute("SELECT COUNT(*) as count FROM packages").fetchone()["count"]
        if package_count == 0:
            sample_packages = [
                (
                    "Starter Package",
                    50000.0,
                    "Perfect for beginners to start their journey in Gyaan AUR Dhan",
                    '["Access to basic courses", "Community forum access", "Direct referral bonuses", "Basic mentorship support"]',
                ),
                (
                    "Growth Package",
                    100000.0,
                    "Accelerate your growth with advanced learning modules",
                    '["All starter features", "Advanced courses", "Priority mentorship", "Team building tools", "Rank advancement support"]',
                ),
                (
                    "Leadership Package",
                    500000.0,
                    "For aspiring leaders and entrepreneurs",
                    '["All growth features", "Leadership training", "Advanced analytics", "Priority event access", "One-on-one mentoring"]',
                ),
            ]
            cursor.executemany(
                "INSERT INTO packages (name, price, description, features) VALUES (?, ?, ?, ?)",
                sample_packages,
            )

        # Create default demo user if not exists
        demo_exists = cursor.execute(
            "SELECT id FROM users WHERE email = ?", ("demo@gyaanurdhan.com",)
        ).fetchone()
        if not demo_exists:
            demo_hash = hash_password("demo12345")
            cursor.execute(
                """
                INSERT INTO users (full_name, email, password_hash, phone, referral_code, kyc_verified, otp_verified, bio)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                ("Demo Partner", "demo@gyaanurdhan.com", demo_hash, "+91-9876543210", "DEMO2024", True, True,
                 "Passionate learner and business partner in the Gyaan AUR Dhan community."),
            )

        # Insert sample courses if database is empty
        course_count = cursor.execute("SELECT COUNT(*) as count FROM courses").fetchone()["count"]
        if course_count == 0:
            sample_courses = [
                (
                    "Financial Freedom Fundamentals",
                    "Learn the basics of financial literacy and wealth building through ethical entrepreneurship.",
                    "Finance",
                    "beginner",
                    0.0,
                    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
                ),
                (
                    "Leadership Excellence",
                    "Develop leadership skills and learn how to build and manage successful teams.",
                    "Leadership",
                    "intermediate",
                    0.0,
                    "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=250&fit=crop",
                ),
                (
                    "Digital Marketing Mastery",
                    "Master modern digital marketing techniques for business growth.",
                    "Marketing",
                    "advanced",
                    0.0,
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
                ),
            ]
            cursor.executemany(
                "INSERT INTO courses (title, description, category, level, price, image_url) VALUES (?, ?, ?, ?, ?, ?)",
                sample_courses,
            )

        # Insert sample books if database is empty
        book_count = cursor.execute("SELECT COUNT(*) as count FROM books").fetchone()["count"]
        if book_count == 0:
            sample_books = [
                (
                    "Rich Dad Poor Dad",
                    "Robert Kiyosaki",
                    "Learn the difference between assets and liabilities, and how to build wealth.",
                    "Finance",
                    0.0,
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
                    "/books/rich-dad-poor-dad.pdf",
                    True,
                ),
                (
                    "The Power of Habit",
                    "Charles Duhigg",
                    "Understanding habits and how to change them for personal and professional growth.",
                    "Personal Development",
                    0.0,
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
                    "/books/power-of-habit.pdf",
                    True,
                ),
                (
                    "Atomic Habits",
                    "James Clear",
                    "Small changes that lead to remarkable results in personal development.",
                    "Personal Development",
                    0.0,
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
                    "/books/atomic-habits.pdf",
                    True,
                ),
                (
                    "How to Win Friends and Influence People",
                    "Dale Carnegie",
                    "Essential principles for effective communication and relationship building.",
                    "Communication",
                    0.0,
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
                    "/books/win-friends.pdf",
                    False,
                ),
            ]
            cursor.executemany(
                "INSERT INTO books (title, author, description, category, price, image_url, content_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                sample_books,
            )

        # Insert sample events if database is empty
        event_count = cursor.execute("SELECT COUNT(*) as count FROM events").fetchone()["count"]
        if event_count == 0:
            sample_events = [
                (
                    "Monthly Leadership Summit",
                    "Join fellow leaders for networking, learning, and inspiration. Special guest speakers and breakout sessions.",
                    "seminar",
                    "2025-01-15 10:00:00",
                    "2025-01-15 17:00:00",
                    "Virtual Event",
                    500,
                ),
                (
                    "Financial Freedom Workshop",
                    "Learn practical strategies for building wealth and achieving financial independence.",
                    "training",
                    "2025-01-20 14:00:00",
                    "2025-01-20 18:00:00",
                    "Online Webinar",
                    200,
                ),
                (
                    "AMA with Founders",
                    "Ask Me Anything session with Hrushikesh Mohapatro and leadership team. Get direct answers to your questions.",
                    "ama",
                    "2025-01-25 15:00:00",
                    "2025-01-25 16:00:00",
                    "Live Stream",
                    1000,
                ),
            ]
            cursor.executemany(
                "INSERT INTO events (title, description, event_type, start_date, end_date, location, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)",
                sample_events,
            )

