import { Suspense } from "react";

import { BooksGrid } from "@/components/books/books-grid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SectionHeading } from "@/components/ui/section-heading";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

const fetchBooks = async (): Promise<Book[]> => {
  try {
    return await apiRequest<Book[]>("/api/books");
  } catch {
    // Silently handle errors - return empty array
    // Error is logged on server side
    return [];
  }
};

const BrowseContent = async () => {
  const books = await fetchBooks();
  return <BooksGrid books={books} emptyMessage="No books found." />;
};

export const metadata = {
  title: "Browse",
  description: "Browse all available books.",
};

export default function BrowsePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-4 sm:space-y-6">
          <SectionHeading
            title="Browse Books"
            description="Discover our entire catalogue. Use the book detail page to learn more about each title."
          />
          <Suspense fallback={<LoadingSpinner />}>
            <BrowseContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

