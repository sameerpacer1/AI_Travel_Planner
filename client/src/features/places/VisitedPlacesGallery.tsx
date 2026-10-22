import { useState } from 'react';
import { getTopVisitedPlaces, VisitedPlaceItem } from '../../lib/placeImages.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { Camera, MapPin, ExternalLink, Star, Compass, Sparkles } from 'lucide-react';

interface VisitedPlacesGalleryProps {
  destination: string;
}

export function VisitedPlacesGallery({ destination }: VisitedPlacesGalleryProps) {
  const places = getTopVisitedPlaces(destination);
  const [selectedPlace, setSelectedPlace] = useState<VisitedPlaceItem | null>(null);

  if (!places || places.length === 0) return null;

  return (
    <>
      <Card className="border-slate-200/80 shadow-subtle overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm">Must-Visit Places & Sights in {destination}</CardTitle>
          </div>
          <Badge variant="purple" className="gap-1 text-[10px]">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Curated Highlights
          </Badge>
        </CardHeader>

        <CardContent className="p-5">
          <p className="text-xs text-slate-500 mb-4">
            Iconic sights, viewpoints, and cultural hotspots that make {destination} a memorable journey.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Image container */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={place.image}
                    alt={place.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20" />

                  {/* Rating badge */}
                  {place.rating && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-white/20">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{place.rating}</span>
                    </div>
                  )}

                  {/* Category tag */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-900 shadow-xs">
                      {place.tag}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {place.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-1">
                      {place.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-brand-600 font-semibold group-hover:underline">
                      <Compass className="w-3 h-3" />
                      View Details
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${place.name}, ${destination}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox / Expanded View Modal */}
      {selectedPlace && (
        <Modal
          isOpen={Boolean(selectedPlace)}
          onClose={() => setSelectedPlace(null)}
          title={selectedPlace.name}
          description={`${destination} • ${selectedPlace.tag}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-900 shadow-md">
              <img
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className="w-full h-full object-cover"
              />
              {selectedPlace.rating && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-amber-300 flex items-center gap-1.5 border border-white/20">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{selectedPlace.rating} Traveler Rating</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
                {selectedPlace.tag}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed pt-1">
                {selectedPlace.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{selectedPlace.name}, {destination}</span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedPlace.name}, ${destination}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

