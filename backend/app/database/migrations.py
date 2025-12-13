"""Database migration utilities for schema updates."""

from .session import db_session


def migrate_add_missing_user_columns() -> None:
    """Add missing columns to users table that might not exist in old databases."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # Add bank-related columns if missing
        columns_to_add = [
            ("bank_name", "TEXT"),
            ("branch_state", "TEXT"),
            ("ifsc_code", "TEXT"),
            ("account_number", "TEXT"),
        ]
        
        for column_name, column_type in columns_to_add:
            try:
                cursor.execute(f"""
                    ALTER TABLE users 
                    ADD COLUMN {column_name} {column_type}
                """)
            except Exception:
                pass  # Column might already exist
        
        conn.commit()


def migrate_add_sales_tracking() -> None:
    """Add sales unit tracking fields to users and orders tables."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # Add sales tracking fields to users table
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN total_sales_count INTEGER DEFAULT 0
            """)
        except Exception:
            pass  # Column might already exist
        
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN team_sales_count INTEGER DEFAULT 0
            """)
        except Exception:
            pass
        
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN insurance_amount REAL DEFAULT 0
            """)
        except Exception:
            pass
        
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN consecutive_active_months INTEGER DEFAULT 0
            """)
        except Exception:
            pass
        
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN last_sale_date TIMESTAMP
            """)
        except Exception:
            pass
        
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN monthly_sales_count INTEGER DEFAULT 0
            """)
        except Exception:
            pass
        
        # Add sales_units field to orders table
        try:
            cursor.execute("""
                ALTER TABLE orders 
                ADD COLUMN sales_units INTEGER DEFAULT 1
            """)
        except Exception:
            pass
        
        conn.commit()


def migrate_add_team_commission_queue() -> None:
    """Create table for weekly team commission queue."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS team_commission_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                sales_units INTEGER NOT NULL,
                commission_amount REAL NOT NULL,
                level INTEGER NOT NULL,
                order_id INTEGER,
                calculation_period_start TIMESTAMP NOT NULL,
                calculation_period_end TIMESTAMP NOT NULL,
                status TEXT DEFAULT 'pending', -- pending, processed, cancelled
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """)
        conn.commit()


