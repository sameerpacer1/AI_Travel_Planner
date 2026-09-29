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
  reason: z.string().min(1).describe('Personalized explanation connecting this choice to user preferences/budget')
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

export const ItinerarySchema = z.object({
  summary: z.string().min(10),
  destinationHighlights: z.array(z.string()).default([]),
  estimatedTotalCost: z.number().positive(),
  currency: z.string().default('INR'),
  costBreakdown: CostBreakdownSchema,
  days: z.array(ItineraryDaySchema).min(1),
  travelTips: z.array(z.string()).default([]),
  packingSuggestions: z.array(z.string()).default([])
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
