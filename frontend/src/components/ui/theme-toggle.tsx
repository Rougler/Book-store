"use client";

import { useTheme } from "@/context/theme-context";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
    const { theme, toggleTheme, mounted } = useTheme();

    // Prevent hydration mismatch by showing consistent UI until mounted
    if (!mounted) {
        return (
            <button
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ${className}`}
                aria-label="Toggle theme"
                disabled
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${theme === "dark"
                ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${className}`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {/* Sun icon for light mode */}
            <svg
                className={`absolute h-5 w-5 transition-all duration-300 ${theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Moon icon for dark mode */}
            <svg
                className={`absolute h-5 w-5 transition-all duration-300 ${theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>
        </button>
    );
}
