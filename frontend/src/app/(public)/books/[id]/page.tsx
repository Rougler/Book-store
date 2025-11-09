import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/books/add-to-cart-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { apiRequest } from "@/lib/api-client";
import { Book } from "@/lib/types";

type BookDetailPageProps = {
  params: { id: string };
};

const fetchBook = async (id: number) => {
  try {
    return await apiRequest<Book>(`/api/books/${id}`);
  } catch {
    return null;
  }
};

export async function generateMetadata({ params }: BookDetailPageProps) {
  const { id } = params;
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
  const { id } = params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    notFound();
  }

  const book = await fetchBook(numericId);
  if (!book) {
    notFound();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <div className="space-y-6">
        <SectionHeading title={book.title} description={`by ${book.author}`} />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="min-w-[120px] font-medium text-slate-700">Category</dt>
              <dd>{book.category ?? "General"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-[120px] font-medium text-slate-700">Price</dt>
              <dd>₹{book.price.toFixed(2)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="min-w-[120px] font-medium text-slate-700">Description</dt>
              <dd>{book.description ?? "No description available."}</dd>
            </div>
          </dl>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {book.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.image_url} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-slate-500">
              No cover image
            </div>
          )}
        </div>
        <AddToCartButton book={book} size="lg" />
      </aside>
    </div>
  );
}

