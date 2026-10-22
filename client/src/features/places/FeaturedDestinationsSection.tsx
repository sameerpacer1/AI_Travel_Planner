import { Link } from 'react-router-dom';
import { getDestinationCover, handleImageError } from '../../lib/placeImages.js';
import { Button } from '../../components/ui/Button.js';
import { MapPin, Star, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.js';

interface FeaturedDestination {
  id: string;
  name: string;
  state: string;
  image: string;
  tag: string;
  rating: number;
  visitedHighlights: string[];
  budgetEst: string;
}

const FEATURED_DESTINATIONS: FeaturedDestination[] = [
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    image: getDestinationCover('manali'),
    tag: 'Snow Peaks & Valleys',
    rating: 4.9,
    visitedHighlights: ['Solang Valley', 'Hadimba Temple', 'Rohtang Pass', 'Jogini Falls'],
    budgetEst: '₹12,000 - ₹18,000',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    image: getDestinationCover('mumbai'),
    tag: 'Coastal Skyline & Culture',
    rating: 4.8,
    visitedHighlights: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Colaba'],
    budgetEst: '₹15,000 - ₹24,000',
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'West Coast',
    image: getDestinationCover('goa'),
    tag: 'Golden Beaches & Forts',
    rating: 4.9,
    visitedHighlights: ['Baga Beach', 'Fort Aguada', 'Dudhsagar Falls', 'Old Goa'],
    budgetEst: '₹14,000 - ₹22,000',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    image: getDestinationCover('jaipur'),
    tag: 'Royal Heritage & Palaces',
    rating: 4.8,
    visitedHighlights: ['Hawa Mahal', 'Amber Fort', 'Jal Mahal', 'Nahargarh Sunset'],
    budgetEst: '₹10,000 - ₹16,000',
  },
  {
    id: 'kerala',
    name: 'Kerala & Munnar',
    state: 'God’s Own Country',
    image: getDestinationCover('kerala'),
    tag: 'Backwaters & Tea Hills',
    rating: 4.9,
    visitedHighlights: ['Alleppey Houseboats', 'Munnar Tea Plantations', 'Athirappilly'],
    budgetEst: '₹16,000 - ₹26,000',
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    image: getDestinationCover('varanasi'),
    tag: 'Spiritual Ghats & Aarti',
    rating: 4.8,
    visitedHighlights: ['Dashashwamedh Aarti', 'Kashi Vishwanath', 'Sunrise Boating'],
    budgetEst: '₹8,000 - ₹14,000',
  },
];

export function FeaturedDestinationsSection() {
  const { user } = useAuth();
  const ctaBase = user ? '/trips/new' : '/register';

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 mb-3">
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span>Trending Places to Visit</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Iconic Places & Travel Inspiration
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mt-2">
              Discover real-world destinations planned by TripWise. Each location includes AI budget estimates and vetted local sights.
            </p>
          </div>

          <Link to={ctaBase}>
            <Button variant="outline" size="md" className="gap-2 shrink-0">
              <span>Plan Custom Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-subtle hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    onError={(e) => handleImageError(e)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/20 to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-amber-300 flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{dest.rating}</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-900 shadow-xs">
                      {dest.tag}
                    </span>
                  </div>

                  {/* Destination Name Overlay */}
                  <div className="absolute bottom-3.5 left-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>{dest.state}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body: Highlights */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Top Visited Sights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.visitedHighlights.map((hl, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-xs font-medium text-slate-700"
                        >
                          📍 {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Est. Budget</span>
                      <span className="font-bold text-emerald-700 text-xs">{dest.budgetEst}</span>
                    </div>

                    <Link to={`${ctaBase}?destination=${encodeURIComponent(dest.name)}`}>
                      <span className="inline-flex items-center gap-1 font-bold text-brand-600 group-hover:text-brand-700 group-hover:underline">
                        <span>Plan with AI</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

