import axios from 'axios';
import { env } from '../../config/env.js';

export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface MapServiceResponse {
  configured: boolean;
  message?: string;
  data?: GeocodeResult;
}

export class MapsService {
  static isConfigured(): boolean {
    return Boolean(env.GOOGLE_MAPS_API_KEY && env.GOOGLE_MAPS_API_KEY.trim() !== '');
  }

  static getPublicApiKey(): string | null {
    return this.isConfigured() ? env.GOOGLE_MAPS_API_KEY! : null;
  }

  static async geocode(address: string): Promise<MapServiceResponse> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'Google Maps service is not configured. Set GOOGLE_MAPS_API_KEY in server .env to view interactive maps and coordinates.',
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${env.GOOGLE_MAPS_API_KEY}`;

      const res = await axios.get(url, { timeout: 5000 });
      if (res.data.status !== 'OK' || !res.data.results || res.data.results.length === 0) {
        return {
          configured: true,
          message: `Location "${address}" could not be resolved by Google Maps (${res.data.status}).`,
        };
      }

      const result = res.data.results[0];
      return {
        configured: true,
        data: {
          formattedAddress: result.formatted_address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          placeId: result.place_id,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Geocoding request failed';
      return {
        configured: true,
        message: `Maps service error: ${msg}`,
      };
    }
  }
}
