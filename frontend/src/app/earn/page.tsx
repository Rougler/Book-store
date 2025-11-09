import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";

export default function EarnPage() {
  return (
    <div className="space-y-12">
      <SectionHeading
        title="Dhan Hub - Income Generation"
        description="Build sustainable wealth through our ethical compensation plan"
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">💵</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Direct Referrals</h3>
          <p className="text-sm text-slate-600">
            Earn commissions directly from people you refer to the platform. Simple and transparent.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">👥</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Team Commissions</h3>
          <p className="text-sm text-slate-600">
            Build a team and earn from their success with our single-leg compensation structure.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-4xl">📈</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Growth Potential</h3>
          <p className="text-sm text-slate-600">
            Unlimited earning potential as you help others learn and grow while building your own income.
          </p>
        </div>
      </div>
      <section className="rounded-3xl bg-slate-50 px-8 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Start Earning Today</h2>
          <p className="mb-6 text-slate-600">
            Join our platform and start building your income stream through ethical and sustainable means.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

