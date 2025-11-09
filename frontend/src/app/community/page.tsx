import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";

export default function CommunityPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        title="Community Hub"
        description="Connect with like-minded individuals and grow together"
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">🤝</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Networking</h3>
          <p className="text-sm text-slate-600">
            Connect with entrepreneurs, learners, and leaders from diverse backgrounds and industries.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">💬</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Discussion Forums</h3>
          <p className="text-sm text-slate-600">
            Engage in meaningful conversations, share insights, and learn from community experiences.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">🎯</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Events & Workshops</h3>
          <p className="text-sm text-slate-600">
            Participate in regular events, workshops, and webinars to enhance your skills and knowledge.
          </p>
        </div>
      </div>
      <section className="rounded-3xl bg-slate-50 px-8 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Join Our Community</h2>
          <p className="mb-6 text-slate-600">
            Become part of a supportive community committed to mutual growth and success. Register now to get started.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}

