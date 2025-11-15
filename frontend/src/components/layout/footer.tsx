export const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-16">
        {/* Main footer content */}
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand section */}
          <div className="md:col-span-2">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg" />
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Gyaan AUR Dhan
              </span>
            </div>
            <p className="mb-6 text-lg leading-relaxed text-slate-300 max-w-md">
              Unlocking Potential Through the Power of Knowledge. Join thousands of learners building their future through education and entrepreneurship.
            </p>
            <div className="flex gap-4">
              {/* Social links placeholders */}
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110" aria-label="Facebook">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110" aria-label="Twitter">
                <span className="text-lg">🐦</span>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110" aria-label="LinkedIn">
                <span className="text-lg">💼</span>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-110" aria-label="Instagram">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Platform Hubs */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-white">Platform Hubs</h3>
            <ul className="space-y-3">
              <li>
                <a href="/learn" className="text-slate-300 transition-all duration-300 hover:text-indigo-400 hover:translate-x-1 inline-block">
                  🧠 Gyaan Hub
                </a>
              </li>
              <li>
                <a href="/earn" className="text-slate-300 transition-all duration-300 hover:text-emerald-400 hover:translate-x-1 inline-block">
                  💰 Dhan Hub
                </a>
              </li>
              <li>
                <a href="/community" className="text-slate-300 transition-all duration-300 hover:text-pink-400 hover:translate-x-1 inline-block">
                  🤝 Community Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/browse" className="text-slate-300 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                  📚 Browse Books
                </a>
              </li>
              <li>
                <a href="/cart" className="text-slate-300 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                  🛒 Shopping Cart
                </a>
              </li>
              <li>
                <a href="/register" className="text-slate-300 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                  🚀 Join Now
                </a>
              </li>
              <li>
                <a href="/admin" className="text-slate-300 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
                  ⚙️ Admin Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-slate-400">
                &copy; {new Date().getFullYear()} Gyaan AUR Dhan. All rights reserved.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Built with ❤️ for knowledge seekers and entrepreneurs
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

