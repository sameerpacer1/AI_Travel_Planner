import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { api, getErrorMessage } from '../lib/api.js';
import { Trip } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Modal } from '../components/ui/Modal.js';
import { formatCurrency, formatDate, getDaysBetween } from '../lib/utils.js';
import { getDestinationCover, handleImageError } from '../lib/placeImages.js';
import {
  PlusCircle,
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  Trash2,
  Sparkles,
  Plane,
  AlertCircle,
  Compass,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete trip modal state
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/trips');
      if (res.data.success) {
        setTrips(res.data.data.trips);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/trips/${tripToDelete.id}`);
      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));
      setTripToDelete(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculations for dashboard stats
  const generatedCount = trips.filter((t) => t.isGenerated).length;
  const totalDays = trips.reduce(
    (acc, t) => acc + getDaysBetween(t.startDate, t.endDate),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Header / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your AI travel plans, generate new itineraries, and organize upcoming trips.
          </p>
        </div>
        <Link to="/trips/new" className="w-full sm:w-auto">
          <Button size="md" className="w-full sm:w-auto gap-2 shadow-sm shadow-brand-500/20">
            <PlusCircle className="w-4 h-4" />
            Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <h3 className="text-2xl font-bold text-slate-900">{isLoading ? '...' : trips.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Itineraries</p>
            <h3 className="text-2xl font-bold text-slate-900">{isLoading ? '...' : generatedCount}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Days Planned</p>
            <h3 className="text-2xl font-bold text-slate-900">{isLoading ? '...' : totalDays}</h3>
          </div>
        </div>
      </div>

      {/* Trips List Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Trips</h2>
          <span className="text-xs text-slate-400">{trips.length} total</span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-white border border-dashed border-slate-300">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your next adventure starts here.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven't planned any trips yet. Enter your dates, budget, and destination to get an AI-tailored plan.
            </p>
            <Link to="/trips/new">
              <Button size="md" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Create your first trip
              </Button>
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const days = getDaysBetween(trip.startDate, trip.endDate);

              return (
                <Card
                  key={trip.id}
                  className="hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Destination Cover Header */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getDestinationCover(trip.destination)}
                      alt={trip.destination}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/25 to-transparent" />
                    <div className="absolute top-3 right-3">
                      {trip.isGenerated ? (
                        <Badge variant="success" className="gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="shadow-xs">Draft</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 left-3 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-300" />
                        <span>{trip.origin} → {trip.destination}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Header: Trip Details */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {trip.travelStyle} • {trip.transportPreference}
                      </p>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Duration
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatDate(trip.startDate)} ({days} days)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          Travelers
                        </span>
                        <span className="font-semibold text-slate-800">
                          {trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Wallet className="w-3.5 h-3.5" />
                          Budget
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(trip.budget, trip.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Interests tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {trip.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 capitalize"
                        >
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-400">
                          +{trip.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  {/* Actions footer */}
                  <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setTripToDelete(trip)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete trip"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link to={`/trips/${trip.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <span>Open Trip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Trip Deletion */}
      <Modal
        isOpen={Boolean(tripToDelete)}
        onClose={() => setTripToDelete(null)}
        title="Delete Trip"
        description="Are you sure you want to delete this trip plan?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will permanently remove <strong>{tripToDelete?.title}</strong> and its AI-generated itinerary. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTripToDelete(null)}
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
