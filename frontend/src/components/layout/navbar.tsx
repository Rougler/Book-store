"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth, useAdminAuth } from "@/context/auth-context";
import { useCartStore } from "@/store/cart-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import clsx from "clsx";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Gyaan Hub" },
  { href: "/earn", label: "Dhan Hub" },
  { href: "/community", label: "Community" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalQuantity = useCartStore((state) => state.totalQuantity);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleAdminLogout = () => {
    adminLogout();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-4">
        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-4 transition-transform duration-300 hover:scale-105"
            aria-label="Gyaan AUR Dhan home"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Gyaan AUR Dhan Logo"
                width={60}
                height={60}
                className="h-14 w-auto rounded-xl shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
                priority
              />
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Gyan</span>{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">AUR</span>{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dhan</span>
            </span>
          </Link>

          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative px-4 py-2 text-sm font-semibold transition-all duration-300 hover:text-indigo-600",
                  pathname === link.href
                    ? "text-indigo-600"
                    : "text-slate-700 hover:text-indigo-600",
                  "before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:bg-gradient-to-r before:from-indigo-600 before:to-purple-600 before:transition-all before:duration-300 hover:before:w-full"
                )}
                aria-label={link.label}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            <Link
              href="/cart"
              className="group relative rounded-full p-3 text-slate-700 transition-all duration-300 hover:bg-white/50 hover:text-indigo-600 hover:scale-110 hover:shadow-lg"
              aria-label="Shopping cart"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg animate-pulse">
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </Link>

            {isAdminAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                  aria-label="Admin Dashboard"
                >
                  Admin
                </Link>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="rounded-full border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-6 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-sm font-medium text-slate-700 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full" aria-label="Signed in user name">
                  {user.full_name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-6 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-6 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                  aria-label="Login"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                  aria-label="Register"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="flex md:hidden items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
            aria-label="Gyaan AUR Dhan home"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Gyaan AUR Dhan Logo"
                width={50}
                height={50}
                className="h-12 w-auto rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-lg"
                priority
              />
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Gyan</span>{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">AUR</span>{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Dhan</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="rounded-xl p-3 text-slate-700 transition-all duration-300 hover:bg-white/50 hover:text-indigo-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 space-y-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600",
                    pathname === link.href
                      ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600"
                      : "text-slate-700 hover:text-indigo-600",
                  )}
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 border-t border-slate-200/50 pt-4">
              {/* Theme Toggle for Mobile */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Dark Mode</span>
                <ThemeToggle />
              </div>
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600"
                aria-label="Shopping cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Cart
                {totalQuantity > 0 && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {totalQuantity > 9 ? "9+" : totalQuantity}
                  </span>
                )}
              </Link>
              {isAdminAuthenticated ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                    aria-label="Admin Dashboard"
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="rounded-xl border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                    aria-label="Sign out"
                  >
                    Logout
                  </button>
                </>
              ) : user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-slate-700 bg-white/50 backdrop-blur-sm rounded-xl" aria-label="Signed in user name">
                    {user.full_name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                    aria-label="Sign out"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl border-2 border-slate-300 bg-white/50 backdrop-blur-sm px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                    aria-label="Login"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105"
                    aria-label="Register"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

