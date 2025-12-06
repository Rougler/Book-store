import sqlite3
import json
import os

# Define the content
content = {
    "hero_slides": [
        {
            "title": "Unlock Your Potential",
            "subtitle": "Through the Power of Knowledge",
            "quote": "\"Knowledge is not just information, it's the foundation of transformation. When you change what you read, you change what you think. When you change what you think, you change how you live.\"",
            "author": "— Hrushikesh Mohapatra",
            "designation": "Founder, Gyaan AUR Dhan",
            "gradient": "from-indigo-600 via-purple-600 to-pink-600",
            "bgGradient": "from-slate-900 via-indigo-900 to-slate-800",
            "accentColor": "indigo",
            "image": "📚",
            "backgroundImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
            "altText": "Books and learning materials on a desk"
        },
        {
            "title": "Build Your Future",
            "subtitle": "With Knowledge & Wealth Creation",
            "quote": "\"Success is not accidental. It's the result of consistent learning, strategic action, and building meaningful relationships. Every book you read opens a new door to opportunity.\"",
            "author": "— Hrushikesh Mohapatra",
            "designation": "Founder, Gyaan AUR Dhan",
            "gradient": "from-emerald-600 via-teal-600 to-cyan-600",
            "bgGradient": "from-slate-900 via-emerald-900 to-slate-800",
            "accentColor": "emerald",
            "image": "💰",
            "backgroundImage": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
            "altText": "Financial charts and money growth"
        },
        {
            "title": "Lead & Inspire",
            "subtitle": "Create Lasting Impact",
            "quote": "\"True leadership begins with self-mastery. When you invest in your growth, you don't just change yourself—you change the world around you. Be the leader others want to follow.\"",
            "author": "— Hrushikesh Mohapatra",
            "designation": "Founder, Gyaan AUR Dhan",
            "gradient": "from-orange-600 via-red-600 to-pink-600",
            "bgGradient": "from-slate-900 via-orange-900 to-slate-800",
            "accentColor": "orange",
            "image": "🚀",
            "backgroundImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
            "altText": "Team collaboration and leadership"
        },
        {
            "title": "Grow Together",
            "subtitle": "In a Community of Achievers",
            "quote": "\"Alone we can do so little; together we can do so much. Our community is more than a network—it's a family united by the pursuit of excellence and mutual growth.\"",
            "author": "— Hrushikesh Mohapatra",
            "designation": "Founder, Gyaan AUR Dhan",
            "gradient": "from-pink-600 via-purple-600 to-indigo-600",
            "bgGradient": "from-slate-900 via-pink-900 to-slate-800",
            "accentColor": "pink",
            "image": "🤝",
            "backgroundImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
            "altText": "Diverse group of professionals collaborating"
        }
    ],
    "hero_steps": [
        {
            "number": 1,
            "title": "Learn",
            "description": "Build knowledge foundation",
            "icon": "📚",
            "color": "from-indigo-500 to-purple-600",
            "gradient": "from-indigo-500/20 to-purple-600/20"
        },
        {
            "number": 2,
            "title": "Earn",
            "description": "Apply learning through referrals",
            "icon": "💰",
            "color": "from-emerald-500 to-teal-600",
            "gradient": "from-emerald-500/20 to-teal-600/20"
        },
        {
            "number": 3,
            "title": "Invest",
            "description": "Reinvest in growth & tools",
            "icon": "📈",
            "color": "from-orange-500 to-red-600",
            "gradient": "from-orange-500/20 to-red-600/20"
        },
        {
            "number": 4,
            "title": "Grow",
            "description": "Scale leadership & impact",
            "icon": "🚀",
            "color": "from-pink-500 to-rose-600",
            "gradient": "from-pink-500/20 to-rose-600/20"
        }
    ],
    "growth_model": [
        {
            "step": 1,
            "title": "Learn",
            "description": "Build your knowledge foundation through comprehensive courses, books, and mentorship programs designed for personal and professional growth.",
            "icon": "📚",
            "delay": 100
        },
        {
            "step": 2,
            "title": "Earn",
            "description": "Apply your learning through ethical sales and referrals. Generate income with our transparent single-leg compensation plan.",
            "icon": "💰",
            "delay": 200
        },
        {
            "step": 3,
            "title": "Invest",
            "description": "Reinvest in your growth and tools. Build sustainable wealth by strategically investing in your personal and business development.",
            "icon": "📈",
            "delay": 300
        },
        {
            "step": 4,
            "title": "Grow",
            "description": "Scale your leadership and impact. Build teams, mentor others, and create a legacy of knowledge and wealth.",
            "icon": "🚀",
            "delay": 400
        }
    ],
    "platform_hubs": [
        {
            "title": "Gyaan Hub",
            "description": "Access comprehensive learning resources, courses, books, and mentorship programs to build your knowledge foundation.",
            "icon": "🧠",
            "color": "from-indigo-600 to-purple-600",
            "href": "/learn",
            "stats": "500+"
        },
        {
            "title": "Dhan Hub",
            "description": "Build sustainable wealth through our ethical compensation plan with direct referrals and team commissions.",
            "icon": "💎",
            "color": "from-emerald-500 to-teal-600",
            "href": "/earn",
            "stats": "₹10L+"
        },
        {
            "title": "Community Hub",
            "description": "Join a supportive network of leaders, participate in events, and grow together with like-minded individuals.",
            "icon": "🤝",
            "color": "from-pink-500 to-rose-600",
            "href": "/community",
            "stats": "1K+"
        }
    ],
    "stats": [
        {
            "icon": "👥",
            "value": "10,000+",
            "label": "Active Partners"
        },
        {
            "icon": "📚",
            "value": "500+",
            "label": "Learning Resources"
        },
        {
            "icon": "💰",
            "value": "₹1Cr+",
            "label": "Total Earnings"
        },
        {
            "icon": "🎯",
            "value": "50+",
            "label": "Events & Workshops"
        }
    ],
    "why_choose_us": [
        {
            "icon": "📚",
            "title": "Comprehensive Learning",
            "description": "Access courses, books, and mentorship programs designed to accelerate your personal and professional growth."
        },
        {
            "icon": "💰",
            "title": "Ethical Income Generation",
            "description": "Build sustainable wealth through our single-leg compensation plan with direct referrals and team commissions."
        },
        {
            "icon": "🌱",
            "title": "Community & Leadership",
            "description": "Join a supportive community of leaders and entrepreneurs committed to mutual growth and success."
        }
    ],
    "core_quote": {
        "text": "When you change what you read, you change what you think. When you change what you think, you change how you live.",
        "author": "— Hrushikesh Mohapatro",
        "role": "Founder, Gyaan AUR Dhan"
    },
    "how_it_works": [
        {
            "step": 1,
            "title": "Step 1: Learn",
            "description": "Start your journey by accessing our comprehensive library of books, courses, and mentorship programs. Build your knowledge foundation with expert guidance.",
            "icon": "📚"
        },
        {
            "step": 2,
            "title": "Step 2: Earn",
            "description": "Apply your knowledge through our ethical referral system. Share what you've learned and earn commissions while helping others grow.",
            "icon": "💰"
        },
        {
            "step": 3,
            "title": "Step 3: Grow",
            "description": "Scale your impact by building teams and creating leaders. Reinvest your earnings and multiply your success through mentorship.",
            "icon": "🚀"
        }
    ],
    "key_features": [
        {
            "icon": "📖",
            "title": "Digital Library",
            "description": "Access thousands of books, courses, and resources in our comprehensive digital library with offline reading capabilities."
        },
        {
            "icon": "👥",
            "title": "Community Network",
            "description": "Connect with like-minded individuals, join study groups, and participate in mentorship programs for accelerated growth."
        },
        {
            "icon": "📊",
            "title": "Progress Tracking",
            "description": "Monitor your learning progress, earnings, and achievements with detailed analytics and personalized insights."
        },
        {
            "icon": "🎯",
            "title": "Smart Recommendations",
            "description": "AI-powered recommendations suggest the perfect books and courses based on your goals and learning preferences."
        }
    ],
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

# Connect to DB - use the root level database
db_path = os.path.join(os.path.dirname(__file__), '..', 'bookstore.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table if not exists (just in case)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_key TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL, -- JSON string
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

# Insert
cursor.execute(
    """
    INSERT INTO site_content (section_key, content, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(section_key) DO UPDATE SET 
        content = excluded.content,
        updated_at = CURRENT_TIMESTAMP
    """,
    ('homepage', json.dumps(content))
)

conn.commit()
conn.close()
print("Content initialized.")
