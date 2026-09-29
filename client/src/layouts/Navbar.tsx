import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { Compass, PlusCircle, LayoutDashboard, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Trip<span className="text-brand-600">Wise</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                AI Travel Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/trips/new"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/trips/new')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-brand-600" />
                  Plan New Trip
                </Link>
              </>
            ) : (
              <>
                <a
                  href="/#how-it-works"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="/#features"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Features
                </a>
                <a
                  href="/#privacy"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Privacy
                </a>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors ${
                    isActive('/profile') ? 'bg-slate-100 ring-1 ring-slate-200' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    {user.name[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          {user ? (
            <>
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                Dashboard
              </Link>
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                Plan New Trip
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <UserIcon className="w-4 h-4 text-brand-600" />
                Profile & Security
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Features
              </a>
              <a
                href="/#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Privacy & Security
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
