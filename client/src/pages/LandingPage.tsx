import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import {
  Sparkles,
  ArrowRight,
  Wallet,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  CloudSun,
  Map,
  Sliders,
  HelpCircle,
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  const ctaLink = user ? '/trips/new' : '/register';

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-brand-50/30 to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                <span>Next-Gen Travel Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your next trip, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600">
                  planned by AI.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Tell TripWise where you're going, what you love, and what you want to spend. Get a personalized itinerary in seconds.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to={ctaLink} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-7 shadow-lg shadow-brand-500/25">
                    Plan my trip
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                    See how it works
                  </Button>
                </a>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real budget calculations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Transparent AI reasoning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No data sold</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Travel Interface Mockup */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl border border-slate-200/80 bg-white p-5 shadow-float">
                {/* Mock Card Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Manali Explorer</h4>
                      <p className="text-xs text-slate-400">From Ghaziabad • 3 Travelers • ₹15,000</p>
                    </div>
                  </div>
                  <Badge variant="success">AI Optimized</Badge>
                </div>

                {/* Day snippet */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day 2 • Alpine Thrills</span>
                    <span className="text-xs font-semibold text-brand-600">₹3,400 allocated</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Activity 1 */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-xs text-brand-600 font-bold text-xs mt-0.5">
                        09:30 AM
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-800">Solang Valley Adventure</h5>
                          <span className="text-[11px] font-semibold text-slate-600">₹1,800</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Ziplining & panoramic photography of snow peaks</p>
                        <div className="mt-2 text-[10px] text-brand-700 bg-brand-50/80 px-2 py-1 rounded-lg border border-brand-100/50 flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3 text-brand-600 shrink-0" />
                          <span><strong>Why:</strong> Matches your photography and mountain interest within day budget.</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity 2 */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-xs text-amber-600 font-bold text-xs mt-0.5">
                        01:30 PM
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-800">Himachali Trout & Siddu Lunch</h5>
                          <span className="text-[11px] font-semibold text-slate-600">₹950</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Authentic riverfront dining experience</p>
                        <div className="mt-2 text-[10px] text-brand-700 bg-brand-50/80 px-2 py-1 rounded-lg border border-brand-100/50 flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3 text-brand-600 shrink-0" />
                          <span><strong>Why:</strong> Chosen to fulfill your food interest with top local cuisine.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom floating stat */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Transport: Volvo AC Bus</span>
                  <span className="font-semibold text-emerald-600">Within Budget (96% utilized)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info">Simple & Transparent</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              How TripWise Plans Your Journey
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From your initial idea to a structured, minute-by-minute itinerary in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-surface border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-brand-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Input Your Constraints</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Specify destination, departure city, travel dates, passenger count, and your exact budget cap in INR or other currencies.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-blue-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Define Your Vibe</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose preferred travel style (budget, relaxed, adventure), transport mode, accommodation type, and tag your personal interests.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-indigo-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Actionable Itinerary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini AI outputs structured days with explicit reasons, realistic time durations, itemized cost estimates, and packing recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI PLANNING CAPABILITIES */}
      <section id="features" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="purple">Intelligent Reasoning</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Why TripWise is Not a Generic Template
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every activity has an intentional reason directly referencing your chosen preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Explainable AI (XAI)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every event item includes a clear explanation stating why it was scheduled and how it respects your budget.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Real Budget Allocation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Costs are segmented across transportation, lodging, food, and sightseeing so you never run out of funds midway.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Dynamic Regeneration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Want it cheaper? More nature? More relaxed? Re-prompt the engine with a single click without losing trip data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <CloudSun className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Real Weather Integration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects to real weather forecasts for destination cities, with clear unconfigured states when keys are absent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Map className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Geocoding & Maps</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean Google Maps service abstraction with strict coordinate validation and zero invented fake locations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Robust Security</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                HttpOnly session cookies, SameSite defense, Argon2/bcrypt hashing, and strict IDOR trip ownership boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIVACY */}
      <section id="privacy" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Engineered for Privacy & Zero Data Exploitation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Personal Information Stays Yours
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TripWise strictly collects only what is required to formulate your travel itinerary. We do not ask for or store Aadhaar numbers, PAN cards, passport copies, financial bank records, or permanent precise GPS traces.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <h5 className="font-bold text-sm text-white mb-1">No AI Credential Leakage</h5>
                  <p className="text-xs text-slate-400">
                    Your password, tokens, and email are never sent to Gemini AI. The backend communicates through an isolated server proxy.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <h5 className="font-bold text-sm text-white mb-1">HttpOnly Cookie Architecture</h5>
                  <p className="text-xs text-slate-400">
                    Tokens are never stored in localStorage, shielding user sessions from client-side script tampering or XSS theft.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-surface to-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to plan your next journey?
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Experience realistic, budget-conscious travel itineraries created specifically for your taste.
          </p>
          <div className="pt-2">
            <Link to={ctaLink}>
              <Button size="lg" className="px-8 shadow-lg shadow-brand-500/25">
                Start Planning Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
