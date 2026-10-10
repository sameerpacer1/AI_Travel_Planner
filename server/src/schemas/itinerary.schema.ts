import { z } from 'zod';

export const ActivityCategorySchema = z.enum([
  'sightseeing',
  'food',
  'adventure',
  'culture',
  'relaxation',
  'shopping',
  'travel',
  'nature',
  'nightlife'
]);

export const ActivitySchema = z.object({
  time: z.string().describe('e.g. 09:30 AM or 14:00'),
  title: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  estimatedCost: z.number().nonnegative().describe('Estimated cost for all travelers in currency'),
  category: ActivityCategorySchema,
  location: z.string().optional().describe('City neighborhood or landmark name'),
  reason: z.string().min(1).describe('Personalized explanation connecting this choice to user preferences/budget'),
  // Distance and transit details between activities
  distanceFromPrev: z.string().optional().describe('Estimated distance from origin/previous stop, e.g. "1,430 km" or "4.5 km" or "350m walk"'),
  travelTimeFromPrev: z.string().optional().describe('Estimated travel time to reach this destination, e.g. "29 hrs by Sleeper Bus" or "15 mins via Cab"'),
  transitMode: z.string().optional().describe('Recommended transit mode, e.g. "Bus", "Cab/Taxi", "Metro", "Walking"')
});

export const ItineraryDaySchema = z.object({
  day: z.number().int().positive(),
  date: z.string().describe('YYYY-MM-DD format'),
  title: z.string().min(1),
  theme: z.string().optional(),
  activities: z.array(ActivitySchema).min(1)
});

export const CostBreakdownSchema = z.object({
  transport: z.number().nonnegative(),
  accommodation: z.number().nonnegative(),
  activities: z.number().nonnegative(),
  food: z.number().nonnegative(),
  other: z.number().nonnegative()
});

export const RouteModeSchema = z.object({
  mode: z.string(),
  label: z.string(),
  durationText: z.string(),
  distanceText: z.string(),
  notes: z.string().optional()
});

export const RouteOverviewSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  straightDistanceKm: z.number().optional(),
  roadDistanceKm: z.number().optional(),
  distanceText: z.string().describe('e.g. 1,430 km'),
  primaryMode: z.string().describe('e.g. bus, train, flight, car'),
  primaryDurationText: z.string().describe('e.g. 29h 48m'),
  modes: z.array(RouteModeSchema).optional(),
  googleMapsUrl: z.string().optional(),
  embedMapUrl: z.string().optional()
});

export const ItinerarySchema = z.object({
  summary: z.string().min(10),
  destinationHighlights: z.array(z.string()).default([]),
  estimatedTotalCost: z.number().positive(),
  currency: z.string().default('INR'),
  costBreakdown: CostBreakdownSchema,
  days: z.array(ItineraryDaySchema).min(1),
  travelTips: z.array(z.string()).default([]),
  packingSuggestions: z.array(z.string()).default([]),
  routeOverview: RouteOverviewSchema.optional()
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>;
export type RouteOverview = z.infer<typeof RouteOverviewSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
