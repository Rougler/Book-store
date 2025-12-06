"""Application configuration settings."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    database_path: Path = BASE_DIR.parent / "bookstore.db"
    secret_key: str = "change-this-secret"
    access_token_exp_minutes: int = 60 * 12
    refresh_token_exp_days: int = 7
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    razorpay_key_id: str = "rzp_test_Rnc7nWfsKs58TI"  # Replace with your Razorpay Key ID
    razorpay_key_secret: str = "WbtiraREC4TagZCFtLBZxnWF"  # Replace with your Razorpay Secret Key

    class Config:
        env_file = BASE_DIR.parent / ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

