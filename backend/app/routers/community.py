from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..core.dependencies import get_current_user, get_current_admin
from ..database.session import db_session
from ..models.schemas import (
    CommunityPost, CommunityPostCreate, CommunityPostUpdate,
    CommunityComment, CommunityCommentCreate, CommunityCommentUpdate,
    MeetingLink, MeetingLinkCreate, MeetingLinkUpdate,
    CommunityBanner, CommunityBannerCreate, CommunityBannerUpdate,
    CommunityStats, UserPublic
)

router = APIRouter()

# Community Posts Endpoints

@router.get("/posts", response_model=List[CommunityPost])
def get_community_posts(
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserPublic = Depends(get_current_user)
):
    """Get community posts with optional category filtering."""
    with db_session() as conn:
        cursor = conn.cursor()

        query = """
            SELECT
                p.id, p.user_id, p.title, p.content, p.category, p.image_url,
                p.is_pinned, p.is_featured, p.likes_count, p.comments_count,
                p.is_active, p.created_at, p.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.is_active = 1
        """

        params = []
        if category:
            query += " AND p.category = ?"
            params.append(category)

        # Order by pinned posts first, then by creation date
        query += " ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        posts = []
        for row in rows:
            post = CommunityPost(
                id=row['id'],
                user_id=row['user_id'],
                title=row['title'],
                content=row['content'],
                category=row['category'],
                image_url=row['image_url'],
                is_pinned=row['is_pinned'],
                is_featured=row['is_featured'],
                likes_count=row['likes_count'],
                comments_count=row['comments_count'],
                is_active=row['is_active'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at']),
                user_name=row['user_name'],
                user_profile_image=row['user_profile_image']
            )
            posts.append(post)

        return posts


@router.post("/posts", response_model=CommunityPost)
def create_community_post(
    post_data: CommunityPostCreate,
    current_user: UserPublic = Depends(get_current_user)
):
    """Create a new community post."""
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO community_posts (user_id, title, content, category, image_url)
            VALUES (?, ?, ?, ?, ?)
        """, (
            current_user.id,
            post_data.title,
            post_data.content,
            post_data.category,
            post_data.image_url
        ))

        post_id = cursor.lastrowid

        # Get the created post with user info
        cursor.execute("""
            SELECT
                p.id, p.user_id, p.title, p.content, p.category, p.image_url,
                p.is_pinned, p.is_featured, p.likes_count, p.comments_count,
                p.is_active, p.created_at, p.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        """, (post_id,))

        row = cursor.fetchone()
        return CommunityPost(
            id=row['id'],
            user_id=row['user_id'],
            title=row['title'],
            content=row['content'],
            category=row['category'],
            image_url=row['image_url'],
            is_pinned=row['is_pinned'],
            is_featured=row['is_featured'],
            likes_count=row['likes_count'],
            comments_count=row['comments_count'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            user_name=row['user_name'],
            user_profile_image=row['user_profile_image']
        )


@router.get("/posts/{post_id}", response_model=CommunityPost)
def get_community_post(
    post_id: int,
    current_user: UserPublic = Depends(get_current_user)
):
    """Get a specific community post."""
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                p.id, p.user_id, p.title, p.content, p.category, p.image_url,
                p.is_pinned, p.is_featured, p.likes_count, p.comments_count,
                p.is_active, p.created_at, p.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ? AND p.is_active = 1
        """, (post_id,))

        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")

        return CommunityPost(
            id=row['id'],
            user_id=row['user_id'],
            title=row['title'],
            content=row['content'],
            category=row['category'],
            image_url=row['image_url'],
            is_pinned=row['is_pinned'],
            is_featured=row['is_featured'],
            likes_count=row['likes_count'],
            comments_count=row['comments_count'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            user_name=row['user_name'],
            user_profile_image=row['user_profile_image']
        )


@router.put("/posts/{post_id}", response_model=CommunityPost)
def update_community_post(
    post_id: int,
    post_data: CommunityPostUpdate,
    current_user: UserPublic = Depends(get_current_user)
):
    """Update a community post (only by the author or admin)."""
    with db_session() as conn:
        cursor = conn.cursor()

        # Check if user owns the post or is admin
        cursor.execute(
            "SELECT user_id FROM community_posts WHERE id = ?",
            (post_id,)
        )
        post = cursor.fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if post['user_id'] != current_user.id and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized to update this post")

        # Build update query dynamically
        update_fields = []
        params = []
        for field, value in post_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ?")
                params.append(value)

        if update_fields:
            params.append(post_id)
            cursor.execute(f"""
                UPDATE community_posts
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, params)

        # Return updated post
        return get_community_post(post_id, current_user)


@router.delete("/posts/{post_id}")
def delete_community_post(
    post_id: int,
    current_user: UserPublic = Depends(get_current_user)
):
    """Delete a community post (only by the author or admin)."""
    with db_session() as conn:
        cursor = conn.cursor()

        # Check if user owns the post or is admin
        cursor.execute(
            "SELECT user_id FROM community_posts WHERE id = ?",
            (post_id,)
        )
        post = cursor.fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if post['user_id'] != current_user.id and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")

        cursor.execute(
            "UPDATE community_posts SET is_active = 0 WHERE id = ?",
            (post_id,)
        )

        return {"message": "Post deleted successfully"}


# Community Comments Endpoints

@router.get("/posts/{post_id}/comments", response_model=List[CommunityComment])
def get_post_comments(
    post_id: int,
    current_user: UserPublic = Depends(get_current_user)
):
    """Get comments for a specific post."""
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                c.id, c.post_id, c.user_id, c.content, c.likes_count,
                c.is_active, c.created_at, c.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.is_active = 1
            ORDER BY c.created_at ASC
        """, (post_id,))

        rows = cursor.fetchall()
        comments = []
        for row in rows:
            comment = CommunityComment(
                id=row['id'],
                post_id=row['post_id'],
                user_id=row['user_id'],
                content=row['content'],
                likes_count=row['likes_count'],
                is_active=row['is_active'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at']),
                user_name=row['user_name'],
                user_profile_image=row['user_profile_image']
            )
            comments.append(comment)

        return comments


@router.post("/comments", response_model=CommunityComment)
def create_comment(
    comment_data: CommunityCommentCreate,
    current_user: UserPublic = Depends(get_current_user)
):
    """Create a new comment on a post."""
    with db_session() as conn:
        cursor = conn.cursor()

        # Verify post exists and is active
        cursor.execute(
            "SELECT id FROM community_posts WHERE id = ? AND is_active = 1",
            (comment_data.post_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Post not found")

        cursor.execute("""
            INSERT INTO community_comments (post_id, user_id, content)
            VALUES (?, ?, ?)
        """, (
            comment_data.post_id,
            current_user.id,
            comment_data.content
        ))

        comment_id = cursor.lastrowid

        # Update comments count on the post
        cursor.execute("""
            UPDATE community_posts
            SET comments_count = comments_count + 1
            WHERE id = ?
        """, (comment_data.post_id,))

        # Get the created comment
        cursor.execute("""
            SELECT
                c.id, c.post_id, c.user_id, c.content, c.likes_count,
                c.is_active, c.created_at, c.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        """, (comment_id,))

        row = cursor.fetchone()
        return CommunityComment(
            id=row['id'],
            post_id=row['post_id'],
            user_id=row['user_id'],
            content=row['content'],
            likes_count=row['likes_count'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            user_name=row['user_name'],
            user_profile_image=row['user_profile_image']
        )


# Meeting Links Endpoints

@router.get("/meetings", response_model=List[MeetingLink])
def get_meeting_links(
    upcoming_only: bool = True,
    limit: int = Query(50, ge=1, le=100),
    current_user: UserPublic = Depends(get_current_user)
):
    """Get meeting links."""
    with db_session() as conn:
        cursor = conn.cursor()

        query = """
            SELECT
                m.id, m.title, m.description, m.meeting_url, m.meeting_id,
                m.passcode, m.start_date, m.end_date, m.is_active,
                m.created_by, m.created_at, m.updated_at,
                u.full_name as created_by_name
            FROM meeting_links m
            JOIN users u ON m.created_by = u.id
            WHERE m.is_active = 1
        """

        params = []
        if upcoming_only:
            query += " AND m.start_date >= CURRENT_TIMESTAMP"

        query += " ORDER BY m.start_date ASC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        meetings = []
        for row in rows:
            meeting = MeetingLink(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                meeting_url=row['meeting_url'],
                meeting_id=row['meeting_id'],
                passcode=row['passcode'],
                start_date=datetime.fromisoformat(row['start_date']),
                end_date=datetime.fromisoformat(row['end_date']) if row['end_date'] else None,
                is_active=row['is_active'],
                created_by=row['created_by'],
                created_by_name=row['created_by_name'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at'])
            )
            meetings.append(meeting)

        return meetings


@router.post("/meetings", response_model=MeetingLink)
def create_meeting_link(
    meeting_data: MeetingLinkCreate,
    current_user: UserPublic = Depends(get_current_admin)
):
    """Create a new meeting link (admin only)."""
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO meeting_links (
                title, description, meeting_url, meeting_id, passcode,
                start_date, end_date, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            meeting_data.title,
            meeting_data.description,
            meeting_data.meeting_url,
            meeting_data.meeting_id,
            meeting_data.passcode,
            meeting_data.start_date.isoformat(),
            meeting_data.end_date.isoformat() if meeting_data.end_date else None,
            current_user.id
        ))

        meeting_id = cursor.lastrowid

        # Get the created meeting
        cursor.execute("""
            SELECT
                m.id, m.title, m.description, m.meeting_url, m.meeting_id,
                m.passcode, m.start_date, m.end_date, m.is_active,
                m.created_by, m.created_at, m.updated_at,
                u.full_name as created_by_name
            FROM meeting_links m
            JOIN users u ON m.created_by = u.id
            WHERE m.id = ?
        """, (meeting_id,))

        row = cursor.fetchone()
        return MeetingLink(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            meeting_url=row['meeting_url'],
            meeting_id=row['meeting_id'],
            passcode=row['passcode'],
            start_date=datetime.fromisoformat(row['start_date']),
            end_date=datetime.fromisoformat(row['end_date']) if row['end_date'] else None,
            is_active=row['is_active'],
            created_by=row['created_by'],
            created_by_name=row['created_by_name'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at'])
        )


# Community Banners Endpoints

@router.get("/banners", response_model=List[CommunityBanner])
def get_community_banners(
    active_only: bool = True,
    current_user: UserPublic = Depends(get_current_user)
):
    """Get community banners."""
    with db_session() as conn:
        cursor = conn.cursor()

        query = """
            SELECT
                b.id, b.title, b.description, b.image_url, b.link_url,
                b.display_order, b.is_active, b.created_by, b.created_at, b.updated_at,
                u.full_name as created_by_name
            FROM community_banners b
            JOIN users u ON b.created_by = u.id
        """

        params = []
        if active_only:
            query += " WHERE b.is_active = 1"

        query += " ORDER BY b.display_order ASC, b.created_at DESC"

        cursor.execute(query, params)
        rows = cursor.fetchall()

        banners = []
        for row in rows:
            banner = CommunityBanner(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                image_url=row['image_url'],
                link_url=row['link_url'],
                display_order=row['display_order'],
                is_active=row['is_active'],
                created_by=row['created_by'],
                created_by_name=row['created_by_name'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at'])
            )
            banners.append(banner)

        return banners


@router.post("/banners", response_model=CommunityBanner)
def create_community_banner(
    banner_data: CommunityBannerCreate,
    current_user: UserPublic = Depends(get_current_admin)
):
    """Create a new community banner (admin only)."""
    with db_session() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO community_banners (
                title, description, image_url, link_url, display_order, created_by
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            banner_data.title,
            banner_data.description,
            banner_data.image_url,
            banner_data.link_url,
            banner_data.display_order,
            current_user.id
        ))

        banner_id = cursor.lastrowid

        # Get the created banner
        cursor.execute("""
            SELECT
                b.id, b.title, b.description, b.image_url, b.link_url,
                b.display_order, b.is_active, b.created_by, b.created_at, b.updated_at,
                u.full_name as created_by_name
            FROM community_banners b
            JOIN users u ON b.created_by = u.id
            WHERE b.id = ?
        """, (banner_id,))

        row = cursor.fetchone()
        return CommunityBanner(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            image_url=row['image_url'],
            link_url=row['link_url'],
            display_order=row['display_order'],
            is_active=row['is_active'],
            created_by=row['created_by'],
            created_by_name=row['created_by_name'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at'])
        )


@router.get("/stats", response_model=CommunityStats)
def get_community_stats(current_user: UserPublic = Depends(get_current_user)):
    """Get community statistics."""
    with db_session() as conn:
        cursor = conn.cursor()

        # Get total posts
        cursor.execute("SELECT COUNT(*) as count FROM community_posts WHERE is_active = 1")
        total_posts = cursor.fetchone()['count']

        # Get total comments
        cursor.execute("SELECT COUNT(*) as count FROM community_comments WHERE is_active = 1")
        total_comments = cursor.fetchone()['count']

        # Get active users (users who posted or commented in last 30 days)
        cursor.execute("""
            SELECT COUNT(DISTINCT user_id) as count FROM (
                SELECT user_id FROM community_posts
                WHERE is_active = 1 AND created_at >= datetime('now', '-30 days')
                UNION
                SELECT user_id FROM community_comments
                WHERE is_active = 1 AND created_at >= datetime('now', '-30 days')
            )
        """)
        active_users = cursor.fetchone()['count']

        # Get recent posts (last 5)
        cursor.execute("""
            SELECT
                p.id, p.user_id, p.title, p.content, p.category, p.image_url,
                p.is_pinned, p.is_featured, p.likes_count, p.comments_count,
                p.is_active, p.created_at, p.updated_at,
                u.full_name as user_name, u.profile_image_url as user_profile_image
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC LIMIT 5
        """)

        recent_posts = []
        for row in cursor.fetchall():
            post = CommunityPost(
                id=row['id'],
                user_id=row['user_id'],
                title=row['title'],
                content=row['content'],
                category=row['category'],
                image_url=row['image_url'],
                is_pinned=row['is_pinned'],
                is_featured=row['is_featured'],
                likes_count=row['likes_count'],
                comments_count=row['comments_count'],
                is_active=row['is_active'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at']),
                user_name=row['user_name'],
                user_profile_image=row['user_profile_image']
            )
            recent_posts.append(post)

        # Get upcoming meetings
        cursor.execute("""
            SELECT
                m.id, m.title, m.description, m.meeting_url, m.meeting_id,
                m.passcode, m.start_date, m.end_date, m.is_active,
                m.created_by, m.created_at, m.updated_at,
                u.full_name as created_by_name
            FROM meeting_links m
            JOIN users u ON m.created_by = u.id
            WHERE m.is_active = 1 AND m.start_date >= CURRENT_TIMESTAMP
            ORDER BY m.start_date ASC LIMIT 5
        """)

        upcoming_meetings = []
        for row in cursor.fetchall():
            meeting = MeetingLink(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                meeting_url=row['meeting_url'],
                meeting_id=row['meeting_id'],
                passcode=row['passcode'],
                start_date=datetime.fromisoformat(row['start_date']),
                end_date=datetime.fromisoformat(row['end_date']) if row['end_date'] else None,
                is_active=row['is_active'],
                created_by=row['created_by'],
                created_by_name=row['created_by_name'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at'])
            )
            upcoming_meetings.append(meeting)

        return CommunityStats(
            total_posts=total_posts,
            total_comments=total_comments,
            active_users=active_users,
            recent_posts=recent_posts,
            upcoming_meetings=upcoming_meetings
        )
