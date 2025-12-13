"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/store/cart-store";

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore((state) => ({
    items: state.items,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
  }));

  const subtotal = items.reduce((total, entry) => total + entry.book.price * entry.quantity, 0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (bookId: number) => {
    setImageErrors((prev) => ({ ...prev, [bookId]: true }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center max-w-md">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🛒</span>
            </div>
            <div className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-lg">
              0
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-slate-600 mb-8">
            Browse our catalogue and add books to your cart to see them here.
          </p>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
            aria-label="Browse books"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Browse Books
          </Link>

          {/* Suggestions */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Looking for something?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["📚 Self Help", "💰 Finance", "🧠 Personal Growth", "🚀 Business"].map((category) => (
                <span key={category} className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-3xl">
                Shopping Cart
              </h1>
              <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map(({ book, quantity }, index) => {
              const lineTotal = book.price * quantity;
              const hasImageError = imageErrors[book.id];

              return (
                <div
                  key={book.id}
                  className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex flex-col sm:flex-row gap-4">
                    {/* Book Image */}
                    <Link
                      href={`/books/${book.id}`}
                      className="relative w-full sm:w-24 aspect-[3/4] sm:aspect-auto sm:h-32 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0 group/image"
                    >
                      {book.image_url && !hasImageError ? (
                        <Image
                          src={book.image_url}
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/image:scale-110"
                          sizes="(max-width: 640px) 100vw, 96px"
                          onError={() => handleImageError(book.id)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                    </Link>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/books/${book.id}`} className="block group/title">
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1 group-hover/title:text-indigo-600 transition-colors">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">{book.author}</p>
                      {book.category && (
                        <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-indigo-50 text-xs font-medium text-indigo-600">
                          {book.category}
                        </span>
                      )}

                      {/* Price - Mobile */}
                      <div className="mt-3 sm:hidden">
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(book.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                      {/* Price - Desktop */}
                      <div className="hidden sm:block text-right">
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(book.price)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, Math.max(1, quantity - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-lg font-bold text-slate-600 transition-all duration-300 hover:border-indigo-500 hover:text-indigo-600 hover:scale-110"
                          aria-label={`Decrease quantity of ${book.title}`}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-lg font-bold text-slate-900" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(book.id, quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-lg font-bold text-slate-600 transition-all duration-300 hover:border-indigo-500 hover:text-indigo-600 hover:scale-110"
                          aria-label={`Increase quantity of ${book.title}`}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Subtotal</p>
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(book.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
                    aria-label={`Remove ${book.title} from cart`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Continue Shopping Link */}
            <Link
              href="/browse"
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors pt-4"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] blur opacity-20" />

              <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>📋</span> Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium text-slate-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white/50 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      className="px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] overflow-hidden"
                  aria-label="Proceed to checkout"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Proceed to Checkout
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Secure
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Free Shipping
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
