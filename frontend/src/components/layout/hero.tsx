"use client";

import Link from "next/link";
import { useState } from "react";

export const Hero = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { number: 1, title: "Learn", description: "Build knowledge foundation", icon: "📚", color: "from-blue-500 to-blue-600" },
    { number: 2, title: "Earn", description: "Apply learning through referrals", icon: "💰", color: "from-yellow-500 to-yellow-600" },
    { number: 3, title: "Invest", description: "Reinvest in growth & tools", icon: "📈", color: "from-green-500 to-green-600" },
    { number: 4, title: "Grow", description: "Scale leadership & impact", icon: "🚀", color: "from-purple-500 to-purple-600" },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 px-8 py-16 text-white shadow-2xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-200">Welcome to Gyaan AUR Dhan</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-6xl">
            Unlocking Potential Through the Power of{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Knowledge
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-blue-100 sm:text-xl">
            Empower yourself with the right <span className="font-semibold text-blue-50">Knowledge (Gyaan)</span> and{" "}
            <span className="font-semibold text-yellow-300">Wealth-Building Tools (Dhan)</span> for achieving personal mastery,
            financial freedom, and leadership excellence within a unified ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group rounded-full bg-yellow-500 px-8 py-4 text-base font-semibold text-blue-900 shadow-lg transition-all duration-300 hover:bg-yellow-400 hover:scale-105 hover:shadow-xl"
            aria-label="Join our community"
          >
            Start Your Journey
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/learn"
            className="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20"
            aria-label="Explore learning resources"
          >
            Explore Gyaan Hub
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`group relative overflow-hidden rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 ${
                hoveredStep === step.number ? "scale-105 bg-white/20 shadow-lg" : ""
              }`}
              onMouseEnter={() => setHoveredStep(step.number)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="mb-2 text-center text-3xl">{step.icon}</div>
              <div className="text-center text-xl font-bold text-yellow-400">{step.title}</div>
              <div className="text-center text-xs text-blue-100">{step.description}</div>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 animate-pulse rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-20 h-60 w-60 animate-pulse rounded-full bg-white/10 blur-3xl" style={{ animationDelay: "1s" }} />
      <div className="pointer-events-none absolute right-1/2 top-1/2 h-40 w-40 animate-pulse rounded-full bg-blue-400/20 blur-3xl" style={{ animationDelay: "2s" }} />
    </section>
  );
};

