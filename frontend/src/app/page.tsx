"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BooksGrid } from "@/components/books/books-grid";
import { Hero } from "@/components/layout/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedSection, FloatingElement, PulseGlow } from "@/components/ui/animated-section";
import { apiRequest } from "@/lib/api-client";
import { Book, HomepageContent } from "@/lib/types";

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
      className={`group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-8 shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 h-full flex flex-col ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
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

        <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors duration-300 flex-grow line-clamp-3">
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

        <p className="mb-6 text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 flex-grow line-clamp-3">
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
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await apiRequest<HomepageContent>("/api/content/homepage");
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch homepage content:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchContent();
  }, []);

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

  if (isLoadingContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <div className="absolute inset-4 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="mt-4 text-lg font-medium text-slate-600">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Content Loading</h2>
          <p className="text-slate-600 mb-8">We're setting up your experience. Please refresh the page in a moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner - Full Width */}
      <Hero slides={content.hero_slides} steps={content.hero_steps} />

      {/* Content Sections - Constrained Width */}
      <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8">
        {/* 4-Step Growth Model */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-purple-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    {content.growth_model_title || "Your Growth Journey"}
                  </h2>
                </PulseGlow>

                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.growth_model_subtitle || "Follow our proven 4-Step Growth Model to transform your life and achieve lasting success through knowledge and wealth creation"}
                </p>

                {/* Subtle underline */}
                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-stretch">
              {content.growth_model.map((item, index) => (
                <AnimatedSection key={item.step} direction={index % 2 === 0 ? "left" : "right"} delay={0.1 * (index + 1)} className="h-full">
                  <div className="h-full">
                    <GrowthStep
                      step={item.step}
                      title={item.title}
                      description={item.description}
                      icon={item.icon}
                      delay={item.delay}
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="relative py-12 sm:py-16 lg:py-20" id="featured-books-section">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 via-transparent to-indigo-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-transparent to-blue-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    {content.platform_hubs_title || "Explore Our Platform Hubs"}
                  </h2>
                </PulseGlow>

                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.platform_hubs_subtitle || "Three powerful zones designed to accelerate your journey to mastery and financial freedom through interconnected growth"}
                </p>

                {/* Subtle underline */}
                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-3 items-stretch">
              {content.platform_hubs.map((hub, index) => (
                <AnimatedSection key={hub.title} direction="up" delay={0.1 * (index + 1)} className="h-full">
                  <div className="h-full">
                    <PulseGlow color={`rgba(${index === 0 ? '99, 102, 241' : index === 1 ? '16, 185, 129' : '236, 72, 153'}, 0.2)`}>
                      <HubCard
                        title={hub.title}
                        description={hub.description}
                        icon={hub.icon}
                        color={hub.color}
                        href={hub.href}
                        stats={hub.stats}
                      />
                    </PulseGlow>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <AnimatedSection direction="scale" delay={0.3} className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-12 text-white shadow-2xl sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <AnimatedSection direction="up" delay={0.1} className="mb-8 text-center">
              <FloatingElement intensity={8} speed={4}>
                <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Join Thousands of Success Stories</h2>
              </FloatingElement>
              <p className="text-lg text-blue-100">Be part of a growing community transforming lives through knowledge and wealth</p>
            </AnimatedSection>
            <div className="grid gap-6 md:grid-cols-4 items-stretch">
              {content.stats.map((stat, index) => (
                <AnimatedSection key={stat.label} direction="up" delay={0.1 * (index + 1)} className="h-full">
                  <PulseGlow color="rgba(255, 255, 255, 0.1)" className="h-full">
                    <div className="group rounded-3xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 h-full flex flex-col">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl transition-transform duration-300 group-hover:scale-110">
                        {stat.icon}
                      </div>
                      <div className="mb-2 text-3xl font-bold flex-grow flex items-center">{stat.value}</div>
                      <div className="text-sm font-medium text-blue-100">{stat.label}</div>
                    </div>
                  </PulseGlow>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Why Choose Us */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="up" delay={0.2} className="text-center mb-12 sm:mb-16 lg:mb-20">
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
                    {content.why_choose_us_title || "Why Choose Gyaan AUR Dhan?"}
                  </h2>
                </PulseGlow>

                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.why_choose_us_subtitle || "Join thousands of learners and entrepreneurs building their future"}
                </p>

                {/* Subtle underline */}
                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>
            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              {content.why_choose_us.map((item, index) => (
                <AnimatedSection key={item.title} direction="up" delay={0.1 * (index + 1)} className="h-full">
                  <PulseGlow color={`rgba(${index === 0 ? '59, 130, 246' : index === 1 ? '245, 158, 11' : '34, 197, 94'}, 0.15)`} className="h-full">
                    <div className={`group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg transition-all duration-500 hover:border-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col`}>
                      {/* Animated background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500/10 to-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                      <div className="relative z-10 h-full flex flex-col">
                        <FloatingElement intensity={5} speed={4}>
                          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500 to-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-600 text-4xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                            {item.icon}
                          </div>
                        </FloatingElement>
                        <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-slate-600 flex-grow group-hover:text-slate-700 transition-colors line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Animated bottom border */}
                      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500 to-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-600 transition-all duration-500 group-hover:w-full`} />

                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </PulseGlow>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Core Quote */}
        <AnimatedSection direction="scale" delay={0.3} className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-yellow-50 px-4 py-12 shadow-lg sm:px-6 lg:px-8 lg:py-16">
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
                  &ldquo;{content.core_quote.text}&rdquo;
                </blockquote>
              </PulseGlow>
            </AnimatedSection>
            <AnimatedSection direction="up" delay={0.3}>
              <cite className="block text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{content.core_quote.author}</cite>
              <p className="mt-6 text-sm italic text-slate-600">{content.core_quote.role}</p>
            </AnimatedSection>
          </div>
        </AnimatedSection>

        {/* How It Works */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-transparent to-red-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    {content.how_it_works_title || "Your Journey to Success"}
                  </h2>
                </PulseGlow>

                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.how_it_works_subtitle || "Discover how our integrated platform combines learning and earning to accelerate your growth journey"}
                </p>

                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>

            <div className="grid gap-12 md:grid-cols-3">
              {content.how_it_works.map((step, index) => (
                <AnimatedSection key={step.step} direction="up" delay={0.1 * (index + 1)} className="text-center">
                  <PulseGlow color={`rgba(${index === 0 ? '59, 130, 246' : index === 1 ? '245, 158, 11' : '34, 197, 94'}, 0.15)`}>
                    <div className={`group relative overflow-hidden p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-200/50 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                      {/* Animated background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500/10 to-${index === 0 ? 'indigo' : index === 1 ? 'orange' : 'emerald'}-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                      <div className="relative z-10">
                        <div className="mb-6 flex justify-center">
                          <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500 to-${index === 0 ? 'indigo' : index === 1 ? 'orange' : 'emerald'}-600 flex items-center justify-center text-4xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                            {step.icon}
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                        <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors line-clamp-3">
                          {step.description}
                        </p>
                        <div className={`text-6xl font-bold text-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-600/20 transition-all duration-300 group-hover:text-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-600/30 group-hover:scale-110`}>0{step.step}</div>
                      </div>

                      {/* Animated bottom border */}
                      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-${index === 0 ? 'blue' : index === 1 ? 'yellow' : 'green'}-500 to-${index === 0 ? 'indigo' : index === 1 ? 'orange' : 'emerald'}-600 transition-all duration-500 group-hover:w-full`} />

                      {/* Subtle shine effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </PulseGlow>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-purple-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="up" delay={0.2} className="text-center mb-12 sm:mb-16 lg:mb-20">
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
                    {content.key_features_title || "Powerful Tools for Success"}
                  </h2>
                </PulseGlow>

                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.key_features_subtitle || "Explore the comprehensive features designed to accelerate your learning and earning journey"}
                </p>

                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {content.key_features.map((feature, index) => (
                <AnimatedSection key={feature.title} direction="up" delay={0.1 * (index + 1)} className="h-full">
                  <div className="group relative overflow-hidden h-full p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2">
                    {/* Animated background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'yellow' : 'red'}-500/10 to-${index === 0 ? 'indigo' : index === 1 ? 'emerald' : index === 2 ? 'orange' : 'pink'}-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                    <div className="relative z-10 text-center mb-4 h-full flex flex-col">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-${index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'yellow' : 'red'}-500 to-${index === 0 ? 'indigo' : index === 1 ? 'emerald' : index === 2 ? 'orange' : 'pink'}-600 flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed flex-grow group-hover:text-slate-700 transition-colors line-clamp-3">
                        {feature.description}
                      </p>
                    </div>

                    {/* Animated bottom border */}
                    <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-${index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'yellow' : 'red'}-500 to-${index === 0 ? 'indigo' : index === 1 ? 'emerald' : index === 2 ? 'orange' : 'pink'}-600 transition-all duration-500 group-hover:w-full`} />

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-transparent to-teal-50/30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection direction="up" delay={0.2} className="text-center mb-12 sm:mb-16 lg:mb-20">
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
                    {content.success_stories_title}
                  </h2>
                </PulseGlow>

                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-400 opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              <div className="relative">
                <p className="mx-auto max-w-4xl text-xl leading-relaxed text-slate-600 sm:text-2xl font-medium">
                  {content.success_stories_subtitle}
                </p>

                <div className="mt-6 mx-auto w-24 h-1 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 rounded-full opacity-60" />
              </div>
            </AnimatedSection>

            <div className="grid gap-8 md:grid-cols-3">
              <AnimatedSection direction="left" delay={0.2} className="h-full">
                <PulseGlow color="rgba(59, 130, 246, 0.1)" className="h-full">
                  <div className="group relative overflow-hidden h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-blue-200/30 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          👨‍💼
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Rajesh Kumar</h4>
                          <p className="text-sm text-slate-600">Business Owner</p>
                        </div>
                      </div>
                      <blockquote className="text-slate-700 italic leading-relaxed mb-4 group-hover:text-slate-800 transition-colors">
                        "Gyaan AUR Dhan completely changed my perspective on learning and earning. The books helped me build my business knowledge, and the referral system provided steady income."
                      </blockquote>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg transition-transform duration-300 group-hover:scale-110" style={{ transitionDelay: `${i * 50}ms` }}>⭐</span>
                        ))}
                      </div>
                    </div>

                    {/* Animated bottom border */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 group-hover:w-full" />

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </PulseGlow>
              </AnimatedSection>

              <AnimatedSection direction="up" delay={0.3} className="h-full">
                <PulseGlow color="rgba(245, 158, 11, 0.1)" className="h-full">
                  <div className="group relative overflow-hidden h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-yellow-200/30 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          👩‍🎓
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Priya Sharma</h4>
                          <p className="text-sm text-slate-600">Student</p>
                        </div>
                      </div>
                      <blockquote className="text-slate-700 italic leading-relaxed mb-4 group-hover:text-slate-800 transition-colors">
                        "As a student, I was struggling to afford good resources. This platform not only gave me access to premium books but also helped me earn while learning."
                      </blockquote>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg transition-transform duration-300 group-hover:scale-110" style={{ transitionDelay: `${i * 50}ms` }}>⭐</span>
                        ))}
                      </div>
                    </div>

                    {/* Animated bottom border */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 to-orange-600 transition-all duration-500 group-hover:w-full" />

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </PulseGlow>
              </AnimatedSection>

              <AnimatedSection direction="right" delay={0.4} className="h-full">
                <PulseGlow color="rgba(34, 197, 94, 0.1)" className="h-full">
                  <div className="group relative overflow-hidden h-full p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-green-200/30 shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          👨‍🏫
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Amit Singh</h4>
                          <p className="text-sm text-slate-600">Mentor</p>
                        </div>
                      </div>
                      <blockquote className="text-slate-700 italic leading-relaxed mb-4 group-hover:text-slate-800 transition-colors">
                        "Being part of this community has been incredible. I've not only grown personally but also built a team of successful entrepreneurs who are making a real difference."
                      </blockquote>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg transition-transform duration-300 group-hover:scale-110" style={{ transitionDelay: `${i * 50}ms` }}>⭐</span>
                        ))}
                      </div>
                    </div>

                    {/* Animated bottom border */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500 group-hover:w-full" />

                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </PulseGlow>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <AnimatedSection direction="scale" delay={0.4} className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-12 text-center text-white shadow-2xl sm:px-6 lg:px-8 lg:py-16">
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
    </div>
  );
}
