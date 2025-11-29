import json
from fastapi import APIRouter, Depends, HTTPException, status
from ..core.dependencies import get_current_admin
from ..database.session import db_session
from ..models.schemas import ContentUpdate

router = APIRouter()

@router.get("/{section_key}")
def get_content(section_key: str):
    with db_session() as conn:
        cursor = conn.cursor()
        # Use row_factory to get dict-like access if not already configured globally, 
        # but usually fetchone returns a Row object or tuple. 
        # In init.py, it seems they access by index or name. 
        # Let's assume standard sqlite3 behavior or Row factory.
        # To be safe, I'll use index or try to set row_factory.
        # But db_session likely yields a connection.
        
        row = cursor.execute(
            "SELECT content FROM site_content WHERE section_key = ?", (section_key,)
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Content not found")
            
        # If row is a tuple, it's row[0]. If it's a Row object, row['content'] works.
        # I'll check if it supports key access, otherwise index 0.
        try:
            content_str = row['content']
        except (TypeError, IndexError):
            content_str = row[0]
            
        return json.loads(content_str)

@router.put("/{section_key}")
def update_content(section_key: str, payload: ContentUpdate, admin_id: str = Depends(get_current_admin)):
    # payload.content is a dict (from Pydantic model)
    content_json = json.dumps(payload.content)
    
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO site_content (section_key, content, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(section_key) DO UPDATE SET 
                content = excluded.content,
                updated_at = CURRENT_TIMESTAMP
            """,
            (section_key, content_json)
        )
    
    return {"message": "Content updated successfully"}
