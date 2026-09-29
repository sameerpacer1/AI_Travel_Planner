import { Compass, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Trip<span className="text-brand-400">Wise</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              TripWise generates realistic, personalized day-by-day travel itineraries powered by Google Gemini AI. Built with transparent reasoning, strict budget allocation, and zero privacy compromise.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Privacy First
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-brand-400" />
                Gemini 1.5 Flash
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                React + Express + Prisma
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trips/new" className="hover:text-white transition-colors">
                  Trip Planner Wizard
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  My Trips Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Profile & Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Principles */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Architecture & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>HttpOnly Session Cookies</li>
              <li>Zod Validated AI Engine</li>
              <li>PostgreSQL Relational Schema</li>
              <li>IDOR Protected Access</li>
              <li>No Fake Reviews or Prices</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TripWise. AI-Powered Personalized Travel Planner.</p>
          <p className="text-slate-400">
            College Mini-Project Demonstration
          </p>
        </div>
      </div>
    </footer>
  );
}
