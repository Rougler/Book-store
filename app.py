"""Legacy entrypoint retained for backwards compatibility.

This script now boots the FastAPI backend instead of the previous Flask app.
"""

from backend.main import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
