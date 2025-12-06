"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { HeroSlide, HeroStep } from "@/lib/types";

interface HeroProps {
  slides?: HeroSlide[];
  steps?: HeroStep[];
}

export const Hero = ({ slides, steps: propSteps }: HeroProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const defaultSlides = [
    {
      title: "Unlock Your Potential",
      subtitle: "Through the Power of Knowledge",
      quote: "\"Knowledge is not just information, it's the foundation of transformation. When you change what you read, you change what you think. When you change what you think, you change how you live.\"",
      author: "— Hrushikesh Mohapatra",
      designation: "Founder, Gyaan AUR Dhan",
      gradient: "from-indigo-600 via-purple-600 to-pink-600",
      bgGradient: "from-slate-900 via-indigo-900 to-slate-800",
      accentColor: "indigo",
      image: "📚",
      backgroundImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      altText: "Books and learning materials on a desk",
    },
    {
      title: "Build Your Future",
      subtitle: "With Knowledge & Wealth Creation",
      quote: "\"Success is not accidental. It's the result of consistent learning, strategic action, and building meaningful relationships. Every book you read opens a new door to opportunity.\"",
      author: "— Hrushikesh Mohapatra",
      designation: "Founder, Gyaan AUR Dhan",
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      bgGradient: "from-slate-900 via-emerald-900 to-slate-800",
      accentColor: "emerald",
      image: "💰",
      backgroundImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      altText: "Financial charts and money growth",
    },
    {
      title: "Lead & Inspire",
      subtitle: "Create Lasting Impact",
      quote: "\"True leadership begins with self-mastery. When you invest in your growth, you don't just change yourself—you change the world around you. Be the leader others want to follow.\"",
      author: "— Hrushikesh Mohapatra",
      designation: "Founder, Gyaan AUR Dhan",
      gradient: "from-orange-600 via-red-600 to-pink-600",
      bgGradient: "from-slate-900 via-orange-900 to-slate-800",
      accentColor: "orange",
      image: "🚀",
      backgroundImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      altText: "Team collaboration and leadership",
    },
    {
      title: "Grow Together",
      subtitle: "In a Community of Achievers",
      quote: "\"Alone we can do so little; together we can do so much. Our community is more than a network—it's a family united by the pursuit of excellence and mutual growth.\"",
      author: "— Hrushikesh Mohapatra",
      designation: "Founder, Gyaan AUR Dhan",
      gradient: "from-pink-600 via-purple-600 to-indigo-600",
      bgGradient: "from-slate-900 via-pink-900 to-slate-800",
      accentColor: "pink",
      image: "🤝",
      backgroundImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2024&q=80",
      altText: "Diverse group of professionals collaborating",
    },
  ];

  const defaultSteps = [
    {
      number: 1,
      title: "Learn",
      description: "Build knowledge foundation",
      icon: "📚",
      color: "from-indigo-500 to-purple-600",
      gradient: "from-indigo-500/20 to-purple-600/20"
    },
    {
      number: 2,
      title: "Earn",
      description: "Apply learning through referrals",
      icon: "💰",
      color: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-500/20 to-teal-600/20"
    },
    {
      number: 3,
      title: "Invest",
      description: "Reinvest in growth & tools",
      icon: "📈",
      color: "from-orange-500 to-red-600",
      gradient: "from-orange-500/20 to-red-600/20"
    },
    {
      number: 4,
      title: "Grow",
      description: "Scale leadership & impact",
      icon: "🚀",
      color: "from-pink-500 to-rose-600",
      gradient: "from-pink-500/20 to-rose-600/20"
    },
  ];

  const carouselSlides = slides || defaultSlides;
  const steps = propSteps || defaultSteps;

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Preload background images for smoother transitions
  useEffect(() => {
    carouselSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.backgroundImage;
    });
  }, [carouselSlides]);

  // Auto-rotate carousel with progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        setProgress(0); // Reset progress on slide change
        setIsTransitioning(false);
        // Trigger animations for new slide
        setTimeout(() => setAnimationKey(prev => prev + 1), 100);
      }, 300);
    }, 6000); // Change slide every 6 seconds

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / 600), 100)); // Increment progress every 100ms
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [carouselSlides.length]);

  // Reset progress when slide changes manually
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      setIsTransitioning(false);
      // Trigger animations for new slide
      setTimeout(() => setAnimationKey(prev => prev + 1), 100);
    }, 300);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
      setIsTransitioning(false);
      // Trigger animations for new slide
      setTimeout(() => setAnimationKey(prev => prev + 1), 100);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
        // Trigger animations for new slide
        setTimeout(() => setAnimationKey(prev => prev + 1), 100);
      }, 300);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image that changes with slides */}
      <div className="absolute inset-0 transition-all duration-2000">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-all duration-2000"
          style={{
            backgroundImage: `url(${carouselSlides[currentSlide].backgroundImage})`,
          }}
        />
        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-br ${carouselSlides[currentSlide].bgGradient} opacity-85 transition-all duration-2000`} />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-transparent opacity-50" />

        {/* Geometric pattern for texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rotate-45" />
          <div className="absolute top-1/3 right-20 w-24 h-24 border border-white/20 rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border border-white/20 rotate-12" />
          <div className="absolute bottom-10 right-10 w-28 h-28 border border-white/20 rounded-lg rotate-30" />
        </div>
      </div>

      {/* Animated gradient orbs that change with slides */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${carouselSlides[currentSlide].gradient}/30 rounded-full blur-3xl animate-pulse transition-all duration-2000`}
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r ${carouselSlides[currentSlide].gradient.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}/20 rounded-full blur-3xl animate-pulse transition-all duration-2000`}
        style={{
          transform: `translate(${mousePosition.x * -0.005}px, ${mousePosition.y * -0.005}px)`,
          transition: 'transform 0.1s ease-out',
          animationDelay: '1s'
        }}
      />

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Content */}
          <div className="text-center">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 text-sm font-medium text-white/90 transition-all duration-700 mt-4 ${isLoaded ? 'translate-y-0 opacity-100 animate-slide-in-up' : 'translate-y-4 opacity-0'}`}>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Welcome to Gyaan AUR Dhan
            </div>

            {/* Main heading with animated text effect */}
            <h1 className={`mt-8 text-5xl font-bold leading-tight text-white sm:text-7xl lg:text-8xl transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '0.2s' }}>
              <span key={`title-${animationKey}`} className="block animate-slide-in-left">
                {carouselSlides[currentSlide].title}
              </span>
            </h1>

            {/* Subtitle with fade-in effect */}
            <p className={`mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-300 sm:text-2xl transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '0.4s' }}>
              <span key={`subtitle-${animationKey}`} className="block animate-fade-in-scale animation-delay-200">
                {carouselSlides[currentSlide].subtitle}
              </span>
            </p>

            {/* Quote section with typewriter effect */}
            <div className={`mt-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '0.6s' }}>
              <blockquote key={`quote-${animationKey}`} className="mx-auto max-w-4xl text-2xl leading-relaxed font-medium text-white/90 animate-slide-in-up animation-delay-400">
                {carouselSlides[currentSlide].quote}
              </blockquote>
              <cite key={`author-${animationKey}`} className="mt-6 block text-lg font-semibold bg-gradient-to-r animate-slide-in-right animation-delay-600">
                <span className={`bg-gradient-to-r ${carouselSlides[currentSlide].gradient} bg-clip-text text-transparent`}>
                  {carouselSlides[currentSlide].author}
                </span>
                <span className="block text-sm font-normal text-slate-400 mt-1">
                  {carouselSlides[currentSlide].designation}
                </span>
              </cite>
            </div>

            {/* CTA Buttons */}
            <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '0.8s' }}>
              <Link
                href="/register"
                className={`group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105 ${animationKey >= 0 ? 'animate-fade-in-scale animation-delay-800' : ''}`}
                aria-label="Join our community"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/learn"
                className={`group rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/20 hover:scale-105 ${animationKey >= 0 ? 'animate-slide-in-up animation-delay-800' : ''}`}
                aria-label="Explore learning resources"
              >
                Explore Gyaan Hub
              </Link>
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className={`mt-16 flex items-center justify-center gap-4 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1s' }}>
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className={`group flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 ${animationKey >= 0 ? 'animate-slide-in-left animation-delay-800' : ''}`}
              aria-label="Previous slide"
            >
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className={`flex items-center gap-2 ${animationKey >= 0 ? 'animate-fade-in-scale animation-delay-1000' : ''}`}>
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${index === currentSlide
                    ? `bg-gradient-to-r ${carouselSlides[currentSlide].gradient} scale-125 animate-pulse`
                    : 'bg-white/30 hover:bg-white/50'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className={`group flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 ${animationKey >= 0 ? 'animate-slide-in-right animation-delay-800' : ''}`}
              aria-label="Next slide"
            >
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className={`mt-8 mx-auto max-w-md ${animationKey >= 0 ? 'animate-slide-in-up animation-delay-1200' : ''}`}>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${carouselSlides[currentSlide].gradient} transition-all duration-300 ease-out`}
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Interactive steps grid */}
        <div className={`mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1.2s' }}>
          {steps.map((step, index) => (
            <div
              key={`${step.number}-${animationKey}`}
              className={`group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer animate-fade-in-scale`}
              style={{
                transitionDelay: `${index * 0.1}s`,
                animationDelay: `${1.4 + index * 0.1}s`
              }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 text-center text-4xl transition-transform duration-300 group-hover:scale-110">
                  {step.icon}
                </div>
                <div className={`text-center text-xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-2`}>
                  {step.title}
                </div>
                <div className="text-center text-sm text-slate-300 group-hover:text-white transition-colors duration-300">
                  {step.description}
                </div>
              </div>

              {/* Hover effect line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${step.color} transition-all duration-500 group-hover:w-full`} />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm">Scroll to explore</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Auto-play pause on hover */}
      <div
        className="absolute inset-0"
        onMouseEnter={() => {
          // Pause auto-rotation on hover (implementation would go here)
        }}
        onMouseLeave={() => {
          // Resume auto-rotation on mouse leave (implementation would go here)
        }}
      />
    </section>
  );
};
