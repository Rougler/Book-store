"use client";

import { useRouter } from "next/navigation";

import { Book } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

type AddToCartButtonProps = {
  book: Book;
  quantity?: number;
  size?: "md" | "lg";
};

export const AddToCartButton = ({ book, quantity = 1, size = "md" }: AddToCartButtonProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const router = useRouter();

  // Check if book is already in cart
  const isInCart = items.some((item) => item.book.id === book.id);

  const handleAddToCart = () => {
    addItem(book, quantity);
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

  const baseStyles = "rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer";
  const sizeStyles = size === "lg" ? "px-6 py-3 text-sm font-semibold" : "px-4 py-2 text-sm font-semibold";

  if (isInCart) {
    return (
      <button
        type="button"
        onClick={handleGoToCart}
        onKeyDown={handleKeyDown}
        aria-label="Go to cart"
        className={`${baseStyles} ${sizeStyles} text-center`}
      >
        Go to Cart
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      onKeyDown={handleKeyDown}
      aria-label={`Add ${book.title} to cart`}
      className={`${baseStyles} ${sizeStyles} text-center`}
    >
      Add to cart
    </button>
  );
};
