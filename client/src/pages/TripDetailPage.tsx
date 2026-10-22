import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api.js';
import { Trip, Itinerary } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { WeatherWidget } from '../features/weather/WeatherWidget.js';
import { MapWidget } from '../features/map/MapWidget.js';
import { RouteOverviewCard } from '../features/route/RouteOverviewCard.js';
import { VisitedPlacesGallery } from '../features/places/VisitedPlacesGallery.js';
import { getDestinationCover, getActivityImage } from '../lib/placeImages.js';
import { formatCurrency, formatDate, getDaysBetween } from '../lib/utils.js';
import {
  MapPin,
  Sparkles,
  RefreshCw,
  Trash2,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Backpack,
  ArrowLeft,
  Navigation,
  ExternalLink,
} from 'lucide-react';

const REGENERATE_MODIFIERS = [
  { id: 'cheaper', label: 'Make it Cheaper', desc: 'Focus on budget stays, street dining, and free attractions' },
  { id: 'more_nature', label: 'Add More Nature', desc: 'Prioritize scenic viewpoints, forest walks, and outdoor views' },
  { id: 'more_food', label: 'Add More Food Experiences', desc: 'Include famous culinary joints and regional specialties' },
  { id: 'more_relaxed', label: 'Make it More Relaxed', desc: 'Fewer stops per day, more downtime and leisurely mornings' },
  { id: 'reduce_travel_time', label: 'Reduce Travel Time', desc: 'Group attractions tightly to cut inter-city movement' },
  { id: 'more_activities', label: 'Pack More Activities', desc: 'Action-packed schedule for high energy explorers' },
];

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active day accordion/tabs
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Regeneration modal state
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<string>('cheaper');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch trip
  const fetchTrip = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/trips/${id}`);
      if (res.data.success) {
        setTrip(res.data.data.trip);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  // Handle Regeneration
  const handleRegenerate = async () => {
    if (!id) return;
    try {
      setIsRegenerating(true);
      setRegenerateError(null);

      const res = await api.post(`/trips/${id}/regenerate`, {
        modifier: selectedModifier,
        customPrompt: customPrompt.trim() || undefined,
      });

      if (res.data.success) {
        setTrip(res.data.data.trip);
        setIsRegenerateModalOpen(false);
        setCustomPrompt('');
      }
    } catch (err) {
      setRegenerateError(getErrorMessage(err));
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle Delete
  const handleDeleteTrip = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await api.delete(`/trips/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This trip does not exist or you do not have permission to view it.'}</p>
        <Link to="/dashboard">
          <Button variant="primary" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const daysCount = getDaysBetween(trip.startDate, trip.endDate);
  const itinerary = trip.itinerary as Itinerary | null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegenerateModalOpen(true)}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
            Regenerate Itinerary
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* DESTINATION COVER HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-float border border-slate-200/80 bg-slate-900 group">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden">
          <img
            src={getDestinationCover(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-xs">
              📸 {trip.destination} Visual Guide
            </span>
          </div>

          <div className="absolute bottom-5 left-6 sm:left-8 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success" className="shadow-xs bg-emerald-500/90 text-white border-0">
                <Sparkles className="w-3 h-3" />
                {trip.isGenerated ? 'AI Verified Plan' : 'Draft'}
              </Badge>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
                {trip.origin} ➔ {trip.destination}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium capitalize">
              Style: <strong>{trip.travelStyle}</strong> • Transport: <strong>{trip.transportPreference}</strong> • Stay: <strong>{trip.accommodationPreference.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* HEADER HERO CARD */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" className="gap-1">
                <MapPin className="w-3 h-3 text-brand-600" />
                {trip.origin} → {trip.destination}
              </Badge>
              <Badge variant={trip.isGenerated ? 'success' : 'warning'}>
                {trip.isGenerated ? 'AI Itinerary Active' : 'Draft Plan'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Style: <strong>{trip.travelStyle}</strong> • Transport: <strong>{trip.transportPreference}</strong> • Stay: <strong>{trip.accommodationPreference.replace('_', ' ')}</strong>
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">DATES</span>
              <span className="font-bold text-slate-800">
                {formatDate(trip.startDate)} ({daysCount}d)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">TRAVELERS</span>
              <span className="font-bold text-slate-800">
                {trip.travelers} {trip.travelers === 1 ? 'Person' : 'People'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">BUDGET CAP</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(trip.budget, trip.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Interests row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Interests:</span>
          {trip.interests.map((item) => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 capitalize"
            >
              {item}
            </span>
          ))}
          {trip.additionalPreferences && (
            <span className="text-xs text-slate-500 italic ml-2">
              "{trip.additionalPreferences}"
            </span>
          )}
        </div>
      </div>

      {/* TRIP SUMMARY */}
      {itinerary?.summary && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50/70 via-blue-50/40 to-white border border-brand-100/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>AI Itinerary Overview</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {itinerary.summary}
          </p>

          {itinerary.destinationHighlights && itinerary.destinationHighlights.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {itinerary.destinationHighlights.map((hl, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white border border-brand-200 text-xs font-medium text-brand-800"
                >
                  ✨ {hl}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ESTIMATED BUDGET BREAKDOWN */}
      {itinerary?.costBreakdown && (
        <Card className="border-slate-200/80 shadow-subtle overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Estimated Budget Breakdown</CardTitle>
              <p className="text-[11px] text-slate-400">
                AI estimates conforming to your {formatCurrency(trip.budget, trip.currency)} budget cap. (Non-guaranteed estimates)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Estimated Total</span>
              <p className="text-base font-extrabold text-emerald-700">
                {formatCurrency(itinerary.estimatedTotalCost, itinerary.currency)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Transport', cost: itinerary.costBreakdown.transport, color: 'bg-blue-500' },
                { label: 'Accommodation', cost: itinerary.costBreakdown.accommodation, color: 'bg-indigo-500' },
                { label: 'Activities', cost: itinerary.costBreakdown.activities, color: 'bg-emerald-500' },
                { label: 'Food & Dining', cost: itinerary.costBreakdown.food, color: 'bg-amber-500' },
                { label: 'Miscellaneous', cost: itinerary.costBreakdown.other, color: 'bg-slate-400' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.cost, itinerary.currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {Math.round((item.cost / Math.max(1, itinerary.estimatedTotalCost)) * 100)}% of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROUTE DISTANCE & TRAVEL TIME OVERVIEW */}
      {trip && (
        <RouteOverviewCard
          origin={trip.origin}
          destination={trip.destination}
          preferredTransport={trip.transportPreference}
          initialRoute={itinerary?.routeOverview}
        />
      )}

      {/* MUST-VISIT PLACES & PHOTO GALLERY */}
      {trip && <VisitedPlacesGallery destination={trip.destination} />}

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ITINERARY TIMELINE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Day-by-Day Timeline
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {itinerary?.days?.length || 0} Days Planned
            </span>
          </div>

          {!itinerary || !itinerary.days || itinerary.days.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Itinerary not yet generated</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate your personalized itinerary using Gemini AI with transparent activity reasoning.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsRegenerateModalOpen(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Itinerary Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Day Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {itinerary.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedDay === day.day
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Day {day.day} • {day.title.slice(0, 16)}...
                  </button>
                ))}
              </div>

              {/* Selected Day View */}
              {itinerary.days
                .filter((day) => day.day === selectedDay)
                .map((day) => (
                  <div key={day.day} className="space-y-4 animate-fade-in">
                    {/* Day Title Card */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                          Day {day.day} • {day.date}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {day.title}
                        </h3>
                        {day.theme && (
                          <p className="text-xs text-slate-500 italic mt-0.5">
                            Theme: {day.theme}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{day.activities.length} Activities</Badge>
                    </div>

                    {/* Timeline Activities List */}
                    <div className="relative pl-6 sm:pl-8 space-y-4 border-l-2 border-slate-200 ml-3 sm:ml-4">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="relative group">
                          {/* Dot on timeline */}
                          <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full bg-white border-4 border-brand-600 group-hover:scale-125 transition-transform" />

                          <Card className="hover:shadow-card transition-all border-slate-200/80">
                            <CardContent className="p-5 space-y-3">
                              {/* Top activity bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs">
                                    {activity.time}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {activity.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="default" className="capitalize text-[10px]">
                                    {activity.category}
                                  </Badge>
                                  <span className="font-semibold text-slate-700">
                                    {activity.estimatedCost > 0
                                      ? formatCurrency(activity.estimatedCost, itinerary.currency)
                                      : 'Free'}
                                  </span>
                                </div>
                              </div>

                              {/* Visited Place Photo Banner */}
                              <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-xs group/img">
                                <img
                                  src={getActivityImage(activity.title, activity.location, activity.category, trip.destination)}
                                  alt={activity.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/15" />
                                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white/95 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-brand-300" />
                                    {activity.location || trip.destination}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white">
                                    {activity.category}
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {activity.description}
                              </p>

                              {/* Location & Duration metadata */}
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                                {activity.location && (
                                  <span className="flex items-center gap-1 font-medium text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                                    {activity.location}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  Duration: {activity.durationMinutes} mins
                                </span>
                              </div>

                              {/* Distance & Travel Time to Reach Destination */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                  <Navigation className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                  <span>
                                    {activity.distanceFromPrev ? (
                                      <span>Distance: <strong className="text-slate-900">{activity.distanceFromPrev}</strong></span>
                                    ) : (
                                      <span>Distance: <strong className="text-slate-900">{actIdx === 0 && day.day === 1 ? `Direct from ${trip.origin}` : 'Local stop'}</strong></span>
                                    )}
                                    <span className="mx-1 text-slate-300">•</span>
                                    <span>
                                      Travel Time: <strong className="text-brand-700">{activity.travelTimeFromPrev || (actIdx === 0 && day.day === 1 ? 'Scheduled Arrival' : '~15-20 mins')}</strong>
                                    </span>
                                    {activity.transitMode && (
                                      <span className="text-slate-500 font-normal"> ({activity.transitMode})</span>
                                    )}
                                  </span>
                                </div>

                                {activity.location && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      `${activity.location}, ${trip.destination}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline shrink-0"
                                  >
                                    <span>Directions</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              {/* TRANSPARENT AI REASONING */}
                              <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 flex items-start gap-2.5 text-xs text-brand-900">
                                <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-brand-800">Why this was chosen: </span>
                                  <span className="text-brand-900/90">{activity.reason}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Travel Tips and Packing Suggestions */}
          {itinerary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {itinerary.travelTips && itinerary.travelTips.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Traveler Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {itinerary.travelTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {itinerary.packingSuggestions && itinerary.packingSuggestions.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                    <Backpack className="w-4 h-4" />
                    <span>Packing Checklist</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {itinerary.packingSuggestions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WEATHER & MAP */}
        <div className="lg:col-span-4 space-y-6">
          <WeatherWidget destination={trip.destination} />
          <MapWidget
            destination={trip.destination}
            origin={trip.origin}
            preferredTransport={trip.transportPreference}
            routeOverview={itinerary?.routeOverview}
          />
        </div>

      </div>

      {/* REGENERATE MODAL */}
      <Modal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        title="Refine & Regenerate Itinerary"
        description="Choose how Gemini AI should recalibrate your itinerary"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {regenerateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{regenerateError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Adjustment Directive
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REGENERATE_MODIFIERS.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModifier(mod.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedModifier === mod.id
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{mod.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{mod.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Custom Prompt or Specific Requests (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Include a sunrise viewpoint on Day 2, prioritize vegetarian mountain dhabas..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Note: Your existing itinerary is preserved safely if the new generation request encounters an error.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegenerateModalOpen(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRegenerate}
              isLoading={isRegenerating}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate Itinerary
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE TRIP MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Trip"
        description="Are you sure you want to permanently delete this trip?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will permanently remove <strong>{trip.title}</strong> and all associated timeline activities. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteTrip}
              isLoading={isDeleting}
            >
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
