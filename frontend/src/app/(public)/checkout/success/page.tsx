"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white px-10 py-14 text-center shadow-sm">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        ✓
      </span>
      <h1 className="text-2xl font-semibold text-slate-900">Thank you for your purchase!</h1>
      <p className="max-w-md text-sm text-slate-600">
        We've received your order and sent a confirmation email. We'll notify you when it ships.
      </p>
      {orderId ? <p className="text-sm font-medium text-slate-700">Order ID: #{orderId}</p> : null}
      <Link
        href="/browse"
        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
        aria-label="Continue shopping"
      >
        Continue shopping
      </Link>
    </div>
  );
}

