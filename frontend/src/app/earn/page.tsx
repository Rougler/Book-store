"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
      const ordersData = await apiRequest<OrderSummary[]>("/api/orders", {
        requireAuth: true,
        role: "user",
      });
      setOrders(ordersData);
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

          const [compensationData, ordersData] = await Promise.all([
            apiRequest<CompensationSummary>("/api/compensation/summary", {
              requireAuth: true,
              role: "user",
            }),
            apiRequest<OrderSummary[]>("/api/orders", {
              requireAuth: true,
              role: "user",
            }).catch(() => []),
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20 mb-4">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <div className="absolute inset-3 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-slate-600">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  // Guest view - not logged in
  if (!user) {
    return (
      <div className="w-full overflow-x-hidden">
        {/* Hero Section for Guests */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 px-6 py-2 text-sm font-medium text-emerald-700 mb-6">
                <span className="text-xl">💰</span>
                Dhan Hub - Income Generation
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent sm:text-5xl lg:text-6xl mb-6">
                Build Your Wealth
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
                Create sustainable income through our ethical compensation plan.
                Earn while you learn and help others succeed.
              </p>
            </div>

            {/* Earning Methods */}
            <div className="grid gap-6 md:grid-cols-3 mb-16">
              {[
                {
                  icon: "💵",
                  title: "Direct Referrals",
                  description: "Earn 20% commission directly from people you refer. Instant payment upon purchase.",
                  color: "from-emerald-500 to-teal-600",
                  highlight: "20% Instant",
                },
                {
                  icon: "👥",
                  title: "Team Commissions",
                  description: "Build a team and earn tiered commissions (2%, 1%, 0.1%) based on total team sales.",
                  color: "from-blue-500 to-indigo-600",
                  highlight: "Weekly Payouts",
                },
                {
                  icon: "🏆",
                  title: "Rank Bonuses",
                  description: "Achieve ranks and earn bonuses from ₹10K to ₹10Cr plus insurance benefits.",
                  color: "from-amber-500 to-orange-600",
                  highlight: "Up to ₹10Cr",
                },
              ].map((method) => (
                <div key={method.title} className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${method.color} text-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {method.icon}
                  </div>

                  <div className="absolute top-6 right-6">
                    <span className={`rounded-full bg-gradient-to-r ${method.color} px-3 py-1 text-xs font-bold text-white`}>
                      {method.highlight}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-slate-900">{method.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{method.description}</p>

                  <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${method.color} transition-all duration-500 group-hover:w-full`} />
                </div>
              ))}
            </div>

            {/* Rank Ladder */}
            <div className="relative mb-16">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-[2.5rem] blur opacity-20" />
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Rank Progression & Rewards</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { rank: "Starter", sales: "0", bonus: "₹0", icon: "🌱" },
                    { rank: "Achiever", sales: "100", bonus: "₹10K", icon: "⭐" },
                    { rank: "Leader", sales: "1K", bonus: "₹1L", icon: "🚀" },
                    { rank: "Pro Leader", sales: "10K", bonus: "₹10L", icon: "💎" },
                    { rank: "Champion", sales: "100K", bonus: "₹1Cr", icon: "🏆" },
                    { rank: "Legend", sales: "1M", bonus: "₹10Cr", icon: "👑" },
                  ].map((item, index) => (
                    <div key={item.rank} className="text-center p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{item.rank}</h4>
                      <p className="text-xs text-slate-500 mb-2">{item.sales} units</p>
                      <p className="text-sm font-bold text-emerald-600">{item.bonus}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-[2.5rem] blur opacity-20" />
              <div className="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 rounded-3xl p-12 text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">💰</span>
                  <h2 className="text-3xl font-bold text-white mb-4 sm:text-4xl">Start Earning Today</h2>
                  <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                    Join our platform and start building your income stream through ethical and sustainable means.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02]"
                  >
                    Get Started
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Logged in user view
  return (
    <div className="w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-4">
            <span className="text-lg">💰</span>
            Dhan Hub - Your Earnings
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent sm:text-4xl">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-slate-600 mt-2">Track your income, sales, and rank progress</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {compensation && (
          <>
            {/* Referral Code Section */}
            {user?.referral_code && (
              <div className="relative mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20" />
                <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">Your Referral Code</h3>
                      <p className="text-sm text-slate-600">Share this code to earn 20% on each referral&apos;s purchase</p>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border-2 border-blue-300 bg-white px-4 py-3">
                        <div className="text-xs font-medium text-slate-500 mb-1">Referral Code</div>
                        <div className="text-xl font-bold text-slate-900 font-mono">{user.referral_code}</div>
                      </div>
                      <button
                        onClick={handleCopyReferralCode}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-105"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 overflow-hidden">
                        <div className="text-xs font-medium text-slate-500 mb-1">Referral Link</div>
                        <div className="truncate text-sm text-slate-700 font-mono">{referralLink}</div>
                      </div>
                      <button
                        onClick={handleCopyReferralLink}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-105"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-blue-100/50 p-4 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-sm text-blue-800">
                      <strong>Pro Tip:</strong> Share your referral link on social media and with friends. When they register and make a purchase, you&apos;ll earn 20% commission instantly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: "Total Earnings", value: formatCurrency(compensation.total_earnings), icon: "💵", color: "from-emerald-500 to-teal-600" },
                { label: "Wallet Balance", value: formatCurrency(compensation.wallet_balance), icon: "💳", color: "from-blue-500 to-indigo-600" },
                { label: "Direct Referral Bonus", value: formatCurrency(compensation.direct_referral_bonus), icon: "🎯", color: "from-green-500 to-emerald-600" },
                { label: "Team Commission", value: formatCurrency(compensation.team_commission), icon: "👥", color: "from-purple-500 to-pink-600" },
              ].map((item) => (
                <div key={item.label} className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl`} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg text-white`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales & Rank Grid */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Sales Performance */}
              <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">📊</span> Sales Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Direct Sales</span>
                    <span className="font-bold text-slate-900">{formatNumber(user.total_sales_count || 0)} units</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Team Sales</span>
                    <span className="font-bold text-slate-900">{formatNumber(user.team_sales_count || 0)} units</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <span className="font-medium text-slate-900">Total Sales</span>
                    <span className="font-bold text-emerald-600 text-xl">{formatNumber(totalSales)} units</span>
                  </div>
                </div>
              </div>

              {/* Rank Progress */}
              <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">🏆</span> Current Rank
                </h3>
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-slate-900 capitalize">{user.rank.replace("_", " ")}</span>
                    {user.insurance_amount && user.insurance_amount > 0 && (
                      <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                        🛡️ {formatCurrency(user.insurance_amount)}
                      </span>
                    )}
                  </div>
                </div>

                {rankProgress && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress to {rankProgress.nextRank.replace("_", " ")}</span>
                      <span className="font-semibold text-indigo-600">{rankProgress.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${rankProgress.progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatNumber(rankProgress.remaining)} units remaining to reach next rank
                    </p>
                  </div>
                )}
                {!rankProgress && (
                  <div className="text-center p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100">
                    <span className="text-2xl">👑</span>
                    <p className="font-semibold text-amber-800 mt-2">Maximum rank achieved!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {[
                { label: "Rank Bonuses", value: formatCurrency(compensation.rank_bonuses), icon: "🏅", color: "text-purple-600" },
                { label: "Pending Weekly", value: compensation.pending_weekly_commissions ? formatCurrency(compensation.pending_weekly_commissions) : "₹0", icon: "⏳", color: "text-amber-600", sub: "Processed every Monday" },
                { label: "Pending Payouts", value: formatCurrency(compensation.pending_payouts), icon: "📤", color: "text-slate-700" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 shadow-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </div>
                  <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                  {item.sub && <p className="text-xs text-slate-500 mt-1">{item.sub}</p>}
                </div>
              ))}
            </div>

            {/* How You Earn */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 sm:p-8 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">💡 How You Earn</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl bg-white/80 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900 mb-2">💵 Direct Referrals</div>
                  <p className="text-sm text-slate-600">20% instant commission on each direct sale</p>
                </div>
                <div className="p-4 rounded-xl bg-white/80 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900 mb-2">👥 Team Commissions</div>
                  <p className="text-sm text-slate-600">Tiered rates: 2% (1-1K), 1% (1K-10K), 0.1% (10K+). Weekly payout.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/80 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900 mb-2">🏆 Rank Bonuses</div>
                  <p className="text-sm text-slate-600">One-time bonuses from ₹10K to ₹10Cr + insurance</p>
                </div>
              </div>
            </div>

            {/* Orders Section */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-white/20 p-6 sm:p-8 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📦</span> Your Package Orders
              </h3>
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Only <strong>Package Orders</strong> (Combo Pack: 3 Books + 1 T-Shirt = ₹5,000) count as sales units.
                </p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">Order #{order.id}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{order.package_name}</p>
                          <p className="text-xs text-slate-500">
                            Sales Units: {order.sales_units || 1} | Amount: {formatCurrency(order.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-slate-100 text-slate-800"
                            }`}>
                            {order.status}
                          </span>
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleMarkAsPaid(order.id)}
                              disabled={updatingOrderId === order.id}
                              className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-xs font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
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
                <div className="text-center py-12 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-4xl mb-4 block">📦</span>
                  <p className="text-slate-600 mb-2">No package orders yet</p>
                  <p className="text-sm text-slate-500 mb-6">Purchase a combo pack to start earning!</p>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    View Packages →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EarnPage;
