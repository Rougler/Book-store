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


def run_all_migrations() -> None:
    """Run all pending migrations."""
    migrate_add_missing_user_columns()  # Run first to add basic columns
    migrate_add_sales_tracking()
    migrate_add_team_commission_queue()
    migrate_add_insurance_benefits()

