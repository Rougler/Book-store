import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AppProviders } from "@/components/layout/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gyaan AUR Dhan",
    template: "%s | Gyaan AUR Dhan",
  },
  description: "Unlocking Potential Through the Power of Knowledge - Learn, Earn, and Grow with Gyaan AUR Dhan.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        <AppProviders>
          <Navbar />
          <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