def migrate_add_insurance_benefits() -> None:
    """Create table for insurance benefit tracking."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS insurance_benefits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                rank TEXT NOT NULL,
                insurance_amount REAL NOT NULL,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active', -- active, expired, cancelled
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()


def migrate_orders_table_schema() -> None:
    """Migrate orders table from legacy book orders schema to package orders schema.
    
    If the orders table has the old schema (with email, address fields), migrate that data
    to book_orders table and recreate orders table with the correct schema for packages.
    """
    with db_session() as conn:
        cursor = conn.cursor()
        
        # Check if orders table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='orders'
        """)
        table_exists = cursor.fetchone() is not None
        
        if not table_exists:
            # Create orders table with correct schema
            cursor.execute("""
                CREATE TABLE orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    package_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT,
                    payment_reference TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    paid_at TIMESTAMP,
                    sales_units INTEGER DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (package_id) REFERENCES packages(id)
                )
            """)
            conn.commit()
            return
        
        # Check if orders table has the old schema (has email column)
        cursor.execute("PRAGMA table_info(orders)")
        columns = [row[1] for row in cursor.fetchall()]
        
        has_email = "email" in columns
        has_package_id = "package_id" in columns
        
        # If it has email but no package_id, it's the old schema - migrate data
        if has_email and not has_package_id:
            # Ensure book_orders table exists
            cursor.execute("""
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
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    paid_at TIMESTAMP
                )
            """)
            
            # Migrate existing book orders data to book_orders table
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO book_orders (
                        email, first_name, last_name, address, city, state, 
                        zip_code, country, total_amount, status, created_at
                    )
                    SELECT 
                        email, first_name, last_name, address, city, state,
                        zip_code, country, total_amount, status, created_at
                    FROM orders
                """)
            except Exception:
                pass  # Data might already be migrated
            
            # Drop the old orders table and recreate with correct schema
            cursor.execute("DROP TABLE orders")
            conn.commit()
            
            cursor.execute("""
                CREATE TABLE orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    package_id INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT,
                    payment_reference TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    paid_at TIMESTAMP,
                    sales_units INTEGER DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (package_id) REFERENCES packages(id)
                )
            """)
            conn.commit()
            return
        
        # Table exists but might be missing some columns - add them
        if not has_package_id:
            try:
                cursor.execute("ALTER TABLE orders ADD COLUMN package_id INTEGER")
            except Exception:
                pass
        
        if "payment_method" not in columns:
            try:
                cursor.execute("ALTER TABLE orders ADD COLUMN payment_method TEXT")
            except Exception:
                pass
        
        if "payment_reference" not in columns:
            try:
                cursor.execute("ALTER TABLE orders ADD COLUMN payment_reference TEXT")
            except Exception:
                pass
        
        if "paid_at" not in columns:
            try:
                cursor.execute("ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP")
            except Exception:
                pass
        
        if "amount" not in columns and "total_amount" in columns:
            try:
                cursor.execute("ALTER TABLE orders ADD COLUMN amount REAL")
                cursor.execute("UPDATE orders SET amount = total_amount WHERE amount IS NULL")
            except Exception:
                pass
        
        conn.commit()


def migrate_add_books_content_url() -> None:
    """Add missing columns to books table if they don't exist."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # Check if books table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='books'
        """)
        if not cursor.fetchone():
            return  # Table doesn't exist, will be created by init
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(books)")
        columns = [row[1] for row in cursor.fetchall()]
        
        # Add content_url if missing
        if "content_url" not in columns:
            try:
                cursor.execute("ALTER TABLE books ADD COLUMN content_url TEXT")
            except Exception:
                pass
        
        # Add is_featured if missing
        if "is_featured" not in columns:
            try:
                cursor.execute("ALTER TABLE books ADD COLUMN is_featured BOOLEAN DEFAULT FALSE")
            except Exception:
                pass
        
        # Add is_active if missing
        if "is_active" not in columns:
            try:
                cursor.execute("ALTER TABLE books ADD COLUMN is_active BOOLEAN DEFAULT TRUE")
            except Exception:
                pass
        
        conn.commit()


def migrate_add_book_orders_payment_fields() -> None:
    """Add payment_method and payment_reference columns to book_orders table."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # Check if book_orders table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='book_orders'
        """)
        if not cursor.fetchone():
            return  # Table doesn't exist, will be created by init
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(book_orders)")
        columns = [row[1] for row in cursor.fetchall()]
        
        # Add payment_method if missing
        if "payment_method" not in columns:
            try:
                cursor.execute("ALTER TABLE book_orders ADD COLUMN payment_method TEXT DEFAULT 'cod'")
            except Exception:
                pass
        
        # Add payment_reference if missing
        if "payment_reference" not in columns:
            try:
                cursor.execute("ALTER TABLE book_orders ADD COLUMN payment_reference TEXT")
            except Exception:
                pass
        
        conn.commit()


def migrate_add_community_features() -> None:
    """Create tables for community forum features."""
    with db_session() as conn:
        cursor = conn.cursor()

        # Create community_posts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general', -- general, question, announcement, event
                image_url TEXT,
                is_pinned BOOLEAN DEFAULT FALSE,
                is_featured BOOLEAN DEFAULT FALSE,
                likes_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create community_comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                likes_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create meeting_links table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meeting_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                meeting_url TEXT NOT NULL,
                meeting_id TEXT,
                passcode TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                created_by INTEGER NOT NULL, -- admin user id
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        """)

        # Create community_banners table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_banners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT NOT NULL,
                link_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL, -- admin user id
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        """)

        # Create post_likes table for tracking likes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS post_likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(post_id, user_id)
            )
        """)

        # Create comment_likes table for tracking comment likes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comment_likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                comment_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(comment_id, user_id)
            )
        """)

        conn.commit()


def run_all_migrations() -> None:
    """Run all pending migrations."""
    migrate_add_missing_user_columns()  # Run first to add basic columns
    migrate_add_sales_tracking()
    migrate_add_team_commission_queue()
    migrate_add_insurance_benefits()
    migrate_orders_table_schema()  # Migrate orders table schema
    migrate_add_books_content_url()  # Add content_url to books table
    migrate_add_book_orders_payment_fields()  # Add payment fields to book_orders
    migrate_add_community_features()  # Add community forum tables

