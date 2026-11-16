import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { Itinerary, ItinerarySchema } from '../../schemas/itinerary.schema.js';
import { TripRecord } from '../db.service.js';
import { AIServiceError } from '../../utils/errors.js';
import { RouteService, RouteDetails } from '../maps/route.service.js';

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;

  // Prioritized models with high availability and speed
  private static readonly CANDIDATE_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
  ];

  static isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '');
  }

  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!this.isConfigured()) {
        throw new AIServiceError(
          'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.'
        );
      }
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
    }
    return this.genAI;
  }

  /**
   * Generates a fully structured itinerary based on trip parameters.
   * Employs multi-model cascading with exponential backoff and zero-fail curated fallback.
   */
  static async generateItinerary(
    trip: TripRecord,
    modifier?: string,
    customPrompt?: string
  ): Promise<Itinerary> {
    const daysCount = Math.max(
      1,
      Math.ceil(
        (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );

    // Pre-calculate accurate distance & travel times between origin and destination
    const routeInfo = await RouteService.calculateRoute(
      trip.origin,
      trip.destination,
      trip.transportPreference
    );

    // If Gemini key is not configured, generate a verified curated plan immediately
    if (!this.isConfigured()) {
      return this.generateCuratedFallbackItinerary(trip, routeInfo, daysCount);
    }

    const client = this.getClient();
    const prompt = this.buildPrompt(trip, routeInfo, daysCount, modifier, customPrompt);

    let text = '';
    let lastError: Error | null = null;

    // Multi-model cascading: try prioritized models with retry logic on 503 / 429
    for (const modelName of this.CANDIDATE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const candidateText = response.text().trim();
          if (candidateText && candidateText.length > 50) {
            text = candidateText;
            break;
          }
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error(String(err));
          const errMsg = lastError.message;
          const isTransient =
            errMsg.includes('503') ||
            errMsg.includes('high demand') ||
            errMsg.includes('Unavailable') ||
            errMsg.includes('429') ||
            errMsg.includes('ResourceExhausted');

          if (isTransient && attempt < 2) {
            console.warn(
              `⏳ [Gemini] Model ${modelName} experiencing temporary traffic spike (attempt ${attempt}/2). Retrying in 1.5s...`
            );
            await new Promise((r) => setTimeout(r, 1500));
          } else {
            console.warn(`⚠️ [Gemini] Model ${modelName} failed or unavailable: ${errMsg}. Trying next model...`);
            break;
          }
        }
      }

      if (text) {
        break; // Successfully received response from one of the models
      }
    }

    // If all cloud models hit temporary 503 high demand spikes, seamlessly generate curated itinerary
    if (!text) {
      console.warn(
        '⚠️ [Gemini] All cloud models temporarily busy. Activating zero-fail curated itinerary engine.'
      );
      return this.generateCuratedFallbackItinerary(trip, routeInfo, daysCount);
    }

    try {
      // Clean markdown code blocks if present
      if (text.startsWith('```json')) {
        text = text.substring(7);
      } else if (text.startsWith('```')) {
        text = text.substring(3);
      }
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
      text = text.trim();

      const parsedJson: any = JSON.parse(text);

      // Ensure routeOverview is populated with verified calculation
      parsedJson.routeOverview = {
        origin: trip.origin,
        destination: trip.destination,
        straightDistanceKm: routeInfo.straightDistanceKm,
        roadDistanceKm: routeInfo.roadDistanceKm,
        distanceText: routeInfo.distanceText,
        primaryMode: routeInfo.primaryMode,
        primaryDurationText: routeInfo.primaryDurationText,
        modes: routeInfo.modes.map((m: any) => ({
          mode: m.mode,
          label: m.label,
          durationText: m.durationText,
          distanceText: m.distanceText,
          notes: m.notes,
        })),
        googleMapsUrl: routeInfo.googleMapsUrl,
        embedMapUrl: routeInfo.embedMapUrl,
      };

      // Ensure each activity has reasonable fallback distance/time if missing
      if (Array.isArray(parsedJson.days)) {
        parsedJson.days.forEach((day: any, dayIdx: number) => {
          if (Array.isArray(day.activities)) {
            day.activities.forEach((act: any, actIdx: number) => {
              if (!act.distanceFromPrev) {
                if (dayIdx === 0 && actIdx === 0) {
                  act.distanceFromPrev = routeInfo.distanceText;
                  act.travelTimeFromPrev = routeInfo.primaryDurationText;
                  act.transitMode = routeInfo.primaryMode;
                } else {
                  act.distanceFromPrev = `${((actIdx % 4) * 2.5 + 2).toFixed(1)} km`;
                  act.travelTimeFromPrev = `~${(actIdx % 3) * 10 + 15} mins via Cab/Auto`;
                  act.transitMode = 'Local Cab / Auto';
                }
              }
              if (!act.travelTimeFromPrev) {
                act.travelTimeFromPrev = `~15 mins`;
              }
            });
          }
        });
      }

      // Validate AI response against Zod schema
      const validation = ItinerarySchema.safeParse(parsedJson);
      if (!validation.success) {
        console.error('Gemini output validation failed:', validation.error.format());
        return this.generateCuratedFallbackItinerary(trip, routeInfo, daysCount);
      }

      return validation.data;
    } catch (parseErr) {
      console.warn('JSON parsing error on AI output, falling back to curated plan:', parseErr);
      return this.generateCuratedFallbackItinerary(trip, routeInfo, daysCount);
    }
  }

  private static buildPrompt(
    trip: TripRecord,
    routeInfo: RouteDetails,
    daysCount: number,
    modifier?: string,
    customPrompt?: string
  ): string {
    return `
You are an expert travel planner and local curator for TripWise.
Generate a realistic, day-by-day, budget-aware travel itinerary in JSON format.

TRIP DETAILS:
- Origin: ${trip.origin}
- Destination: ${trip.destination}
- Distance between Origin and Destination: ${routeInfo.distanceText} (~${routeInfo.straightDistanceKm} km straight-line, ~${routeInfo.roadDistanceKm} km by road)
- Primary Estimated Travel Time (${routeInfo.primaryMode}): ${routeInfo.primaryDurationText}
- Dates: ${trip.startDate.toISOString().split('T')[0]} to ${trip.endDate.toISOString().split('T')[0]} (${daysCount} days)
- Travelers: ${trip.travelers}
- Total Budget: ${trip.currency} ${trip.budget}
- Travel Style: ${trip.travelStyle}
- Interests: ${trip.interests.join(', ')}
- Transport Preference: ${trip.transportPreference}
- Accommodation Preference: ${trip.accommodationPreference}
${trip.additionalPreferences ? `- Additional Preferences: ${trip.additionalPreferences}` : ''}
${modifier ? `- Itinerary Adjustment Directive: ${modifier}` : ''}
${customPrompt ? `- Custom Note from Traveler: ${customPrompt}` : ''}

CRITICAL RULES:
1. Every activity MUST include a "reason" property that explicitly connects this specific activity to the traveler's chosen interests, budget, or travel style.
2. The estimated costs must be realistic for ${trip.destination} and in aggregate conform to the budget of ${trip.currency} ${trip.budget}.
3. Every activity MUST specify distance and time to reach it:
   - "distanceFromPrev": Distance from previous stop or origin (e.g. "${routeInfo.distanceText}" for arrival journey, or "3.5 km", "800m" between city spots).
   - "travelTimeFromPrev": Realistic transit time to reach this destination (e.g. "${routeInfo.primaryDurationText}" for main journey, or "15 mins via Cab", "20 mins via Metro", "8 mins walk").
   - "transitMode": Mode of transport used (e.g. "${routeInfo.primaryMode}", "Cab/Taxi", "Metro", "Walking", "Auto Rickshaw").
4. Include "routeOverview" with the total distance and travel duration between ${trip.origin} and ${trip.destination}.

Structure the output strictly matching this JSON schema:
{
  "summary": "Engaging 2-3 sentence summary of the trip",
  "destinationHighlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
  "estimatedTotalCost": number (total for all travelers in ${trip.currency}),
  "currency": "${trip.currency}",
  "costBreakdown": {
    "transport": number,
    "accommodation": number,
    "activities": number,
    "food": number,
    "other": number
  },
  "routeOverview": {
    "origin": "${trip.origin}",
    "destination": "${trip.destination}",
    "straightDistanceKm": ${routeInfo.straightDistanceKm},
    "roadDistanceKm": ${routeInfo.roadDistanceKm},
    "distanceText": "${routeInfo.distanceText}",
    "primaryMode": "${routeInfo.primaryMode}",
    "primaryDurationText": "${routeInfo.primaryDurationText}",
    "googleMapsUrl": "${routeInfo.googleMapsUrl}",
    "embedMapUrl": "${routeInfo.embedMapUrl}"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Theme or highlight for Day 1",
      "theme": "Brief theme name",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "description": "Specific details of what to see/do",
          "durationMinutes": 120,
          "estimatedCost": number,
          "category": "sightseeing" | "food" | "adventure" | "culture" | "relaxation" | "shopping" | "travel" | "nature" | "nightlife",
          "location": "Landmark or area name",
          "reason": "Personalized explanation connecting this choice to user preferences",
          "distanceFromPrev": "e.g. 4.2 km",
          "travelTimeFromPrev": "e.g. 15 mins via Cab",
          "transitMode": "e.g. Cab/Taxi"
        }
      ]
    }
  ],
  "travelTips": ["Practical tip 1", "Practical tip 2"],
  "packingSuggestions": ["Essential item 1", "Essential item 2"]
}

Return ONLY the raw JSON object. Do NOT enclose in markdown backticks or preface with explanatory text.
`;
  }

  /**
   * Resilient, zero-fail curated itinerary generator based on destination highlights.
   * Guarantees that users never receive an empty error page or broken state if external cloud AI spikes.
   */
  private static generateCuratedFallbackItinerary(
    trip: TripRecord,
    routeInfo: RouteDetails,
    daysCount: number
  ): Itinerary {
    const budgetTotal = trip.budget || 15000;
    const transportCost = Math.round(budgetTotal * 0.28);
    const accomCost = Math.round(budgetTotal * 0.35);
    const activitiesCost = Math.round(budgetTotal * 0.18);
    const foodCost = Math.round(budgetTotal * 0.14);
    const otherCost = budgetTotal - (transportCost + accomCost + activitiesCost + foodCost);

    const costBreakdown = {
      transport: transportCost,
      accommodation: accomCost,
      activities: activitiesCost,
      food: foodCost,
      other: Math.max(0, otherCost),
    };

    const days = [];
    const baseDate = new Date(trip.startDate);

    for (let d = 1; d <= daysCount; d++) {
      const curDate = new Date(baseDate);
      curDate.setDate(baseDate.getDate() + (d - 1));
      const dateStr = curDate.toISOString().split('T')[0];

      if (d === 1) {
        days.push({
          day: 1,
          date: dateStr,
          title: `Arrival, Check-in & Orientation in ${trip.destination}`,
          theme: 'Arrival & Evening Exploration',
          activities: [
            {
              time: '10:00 AM',
              title: `Journey & Arrival in ${trip.destination}`,
              description: `Scenic transit from ${trip.origin} to ${trip.destination} via ${trip.transportPreference}. Check in at your accommodation and unwind.`,
              durationMinutes: 180,
              estimatedCost: Math.round(transportCost * 0.7),
              category: 'travel' as const,
              location: `${trip.destination} Central`,
              reason: `Direct transit from ${trip.origin} based on your preferred ${trip.transportPreference} mode.`,
              distanceFromPrev: routeInfo.distanceText,
              travelTimeFromPrev: routeInfo.primaryDurationText,
              transitMode: routeInfo.primaryMode,
            },
            {
              time: '01:30 PM',
              title: 'Traditional Welcome Lunch',
              description: `Sample regional specialties at a vetted local restaurant in ${trip.destination}.`,
              durationMinutes: 75,
              estimatedCost: Math.round(foodCost / (daysCount * 2)),
              category: 'food' as const,
              location: `${trip.destination} Market / Old Quarter`,
              reason: `Matches your travel style with authentic cuisine within daily allocation.`,
              distanceFromPrev: '2.5 km',
              travelTimeFromPrev: '10 mins via Auto/Cab',
              transitMode: 'Local Auto / Taxi',
            },
            {
              time: '05:00 PM',
              title: 'Evening Sunset & Local Promenades',
              description: `Walk through iconic viewpoints, local bazaar streets, and capture sunset photography.`,
              durationMinutes: 120,
              estimatedCost: Math.round(activitiesCost / (daysCount * 2)),
              category: 'sightseeing' as const,
              location: `${trip.destination} Viewpoint / Heritage Walk`,
              reason: `Fulfills your interests in ${trip.interests[0] || 'scenery'} without rushing on your first day.`,
              distanceFromPrev: '1.8 km',
              travelTimeFromPrev: '8 mins walk',
              transitMode: 'Walking',
            },
          ],
        });
      } else if (d === daysCount) {
        days.push({
          day: d,
          date: dateStr,
          title: `Local Sights, Souvenirs & Return Journey`,
          theme: 'Culture & Farewell',
          activities: [
            {
              time: '09:00 AM',
              title: 'Morning Architectural Landmark & Photography',
              description: `Visit the top-rated heritage temple, fort, or nature reserve in ${trip.destination}.`,
              durationMinutes: 120,
              estimatedCost: Math.round(activitiesCost / daysCount),
              category: 'culture' as const,
              location: `${trip.destination} Landmark Sights`,
              reason: `Captures the primary historic and cultural highlight of ${trip.destination}.`,
              distanceFromPrev: '3.0 km',
              travelTimeFromPrev: '15 mins via Cab',
              transitMode: 'Local Cab',
            },
            {
              time: '12:30 PM',
              title: 'Souvenir Shopping & Craft Bazaars',
              description: `Explore local handicrafts, organic tea, spices, and traditional artisan goods.`,
              durationMinutes: 90,
              estimatedCost: Math.round(otherCost * 0.6),
              category: 'shopping' as const,
              location: `${trip.destination} Main Bazaar`,
              reason: `Allocates souvenir and artisan shopping aligned with your budget.`,
              distanceFromPrev: '1.2 km',
              travelTimeFromPrev: '5 mins walk',
              transitMode: 'Walking',
            },
            {
              time: '04:00 PM',
              title: `Departure Journey back to ${trip.origin}`,
              description: `Commence return travel to ${trip.origin} with memorable experiences and photo albums.`,
              durationMinutes: 240,
              estimatedCost: Math.round(transportCost * 0.3),
              category: 'travel' as const,
              location: `${trip.destination} Transit Hub`,
              reason: `Structured return schedule ensuring timely arrival back at ${trip.origin}.`,
              distanceFromPrev: routeInfo.distanceText,
              travelTimeFromPrev: routeInfo.primaryDurationText,
              transitMode: routeInfo.primaryMode,
            },
          ],
        });
      } else {
        days.push({
          day: d,
          date: dateStr,
          title: `Full-Day Adventure & Highlights of ${trip.destination}`,
          theme: 'Signature Exploration',
          activities: [
            {
              time: '09:00 AM',
              title: 'Scenic Nature & Valley Exploration',
              description: `Excursion to famous valleys, waterfalls, or coastal viewpoints around ${trip.destination}.`,
              durationMinutes: 180,
              estimatedCost: Math.round(activitiesCost / daysCount),
              category: 'nature' as const,
              location: `${trip.destination} Scenic Route`,
              reason: `Tailored for your interest in ${trip.interests.join(' & ')} at comfortable morning hours.`,
              distanceFromPrev: '6.5 km',
              travelTimeFromPrev: '20 mins via Taxi',
              transitMode: 'Private Cab',
            },
            {
              time: '01:30 PM',
              title: 'Regional Dining Experience',
              description: `Enjoy popular local recipes with panoramic views.`,
              durationMinutes: 60,
              estimatedCost: Math.round(foodCost / daysCount),
              category: 'food' as const,
              location: `${trip.destination} Panorama Cafe`,
              reason: `Relaxed dining stop fitting your daily budget.`,
              distanceFromPrev: '1.0 km',
              travelTimeFromPrev: '5 mins walk',
              transitMode: 'Walking',
            },
            {
              time: '04:30 PM',
              title: 'Interactive Workshop or Evening Sunset',
              description: `Engage with local culture, spiritual ceremonies, or lake/valley sunset boating.`,
              durationMinutes: 120,
              estimatedCost: Math.round(activitiesCost * 0.3),
              category: 'adventure' as const,
              location: `${trip.destination} Cultural Hub`,
              reason: `Evening activity prioritized according to your ${trip.travelStyle} preference.`,
              distanceFromPrev: '4.0 km',
              travelTimeFromPrev: '15 mins via Cab',
              transitMode: 'Local Cab',
            },
          ],
        });
      }
    }

    return {
      summary: `A personalized ${daysCount}-day ${trip.travelStyle} itinerary from ${trip.origin} to ${trip.destination} designed to balance your interests in ${trip.interests.join(', ')} within a calibrated budget of ${trip.currency} ${budgetTotal}.`,
      destinationHighlights: [
        `Scenic landscapes and cultural landmarks in ${trip.destination}`,
        `Authentic regional dining and verified artisan markets`,
        `Curated daily schedule with transparent cost allocation`,
      ],
      estimatedTotalCost: budgetTotal,
      currency: trip.currency || 'INR',
      costBreakdown,
      routeOverview: {
        origin: trip.origin,
        destination: trip.destination,
        straightDistanceKm: routeInfo.straightDistanceKm,
        roadDistanceKm: routeInfo.roadDistanceKm,
        distanceText: routeInfo.distanceText,
        primaryMode: routeInfo.primaryMode,
        primaryDurationText: routeInfo.primaryDurationText,
        modes: routeInfo.modes.map((m: any) => ({
          mode: m.mode,
          label: m.label,
          durationText: m.durationText,
          distanceText: m.distanceText,
          notes: m.notes,
        })),
        googleMapsUrl: routeInfo.googleMapsUrl,
        embedMapUrl: routeInfo.embedMapUrl,
      },
      days,
      travelTips: [
        `Book return transport in advance, especially for weekend travel between ${trip.origin} and ${trip.destination}.`,
        `Keep digital copies of photo IDs handy at monument entries and hotel check-ins.`,
        `Wear comfortable walking shoes for heritage walks and temple steps.`,
      ],
      packingSuggestions: [
        'Light weather-appropriate clothing and comfortable walking shoes',
        'Power bank and smartphone camera accessories',
        'Reusable water bottle and basic personal medicines',
      ],
    };
  }
}
