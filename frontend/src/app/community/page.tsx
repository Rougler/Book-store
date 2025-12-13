"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { communityApi } from "@/lib/api-client";
import { CommunityPost, CommunityBanner, MeetingLink, CommunityStats } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export default function CommunityPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<CommunityBanner[]>([]);
  const [meetings, setMeetings] = useState<MeetingLink[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [bannersData, meetingsData, postsData, statsData] = await Promise.all([
        communityApi.getBanners(),
        communityApi.getMeetings(),
        communityApi.getPosts({ limit: 10 }),
        communityApi.getStats(),
      ]);

      setBanners(bannersData);
      setMeetings(meetingsData);
      setPosts(postsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityApi.createPost(newPost);
      setNewPost({ title: "", content: "", category: "general" });
      setShowCreatePost(false);
      loadCommunityData();
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20 mb-4">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
            <div className="absolute inset-3 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-slate-600">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/50 px-6 py-2 text-sm font-medium text-pink-700 mb-6">
              <span className="text-xl">🤝</span>
              Community Hub
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-pink-900 to-purple-900 bg-clip-text text-transparent sm:text-5xl mb-4">
              Connect & Grow Together
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Join a vibrant community of learners, entrepreneurs, and leaders supporting each other&apos;s journey
            </p>
          </div>

          {/* Community Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { value: stats.total_posts, label: "Forum Posts", icon: "💬", color: "from-pink-500 to-rose-600" },
                { value: stats.total_comments, label: "Comments", icon: "💭", color: "from-purple-500 to-indigo-600" },
                { value: stats.active_users, label: "Active Users", icon: "👥", color: "from-blue-500 to-cyan-600" },
                { value: meetings.length, label: "Upcoming Meetings", icon: "📅", color: "from-emerald-500 to-teal-600" },
              ].map((stat) => (
                <div key={stat.label} className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`} />
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 space-y-12">
        {/* Community Banners */}
        {banners.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📢</span> Featured Announcements
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <div key={banner.id} className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-2 text-lg">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{banner.description}</p>
                    )}
                    {banner.link_url && (
                      <Link
                        href={banner.link_url}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                      >
                        Learn More
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Meetings */}
        {meetings.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📅</span> Upcoming Meetings
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {meetings.slice(0, 4).map((meeting) => (
                <div key={meeting.id} className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">{meeting.title}</h3>
                        {meeting.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">{meeting.description}</p>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white">
                        Live
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-6">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <span className="text-lg">📅</span>
                        <span>{formatDate(meeting.start_date)}</span>
                      </div>
                      {meeting.end_date && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                          <span className="text-lg">⏰</span>
                          <span>Ends: {formatDate(meeting.end_date)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Meeting
                      </Link>
                      {meeting.passcode && (
                        <button
                          onClick={() => navigator.clipboard.writeText(meeting.passcode)}
                          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2"
                          title="Copy passcode"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Discussion Forum */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">💬</span> Discussion Forum
            </h2>
            {user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${showCreatePost
                  ? "bg-slate-200 text-slate-700"
                  : "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl"
                  }`}
              >
                {showCreatePost ? (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Post
                  </>
                )}
              </button>
            )}
          </div>

          {/* Create Post Form */}
          {showCreatePost && user && (
            <div className="relative mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur opacity-20" />
              <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">✍️</span> Create a New Post
                </h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="What's on your mind?"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-slate-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                    >
                      <option value="general">💬 General Discussion</option>
                      <option value="question">❓ Question</option>
                      <option value="announcement">📢 Announcement</option>
                      <option value="event">🎉 Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                    <textarea
                      placeholder="Share your thoughts, ask questions, or start a discussion..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Publish Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-12 text-center">
                <span className="text-5xl block mb-4">💭</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No posts yet</h3>
                <p className="text-slate-600 mb-6">Be the first to start a discussion!</p>
                {user ? (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  >
                    Create First Post
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  >
                    Login to Post
                  </Link>
                )}
              </div>
            ) : (
              posts.map((post, index) => (
                <div
                  key={post.id}
                  className="group rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl animate-fade-in-scale"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {post.user_profile_image ? (
                        <Image
                          src={post.user_profile_image}
                          alt={post.user_name}
                          width={48}
                          height={48}
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {post.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">{post.title}</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {post.category}
                        </span>
                        {post.is_pinned && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                            📌 Pinned
                          </span>
                        )}
                        {post.is_featured && (
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-3">{post.content}</p>

                      {post.image_url && (
                        <div className="mb-4 rounded-2xl overflow-hidden">
                          <Image
                            src={post.image_url}
                            alt="Post image"
                            width={500}
                            height={300}
                            className="object-cover w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-slate-500">
                          <span className="font-medium text-slate-700">{post.user_name}</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1.5 text-slate-500 hover:text-pink-600 transition-colors">
                            <span>❤️</span>
                            <span>{post.likes_count}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors">
                            <span>💬</span>
                            <span>{post.comments_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {posts.length > 0 && (
            <div className="text-center mt-8">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 hover:border-pink-300 hover:text-pink-600 transition-all">
                Load More Posts
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {/* Join Community CTA */}
        {!user && (
          <section className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-[2.5rem] blur opacity-20" />
            <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <span className="text-5xl mb-4 block">🤝</span>
                <h2 className="text-3xl font-bold text-white mb-4 sm:text-4xl">Join Our Community</h2>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                  Become part of a supportive community committed to mutual growth and success. Register now to connect with like-minded individuals.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02]"
                >
                  Join Now
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
