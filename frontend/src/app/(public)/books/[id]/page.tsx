import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/books/add-to-cart-button";
import { BooksGrid } from "@/components/books/books-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

type BookDetailPageProps = {
  params: Promise<{ id: string }>;
};

const fetchBook = async (id: number) => {
  try {
    return await apiRequest<Book>(`/api/books/${id}`);
  } catch {
    return null;
  }
};

const fetchSimilarBooks = async (id: number): Promise<Book[]> => {
  try {
    return await apiRequest<Book[]>(`/api/books/${id}/similar`);
  } catch {
    return [];
  }
};

export async function generateMetadata({ params }: BookDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return { title: "Book not found" };
  }

  const book = await fetchBook(numericId);
  if (!book) {
    return { title: "Book not found" };
  }

  return {
    title: book.title,
    description: book.description ?? `Read more about ${book.title} by ${book.author}.`,
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    notFound();
  }

  const [book, similarBooks] = await Promise.all([
    fetchBook(numericId),
    fetchSimilarBooks(numericId),
  ]);

  if (!book) {
    notFound();
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-indigo-600 transition-colors">
            Browse
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{book.title}</span>
        </nav>

        {/* Main Content */}
        <div className="mb-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          {/* Book Image */}
          <div className="space-y-4">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              {book.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-[500px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <div className="text-sm">No cover image</div>
                  </div>
                </div>
              )}
              {book.is_featured && (
                <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600">by {book.author}</p>
            </div>

            {/* Price and Rating */}
            <div className="flex items-center gap-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ₹{book.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? "text-yellow-400" : "text-slate-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-slate-600">4.2 (120 reviews)</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <AddToCartButton book={book} size="lg" />
            </div>

            {/* Book Information */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Book Information</h2>
              <dl className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                  <dt className="min-w-[140px] font-medium text-slate-700">Category</dt>
                  <dd className="text-slate-600">
                    {book.category ? (
                      <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                        {book.category}
                      </span>
                    ) : (
                      "General"
                    )}
                  </dd>
                </div>
                {book.description && (
                  <div className="flex flex-col gap-2">
                    <dt className="font-medium text-slate-700">Description</dt>
                    <dd className="text-slate-600 leading-relaxed">{book.description}</dd>
                  </div>
                )}
                {book.content_url && (
                  <div className="flex flex-col gap-2">
                    <dt className="font-medium text-slate-700">Content</dt>
                    <dd>
                      <a
                        href={book.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0-6l-3 3m3-3l3 3m2-8H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
                        </svg>
                        View PDF/E-book
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Similar Books Section */}
        {similarBooks.length > 0 && (
          <div className="space-y-6">
            <SectionHeading
              title="Similar Books"
              description="You might also like these books from the same category or author"
            />
            <BooksGrid books={similarBooks} emptyMessage="No similar books found." />
          </div>
        )}

        {/* Back to Browse Link */}
        <div className="mt-12 text-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 hover:shadow-md"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
}

