# Bookstore Application

A complete Flask-based bookstore application with admin panel for managing books and orders.

## Features

### Customer Features
- Browse books catalog
- View book details
- Add books to shopping cart
- Update cart quantities
- Checkout and place orders
- User registration with KYC fields

### Admin Features
- Admin login system
- Dashboard with statistics
- Add, edit, and delete books
- View all orders
- View order details
- Manage inventory

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. The application will:
   - Create SQLite database (`bookstore.db`) automatically
   - Initialize with sample books
   - Create default admin account

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the admin password in production!

## Access Points

### Customer Routes
- Home: http://localhost:5000/
- Browse Books: http://localhost:5000/browse
- Book Detail: http://localhost:5000/book/{id}
- Shopping Cart: http://localhost:5000/cart
- Checkout: http://localhost:5000/checkout
- Register: http://localhost:5000/register

### Admin Routes
- Admin Login: http://localhost:5000/admin/login
- Admin Dashboard: http://localhost:5000/admin
- Books Management: http://localhost:5000/admin/books
- Orders Management: http://localhost:5000/admin/orders

## Database Schema

The application uses SQLite with the following tables:
- `books` - Book inventory
- `users` - Customer registrations
- `orders` - Customer orders
- `order_items` - Order line items
- `admins` - Admin users

## Technologies Used

- Flask 3.0+
- SQLite3
- Tailwind CSS (via CDN)
- Werkzeug (for password hashing)

## Notes

- The database file (`bookstore.db`) is created automatically on first run
- All data persists between application restarts
- Admin session is stored in Flask session
- Shopping cart uses Flask session (temporary)

