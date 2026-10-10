import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { RouteOverview } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { Map, MapPin, ExternalLink, Navigation, Clock } from 'lucide-react';

interface MapWidgetProps {
  destination: string;
  origin?: string;
  preferredTransport?: string;
  routeOverview?: RouteOverview;
}

export function MapWidget({
  destination,
  origin,
  preferredTransport = 'bus',
  routeOverview,
}: MapWidgetProps) {
  const [route, setRoute] = useState<RouteOverview | null>(routeOverview || null);

  useEffect(() => {
    if (routeOverview) {
      setRoute(routeOverview);
      return;
    }

    if (origin && destination) {
      let isMounted = true;
      api
        .get('/route', { params: { origin, destination, mode: preferredTransport } })
        .then((res) => {
          if (res.data.success && isMounted) {
            setRoute(res.data.data);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [origin, destination, preferredTransport, routeOverview]);

  const mapsQuery = origin
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(
        destination
      )}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`;

  const externalMapsUrl = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  return (
    <Card className="border-slate-200/80 shadow-subtle overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-brand-600" />
          <CardTitle className="text-sm">Location & Route Map</CardTitle>
        </div>
        <Badge variant="success" className="text-[10px]">
          Interactive Route
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Distance & Travel Time Badges */}
        {route && (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-brand-600">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Distance</span>
                <span className="text-xs font-bold text-slate-900">{route.distanceText}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Travel Time ({route.primaryMode})
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {route.primaryDurationText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Interactive Map */}
        <div className="h-60 w-full rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
          <iframe
            title={`Map for ${origin ? `${origin} to ${destination}` : destination}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={mapsQuery}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate">
              {origin ? `${origin} ➔ ${destination}` : destination}
            </span>
          </div>

          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
