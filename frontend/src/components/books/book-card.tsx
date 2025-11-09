"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { Book } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

type BookCardProps = {
  book: Book;
};

export const BookCard = ({ book }: BookCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { user } = useAuth();
  const router = useRouter();

  // Check if book is already in cart
  const isInCart = items.some((item) => item.book.id === book.id);

  const handleAddToCart = () => {
    addItem(book, 1);
  };

  const handleGoToCart = () => {
    if (!user) {
      // User not logged in, redirect to login with return path
      router.push("/login?redirectTo=/cart");
    } else {
      // User is logged in, go to cart
      router.push("/cart");
    }
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
    <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="space-y-3">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
          {book.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.image_url}
              alt={book.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            <Link href={`/books/${book.id}`} aria-label={`View ${book.title} details`} className="hover:underline cursor-pointer">
              {book.title}
            </Link>
          </h3>
          <p className="text-sm text-slate-500">{book.author}</p>
          <p className="text-sm text-slate-700">₹{book.price.toFixed(2)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={isInCart ? handleGoToCart : handleAddToCart}
        onKeyDown={handleKeyDown}
        aria-label={isInCart ? "Go to cart" : `Add ${book.title} to cart`}
        className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
      >
        {isInCart ? "Go to Cart" : "Add to cart"}
      </button>
    </article>
  );
};
