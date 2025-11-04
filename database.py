import sqlite3
import hashlib
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


def get_db():
    """Get database connection"""
    conn = sqlite3.connect('bookstore.db')
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Books table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            description TEXT,
            category TEXT,
            stock INTEGER DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone TEXT,
            aadhaar TEXT,
            pan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            email TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT,
            address TEXT NOT NULL,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            country TEXT,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )
    ''')
    
    # Admin users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create default admin if not exists
    admin_exists = cursor.execute('SELECT id FROM admins WHERE username = ?', ('admin',)).fetchone()
    if not admin_exists:
        default_password = generate_password_hash('admin123')
        cursor.execute('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ('admin', default_password))
    
    # Create default demo user if not exists
    demo_exists = cursor.execute('SELECT id FROM users WHERE email = ?', ('demo@bookstore.test',)).fetchone()
    if not demo_exists:
        demo_hash = generate_password_hash('demo12345')
        cursor.execute('''
            INSERT INTO users (full_name, email, password_hash, phone)
            VALUES (?, ?, ?, ?)
        ''', ('Demo User', 'demo@bookstore.test', demo_hash, ''))
    
    # Insert sample books if database is empty
    book_count = cursor.execute('SELECT COUNT(*) as count FROM books').fetchone()['count']
    if book_count == 0:
        sample_books = [
            ('The Midnight Library', 'Matt Haig', 15.99, 
             'https://lh3.googleusercontent.com/aida-public/AB6AXuA7XfkLLv-Z1ftgyk8kNM0sVtk92WwPBri6NchcWxfXFUPbnSwtWwVPNESUMqJDupQmDJArzyu5undfYKdN4eQ4grRZ2Ng368egs8DlXLFEeMoE-xnrogheTFZHBZa9u-yDXB6fGBfcQ6ARtcVgCwbxFV_qPhLquQf2DVgEkkNK57zFKYXohQswtcegOQVbN1nnAovlx_1Jb5HnDVQrwsiHcJKlAQu9zRizzNOwglon75s_ND3QkS1S-0JR1UseXPV6yblm_SESJMFP',
             'A novel about a library that contains books with different versions of your life.', 'Fiction'),
            ('Project Hail Mary', 'Andy Weir', 18.99,
             'https://lh3.googleusercontent.com/aida-public/AB6AXuD0BnPzP45E00LDqA3Ds9n2VbCk_QPmzbOyVWHbxv97QPJPlm-lAbRZGgy5KbjI35qTMLaTiUsLZnHaZSNeHbDQsjc5EXNkDwgsnoQNied7gXWaK5qt61ULKnYOkfplBcuJ-ehp7Wx3GyS3CZKOZWRFBo2JpKzE_tw-UwVuDi8_lW8pF_lN1QeGmk-Zh-L-XF5pDWBMwGfu3PbFUrIyR3GxMU7p8hBtSHl6iKpVQbW5tGu7Qc--H_Ox4ONIAm0M7LYQzaxP5Tx82Ekh',
             'A lone astronaut must save the earth from disaster.', 'Science Fiction'),
            ('The Name of the Wind', 'Patrick Rothfuss', 29.99,
             'https://lh3.googleusercontent.com/aida-public/AB6AXuDu0i-woFrmMyqMlubdTuIdvG73dHagNtiYcWgsnDF0eGsk5kkxRS-GsU-vnj-QaqvOvx8eGZfU9weVENb-iWHV1Kv4qvgYBWORdf73z9Mok_XHNgv6rwL3gU_Bswj5dTWxokVruPWJ6nly--FSuQhHeXZqgVVRI7WqTEb15yTr5yMYiFgprV4wAgOn_8Ci4NL9Csmg2UbPpJkiKxl5P6hoLqR4ui-mdW92uy9YvVKL0Zd2gHTD2Ars020I9ZeljbpeS1SZvXqfj_MI',
             'The tale of Kvothe, a magically gifted young man.', 'Fantasy'),
        ]
        cursor.executemany('''
            INSERT INTO books (title, author, price, image_url, description, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_books)
    
    conn.commit()
    conn.close()


def get_all_books():
    """Get all books"""
    conn = get_db()
    books = conn.execute('SELECT * FROM books ORDER BY created_at DESC').fetchall()
    conn.close()
    return books


def get_book_by_id(book_id):
    """Get book by ID"""
    conn = get_db()
    book = conn.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone()
    conn.close()
    return book


def create_user(full_name, email, password, phone=None, aadhaar=None, pan=None):
    """Create a new user"""
    conn = get_db()
    password_hash = generate_password_hash(password)
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (full_name, email, password_hash, phone, aadhaar, pan)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (full_name, email, password_hash, phone, aadhaar, pan))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None


def create_order(user_id, email, first_name, last_name, address, city, state, zip_code, country, cart_items, total_amount):
    """Create an order"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create order
    cursor.execute('''
        INSERT INTO orders (user_id, email, first_name, last_name, address, city, state, zip_code, country, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, email, first_name, last_name, address, city, state, zip_code, country, total_amount))
    
    order_id = cursor.lastrowid
    
    # Create order items
    for book_id, quantity in cart_items.items():
        book = get_book_by_id(book_id)
        if book:
            cursor.execute('''
                INSERT INTO order_items (order_id, book_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ''', (order_id, book_id, quantity, book['price']))
    
    conn.commit()
    conn.close()
    return order_id


def get_all_orders():
    """Get all orders"""
    conn = get_db()
    orders = conn.execute('''
        SELECT o.*, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ''').fetchall()
    conn.close()
    return orders


def verify_admin(username, password):
    """Verify admin credentials"""
    conn = get_db()
    admin = conn.execute('SELECT * FROM admins WHERE username = ?', (username,)).fetchone()
    conn.close()
    
    if admin and check_password_hash(admin['password_hash'], password):
        return True
    return False


def verify_user(email: str, password: str):
    """Verify normal user credentials. Returns user row or None."""
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    if user and check_password_hash(user['password_hash'], password):
        return user
    return None

