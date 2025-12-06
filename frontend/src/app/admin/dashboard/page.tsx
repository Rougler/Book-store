"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { useAdminAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/api-client";
import { Book, OrderSummary } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAdminAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin");
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        const [booksData, ordersData] = await Promise.all([
          apiRequest<Book[]>("/api/admin/books", { requireAuth: true, role: "admin" }),
          apiRequest<OrderSummary[]>("/api/admin/orders", { requireAuth: true, role: "admin" }),
        ]);
        setBooks(booksData);
        setOrders(ordersData);
      } catch (err) {
        // Handle network errors gracefully
        const errorMessage = err instanceof Error ? err.message : "Failed to load data";
        if (errorMessage.includes("Authentication required") || errorMessage.includes("Authentication expired")) {
          // Logout will be handled automatically by the API client
          // Just redirect to login page
          router.push("/admin");
          return;
        }
        if (errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
          setError("Unable to connect to the server. Please ensure the backend is running.");
        } else {
          setError(errorMessage);
        }
        // Set empty arrays on error to prevent crashes
        setBooks([]);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  // Show loading state while checking authentication or loading data
  if (!isAuthenticated || isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SectionHeading title="Admin Dashboard" description={!isAuthenticated ? "Redirecting..." : "Loading..."} />
      </div>
    );
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SectionHeading title="Admin Dashboard" description="Manage your bookstore" />
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              const loadData = async () => {
                try {
                  const [booksData, ordersData] = await Promise.all([
                    apiRequest<Book[]>("/api/admin/books", { requireAuth: true, role: "admin" }),
                    apiRequest<OrderSummary[]>("/api/admin/orders", { requireAuth: true, role: "admin" }),
                  ]);
                  setBooks(booksData);
                  setOrders(ordersData);
                  setError(null);
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : "Failed to load data";
                  if (errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
                    setError("Unable to connect to the server. Please ensure the backend is running.");
                  } else {
                    setError(errorMessage);
                  }
                  setBooks([]);
                  setOrders([]);
                } finally {
                  setIsLoading(false);
                }
              };
              loadData();
            }}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionHeading title="Admin Dashboard" description="Manage your bookstore" />
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/content")}
            className="rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            aria-label="Manage content"
          >
            Manage Content
          </button>
          <button
            onClick={() => router.push("/admin/books")}
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            aria-label="Manage books"
          >
            Manage Books
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-sm text-slate-600">Total Books</div>
          <div className="text-3xl font-bold text-slate-900">{books.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-sm text-slate-600">Total Orders</div>
          <div className="text-3xl font-bold text-slate-900">{orders.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-sm text-slate-600">Pending Orders</div>
          <div className="text-3xl font-bold text-slate-900">{pendingOrders}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Books</h2>
          {books.length > 0 ? (
            <div className="space-y-3">
              {books.slice(0, 5).map((book) => (
                <div key={book.id} className="flex items-center gap-4 border-b border-slate-200 pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{book.title}</p>
                    <p className="text-sm text-slate-600">{book.author}</p>
                    <p className="text-sm font-bold text-blue-600">₹{book.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No books yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border-b border-slate-200 pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Order #{order.id}</p>
                      <p className="text-sm text-slate-600">{order.user_email}</p>
                      <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{order.total_amount.toFixed(2)}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          order.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

