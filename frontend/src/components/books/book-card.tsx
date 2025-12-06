"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Book } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

type BookCardProps = {
  book: Book;
};

export const BookCard = ({ book }: BookCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Check if book is already in cart
  const isInCart = items.some((item) => item.book.id === book.id);

  const handleAddToCart = () => {
    addItem(book, 1);
  };

  const handleGoToCart = () => {
    // Cart is accessible to everyone, no login required
    router.push("/cart");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isInCart) {
        handleGoToCart();
      } else {
        handleAddToCart();
      }
    }
  };

  return (
    <article
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 p-3 sm:p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

      <div className="relative z-10 space-y-2 sm:space-y-3">
        {/* Book image with enhanced styling - clickable */}
        <Link
          href={`/books/${book.id}`}
          aria-label={`View ${book.title} details`}
          className="block relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner cursor-pointer"
        >
          {book.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.image_url}
              alt={book.title}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Featured badge */}
          {book.is_featured && (
            <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
              Featured
            </div>
          )}
        </Link>

        {/* Book details */}
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight line-clamp-2">
            <Link
              href={`/books/${book.id}`}
              aria-label={`View ${book.title} details`}
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              {book.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm font-medium text-slate-600 line-clamp-1">{book.author}</p>

          <div className="flex items-center justify-between pt-1">
            <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₹{book.price.toFixed(2)}
            </p>

            {/* Rating placeholder */}
            <div className="flex items-center gap-0.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < 4 ? 'text-yellow-400' : 'text-slate-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-slate-500">4.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-3 sm:mt-4">
        <button
          type="button"
          onClick={isInCart ? handleGoToCart : handleAddToCart}
          onKeyDown={handleKeyDown}
          aria-label={isInCart ? "Go to cart" : `Add ${book.title} to cart`}
          className={`w-full rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${
            isInCart
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-emerald-500/20 hover:scale-[1.02]"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-indigo-500/20 hover:scale-[1.02]"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            {isInCart ? (
              <>
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Go to Cart</span>
                <span className="sm:hidden">Cart</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </article>
  );
};
