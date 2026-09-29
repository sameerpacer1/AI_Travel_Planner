import { z } from 'zod';

export const TravelStyleEnum = z.enum([
  'budget',
  'balanced',
  'luxury',
  'adventure',
  'relaxed',
  'family'
]);

export const TransportPreferenceEnum = z.enum([
  'flight',
  'train',
  'bus',
  'self_drive',
  'rental_car',
  'public_transit',
  'any'
]);

export const AccommodationPreferenceEnum = z.enum([
  'hostel',
  'budget_hotel',
  'mid_range_hotel',
  'luxury_resort',
  'homestay',
  'any'
]);

export const tripBaseSchema = z.object({
  title: z.string().optional(),
  origin: z.string().min(2, 'Origin city is required').max(100),
  destination: z.string().min(2, 'Destination city is required').max(100),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date',
  }),
  travelers: z.number().int().min(1, 'At least 1 traveler required').max(50, 'Max 50 travelers'),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.string().default('INR').transform((val) => val.toUpperCase()),
  travelStyle: TravelStyleEnum.default('balanced'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  transportPreference: TransportPreferenceEnum.default('any'),
  accommodationPreference: AccommodationPreferenceEnum.default('any'),
  additionalPreferences: z.string().max(500).optional(),
});

export const createTripSchema = tripBaseSchema.refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date cannot be earlier than start date',
    path: ['endDate'],
  }
);

export const updateTripSchema = tripBaseSchema.partial();

export const regenerateTripSchema = z.object({
  modifier: z.enum([
    'cheaper',
    'more_nature',
    'more_food',
    'reduce_travel_time',
    'more_relaxed',
    'more_activities',
    'custom'
  ]),
  customPrompt: z.string().max(300).optional(),
});

export type CreateTripInput = z.infer<typeof tripBaseSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type RegenerateTripInput = z.infer<typeof regenerateTripSchema>;
