import { useState, useEffect } from 'react';
import { RouteOverview } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { Card, CardContent } from '../../components/ui/Card.js';
import {
  Navigation,
  Clock,
  Compass,
  Plane,
  Train,
  Bus,
  Car,
  ExternalLink,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface RouteOverviewCardProps {
  origin: string;
  destination: string;
  preferredTransport?: string;
  initialRoute?: RouteOverview;
}

export function RouteOverviewCard({
  origin,
  destination,
  preferredTransport = 'bus',
  initialRoute,
}: RouteOverviewCardProps) {
  const [route, setRoute] = useState<RouteOverview | null>(initialRoute || null);
  const [isLoading, setIsLoading] = useState(!initialRoute);
  const [activeMode, setActiveMode] = useState<string>(
    initialRoute?.primaryMode || preferredTransport || 'bus'
  );

  useEffect(() => {
    if (initialRoute && initialRoute.distanceText) {
      setRoute(initialRoute);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchRoute = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/route', {
          params: { origin, destination, mode: preferredTransport },
        });
        if (res.data.success && isMounted) {
          setRoute(res.data.data);
          if (res.data.data.primaryMode) {
            setActiveMode(res.data.data.primaryMode);
          }
        }
      } catch (err) {
        console.error('Failed to load route distance:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (origin && destination) {
      fetchRoute();
    }

    return () => {
      isMounted = false;
    };
  }, [origin, destination, preferredTransport, initialRoute]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 rounded-md w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!route) return null;

  const currentModeDetails = route.modes?.find((m) => m.mode === activeMode);
  const displayDuration = currentModeDetails?.durationText || route.primaryDurationText;
  const displayDistance = currentModeDetails?.distanceText || route.distanceText;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'train':
        return <Train className="w-4 h-4 text-emerald-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'car':
        return <Car className="w-4 h-4 text-indigo-600" />;
      default:
        return <Compass className="w-4 h-4 text-brand-600" />;
    }
  };

  const googleMapsUrl =
    route.googleMapsUrl ||
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;

  return (
    <Card className="border-brand-200/80 bg-gradient-to-br from-white via-brand-50/20 to-sky-50/20 shadow-subtle overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Top Header: Origin -> Destination Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              <Navigation className="w-3.5 h-3.5" />
              <span>Route Distance & Journey Estimates</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {origin}
              </span>
              <ArrowRight className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-lg font-extrabold text-brand-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                {destination}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Distance
              </span>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {displayDistance}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Travel Time ({activeMode})
              </span>
              <p className="text-xl font-extrabold text-brand-600 leading-tight">
                {displayDuration}
              </p>
            </div>
          </div>
        </div>

        {/* Transport Modes Comparison Cards */}
        {route.modes && route.modes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Compare Travel Modes & Durations
              </span>
              <span className="text-[11px] text-slate-400">
                Click a mode to preview timing
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {route.modes.map((modeItem) => {
                const isSelected = activeMode === modeItem.mode;
                const isPreferred =
                  preferredTransport.toLowerCase().includes(modeItem.mode) ||
                  route.primaryMode === modeItem.mode;

                return (
                  <button
                    key={modeItem.mode}
                    onClick={() => setActiveMode(modeItem.mode)}
                    className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-sm ring-2 ring-brand-500/10'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {isPreferred && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-brand-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-xs">
                        Selected
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-slate-100/80">
                        {getModeIcon(modeItem.mode)}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {modeItem.label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-sm font-extrabold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{modeItem.durationText}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {modeItem.distanceText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Bar: Action link to Google Maps */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Real-world distance calculated from geographical road network & airport corridors.
            </span>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>Open Route & Navigation on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
