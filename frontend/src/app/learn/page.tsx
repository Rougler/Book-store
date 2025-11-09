import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";

export default function LearnPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        title="Gyaan Hub - Learning Center"
        description="Expand your knowledge with our comprehensive learning resources"
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">📖</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Books & Resources</h3>
          <p className="text-sm text-slate-600">
            Access a vast library of books covering business, personal development, technology, and more.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">🎓</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Online Courses</h3>
          <p className="text-sm text-slate-600">
            Learn from industry experts through structured courses designed for practical application.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">👨‍🏫</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Mentorship Programs</h3>
          <p className="text-sm text-slate-600">
            Get personalized guidance from experienced mentors to accelerate your learning journey.
          </p>
        </div>
      </div>
      <section className="rounded-3xl bg-slate-50 px-8 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Start Your Learning Journey</h2>
          <p className="mb-6 text-slate-600">
            Browse our collection of books and resources to begin expanding your knowledge today.
          </p>
          <Link
            href="/browse"
            className="inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Browse Books
          </Link>
        </div>
      </section>
    </div>
  );
}

