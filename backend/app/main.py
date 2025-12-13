"""FastAPI application bootstrap."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import initialize_database
from .routers.admin import router as admin_router
from .routers.auth import router as auth_router
from .routers.books import router as books_router
from .routers.community import router as community_router
from .routers.compensation import router as compensation_router
from .routers.orders import router as orders_router
from .routers.packages import router as packages_router
from .routers.payments import router as payments_router
from .routers.uploads import router as uploads_router
from .routers.content import router as content_router
from .services.scheduler import lifespan


def create_app() -> FastAPI:
    app = FastAPI(
        title="Bookstore API",
        version="1.0.0",
        lifespan=lifespan,
    )

    initialize_database()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(books_router, prefix="/api/books", tags=["books"])
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
    app.include_router(packages_router, prefix="/api/packages", tags=["packages"])
    app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
    app.include_router(compensation_router, prefix="/api/compensation", tags=["compensation"])
    app.include_router(community_router, prefix="/api/community", tags=["community"])
    app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
    app.include_router(uploads_router, prefix="/api/uploads", tags=["uploads"])
    app.include_router(content_router, prefix="/api/content", tags=["content"])
    app.include_router(payments_router, prefix="/api/payments", tags=["payments"])

    return app


app = create_app()

