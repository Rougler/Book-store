"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth, useAdminAuth } from "@/context/auth-context";
import { useCartStore } from "@/store/cart-store";
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Gyaan AUR Dhan home"
          >
            <Image
              src="/logo.png"
              alt="Gyaan AUR Dhan Logo"
              width={80}
              height={80}
              className="h-16 w-auto"
              priority
            />
            <span className="text-2xl font-bold">
              <span className="text-blue-900">Gyan</span>{" "}
              <span className="text-amber-500">AUR</span>{" "}
              <span className="text-blue-900">Dhan</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "transition-colors hover:text-slate-900",
                  pathname === link.href ? "text-slate-900" : "text-slate-600",
                )}
                aria-label={link.label}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </Link>
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Link
                  href="/admin/dashboard"
                  className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:border-blue-500 hover:bg-blue-100"
                  aria-label="Admin Dashboard"
                >
                  Admin
                </Link>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="hidden sm:inline" aria-label="Signed in user name">
                  {user.full_name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-slate-300 px-4 py-1 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
                  aria-label="Login"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-slate-900 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-slate-700"
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
            className="flex items-center gap-2"
            aria-label="Gyaan AUR Dhan home"
            onClick={closeMobileMenu}
          >
            <Image
              src="/logo.png"
              alt="Gyaan AUR Dhan Logo"
              width={60}
              height={60}
              className="h-12 w-auto"
              priority
            />
            <span className="text-lg font-bold">
              <span className="text-blue-900">Gyan</span>{" "}
              <span className="text-amber-500">AUR</span>{" "}
              <span className="text-blue-900">Dhan</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
          <div className="md:hidden mt-4 space-y-4 border-t border-slate-200 pt-4">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900",
                    pathname === link.href ? "bg-slate-100 text-slate-900" : "text-slate-600",
                  )}
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                  <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {totalQuantity > 9 ? "9+" : totalQuantity}
                  </span>
                )}
              </Link>
              {isAdminAuthenticated ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-700 transition-colors hover:border-blue-500 hover:bg-blue-100"
                    aria-label="Admin Dashboard"
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-100"
                    aria-label="Sign out"
                  >
                    Logout
                  </button>
                </>
              ) : user ? (
                <>
                  <div className="px-3 py-2 text-sm text-slate-700" aria-label="Signed in user name">
                    {user.full_name}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-100"
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
                    className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-100"
                    aria-label="Login"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-700"
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

