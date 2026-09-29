import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Map, MapPin, ExternalLink } from 'lucide-react';

interface MapWidgetProps {
  destination: string;
}

export function MapWidget({ destination }: MapWidgetProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [apiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/services-status');
        if (res.data.success) {
          setIsConfigured(res.data.data.maps.configured);
        }
      } catch (err) {
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  return (
    <Card className="border-slate-200/80 shadow-subtle overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-brand-600" />
          <CardTitle className="text-sm">Location & Maps</CardTitle>
        </div>
        <Badge variant={isConfigured ? 'success' : 'outline'}>
          {isConfigured ? 'Google Maps Active' : 'Service Not Configured'}
        </Badge>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="h-44 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
            Checking map services...
          </div>
        ) : isConfigured ? (
          <div className="space-y-3">
            <div className="h-52 w-full rounded-xl overflow-hidden border border-slate-200 relative bg-slate-50">
              <iframe
                title={`Map of ${destination}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
                  destination
                )}`}
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Interactive Google Maps rendering for <strong>{destination}</strong>
            </p>
          </div>
        ) : (
          /* Graceful Unconfigured State - No Fake Data */
          <div className="py-6 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Map Service Unconfigured</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Interactive map rendering requires <code>GOOGLE_MAPS_API_KEY</code> in the server <code>.env</code>.
              </p>
            </div>
            <div className="pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition-colors"
              >
                <span>Open {destination} in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
