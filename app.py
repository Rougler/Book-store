from flask import Flask, render_template, redirect, url_for, request, session, flash
from functools import wraps
from database import (
    init_db, get_all_books, get_book_by_id, create_user,
    create_order, get_all_orders, verify_admin, verify_user
)


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = "dev-secret-change-this-12345"
    
    # Initialize database
    init_db()
    
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'admin_logged_in' not in session:
                flash('Please login to access admin panel.', 'error')
                return redirect(url_for('admin_login'))
            return f(*args, **kwargs)
        return decorated_function
    
    @app.context_processor
    def inject_globals():
        cart = session.get("cart", {})
        cart_qty = sum(cart.values())
        return {"cart_quantity": cart_qty}
    
    # ========== PUBLIC ROUTES ==========
    
    @app.route("/")
    def home():
        books = get_all_books()
        # Convert Row objects to dicts for template
        books_list = [dict(book) for book in books[:6]]  # Show first 6 for featured
        return render_template("home.html", books=books_list)
    
    @app.route("/browse")
    def browse():
        books = get_all_books()
        books_list = [dict(book) for book in books]
        return render_template("browse.html", books=books_list)
    
    @app.route("/book/<int:book_id>")
    def book_detail(book_id):
        book = get_book_by_id(book_id)
        if not book:
            flash("Book not found.", "error")
            return redirect(url_for("browse"))
        return render_template("detail.html", book=dict(book))
    
    @app.route("/cart")
    def cart():
        cart = session.get("cart", {})
        items = []
        subtotal = 0.0
        
        for book_id_str, qty in cart.items():
            try:
                book_id = int(book_id_str)
            except ValueError:
                continue
                
            book = get_book_by_id(book_id)
            if not book:
                continue
            
            book_dict = dict(book)
            line_total = book_dict['price'] * qty
            subtotal += line_total
            items.append({"book": book_dict, "quantity": qty, "line_total": line_total})
        
        return render_template("cart.html", items=items, subtotal=subtotal)
    
    @app.route("/cart/add", methods=["POST"])
    def add_to_cart():
        book_id = request.form.get("book_id")
        qty_str = request.form.get("quantity", "1")
        
        try:
            book_id_int = int(book_id)
        except (ValueError, TypeError):
            flash("Invalid book.", "error")
            return redirect(request.referrer or url_for("browse"))
        
        book = get_book_by_id(book_id_int)
        if not book:
            flash("Book not found.", "error")
            return redirect(request.referrer or url_for("browse"))
        
        try:
            qty = max(1, int(qty_str))
        except ValueError:
            qty = 1
        
        cart = session.get("cart", {})
        cart[str(book_id_int)] = cart.get(str(book_id_int), 0) + qty
        session["cart"] = cart
        flash("Added to cart!", "success")
        return redirect(request.referrer or url_for("cart"))
    
    @app.route("/cart/update", methods=["POST"])
    def update_cart():
        book_id = request.form.get("book_id")
        action = request.form.get("action")
        cart = session.get("cart", {})
        
        if book_id and book_id in cart:
            if action == "inc":
                cart[book_id] += 1
            elif action == "dec":
                cart[book_id] = max(1, cart[book_id] - 1)
            elif action == "remove":
                cart.pop(book_id, None)
        
        session["cart"] = cart
        return redirect(url_for("cart"))
    
    @app.route("/checkout", methods=["GET", "POST"])
    def checkout():
        cart = session.get("cart", {})
        if not cart:
            flash("Your cart is empty.", "error")
            return redirect(url_for("cart"))
        
        if request.method == "POST":
            email = request.form.get("email", "").strip()
            first_name = request.form.get("first_name", "").strip()
            last_name = request.form.get("last_name", "").strip()
            address = request.form.get("address", "").strip()
            city = request.form.get("city", "").strip()
            state = request.form.get("state", "").strip()
            zip_code = request.form.get("zip", "").strip()
            country = request.form.get("country", "United States").strip()
            
            if not email or not first_name or not address:
                flash("Please complete all required fields.", "error")
                return redirect(url_for("checkout"))
            
            # Calculate total
            total_amount = 0.0
            for book_id_str, qty in cart.items():
                try:
                    book_id = int(book_id_str)
                except ValueError:
                    continue
                book = get_book_by_id(book_id)
                if book:
                    total_amount += book['price'] * qty
            
            # Get user_id if logged in (for future login system)
            user_id = session.get('user_id')
            
            # Create order
            order_id = create_order(
                user_id=user_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                address=address,
                city=city,
                state=state,
                zip_code=zip_code,
                country=country,
                cart_items=cart,
                total_amount=total_amount
            )
            
            # Clear cart
            session.pop("cart", None)
            flash(f"Order #{order_id} placed successfully!", "success")
            return render_template("checkout_success.html", order_id=order_id)
        
        return render_template("checkout.html")
    
    @app.route("/register", methods=["GET", "POST"])
    def register():
        if request.method == "POST":
            name = request.form.get("full_name", "").strip()
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")
            confirm = request.form.get("confirm_password", "")
            phone = request.form.get("phone", "").strip()
            aadhaar = request.form.get("aadhaar", "").strip()
            pan = request.form.get("pan", "").strip()
            terms = request.form.get("terms") == "on"
            
            # Validation
            errors = []
            if not name:
                errors.append("Full name is required.")
            if not email:
                errors.append("Email is required.")
            if len(password) < 8:
                errors.append("Password must be at least 8 characters.")
            if password != confirm:
                errors.append("Passwords do not match.")
            if not terms:
                errors.append("You must agree to the terms.")
            
            if errors:
                for error in errors:
                    flash(error, "error")
                return redirect(url_for("register"))
            
            # Create user
            user_id = create_user(name, email, password, phone, aadhaar, pan)
            if user_id:
                session['user_id'] = user_id
                flash("Account created successfully!", "success")
                return redirect(url_for("home"))
            else:
                flash("Email already exists. Please login instead.", "error")
                return redirect(url_for("register"))
        
        return render_template("register.html")

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")
            user = verify_user(email, password)
            if user:
                session['user_id'] = user['id']
                session['user_email'] = user['email']
                session['user_name'] = user['full_name']
                flash("Logged in successfully!", "success")
                return redirect(url_for("home"))
            flash("Invalid email or password.", "error")
            return redirect(url_for("login"))
        return render_template("login.html")

    @app.route("/logout")
    def logout():
        session.pop('user_id', None)
        session.pop('user_email', None)
        session.pop('user_name', None)
        flash("Logged out.", "success")
        return redirect(url_for("home"))
    
    # ========== ADMIN ROUTES ==========
    
    @app.route("/admin/login", methods=["GET", "POST"])
    def admin_login():
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            
            if verify_admin(username, password):
                session['admin_logged_in'] = True
                session['admin_username'] = username
                flash("Login successful!", "success")
                return redirect(url_for("admin_dashboard"))
            else:
                flash("Invalid credentials.", "error")
        
        return render_template("admin/login.html")
    
    @app.route("/admin/logout")
    def admin_logout():
        session.pop('admin_logged_in', None)
        session.pop('admin_username', None)
        flash("Logged out successfully.", "success")
        return redirect(url_for("admin_login"))
    
    @app.route("/admin")
    @login_required
    def admin_dashboard():
        books = get_all_books()
        orders = get_all_orders()
        books_list = [dict(book) for book in books]
        orders_list = [dict(order) for order in orders]
        return render_template("admin/dashboard.html", books=books_list, orders=orders_list)
    
    @app.route("/admin/books")
    @login_required
    def admin_books():
        books = get_all_books()
        books_list = [dict(book) for book in books]
        return render_template("admin/books.html", books=books_list)
    
    @app.route("/admin/books/add", methods=["GET", "POST"])
    @login_required
    def admin_add_book():
        if request.method == "POST":
            title = request.form.get("title", "").strip()
            author = request.form.get("author", "").strip()
            price_str = request.form.get("price", "").strip()
            image_url = request.form.get("image_url", "").strip()
            description = request.form.get("description", "").strip()
            category = request.form.get("category", "Fiction").strip()
            stock_str = request.form.get("stock", "100").strip()
            
            if not title or not author or not price_str:
                flash("Title, author, and price are required.", "error")
                return redirect(url_for("admin_add_book"))
            
            try:
                price = float(price_str)
                stock = int(stock_str) if stock_str else 100
            except ValueError:
                flash("Invalid price or stock value.", "error")
                return redirect(url_for("admin_add_book"))
            
            from database import get_db
            conn = get_db()
            conn.execute('''
                INSERT INTO books (title, author, price, image_url, description, category, stock)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (title, author, price, image_url, description, category, stock))
            conn.commit()
            conn.close()
            
            flash("Book added successfully!", "success")
            return redirect(url_for("admin_books"))
        
        return render_template("admin/add_book.html")
    
    @app.route("/admin/books/<int:book_id>/edit", methods=["GET", "POST"])
    @login_required
    def admin_edit_book(book_id):
        book = get_book_by_id(book_id)
        if not book:
            flash("Book not found.", "error")
            return redirect(url_for("admin_books"))
        
        if request.method == "POST":
            title = request.form.get("title", "").strip()
            author = request.form.get("author", "").strip()
            price_str = request.form.get("price", "").strip()
            image_url = request.form.get("image_url", "").strip()
            description = request.form.get("description", "").strip()
            category = request.form.get("category", "Fiction").strip()
            stock_str = request.form.get("stock", "100").strip()
            
            if not title or not author or not price_str:
                flash("Title, author, and price are required.", "error")
                return redirect(url_for("admin_edit_book", book_id=book_id))
            
            try:
                price = float(price_str)
                stock = int(stock_str) if stock_str else 100
            except ValueError:
                flash("Invalid price or stock value.", "error")
                return redirect(url_for("admin_edit_book", book_id=book_id))
            
            from database import get_db
            conn = get_db()
            conn.execute('''
                UPDATE books 
                SET title = ?, author = ?, price = ?, image_url = ?, description = ?, category = ?, stock = ?
                WHERE id = ?
            ''', (title, author, price, image_url, description, category, stock, book_id))
            conn.commit()
            conn.close()
            
            flash("Book updated successfully!", "success")
            return redirect(url_for("admin_books"))
        
        return render_template("admin/edit_book.html", book=dict(book))
    
    @app.route("/admin/books/<int:book_id>/delete", methods=["POST"])
    @login_required
    def admin_delete_book(book_id):
        book = get_book_by_id(book_id)
        if not book:
            flash("Book not found.", "error")
            return redirect(url_for("admin_books"))
        
        from database import get_db
        conn = get_db()
        conn.execute('DELETE FROM books WHERE id = ?', (book_id,))
        conn.commit()
        conn.close()
        
        flash("Book deleted successfully!", "success")
        return redirect(url_for("admin_books"))
    
    @app.route("/admin/orders")
    @login_required
    def admin_orders():
        orders = get_all_orders()
        orders_list = [dict(order) for order in orders]
        return render_template("admin/orders.html", orders=orders_list)
    
    @app.route("/admin/orders/<int:order_id>")
    @login_required
    def admin_order_detail(order_id):
        from database import get_db
        conn = get_db()
        order = conn.execute('SELECT * FROM orders WHERE id = ?', (order_id,)).fetchone()
        if not order:
            flash("Order not found.", "error")
            return redirect(url_for("admin_orders"))
        
        items = conn.execute('''
            SELECT oi.*, b.title, b.author, b.image_url
            FROM order_items oi
            JOIN books b ON oi.book_id = b.id
            WHERE oi.order_id = ?
        ''', (order_id,)).fetchall()
        
        conn.close()
        return render_template("admin/order_detail.html", order=dict(order), items=[dict(item) for item in items])
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
