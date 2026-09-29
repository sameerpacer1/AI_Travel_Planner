import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { Itinerary, ItinerarySchema } from '../../schemas/itinerary.schema.js';
import { TripRecord } from '../db.service.js';
import { AIServiceError } from '../../utils/errors.js';

export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;

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
   */
  static async generateItinerary(
    trip: TripRecord,
    modifier?: string,
    customPrompt?: string
  ): Promise<Itinerary> {
    if (!this.isConfigured()) {
      throw new AIServiceError(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in the server .env to generate AI itineraries.'
      );
    }

    try {
      const client = this.getClient();
      // Try gemini-3.5-flash-lite first, fallback to gemini-3.8-flash if needed
      const modelName = 'gemini-3.5-flash-lite';
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const daysCount = Math.max(
        1,
        Math.ceil(
          (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      );

      const prompt = `
You are an expert travel planner and local curator for TripWise.
Generate a realistic, day-by-day, budget-aware travel itinerary in JSON format.

TRIP DETAILS:
- Origin: ${trip.origin}
- Destination: ${trip.destination}
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
1. Every activity MUST include a "reason" property that explicitly connects this specific activity to the traveler's chosen interests, budget, or travel style (e.g. "Solang Valley was included because you selected mountains and photography, and it fits within your available Day 2 schedule.").
2. The estimated costs must be realistic for ${trip.destination} and in aggregate conform to the budget of ${trip.currency} ${trip.budget}.
3. Structure the output strictly matching this JSON schema:
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
          "reason": "Personalized explanation connecting this choice to user preferences"
        }
      ]
    }
  ],
  "travelTips": ["Practical tip 1", "Practical tip 2"],
  "packingSuggestions": ["Essential item 1", "Essential item 2"]
}

Return ONLY the raw JSON object. Do NOT enclose in markdown backticks or preface with explanatory text.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

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

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(text);
      } catch (err) {
        throw new AIServiceError('Gemini returned an invalid JSON response structure', { rawText: text });
      }

      // Validate AI response against Zod schema
      const validation = ItinerarySchema.safeParse(parsedJson);
      if (!validation.success) {
        console.error('Gemini output validation failed:', validation.error.format());
        throw new AIServiceError('Gemini output failed schema verification', validation.error.errors);
      }

      return validation.data;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown AI service failure';
      throw new AIServiceError(`Failed to generate itinerary: ${message}`);
    }
  }
}
