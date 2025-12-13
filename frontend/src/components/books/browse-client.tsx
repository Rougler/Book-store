"use client";

import { useMemo, useState } from "react";

import { BooksGrid } from "@/components/books/books-grid";
import { Book } from "@/lib/types";

// Categories configuration
const CATEGORIES = [
    { name: "All", icon: "📚" },
    { name: "Fiction", icon: "📖" },
    { name: "Fantasy", icon: "🐉" },
    { name: "Science Fiction", icon: "👽" },
    { name: "Mystery", icon: "🕵️" },
    { name: "Romance", icon: "💘" },
    { name: "Biography", icon: "✍️" },
    { name: "History", icon: "🏛️" },
    { name: "Business", icon: "💼" },
    { name: "Self-Help", icon: "🧠" },
    { name: "Education", icon: "🎓" },
];

type SortOption = "Featured" | "Price: Low to High" | "Price: High to Low" | "Newest First" | "Best Selling";

type BrowseClientProps = {
    initialBooks: Book[];
};

export function BrowseClient({ initialBooks }: BrowseClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState<SortOption>("Featured");

    // Filter and Sort Logic
    const filteredBooks = useMemo(() => {
        let result = [...initialBooks];

        // 1. Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (book) =>
                    book.title.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query) ||
                    (book.category && book.category.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Category
        if (selectedCategory !== "All") {
            result = result.filter((book) => book.category === selectedCategory);
        }

        // 3. Sort
        switch (sortBy) {
            case "Price: Low to High":
                result.sort((a, b) => a.price - b.price);
                break;
            case "Price: High to Low":
                result.sort((a, b) => b.price - a.price);
                break;
            case "Newest First":
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case "Featured":
                // Sort by is_featured (true first), then by newest
                result.sort((a, b) => {
                    if (a.is_featured === b.is_featured) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }
                    return a.is_featured ? -1 : 1;
                });
                break;
            case "Best Selling":
                // Since we don't have sales count in Book type yet, fallback to featured/newest
                // Or if added later, sort by sales_count
                result.sort((a, b) => {
                    if (a.is_featured === b.is_featured) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }
                    return a.is_featured ? -1 : 1;
                });
                break;
            default:
                break;
        }

        return result;
    }, [initialBooks, searchQuery, selectedCategory, sortBy]);

    return (
        <div className="w-full overflow-x-hidden min-h-screen">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-4">
                                <span className="text-lg">📖</span>
                                Curated Collection
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
                                Browse Books
                            </h1>
                            <p className="mt-3 text-slate-600 max-w-2xl">
                                Discover our entire catalogue of premium books. Build your knowledge library and transform your life.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="sm:w-72">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search books..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-300 ${selectedCategory === category.name
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                                    }`}
                            >
                                <span className="text-base">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        >
                            <option value="Featured">Featured</option>
                            <option value="Price: Low to High">Price: Low to High</option>
                            <option value="Price: High to Low">Price: High to Low</option>
                            <option value="Newest First">Newest First</option>
                            {/* <option value="Best Selling">Best Selling</option> */}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                            Showing <span className="font-bold text-slate-900">{filteredBooks.length}</span> results
                        </span>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="mb-12">
                    <BooksGrid books={filteredBooks} emptyMessage="No books found matching your criteria." />
                </div>

                {/* Newsletter Section */}
                <div className="mt-16 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] blur opacity-20" />
                    <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <span className="text-4xl mb-4 block">📬</span>
                            <h3 className="text-2xl font-bold text-white mb-3 sm:text-3xl">
                                Stay Updated
                            </h3>
                            <p className="text-slate-300 mb-6 max-w-md mx-auto">
                                Subscribe to our newsletter and be the first to know about new book releases and exclusive offers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                                />
                                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
