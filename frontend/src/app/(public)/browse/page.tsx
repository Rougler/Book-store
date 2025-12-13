import { Suspense } from "react";

import { BrowseClient } from "@/components/books/browse-client";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

const fetchBooks = async (): Promise<Book[]> => {
  try {
    return await apiRequest<Book[]>("/api/books");
  } catch {
    return [];
  }
};

export const metadata = {
  title: "Browse",
  description: "Browse all available books.",
};

export default async function BrowsePage() {
  const books = await fetchBooks();

  return (
    <Suspense fallback={<div className="min-h-screen gridplace-items-center">Loading...</div>}>
      <BrowseClient initialBooks={books} />
    </Suspense>
  );
}

