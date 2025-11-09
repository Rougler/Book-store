"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BooksGrid } from "@/components/books/books-grid";
import { Hero } from "@/components/layout/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

const GrowthStep = ({ step, title, description, icon, delay }: { step: number; title: string; description: string; icon: string; delay: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-2 border-transparent bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg transition-all duration-500 hover:border-blue-500 hover:shadow-xl cursor-pointer ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="absolute right-4 top-4 text-6xl font-bold text-blue-50 transition-transform duration-300 group-hover:scale-110">
        {step}
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
          <span>Explore →</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-600 to-yellow-500 transition-all duration-500 group-hover:w-full" />
    </div>
  );
};

const HubCard = ({ title, description, icon, color, href, stats }: { title: string; description: string; icon: string; color: string; href: string; stats?: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-2xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
          {stats && (
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{stats}</div>
              <div className="text-xs text-slate-500">Active</div>
            </div>
          )}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-transform duration-300 group-hover:translate-x-2">
          <span>Explore Hub</span>
          <span className="text-lg">→</span>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-500 ${isHovered ? "w-full" : ""}`} />
    </Link>
  );
};

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setIsLoadingBooks(true);
        const books = await apiRequest<Book[]>("/api/books");
        // Filter for featured books and limit to 6
        if (Array.isArray(books)) {
          const featured = books.filter((book) => book.is_featured && book.is_active).slice(0, 6);
          setFeaturedBooks(featured);
        } else {
          setFeaturedBooks([]);
        }
      } catch {
        setFeaturedBooks([]);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="space-y-16">
      <Hero />

      {/* 4-Step Growth Model */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">Your Growth Journey</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Follow the proven 4-Step Growth Model to transform your life and achieve lasting success
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <GrowthStep
            step={1}
            title="Learn"
            description="Build your knowledge foundation through comprehensive courses, books, and mentorship programs designed for personal and professional growth."
            icon="📚"
            delay={100}
          />
          <GrowthStep
            step={2}
            title="Earn"
            description="Apply your learning through ethical sales and referrals. Generate income with our transparent single-leg compensation plan."
            icon="💰"
            delay={200}
          />
          <GrowthStep
            step={3}
            title="Invest"
            description="Reinvest in your growth and tools. Build sustainable wealth by strategically investing in your personal and business development."
            icon="📈"
            delay={300}
          />
          <GrowthStep
            step={4}
            title="Grow"
            description="Scale your leadership and impact. Build teams, mentor others, and create a legacy of knowledge and wealth."
            icon="🚀"
            delay={400}
          />
        </div>
      </section>

      {/* Featured Books Section - Always Visible */}
      <section className="space-y-8" id="featured-books-section">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">Featured Books</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Discover our handpicked selection of must-read books to accelerate your learning journey
          </p>
        </div>
        {isLoadingBooks ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading featured books...</p>
          </div>
        ) : featuredBooks.length > 0 ? (
          <>
            <BooksGrid books={featuredBooks} emptyMessage="No featured books available." />
            <div className="text-center">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 cursor-pointer"
                aria-label="Browse all books"
              >
                Browse All Books
                <span className="text-lg">→</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
            <p className="text-slate-600 mb-4">No featured books available at the moment.</p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 cursor-pointer"
              aria-label="Browse all books"
            >
              Browse All Books
              <span className="text-lg">→</span>
            </Link>
          </div>
        )}
      </section>

      {/* Platform Hubs */}
      <section className="space-y-8">
        <SectionHeading
          title="Explore Our Platform Hubs"
          description="Three powerful zones designed to accelerate your journey to mastery and financial freedom"
        />
        <div className="grid gap-6 md:grid-cols-3">
          <HubCard
            title="Gyaan Hub"
            description="Access comprehensive learning resources, courses, books, and mentorship programs to build your knowledge foundation."
            icon="🧠"
            color="from-blue-600 to-blue-700"
            href="/learn"
            stats="500+"
          />
          <HubCard
            title="Dhan Hub"
            description="Build sustainable wealth through our ethical compensation plan with direct referrals and team commissions."
            icon="💎"
            color="from-yellow-500 to-yellow-600"
            href="/earn"
            stats="₹10L+"
          />
          <HubCard
            title="Community Hub"
            description="Join a supportive network of leaders, participate in events, and grow together with like-minded individuals."
            icon="🤝"
            color="from-green-600 to-green-700"
            href="/community"
            stats="1K+"
          />
        </div>
      </section>

      {/* Statistics */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-8 py-12 text-white shadow-2xl">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Join Thousands of Success Stories</h2>
            <p className="text-lg text-blue-100">Be part of a growing community transforming lives through knowledge and wealth</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                👥
              </div>
              <div className="mb-2 text-3xl font-bold">10,000+</div>
              <div className="text-sm font-medium text-blue-100">Active Partners</div>
            </div>
            <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                📚
              </div>
              <div className="mb-2 text-3xl font-bold">500+</div>
              <div className="text-sm font-medium text-blue-100">Learning Resources</div>
            </div>
            <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                💰
              </div>
              <div className="mb-2 text-3xl font-bold">₹1Cr+</div>
              <div className="text-sm font-medium text-blue-100">Total Earnings</div>
            </div>
            <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                🎯
              </div>
              <div className="mb-2 text-3xl font-bold">50+</div>
              <div className="text-sm font-medium text-blue-100">Events & Workshops</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="space-y-8">
        <SectionHeading
          title="Why Choose Gyaan AUR Dhan?"
          description="Join thousands of learners and entrepreneurs building their future"
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              📚
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Comprehensive Learning</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Access courses, books, and mentorship programs designed to accelerate your personal and professional growth.
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-yellow-500 hover:shadow-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              💰
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Ethical Income Generation</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Build sustainable wealth through our single-leg compensation plan with direct referrals and team commissions.
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-green-500 hover:shadow-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              🌱
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Community & Leadership</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Join a supportive community of leaders and entrepreneurs committed to mutual growth and success.
            </p>
          </div>
        </div>
      </section>

      {/* Core Quote */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-yellow-50 px-8 py-16 shadow-lg">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 text-6xl">💭</div>
          <blockquote className="mb-6 text-2xl font-medium leading-relaxed text-slate-800 sm:text-3xl">
            &ldquo;When you change what you read, you change what you think. When you change what you think, you change how you live.&rdquo;
          </blockquote>
          <cite className="block text-lg font-semibold text-slate-900">— Hrushikesh Mohapatro</cite>
          <p className="mt-6 text-sm italic text-slate-600">Founder, Gyaan AUR Dhan</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-16 text-center text-white shadow-2xl">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Transform Your Life?</h2>
          <p className="mb-8 text-lg text-blue-100">
            Join Gyaan AUR Dhan today and start your journey towards knowledge, wealth, and leadership excellence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-yellow-500 px-8 py-4 text-base font-semibold text-blue-900 shadow-lg transition-all duration-300 hover:bg-yellow-400 hover:scale-105 hover:shadow-xl cursor-pointer"
              aria-label="Start your journey"
            >
              Start Your Journey
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20 cursor-pointer"
              aria-label="Sign in"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
