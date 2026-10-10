export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export type TravelStyle = 'budget' | 'balanced' | 'luxury' | 'adventure' | 'relaxed' | 'family';
export type TransportPreference = 'flight' | 'train' | 'bus' | 'self_drive' | 'rental_car' | 'public_transit' | 'any';
export type AccommodationPreference = 'hostel' | 'budget_hotel' | 'mid_range_hotel' | 'luxury_resort' | 'homestay' | 'any';

export interface RouteModeDetails {
  mode: 'flight' | 'train' | 'bus' | 'car';
  label: string;
  durationText: string;
  durationMinutes: number;
  distanceKm: number;
  distanceText: string;
  speedKmH: number;
  recommended: boolean;
  notes?: string;
}

export interface RouteOverview {
  origin: string;
  destination: string;
  straightDistanceKm?: number;
  roadDistanceKm?: number;
  distanceText: string;
  primaryMode: 'flight' | 'train' | 'bus' | 'car' | string;
  primaryDurationText: string;
  primaryDurationMinutes?: number;
  modes?: RouteModeDetails[];
  googleMapsUrl?: string;
  embedMapUrl?: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  durationMinutes: number;
  estimatedCost: number;
  category: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'relaxation' | 'shopping' | 'travel' | 'nature' | 'nightlife';
  location?: string;
  reason: string;
  distanceFromPrev?: string;
  travelTimeFromPrev?: string;
  transitMode?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  theme?: string;
  activities: Activity[];
}

export interface CostBreakdown {
  transport: number;
  accommodation: number;
  activities: number;
  food: number;
  other: number;
}

export interface Itinerary {
  summary: string;
  destinationHighlights?: string[];
  estimatedTotalCost: number;
  currency: string;
  costBreakdown: CostBreakdown;
  days: ItineraryDay[];
  travelTips?: string[];
  packingSuggestions?: string[];
  routeOverview?: RouteOverview;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  interests: string[];
  transportPreference: TransportPreference;
  accommodationPreference: AccommodationPreference;
  additionalPreferences?: string | null;
  itinerary?: Itinerary | null;
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  city: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: WeatherForecastDay[];
}

export interface ServiceStatus {
  gemini: { configured: boolean; provider: string };
  weather: { configured: boolean; provider: string };
  maps: { configured: boolean; provider: string };
}
