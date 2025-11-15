"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BooksGrid } from "@/components/books/books-grid";
import { Hero } from "@/components/layout/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedSection, FloatingElement, PulseGlow } from "@/components/ui/animated-section";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

const GrowthStep = ({ step, title, description, icon, delay }: { step: number; title: string; description: string; icon: string; delay: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600"
  ];

  const colors = [
    "from-indigo-500/20 to-purple-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-pink-500/20 to-rose-500/20"
  ];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-8 shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 h-full flex flex-col ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[step - 1]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

      {/* Step number */}
      <div className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-800 to-slate-900 text-2xl font-bold text-white shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
        {step}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[step - 1]} text-3xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>

        <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors duration-300 flex-grow">
          {description}
        </p>

        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300 mt-auto">
          <span>Explore Step</span>
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${gradients[step - 1]} transition-all duration-500 group-hover:w-full`} />

      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  );
};

const HubCard = ({ title, description, icon, color, href, stats }: { title: string; description: string; icon: string; color: string; href: string; stats?: string }) => {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 cursor-pointer h-full flex flex-col"
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color}/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

      {/* Stats badge */}
      {stats && (
        <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          <div className="text-center">
            <div className="text-sm font-bold">{stats}</div>
            <div className="text-xs opacity-80">Active</div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-3xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>

        <p className="mb-6 text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 flex-grow">
          {description}
        </p>

        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300 mt-auto">
          <span>Explore Hub</span>
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-500 group-hover:w-full`} />

      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
    <div className="space-y-20">
      <Hero />

      {/* 4-Step Growth Model */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-purple-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={5} speed={4}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
                  Proven Methodology
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(99, 102, 241, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Your Growth Journey
                </h2>
              </PulseGlow>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Follow our proven <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">4-Step Growth Model</span> to transform your life and achieve lasting success through knowledge and wealth creation
              </p>

              {/* Subtle underline */}
              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-stretch">
            <AnimatedSection direction="left" delay={0.1} className="h-full">
              <div className="h-full">
                <GrowthStep
                  step={1}
                  title="Learn"
                  description="Build your knowledge foundation through comprehensive courses, books, and mentorship programs designed for personal and professional growth."
                  icon="📚"
                  delay={100}
                />
              </div>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.2} className="h-full">
              <div className="h-full">
                <GrowthStep
                  step={2}
                  title="Earn"
                  description="Apply your learning through ethical sales and referrals. Generate income with our transparent single-leg compensation plan."
                  icon="💰"
                  delay={200}
                />
              </div>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.3} className="h-full">
              <div className="h-full">
                <GrowthStep
                  step={3}
                  title="Invest"
                  description="Reinvest in your growth and tools. Build sustainable wealth by strategically investing in your personal and business development."
                  icon="📈"
                  delay={300}
                />
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.4} className="h-full">
              <div className="h-full">
                <GrowthStep
                  step={4}
                  title="Grow"
                  description="Scale your leadership and impact. Build teams, mentor others, and create a legacy of knowledge and wealth."
                  icon="🚀"
                  delay={400}
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="relative" id="featured-books-section">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 via-transparent to-indigo-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={6} speed={5}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-purple-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" />
                  Curated Collection
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(147, 51, 234, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Featured Books
                </h2>
              </PulseGlow>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Discover our handpicked selection of must-read <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">books</span> to accelerate your learning journey and personal growth
              </p>

              {/* Subtle underline */}
              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          {isLoadingBooks ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <div className="absolute inset-0 rounded-full border-4 border-solid border-purple-600 border-r-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="mt-6 text-lg text-slate-600">Loading featured books...</p>
            </div>
          ) : featuredBooks.length > 0 ? (
            <>
              <BooksGrid books={featuredBooks} emptyMessage="No featured books available." />
              <div className="text-center mt-16">
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105 cursor-pointer"
                  aria-label="Browse all books"
                >
                  Browse All Books
                  <svg className="h-5 w-5 transition-transform duration-300 hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl px-12 py-20 text-center">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No Featured Books Yet</h3>
              <p className="text-slate-600 mb-8 text-lg">We're curating the perfect collection for you. Check back soon!</p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105 cursor-pointer"
                aria-label="Browse all books"
              >
                Browse All Books
                <svg className="h-5 w-5 transition-transform duration-300 hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Platform Hubs */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-transparent to-blue-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={4} speed={6}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse" />
                  Platform Ecosystem
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(16, 185, 129, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Explore Our Platform Hubs
                </h2>
              </PulseGlow>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Three powerful <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">zones</span> designed to accelerate your journey to mastery and financial freedom through interconnected growth
              </p>

              {/* Subtle underline */}
              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            <AnimatedSection direction="left" delay={0.1} className="h-full">
              <div className="h-full">
                <PulseGlow color="rgba(99, 102, 241, 0.2)">
                  <HubCard
                    title="Gyaan Hub"
                    description="Access comprehensive learning resources, courses, books, and mentorship programs to build your knowledge foundation."
                    icon="🧠"
                    color="from-indigo-600 to-purple-600"
                    href="/learn"
                    stats="500+"
                  />
                </PulseGlow>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.2} className="h-full">
              <div className="h-full">
                <PulseGlow color="rgba(16, 185, 129, 0.2)">
                  <HubCard
                    title="Dhan Hub"
                    description="Build sustainable wealth through our ethical compensation plan with direct referrals and team commissions."
                    icon="💎"
                    color="from-emerald-500 to-teal-600"
                    href="/earn"
                    stats="₹10L+"
                  />
                </PulseGlow>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.3} className="h-full">
              <div className="h-full">
                <PulseGlow color="rgba(236, 72, 153, 0.2)">
                  <HubCard
                    title="Community Hub"
                    description="Join a supportive network of leaders, participate in events, and grow together with like-minded individuals."
                    icon="🤝"
                    color="from-pink-500 to-rose-600"
                    href="/community"
                    stats="1K+"
                  />
                </PulseGlow>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <AnimatedSection direction="scale" delay={0.3} className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-8 py-12 text-white shadow-2xl">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection direction="up" delay={0.1} className="mb-8 text-center">
            <FloatingElement intensity={8} speed={4}>
              <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Join Thousands of Success Stories</h2>
            </FloatingElement>
            <p className="text-lg text-blue-100">Be part of a growing community transforming lives through knowledge and wealth</p>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-4 items-stretch">
            <AnimatedSection direction="left" delay={0.1} className="h-full">
              <PulseGlow color="rgba(255, 255, 255, 0.1)" className="h-full">
                <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 h-full flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                    👥
                  </div>
                  <div className="mb-2 text-3xl font-bold flex-grow flex items-center">10,000+</div>
                  <div className="text-sm font-medium text-blue-100">Active Partners</div>
                </div>
              </PulseGlow>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.2} className="h-full">
              <PulseGlow color="rgba(255, 255, 255, 0.1)" className="h-full">
                <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 h-full flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                    📚
                  </div>
                  <div className="mb-2 text-3xl font-bold flex-grow flex items-center">500+</div>
                  <div className="text-sm font-medium text-blue-100">Learning Resources</div>
                </div>
              </PulseGlow>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.3} className="h-full">
              <PulseGlow color="rgba(255, 255, 255, 0.1)" className="h-full">
                <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 h-full flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                    💰
                  </div>
                  <div className="mb-2 text-3xl font-bold flex-grow flex items-center">₹1Cr+</div>
                  <div className="text-sm font-medium text-blue-100">Total Earnings</div>
                </div>
              </PulseGlow>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.4} className="h-full">
              <PulseGlow color="rgba(255, 255, 255, 0.1)" className="h-full">
                <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 h-full flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                    🎯
                  </div>
                  <div className="mb-2 text-3xl font-bold flex-grow flex items-center">50+</div>
                  <div className="text-sm font-medium text-blue-100">Events & Workshops</div>
                </div>
              </PulseGlow>
            </AnimatedSection>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Choose Us */}
      <section className="space-y-8">
        <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
          <div className="mb-8">
            <FloatingElement intensity={5} speed={5}>
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-blue-700 shadow-lg">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                Why Choose Us
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              </div>
            </FloatingElement>
          </div>

          <div className="relative mb-8">
            <PulseGlow color="rgba(59, 130, 246, 0.2)">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                Why Choose Gyaan AUR Dhan?
              </h2>
            </PulseGlow>

            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative">
            <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
              Join thousands of <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">learners and entrepreneurs</span> building their future
            </p>

            {/* Subtle underline */}
            <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full opacity-60" />
          </div>
        </AnimatedSection>
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          <AnimatedSection direction="left" delay={0.1} className="h-full">
            <PulseGlow color="rgba(59, 130, 246, 0.15)" className="h-full">
              <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-blue-500 hover:shadow-xl h-full flex flex-col">
                <FloatingElement intensity={5} speed={4}>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    📚
                  </div>
                </FloatingElement>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Comprehensive Learning</h3>
                <p className="text-sm leading-relaxed text-slate-600 flex-grow">
                  Access courses, books, and mentorship programs designed to accelerate your personal and professional growth.
                </p>
              </div>
            </PulseGlow>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2} className="h-full">
            <PulseGlow color="rgba(245, 158, 11, 0.15)" className="h-full">
              <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-yellow-500 hover:shadow-xl h-full flex flex-col">
                <FloatingElement intensity={5} speed={4}>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    💰
                  </div>
                </FloatingElement>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Ethical Income Generation</h3>
                <p className="text-sm leading-relaxed text-slate-600 flex-grow">
                  Build sustainable wealth through our single-leg compensation plan with direct referrals and team commissions.
                </p>
              </div>
            </PulseGlow>
          </AnimatedSection>
          <AnimatedSection direction="right" delay={0.3} className="h-full">
            <PulseGlow color="rgba(34, 197, 94, 0.15)" className="h-full">
              <div className="group relative overflow-hidden rounded-3xl border-2 border-white p-8 shadow-lg transition-all duration-300 hover:border-green-500 hover:shadow-xl h-full flex flex-col">
                <FloatingElement intensity={5} speed={4}>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    🌱
                  </div>
                </FloatingElement>
                <h3 className="mb-3 text-xl font-bold text-slate-900">Community & Leadership</h3>
                <p className="text-sm leading-relaxed text-slate-600 flex-grow">
                  Join a supportive community of leaders and entrepreneurs committed to mutual growth and success.
                </p>
              </div>
            </PulseGlow>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Quote */}
      <AnimatedSection direction="scale" delay={0.3} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-yellow-50 px-8 py-16 shadow-lg">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-yellow-200/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <AnimatedSection direction="up" delay={0.1}>
            <FloatingElement intensity={10} speed={6}>
              <div className="mb-6 text-6xl">💭</div>
            </FloatingElement>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <PulseGlow color="rgba(59, 130, 246, 0.2)">
              <blockquote className="mb-6 text-2xl font-medium leading-relaxed text-slate-800 sm:text-3xl">
                &ldquo;When you change what you read, you change what you think. When you change what you think, you change how you live.&rdquo;
              </blockquote>
            </PulseGlow>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.3}>
            <cite className="block text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">— Hrushikesh Mohapatro</cite>
            <p className="mt-6 text-sm italic text-slate-600">Founder, Gyaan AUR Dhan</p>
          </AnimatedSection>
        </div>
      </AnimatedSection>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-transparent to-red-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={4} speed={6}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-orange-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" />
                  How It Works
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(239, 68, 68, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-red-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Your Journey to Success
                </h2>
              </PulseGlow>

              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Discover how our integrated platform combines <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">learning and earning</span> to accelerate your growth journey
              </p>

              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          <div className="grid gap-12 md:grid-cols-3">
            <AnimatedSection direction="left" delay={0.2} className="text-center">
              <PulseGlow color="rgba(59, 130, 246, 0.15)">
                <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-blue-200/50 shadow-xl">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg">
                      📚
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Step 1: Learn</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Start your journey by accessing our comprehensive library of books, courses, and mentorship programs. Build your knowledge foundation with expert guidance.
                  </p>
                  <div className="text-6xl font-bold text-blue-600/20">01</div>
                </div>
              </PulseGlow>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3} className="text-center">
              <PulseGlow color="rgba(245, 158, 11, 0.15)">
                <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-yellow-200/50 shadow-xl">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-4xl shadow-lg">
                      💰
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Step 2: Earn</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Apply your knowledge through our ethical referral system. Share what you've learned and earn commissions while helping others grow.
                  </p>
                  <div className="text-6xl font-bold text-yellow-600/20">02</div>
                </div>
              </PulseGlow>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.4} className="text-center">
              <PulseGlow color="rgba(34, 197, 94, 0.15)">
                <div className="relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-green-200/50 shadow-xl">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-4xl shadow-lg">
                      🚀
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Step 3: Grow</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Scale your impact by building teams and creating leaders. Reinvest your earnings and multiply your success through mentorship.
                  </p>
                  <div className="text-6xl font-bold text-green-600/20">03</div>
                </div>
              </PulseGlow>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-purple-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={5} speed={5}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
                  Key Features
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(147, 51, 234, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Powerful Tools for Success
                </h2>
              </PulseGlow>

              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Explore the comprehensive features designed to accelerate your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">learning and earning journey</span>
              </p>

              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <AnimatedSection direction="up" delay={0.1} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    📖
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Library</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Access thousands of books, courses, and resources in our comprehensive digital library with offline reading capabilities.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    👥
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Community Network</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Connect with like-minded individuals, join study groups, and participate in mentorship programs for accelerated growth.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    📊
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Progress Tracking</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Monitor your learning progress, earnings, and achievements with detailed analytics and personalized insights.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.4} className="h-full">
              <div className="h-full p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    🎯
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Recommendations</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    AI-powered recommendations suggest the perfect books and courses based on your goals and learning preferences.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-transparent to-teal-50/30 -mx-6" />
        <div className="relative mx-auto max-w-7xl px-6">
          <AnimatedSection direction="up" delay={0.2} className="text-center mb-20">
            <div className="mb-8">
              <FloatingElement intensity={3} speed={7}>
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 border border-green-200/50 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-green-700 shadow-lg">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 animate-pulse" />
                  Success Stories
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                </div>
              </FloatingElement>
            </div>

            <div className="relative mb-8">
              <PulseGlow color="rgba(16, 185, 129, 0.2)">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-teal-900 bg-clip-text text-transparent sm:text-6xl lg:text-7xl leading-tight">
                  Real People, Real Success
                </h2>
              </PulseGlow>

              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-400 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative">
              <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                Hear from our community members who transformed their lives through <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent font-bold">knowledge and entrepreneurship</span>
              </p>

              <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 rounded-full opacity-60" />
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-3">
            <AnimatedSection direction="left" delay={0.2} className="h-full">
              <PulseGlow color="rgba(59, 130, 246, 0.1)" className="h-full">
                <div className="h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-blue-200/30 shadow-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
                      👨‍💼
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Rajesh Kumar</h4>
                      <p className="text-sm text-slate-600">Business Owner</p>
                    </div>
                  </div>
                  <blockquote className="text-slate-700 italic leading-relaxed mb-4">
                    "Gyaan AUR Dhan completely changed my perspective on learning and earning. The books helped me build my business knowledge, and the referral system provided steady income."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              </PulseGlow>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.3} className="h-full">
              <PulseGlow color="rgba(245, 158, 11, 0.1)" className="h-full">
                <div className="h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-yellow-200/30 shadow-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-xl shadow-lg">
                      👩‍🎓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Priya Sharma</h4>
                      <p className="text-sm text-slate-600">Student</p>
                    </div>
                  </div>
                  <blockquote className="text-slate-700 italic leading-relaxed mb-4">
                    "As a student, I was struggling to afford good resources. This platform not only gave me access to premium books but also helped me earn while learning."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              </PulseGlow>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.4} className="h-full">
              <PulseGlow color="rgba(34, 197, 94, 0.1)" className="h-full">
                <div className="h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-green-200/30 shadow-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg">
                      👨‍🏫
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Amit Singh</h4>
                      <p className="text-sm text-slate-600">Mentor</p>
                    </div>
                  </div>
                  <blockquote className="text-slate-700 italic leading-relaxed mb-4">
                    "Being part of this community has been incredible. I've not only grown personally but also built a team of successful entrepreneurs who are making a real difference."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              </PulseGlow>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <AnimatedSection direction="scale" delay={0.4} className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-16 text-center text-white shadow-2xl">
        <div className="mx-auto max-w-3xl">
          <AnimatedSection direction="up" delay={0.1}>
            <FloatingElement intensity={8} speed={4}>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Transform Your Life?</h2>
            </FloatingElement>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.2}>
            <p className="mb-8 text-lg text-blue-100">
              Join Gyaan AUR Dhan today and start your journey towards knowledge, wealth, and leadership excellence.
            </p>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PulseGlow color="rgba(245, 158, 11, 0.3)">
                <Link
                  href="/register"
                  className="rounded-full bg-yellow-500 px-8 py-4 text-base font-semibold text-blue-900 shadow-lg transition-all duration-300 hover:bg-yellow-400 hover:scale-105 hover:shadow-xl cursor-pointer"
                  aria-label="Start your journey"
                >
                  Start Your Journey
                </Link>
              </PulseGlow>
              <Link
                href="/login"
                className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20 cursor-pointer"
                aria-label="Sign in"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  );
}
