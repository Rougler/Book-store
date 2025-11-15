"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/api-client";
import { Package } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export default function PackagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiRequest<Package[]>("/api/packages", {
          requireAuth: false,
        });
        setPackages(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load packages";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, []);

  const handlePurchase = async (packageId: number) => {
    if (!user) {
      alert("Please login to purchase a package");
      router.push("/login");
      return;
    }

    try {
      setPurchasingPackageId(packageId);
      
      // Create package order
      const order = await apiRequest<{ id: number }>("/api/orders", {
        method: "POST",
        requireAuth: true,
        role: "user",
        body: {
          package_id: packageId,
          payment_method: "test", // For testing - replace with actual payment gateway
          payment_reference: `test_${Date.now()}`,
        },
      });

      alert(`Order placed successfully! Order ID: ${order.id}\n\nThis purchase will count as sales units and trigger your earnings!`);
      router.push("/earn");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      alert(message);
    } finally {
      setPurchasingPackageId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Combo Packages"
        description="Purchase combo packs to start earning! Each package counts as sales units and triggers the compensation system."
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!user && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Note:</strong> You need to be logged in to purchase packages.{" "}
          <a href="/login" className="font-semibold underline">
            Login here
          </a>
        </div>
      )}

      <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>💰 How It Works:</strong> Each combo pack purchase counts as <strong>sales units</strong> and triggers:
        </p>
        <ul className="mt-2 ml-4 list-disc text-sm text-blue-700">
          <li>Direct referral bonus (20% to your referrer)</li>
          <li>Team commissions for your upline network</li>
          <li>Rank bonuses when you reach milestones</li>
          <li>Progress toward your next rank</li>
        </ul>
      </div>

      {packages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const salesUnits = Math.max(1, Math.floor(pkg.price / 5000));
            const isPurchasing = purchasingPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-4">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{pkg.name}</h3>
                  <div className="mb-3 text-3xl font-bold text-blue-600">
                    {formatCurrency(pkg.price)}
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-slate-600">{pkg.description}</p>
                  )}
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mb-4 space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 text-green-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mb-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-700">
                    Sales Units: <span className="font-bold text-blue-600">{salesUnits}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    (1 unit = ₹5,000 | This purchase = {salesUnits} units)
                  </p>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isPurchasing || !pkg.is_active}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isPurchasing ? "Processing..." : pkg.is_active ? "Purchase Package" : "Not Available"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No packages available at the moment.</p>
        </div>
      )}
    </div>
  );
}

