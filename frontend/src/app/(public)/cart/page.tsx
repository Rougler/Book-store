"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCartStore } from "@/store/cart-store";

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore((state) => ({
    items: state.items,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
  }));

  const subtotal = items.reduce((total, entry) => total + entry.book.price * entry.quantity, 0);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse our catalogue and add books to your cart to see them here."
        action={
          <Link
            href="/browse"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            aria-label="Browse books"
          >
            Browse books
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading title="Your Cart" description="Review items before proceeding to checkout." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
        <ul className="space-y-4">
          {items.map(({ book, quantity }) => {
            const lineTotal = book.price * quantity;
            return (
              <li key={book.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    {book.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.image_url} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">{book.title}</h3>
                    <p className="text-sm text-slate-500">{book.author}</p>
                    <p className="text-sm font-medium text-slate-700">{formatCurrency(book.price)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(book.id, Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
                      aria-label={`Decrease quantity of ${book.title}`}
                    >
                      –
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-slate-900" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(book.id, quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
                      aria-label={`Increase quantity of ${book.title}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{formatCurrency(lineTotal)}</div>
                  <button
                    type="button"
                    onClick={() => removeItem(book.id)}
                    className="text-xs font-medium text-rose-600 transition hover:text-rose-500 cursor-pointer"
                    aria-label={`Remove ${book.title} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Order summary</h3>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
            aria-label="Proceed to checkout"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

