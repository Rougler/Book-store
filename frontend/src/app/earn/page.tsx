"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest } from "@/lib/api-client";
import { CompensationSummary, OrderSummary } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

function EarnPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [compensation, setCompensation] = useState<CompensationSummary | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getRankProgress = (rank: string, totalSales: number) => {
    const ranks = {
      starter: { next: "achiever", threshold: 100 },
      achiever: { next: "leader", threshold: 1000 },
      leader: { next: "pro_leader", threshold: 10000 },
      pro_leader: { next: "champion", threshold: 100000 },
      champion: { next: "legend", threshold: 1000000 },
      legend: { next: null, threshold: null },
    };

    const current = ranks[rank as keyof typeof ranks] || ranks.starter;
    if (!current.next) return null;

    const progress = Math.min((totalSales / current.threshold!) * 100, 100);
    return {
      nextRank: current.next,
      threshold: current.threshold!,
      progress,
      remaining: Math.max(0, current.threshold! - totalSales),
    };
  };

  const totalSales = useMemo(() => {
    return (user?.total_sales_count || 0) + (user?.team_sales_count || 0);
  }, [user]);

  const rankProgress = useMemo(() => {
    if (!user) return null;
    return getRankProgress(user.rank, totalSales);
  }, [user, totalSales]);

  const referralLink = useMemo(() => {
    if (!user?.referral_code) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/register?ref=${user.referral_code}`;
  }, [user]);

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Referral link copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Referral link copied to clipboard!");
    }
  };

  const handleCopyReferralCode = async () => {
    if (!user?.referral_code) return;
    try {
      await navigator.clipboard.writeText(user.referral_code);
      alert("Referral code copied to clipboard!");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = user.referral_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Referral code copied to clipboard!");
    }
  };

  const handleMarkAsPaid = useCallback(async (orderId: number) => {
    try {
      setUpdatingOrderId(orderId);
      await apiRequest<OrderSummary>(`/api/orders/${orderId}/status?new_status=paid`, {
        method: "PATCH",
        requireAuth: true,
        role: "user",
      });
      // Reload orders
      const ordersData = await apiRequest<OrderSummary[]>("/api/orders", {
        requireAuth: true,
        role: "user",
      });
      setOrders(ordersData);
      // Also reload compensation to see updated earnings
      const compensationData = await apiRequest<CompensationSummary>("/api/compensation/summary", {
        requireAuth: true,
        role: "user",
      });
      setCompensation(compensationData);
      alert("Order marked as paid! Your earnings have been updated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      alert(message);
    } finally {
      setUpdatingOrderId(null);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Load compensation summary and orders in parallel
          const [compensationData, ordersData] = await Promise.all([
            apiRequest<CompensationSummary>("/api/compensation/summary", {
              requireAuth: true,
              role: "user",
            }),
            apiRequest<OrderSummary[]>("/api/orders", {
              requireAuth: true,
              role: "user",
            }).catch(() => []), // Don't fail if orders endpoint fails
          ]);
          
          setCompensation(compensationData);
          setOrders(ordersData);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to load earnings";
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-12">
        <SectionHeading
          title="Dhan Hub - Income Generation"
          description="Build sustainable wealth through our ethical compensation plan"
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">💵</div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Direct Referrals</h3>
            <p className="text-sm text-slate-600">
              Earn 20% commission directly from people you refer. Instant payment upon purchase.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">👥</div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Team Commissions</h3>
            <p className="text-sm text-slate-600">
              Build a team and earn tiered commissions (2%, 1%, 0.1%) based on total team sales.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🏆</div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Rank Bonuses</h3>
            <p className="text-sm text-slate-600">
              Achieve ranks and earn bonuses from ₹10K to ₹10Cr plus insurance benefits.
            </p>
          </div>
        </div>
        <section className="rounded-3xl bg-slate-50 px-8 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Start Earning Today</h2>
            <p className="mb-6 text-slate-600">
              Join our platform and start building your income stream through ethical and sustainable means.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Dhan Hub - Your Earnings"
        description="Track your income, sales, and rank progress"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {compensation && (
        <>
          {/* Referral Code Section */}
          {user?.referral_code && (
            <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-slate-900">Your Referral Code</h3>
                  <p className="text-sm text-slate-600">Share this code to earn 20% on each referral&apos;s purchase</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 rounded-lg border-2 border-blue-300 bg-white px-4 py-3">
                  <div className="text-xs font-medium text-slate-500 mb-1">Referral Code</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">{user.referral_code}</div>
                </div>
                <button
                  onClick={handleCopyReferralCode}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  aria-label="Copy referral code"
                >
                  Copy Code
                </button>
              </div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3">
                  <div className="text-xs font-medium text-slate-500 mb-1">Referral Link</div>
                  <div className="truncate text-sm text-slate-700 font-mono">{referralLink}</div>
                </div>
                <button
                  onClick={handleCopyReferralLink}
                  className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                  aria-label="Copy referral link"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-4 rounded-lg bg-blue-100 p-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Share your referral link with friends. When they register and make a purchase, you&apos;ll earn 20% commission instantly!
                </p>
              </div>
            </div>
          )}

          {/* Earnings Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Total Earnings</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(compensation.total_earnings)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Wallet Balance</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(compensation.wallet_balance)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Direct Referral Bonus</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(compensation.direct_referral_bonus)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Team Commission</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(compensation.team_commission)}</div>
            </div>
          </div>

          {/* Sales & Rank Progress */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Direct Sales</span>
                  <span className="font-semibold text-slate-900">{formatNumber(user.total_sales_count || 0)} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Team Sales</span>
                  <span className="font-semibold text-slate-900">{formatNumber(user.team_sales_count || 0)} units</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm font-medium text-slate-900">Total Sales</span>
                  <span className="font-bold text-slate-900">{formatNumber(totalSales)} units</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Current Rank</h3>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 capitalize">{user.rank.replace("_", " ")}</span>
                  {user.insurance_amount && user.insurance_amount > 0 && (
                    <span className="text-xs font-medium text-green-600">
                      🛡️ {formatCurrency(user.insurance_amount)} Insurance
                    </span>
                  )}
                </div>
                {rankProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Progress to {rankProgress.nextRank.replace("_", " ")}</span>
                      <span>{rankProgress.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{ width: `${rankProgress.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatNumber(rankProgress.remaining)} units remaining
                    </div>
                  </div>
                )}
                {!rankProgress && (
                  <div className="text-sm text-slate-600">🏆 Maximum rank achieved!</div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Earnings */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Rank Bonuses</div>
              <div className="text-xl font-bold text-purple-600">{formatCurrency(compensation.rank_bonuses)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Pending Weekly Commissions</div>
              <div className="text-xl font-bold text-amber-600">
                {compensation.pending_weekly_commissions
                  ? formatCurrency(compensation.pending_weekly_commissions)
                  : "₹0"}
              </div>
              <div className="mt-1 text-xs text-slate-500">Processed every Monday</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-slate-600">Pending Payouts</div>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(compensation.pending_payouts)}</div>
            </div>
          </div>

          {/* Earning Types Info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">How You Earn</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 text-sm font-medium text-slate-900">💵 Direct Referrals</div>
                <p className="text-xs text-slate-600">20% instant commission on each direct sale</p>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-slate-900">👥 Team Commissions</div>
                <p className="text-xs text-slate-600">
                  Tiered rates: 2% (1-1K), 1% (1K-10K), 0.1% (10K+) units. Weekly payout.
                </p>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-slate-900">🏆 Rank Bonuses</div>
                <p className="text-xs text-slate-600">One-time bonuses from ₹10K to ₹10Cr + insurance</p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Your Package Orders</h3>
            <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Only <strong>Package Orders</strong> (Combo Pack: 3 Books + 1 T-Shirt = ₹5,000) count as sales units. 
                Individual book purchases do not count toward sales or earnings.
              </p>
            </div>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-slate-900">Order #{order.id}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{order.package_name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Sales Units: {order.sales_units || 1} | Amount: {formatCurrency(order.amount)}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {order.status}
                        </span>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleMarkAsPaid(order.id)}
                            disabled={updatingOrderId === order.id}
                            className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {updatingOrderId === order.id ? "Processing..." : "Mark as Paid"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600 mb-2">No package orders yet</p>
                <p className="text-xs text-slate-500 mb-4">
                  Purchase a combo pack to start earning! Each combo pack purchase counts as sales units.
                </p>
                <Link
                  href="/packages"
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  View Packages →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default EarnPage;
