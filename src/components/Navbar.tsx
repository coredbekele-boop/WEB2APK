import React from 'react';
import { Smartphone, ArrowRight, Menu, X, PlusCircle, Compass } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSignOut?: () => void;
  onStartWizard?: (initialUrl?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  isAuthenticated,
  onOpenAuth,
  onSignOut,
  onStartWizard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    if (currentRoute !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          title="Web2APK — Go to Home Page"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            Web2<span className="text-indigo-600">APK</span>
          </span>
        </button>

        {/* Zone 2: Main Menu Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`transition-colors cursor-pointer ${
              currentRoute === 'pricing' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Open Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              title="Sign in with your Google / Gmail account"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In with Gmail</span>
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          {onStartWizard && (
            <button
              onClick={() => onStartWizard()}
              className="sm:hidden px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg"
            >
              + Convert
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
            Menu
          </div>
          <button
            onClick={() => {
              scrollToSection('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              scrollToSection('features');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Features & Specs
          </button>
          <button
            onClick={() => {
              onNavigate('pricing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Pricing & Plans
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {onStartWizard && (
              <button
                onClick={() => {
                  onStartWizard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl"
              >
                + Convert Website to App
              </button>
            )}

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-indigo-600 rounded-xl"
                >
                  Open Dashboard
                </button>
                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

