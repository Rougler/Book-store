"use client";

import { Book } from "@/lib/types";

import { BookCard } from "./book-card";

type BooksGridProps = {
  books: Book[];
  emptyMessage?: string;
};

export const BooksGrid = ({ books, emptyMessage = "No books available." }: BooksGridProps) => {
  if (books.length === 0) {
    return <p className="text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard book={book} key={book.id} />
      ))}
    </div>
  );
};

