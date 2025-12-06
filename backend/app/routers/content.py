import json
from fastapi import APIRouter, Depends, HTTPException, status
from ..core.dependencies import get_current_admin
from ..database.session import db_session
from ..models.schemas import ContentUpdate, HomepageContent

router = APIRouter()

# Default values for homepage content fields
DEFAULT_HOMEPAGE_CONTENT = {
    "growth_model_title": "Your Growth Journey",
    "growth_model_subtitle": "Follow our proven 4-Step Growth Model to transform your life and achieve lasting success through knowledge and wealth creation",
    "platform_hubs_title": "Explore Our Platform Hubs",
    "platform_hubs_subtitle": "Three powerful zones designed to accelerate your journey to mastery and financial freedom through interconnected growth",
    "why_choose_us_title": "Why Choose Gyaan AUR Dhan?",
    "why_choose_us_subtitle": "Join thousands of learners and entrepreneurs building their future",
    "how_it_works_title": "Your Journey to Success",
    "how_it_works_subtitle": "Discover how our integrated platform combines learning and earning to accelerate your growth journey",
    "key_features_title": "Powerful Tools for Success",
    "key_features_subtitle": "Explore the comprehensive features designed to accelerate your learning and earning journey",
    "success_stories_title": "Real People, Real Success",
    "success_stories_subtitle": "Hear from our community members who transformed their lives through knowledge and entrepreneurship"
}

@router.get("/{section_key}")
def get_content(section_key: str):
    with db_session() as conn:
        cursor = conn.cursor()
        
        row = cursor.execute(
            "SELECT content FROM site_content WHERE section_key = ?", (section_key,)
        ).fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Content not found")
            
        # If row is a tuple, it's row[0]. If it's a Row object, row['content'] works.
        try:
            content_str = row['content']
        except (TypeError, IndexError):
            content_str = row[0]
        
        content = json.loads(content_str)
        
        # Merge default values for homepage content if section is homepage
        if section_key == "homepage":
            # Merge defaults with existing content (existing content takes precedence)
            merged_content = {**DEFAULT_HOMEPAGE_CONTENT, **content}
            return merged_content
            
        return content

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
