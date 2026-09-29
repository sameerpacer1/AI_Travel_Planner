import { describe, it, expect } from 'vitest';
import { ItinerarySchema } from '../src/schemas/itinerary.schema.js';

describe('AI Itinerary Schema Validation & Guardrails', () => {
  it('should successfully validate a properly structured AI itinerary', () => {
    const validItinerary = {
      summary: 'A breathtaking 4-day budget adventure in the scenic valleys of Manali.',
      destinationHighlights: ['Solang Valley', 'Hadimba Temple', 'Old Manali Cafes'],
      estimatedTotalCost: 14500,
      currency: 'INR',
      costBreakdown: {
        transport: 4000,
        accommodation: 5500,
        activities: 2500,
        food: 2000,
        other: 500,
      },
      days: [
        {
          day: 1,
          date: '2026-10-10',
          title: 'Arrival and Old Manali Exploration',
          theme: 'Acclimatization and Culture',
          activities: [
            {
              time: '11:00 AM',
              title: 'Check-in and refresh at Budget Hotel',
              description: 'Drop bags and enjoy tea with mountain views',
              durationMinutes: 60,
              estimatedCost: 0,
              category: 'travel',
              location: 'Old Manali',
              reason: 'Selected as a calm base close to local culture on a modest budget.',
            },
            {
              time: '02:00 PM',
              title: 'Hadimba Devi Temple visit',
              description: 'Explore the ancient cedar-forest shrine and take photos',
              durationMinutes: 90,
              estimatedCost: 100,
              category: 'culture',
              location: 'Dhungri Forest',
              reason: 'Matches your interest in photography and local heritage.',
            },
          ],
        },
      ],
      travelTips: ['Carry warm clothing for evenings', 'Book evening bus early'],
      packingSuggestions: ['Good walking shoes', 'Power bank', 'Thermals'],
    };

    const result = ItinerarySchema.safeParse(validItinerary);
    expect(result.success).toBe(true);
  });

  it('should reject malformed AI output missing mandatory "reason" field', () => {
    const malformedItinerary = {
      summary: 'A trip to Manali',
      estimatedTotalCost: 10000,
      currency: 'INR',
      costBreakdown: {
        transport: 2000,
        accommodation: 4000,
        activities: 2000,
        food: 1500,
        other: 500,
      },
      days: [
        {
          day: 1,
          date: '2026-10-10',
          title: 'Day 1',
          activities: [
            {
              time: '10:00 AM',
              title: 'Walk around',
              description: 'Just walking',
              durationMinutes: 60,
              estimatedCost: 0,
              category: 'sightseeing',
              // missing 'reason' field!
            },
          ],
        },
      ],
    };

    const result = ItinerarySchema.safeParse(malformedItinerary);
    expect(result.success).toBe(false);
  });

  it('should reject malformed AI output missing cost breakdown', () => {
    const malformedItinerary = {
      summary: 'Trip summary',
      estimatedTotalCost: 5000,
      currency: 'INR',
      // missing costBreakdown!
      days: [],
    };

    const result = ItinerarySchema.safeParse(malformedItinerary);
    expect(result.success).toBe(false);
  });
});
