export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Gyaan AUR Dhan. All rights reserved.</p>
          <p className="mt-1 text-xs">Unlocking Potential Through the Power of Knowledge</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/learn"
            className="transition-colors hover:text-slate-700"
            aria-label="Gyaan Hub"
          >
            Gyaan Hub
          </a>
          <a
            href="/earn"
            className="transition-colors hover:text-slate-700"
            aria-label="Dhan Hub"
          >
            Dhan Hub
          </a>
          <a
            href="/community"
            className="transition-colors hover:text-slate-700"
            aria-label="Community"
          >
            Community
          </a>
          <a
            href="/admin"
            className="transition-colors hover:text-slate-700"
            aria-label="Admin dashboard"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

